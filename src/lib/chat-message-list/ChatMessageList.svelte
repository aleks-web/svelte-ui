<script module lang="ts">
	export type ChatMessageListItem = {
		id: string;
		sender: {
			type: 'customer' | 'staff' | 'system';
			id?: string | null;
			displayName: string;
			avatarUrl?: string | null;
		};
		text: string;
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
	import ScrollArea from '../ScrollArea.svelte';
	import ConfirmDialog from '../confirm-dialog/ConfirmDialog.svelte';
	import { DownloadOutline, TrashBinOutline } from 'flowbite-svelte-icons';
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
		class: className = ''
	}: Props = $props();
	let deletingMessageId = $state<string | null>(null);
	let deletingAttachmentId = $state<string | null>(null);

	const styles = chatMessageListVariants();
	const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
		hour: '2-digit',
		minute: '2-digit'
	});

	function getInitials(displayName: string): string {
		const parts = displayName.trim().split(/\s+/).filter(Boolean);
		if (parts.length === 0) return '•';
		const first = parts[0]?.[0] ?? '';
		const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '';
		return `${first}${last}`.toLocaleUpperCase('ru-RU');
	}

	function hideBrokenAvatar(event: Event): void {
		(event.currentTarget as HTMLImageElement).hidden = true;
	}

	function formatBytes(value: number): string {
		return value < 1024 * 1024
			? `${Math.max(1, Math.round(value / 1024))} КБ`
			: `${(value / (1024 * 1024)).toFixed(1)} МБ`;
	}

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
				<article class={styles.row({ own })}>
					<span
						class={styles.avatar({ own })}
						title={message.sender.displayName}
						aria-hidden="true"
					>
						<span class={styles.avatarFallback()}>{getInitials(message.sender.displayName)}</span>
						{#if message.sender.avatarUrl}
							<img
								src={message.sender.avatarUrl}
								alt=""
								class={styles.avatarImage()}
								loading="lazy"
								draggable="false"
								onerror={hideBrokenAvatar}
							/>
						{/if}
					</span>
					<div class={styles.messageColumn({ own })}>
						<div class={styles.message({ own })}>
							<span class="sr-only">{message.sender.displayName}: </span>
							{#if message.text}<p class={styles.body()}>{message.text}</p>{/if}
							{#if message.attachments?.length}
								<div class={`grid gap-2 ${message.text ? 'mt-2.5' : ''}`}>
									{#each message.attachments as attachment (attachment.id)}
										<div class="relative min-w-0">
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
														{#snippet trigger()}<TrashBinOutline class="size-3.5" strokeWidth={1.5} />{/snippet}
													</ConfirmDialog>
												</div>
											{/if}
										</div>
									{/each}
								</div>
							{/if}
						</div>
						<div class={`flex items-center gap-1 ${own ? 'flex-row-reverse' : ''}`}>
							<time class={styles.time({ own })} datetime={new Date(message.createdAt).toISOString()}>
								{dateFormatter.format(new Date(message.createdAt))}
							</time>
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
									{#snippet trigger()}<TrashBinOutline class="size-3.5" strokeWidth={1.5} />{/snippet}
								</ConfirmDialog>
							{/if}
						</div>
					</div>
				</article>
			{/each}
		{/if}
	</ScrollArea>
</div>
