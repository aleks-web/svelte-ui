<script module lang="ts">
	export type ChatMessageListItem = {
		id: string;
		channel?: {
			id: string;
			label: string;
		};
		sender: {
			type: 'customer' | 'staff' | 'system';
			id?: string | null;
			displayName: string;
			avatarUrl?: string | null;
			avatarFallbackUrls?: Array<string | null | undefined>;
		};
		text: string;
		replyTo?: {
			id: string;
			senderDisplayName: string;
			text: string;
		};
		attachments?: Array<{
			id: string;
			originalName: string;
			mimeType: string;
			sizeBytes: number;
		}>;
		createdAt: string | Date;
	};
	export type ChatMessageAttachment = NonNullable<ChatMessageListItem['attachments']>[number];
</script>

<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- attachment URLs may be external */
	import ConfirmDialog from '../confirm-dialog/ConfirmDialog.svelte';
	import ScrollArea from '../ScrollArea.svelte';
	import { DownloadOutline, ReplyOutline, TrashBinOutline } from 'flowbite-svelte-icons';
	import { onDestroy, tick } from 'svelte';
	import { chatMessageListVariants } from './chat-message-list.variants';

	type Props = {
		messages: ChatMessageListItem[];
		loading?: boolean;
		currentActorType?: 'customer' | 'staff';
		loadingText?: string;
		emptyText?: string;
		contentId?: string;
		attachmentUrl?: (attachmentId: string) => string;
		canDeleteMessage?: (message: ChatMessageListItem) => boolean;
		onDeleteMessage?: (message: ChatMessageListItem) => void | Promise<void>;
		onDeleteAttachment?: (
			message: ChatMessageListItem,
			attachment: ChatMessageAttachment
		) => void | Promise<void>;
		onReply?: (message: ChatMessageListItem) => void;
		onNavigateReply?: (messageId: string) => void;
		autoScroll?: boolean;
		class?: string;
	};

	let {
		messages,
		loading = false,
		currentActorType = 'staff',
		loadingText = 'Подключаем чат…',
		emptyText = 'Сообщений пока нет.',
		contentId = 'chat-message-list',
		attachmentUrl,
		canDeleteMessage = () => false,
		onDeleteMessage,
		onDeleteAttachment,
		onReply,
		onNavigateReply,
		autoScroll = true,
		class: className = ''
	}: Props = $props();
	let deletingMessageId = $state<string | null>(null);
	let deletingAttachmentId = $state<string | null>(null);
	let highlightedMessageId = $state<string | null>(null);
	let highlightTimer: ReturnType<typeof setTimeout> | undefined;
	let firstScrollFrame: number | undefined;
	let secondScrollFrame: number | undefined;
	let scrollRequest = 0;
	let previousContentId = '';
	let previousMessageCount = 0;
	let previousLastMessageId: string | null = null;
	let hasAutoScrolled = false;
	let failedAvatarSources = $state<Record<string, string[]>>({});

	const styles = chatMessageListVariants();
	const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
		hour: '2-digit',
		minute: '2-digit'
	});
	type MessageTextPart =
		{ type: 'text'; value: string } | { type: 'link'; value: string; href: string };

	function getInitials(displayName: string): string {
		const parts = displayName.trim().split(/\s+/).filter(Boolean);
		if (parts.length === 0) return '•';
		const first = parts[0]?.[0] ?? '';
		const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '';
		return `${first}${last}`.toLocaleUpperCase('ru-RU');
	}

	function avatarSources(message: ChatMessageListItem): string[] {
		return [
			...new Set(
				[message.sender.avatarUrl, ...(message.sender.avatarFallbackUrls ?? [])].filter(
					(value): value is string => Boolean(value)
				)
			)
		];
	}

	function activeAvatarUrl(message: ChatMessageListItem): string | null {
		const failed = failedAvatarSources[message.id] ?? [];
		return avatarSources(message).find((source) => !failed.includes(source)) ?? null;
	}

	function useNextAvatar(message: ChatMessageListItem, source: string): void {
		const failed = failedAvatarSources[message.id] ?? [];
		if (failed.includes(source)) return;
		failedAvatarSources = {
			...failedAvatarSources,
			[message.id]: [...failed, source]
		};
	}

	function formatBytes(value: number): string {
		return value < 1024 * 1024
			? `${Math.max(1, Math.round(value / 1024))} КБ`
			: `${(value / (1024 * 1024)).toFixed(1)} МБ`;
	}

	function channelClass(channelId: string, own: boolean): string {
		if (own) return 'bg-white/15 text-white ring-white/25';
		if (channelId === 'telegram') return 'bg-sky-50 text-sky-700 ring-sky-200';
		if (channelId === 'mattermost') return 'bg-violet-50 text-violet-700 ring-violet-200';
		return 'bg-slate-100 text-slate-600 ring-slate-200';
	}

	function messageTextParts(value: string): MessageTextPart[] {
		const parts: MessageTextPart[] = [];
		const pattern = /(?:https?:\/\/|www\.)[^\s<>"']+/giu;
		const trailingPunctuation = new Set(['.', ',', '!', '?', ';', ':', ']', ')', '}', '>', '»']);
		let cursor = 0;

		for (const match of value.matchAll(pattern)) {
			const start = match.index ?? 0;
			let linkText = match[0];
			let suffix = '';
			while (linkText && trailingPunctuation.has(linkText.at(-1) ?? '')) {
				suffix = `${linkText.at(-1)}${suffix}`;
				linkText = linkText.slice(0, -1);
			}
			if (start > cursor) parts.push({ type: 'text', value: value.slice(cursor, start) });
			if (linkText) {
				parts.push({
					type: 'link',
					value: linkText,
					href: linkText.toLowerCase().startsWith('www.') ? `https://${linkText}` : linkText
				});
			}
			if (suffix) parts.push({ type: 'text', value: suffix });
			cursor = start + match[0].length;
		}

		if (cursor < value.length) parts.push({ type: 'text', value: value.slice(cursor) });
		return parts.length ? parts : [{ type: 'text', value }];
	}

	function navigateToReply(messageId: string): void {
		if (onNavigateReply) {
			onNavigateReply(messageId);
			return;
		}
		const target = document.getElementById(`${contentId}-message-${messageId}`);
		if (!target) return;
		target.scrollIntoView({ behavior: 'smooth', block: 'center' });
		highlightedMessageId = messageId;
		if (highlightTimer) clearTimeout(highlightTimer);
		highlightTimer = setTimeout(() => {
			highlightedMessageId = null;
		}, 1600);
	}

	function cancelScheduledScroll(): void {
		if (firstScrollFrame !== undefined) window.cancelAnimationFrame(firstScrollFrame);
		if (secondScrollFrame !== undefined) window.cancelAnimationFrame(secondScrollFrame);
		firstScrollFrame = undefined;
		secondScrollFrame = undefined;
	}

	async function scrollToLatest(behavior: ScrollBehavior): Promise<void> {
		const request = ++scrollRequest;
		await tick();
		if (request !== scrollRequest) return;

		cancelScheduledScroll();
		firstScrollFrame = window.requestAnimationFrame(() => {
			secondScrollFrame = window.requestAnimationFrame(() => {
				if (request !== scrollRequest) return;
				const viewport = document.getElementById(contentId);
				if (!(viewport instanceof HTMLElement)) return;
				viewport.scrollTo({ top: viewport.scrollHeight, behavior });
				firstScrollFrame = undefined;
				secondScrollFrame = undefined;
			});
		});
	}

	$effect(() => {
		const nextContentId = contentId;
		const nextMessageCount = messages.length;
		const nextLastMessageId = messages.at(-1)?.id ?? null;
		const isLoading = loading;
		const isEnabled = autoScroll;

		if (nextContentId !== previousContentId) {
			previousContentId = nextContentId;
			previousMessageCount = 0;
			previousLastMessageId = null;
			hasAutoScrolled = false;
		}
		if (isLoading || !isEnabled) return;

		const initialScroll = !hasAutoScrolled;
		const latestMessageChanged =
			hasAutoScrolled &&
			(nextMessageCount > previousMessageCount || nextLastMessageId !== previousLastMessageId);

		previousMessageCount = nextMessageCount;
		previousLastMessageId = nextLastMessageId;
		hasAutoScrolled = true;

		if (initialScroll || latestMessageChanged) {
			void scrollToLatest(initialScroll ? 'auto' : 'smooth');
		}
	});

	async function deleteMessage(message: ChatMessageListItem): Promise<void> {
		deletingMessageId = message.id;
		try {
			await onDeleteMessage?.(message);
		} finally {
			deletingMessageId = null;
		}
	}

	async function deleteAttachment(
		message: ChatMessageListItem,
		attachment: ChatMessageAttachment
	): Promise<void> {
		deletingAttachmentId = attachment.id;
		try {
			await onDeleteAttachment?.(message, attachment);
		} finally {
			deletingAttachmentId = null;
		}
	}

	onDestroy(() => {
		if (highlightTimer) clearTimeout(highlightTimer);
		scrollRequest += 1;
		cancelScheduledScroll();
	});
</script>

<div class={styles.root({ class: className })} aria-live="polite" aria-busy={loading}>
	<ScrollArea
		class="h-full"
		contentClass={styles.content()}
		{contentId}
		horizontal={false}
		scrollbarSize={6}
		scrollbarVisibility="hover"
		verticalLabel="Прокрутка сообщений чата"
	>
		{#if loading}
			<p class={styles.state()}>{loadingText}</p>
		{:else if messages.length === 0}
			<p class={styles.state()}>{emptyText}</p>
		{:else}
			{#each messages as message (message.id)}
				{@const own = message.sender.type === currentActorType}
				{@const deletable = canDeleteMessage(message)}
				{@const avatarUrl = activeAvatarUrl(message)}
				<article
					id={`${contentId}-message-${message.id}`}
					class={`${styles.row({ own })} rounded-2xl transition-shadow ${highlightedMessageId === message.id ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
				>
					<span
						class={styles.avatar({ own })}
						title={message.sender.displayName}
						aria-hidden="true"
					>
						<span class={styles.avatarFallback()}>{getInitials(message.sender.displayName)}</span>
						{#if avatarUrl}
							<img
								src={avatarUrl}
								alt=""
								class={styles.avatarImage()}
								loading="lazy"
								draggable="false"
								onerror={() => useNextAvatar(message, avatarUrl)}
							/>
						{/if}
					</span>
					<div class={styles.messageColumn({ own })}>
						<div class={styles.message({ own })}>
							<span class="sr-only">{message.sender.displayName}: </span>
							{#if message.channel}
								<span
									class={`mb-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${channelClass(message.channel.id, own)}`}
								>
									{message.channel.label}
								</span>
							{/if}
							{#if message.replyTo}
								<button
									type="button"
									class={`mb-2 block w-full min-w-0 rounded-lg border-l-2 px-2.5 py-1.5 text-left ${own ? 'border-white/80 bg-white/15 hover:bg-white/25' : 'border-blue-400 bg-slate-50 hover:bg-slate-100'}`}
									aria-label={`Перейти к сообщению ${message.replyTo.senderDisplayName}`}
									onclick={() => navigateToReply(message.replyTo!.id)}
								>
									<span
										class={`block truncate text-[11px] font-semibold ${own ? 'text-white' : 'text-blue-700'}`}
									>
										{message.replyTo.senderDisplayName}
									</span>
									<span class={`block truncate text-xs ${own ? 'text-blue-50' : 'text-slate-500'}`}>
										{message.replyTo.text}
									</span>
								</button>
							{/if}
							{#if message.text}
								<p class={styles.body()}>
									{#each messageTextParts(message.text) as part, index (`${part.type}-${index}`)}
										{#if part.type === 'link'}
											<a
												href={part.href}
												target="_blank"
												rel="noopener noreferrer"
												class={`break-all underline underline-offset-2 ${own ? 'text-white decoration-white/70 hover:decoration-white' : 'text-blue-700 decoration-blue-300 hover:text-blue-800 hover:decoration-blue-700'}`}
												>{part.value}</a
											>
										{:else}{part.value}{/if}
									{/each}
								</p>
							{/if}
							{#if message.attachments?.length}
								<div class={`grid gap-2 ${message.text ? 'mt-2.5' : ''}`}>
									{#each message.attachments as attachment (attachment.id)}
										<div class="relative min-w-0">
											<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
											<a
												href={attachmentUrl?.(attachment.id) ?? '#'}
												target="_blank"
												rel="noreferrer"
												class={`group/file block overflow-hidden rounded-xl ${own ? 'bg-white/15 hover:bg-white/25' : 'bg-slate-50 hover:bg-slate-100'}`}
												aria-label={`Открыть вложение ${attachment.originalName}`}
											>
												{#if attachment.mimeType.startsWith('image/') && attachmentUrl}
													<img
														src={attachmentUrl(attachment.id)}
														alt={attachment.originalName}
														class="max-h-48 w-full object-cover"
														loading="lazy"
													/>
												{/if}
												<span class="flex min-w-0 items-center gap-2 px-2.5 py-2 pr-10">
													<DownloadOutline class="size-4 shrink-0" strokeWidth={1.5} />
													<span class="min-w-0 flex-1">
														<span class="block truncate text-xs font-medium"
															>{attachment.originalName}</span
														>
														<span
															class={`block text-[10px] ${own ? 'text-blue-100' : 'text-slate-400'}`}
															>{formatBytes(attachment.sizeBytes)}</span
														>
													</span>
												</span>
											</a>
											{#if deletable && onDeleteAttachment}
												<div class="absolute right-1.5 bottom-1.5 z-10">
													<ConfirmDialog
														title="Удалить вложение?"
														description="Файл будет сразу удалён из хранилища без возможности восстановления."
														confirmLabel="Удалить"
														variant="danger"
														triggerVariant="ghost"
														triggerSize="icon"
														triggerClass={`size-7 ${own ? 'text-blue-100 hover:text-white' : 'text-slate-400 hover:text-red-600'}`}
														loading={deletingAttachmentId === attachment.id}
														onConfirm={() => deleteAttachment(message, attachment)}
													>
														{#snippet trigger()}<TrashBinOutline
																class="size-3.5"
																strokeWidth={1.5}
															/>{/snippet}
													</ConfirmDialog>
												</div>
											{/if}
										</div>
									{/each}
								</div>
							{/if}
						</div>
						<div class={`flex items-center gap-1 ${own ? 'flex-row-reverse' : ''}`}>
							<time
								class={styles.time({ own })}
								datetime={new Date(message.createdAt).toISOString()}
							>
								{dateFormatter.format(new Date(message.createdAt))}
							</time>
							{#if onReply}
								<button
									type="button"
									class="grid size-7 place-items-center rounded-lg text-slate-400 transition hover:bg-white hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
									aria-label={`Ответить ${message.sender.displayName}`}
									title="Ответить"
									onclick={() => onReply(message)}
								>
									<ReplyOutline class="size-3.5" strokeWidth={1.7} />
								</button>
							{/if}
							{#if deletable && onDeleteMessage}
								<ConfirmDialog
									title="Удалить сообщение?"
									description="Сообщение и все его вложения будут удалены сразу и без возможности восстановления."
									confirmLabel="Удалить"
									variant="danger"
									triggerVariant="ghost"
									triggerSize="icon"
									triggerClass="size-7 text-slate-400 hover:text-red-600"
									loading={deletingMessageId === message.id}
									onConfirm={() => deleteMessage(message)}
								>
									{#snippet trigger()}<TrashBinOutline
											class="size-3.5"
											strokeWidth={1.5}
										/>{/snippet}
								</ConfirmDialog>
							{/if}
						</div>
					</div>
				</article>
			{/each}
		{/if}
	</ScrollArea>
</div>
