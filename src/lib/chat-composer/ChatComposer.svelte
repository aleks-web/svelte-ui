<script module lang="ts">
	export type ChatComposerReply = {
		id: string;
		senderDisplayName: string;
		text: string;
	};
	export type ChatComposerSendContext = {
		replyTo: ChatComposerReply | null;
	};
	export type ChatComposerConfirmContext = ChatComposerSendContext & {
		files: File[];
	};
	export type ChatComposerSendResult = boolean | void | Promise<boolean | void>;
	export type ChatComposerAttachmentSendResult = boolean | void | Promise<boolean | void>;
	export type ChatComposerConfirmResult = boolean | Promise<boolean>;
</script>

<script lang="ts">
	import { Popover } from 'melt/builders';
	import Button from '../button/Button.svelte';
	import ScrollArea from '../ScrollArea.svelte';
	import {
		CloseOutline,
		FaceGrinOutline,
		PaperClipOutline,
		PaperPlaneSolid,
		ReplyOutline
	} from 'flowbite-svelte-icons';
	import { onDestroy, tick } from 'svelte';
	import { chatComposerVariants } from './chat-composer.variants';

	type Props = {
		value?: string;
		onSend: (value: string, context: ChatComposerSendContext) => ChatComposerSendResult;
		onSendAttachments?: (
			value: string,
			files: File[],
			context: ChatComposerSendContext
		) => ChatComposerAttachmentSendResult;
		confirmBeforeSend?: (
			value: string,
			context: ChatComposerConfirmContext
		) => ChatComposerConfirmResult;
		replyTo?: ChatComposerReply | null;
		onCancelReply?: () => void;
		id?: string;
		placeholder?: string;
		ariaLabel?: string;
		maxLength?: number;
		minHeight?: number;
		maxHeight?: number;
		resizable?: boolean;
		disabled?: boolean;
		attachments?: boolean;
		attachmentAccept?: string;
		maxAttachmentSize?: number;
		maxAttachments?: number;
		class?: string;
	};

	let {
		value = $bindable(''),
		onSend,
		onSendAttachments,
		confirmBeforeSend,
		replyTo = null,
		onCancelReply,
		id = 'chat-message',
		placeholder = 'Напишите сообщение…',
		ariaLabel = 'Сообщение',
		maxLength = 4000,
		minHeight = 112,
		maxHeight = 320,
		resizable = true,
		disabled = false,
		attachments = false,
		attachmentAccept = 'image/jpeg,image/png,image/webp,image/gif,image/avif,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		maxAttachmentSize = 10 * 1024 * 1024,
		maxAttachments = 5,
		class: className = ''
	}: Props = $props();

	let textarea: HTMLTextAreaElement | undefined = $state();
	let fileInput: HTMLInputElement | undefined = $state();
	let selectedFiles = $state<File[]>([]);
	let attachmentError = $state('');
	let contentHeight = $state(112);
	let manualHeight = $state<number | null>(null);
	let submitting = $state(false);
	let inactive = $derived(disabled || submitting);
	let viewportHeight = $derived(
		Math.min(maxHeight, Math.max(minHeight, manualHeight ?? contentHeight))
	);
	let textareaHeight = $derived(Math.max(contentHeight, viewportHeight));
	let styles = $derived(chatComposerVariants({ disabled: inactive }));
	let stopResize: (() => void) | undefined;
	const emojis = [
		'😀',
		'😃',
		'😄',
		'😁',
		'😆',
		'😅',
		'😊',
		'😂',
		'🤣',
		'😇',
		'🙂',
		'🙃',
		'😉',
		'😌',
		'😍',
		'🥰',
		'😘',
		'😋',
		'😎',
		'🤩',
		'🥳',
		'😔',
		'😢',
		'😭',
		'😤',
		'😡',
		'🤔',
		'🤗',
		'🤭',
		'🫡',
		'🫶',
		'👍',
		'👎',
		'👌',
		'✌️',
		'🤞',
		'💪',
		'👏',
		'🙌',
		'🙏',
		'❤️',
		'🧡',
		'💛',
		'💚',
		'💙',
		'💜',
		'🖤',
		'🤍',
		'✅',
		'❌',
		'⚠️',
		'💯',
		'🎉',
		'🎁',
		'🔥',
		'⭐',
		'🍕',
		'🍔',
		'🍟',
		'🍣',
		'🍱',
		'🥗',
		'☕',
		'🍰',
		'🚚',
		'📍',
		'🕐',
		'📞',
		'💬',
		'🛍️',
		'💳'
	];
	const emojiPopover = new Popover({
		floatingConfig: {
			computePosition: { placement: 'top-start' },
			offset: { mainAxis: 8 }
		}
	});

	$effect(() => {
		if (contentHeight < minHeight || (!value && contentHeight !== minHeight)) {
			contentHeight = minHeight;
		}
	});

	function updateSize(element = textarea): void {
		if (!element) return;
		element.style.height = 'auto';
		contentHeight = Math.max(minHeight, element.scrollHeight);
	}

	async function submit(): Promise<void> {
		const message = value.trim();
		if ((!message && selectedFiles.length === 0) || inactive) return;

		submitting = true;
		try {
			const context = { replyTo };
			const files = [...selectedFiles];
			if ((await confirmBeforeSend?.(message, { ...context, files })) === false) return;
			const result = files.length
				? await onSendAttachments?.(message, files, context)
				: await onSend(message, context);
			if (result === false) return;
			value = '';
			selectedFiles = [];
			attachmentError = '';
			onCancelReply?.();
			contentHeight = minHeight;
			await tick();
			updateSize();
		} finally {
			submitting = false;
		}
	}

	function formatBytes(value: number): string {
		return value < 1024 * 1024
			? `${Math.max(1, Math.round(value / 1024))} КБ`
			: `${(value / (1024 * 1024)).toFixed(1)} МБ`;
	}

	function matchesAccept(file: File): boolean {
		return attachmentAccept.split(',').some((rule) => {
			const normalized = rule.trim().toLowerCase();
			if (normalized === '*/*') return true;
			return normalized.endsWith('/*')
				? file.type.toLowerCase().startsWith(normalized.slice(0, -1))
				: file.type.toLowerCase() === normalized;
		});
	}

	function addFiles(files: File[]): void {
		if (!files.length) return;
		attachmentError = '';
		const next = [...selectedFiles, ...files].filter(
			(file, index, all) =>
				all.findIndex(
					(candidate) =>
						candidate.name === file.name &&
						candidate.size === file.size &&
						candidate.lastModified === file.lastModified
				) === index
		);
		const unsupported = next.find((file) => !matchesAccept(file));
		const oversized = next.find((file) => file.size > maxAttachmentSize);
		if (unsupported) attachmentError = `Формат файла «${unsupported.name}» не поддерживается.`;
		else if (oversized)
			attachmentError = `Файл «${oversized.name}» больше ${formatBytes(maxAttachmentSize)}.`;
		else if (next.length > maxAttachments)
			attachmentError = `Можно прикрепить не больше ${maxAttachments} файлов.`;
		else selectedFiles = next;
	}

	function chooseFiles(event: Event): void {
		const files = Array.from((event.currentTarget as HTMLInputElement).files ?? []);
		addFiles(files);
		if (fileInput) fileInput.value = '';
	}

	function handlePaste(event: ClipboardEvent): void {
		if (!attachments || !onSendAttachments || inactive) return;
		const clipboard = event.clipboardData;
		if (!clipboard) return;

		const filesFromItems = Array.from(clipboard.items)
			.filter((item) => item.kind === 'file')
			.map((item) => item.getAsFile())
			.filter((file): file is File => file !== null);
		const files = filesFromItems.length ? filesFromItems : Array.from(clipboard.files);
		if (!files.length) return;

		event.preventDefault();
		addFiles(files);
	}

	function removeFile(index: number): void {
		selectedFiles = selectedFiles.filter((_, current) => current !== index);
		attachmentError = '';
	}

	async function insertEmoji(emoji: string): Promise<void> {
		const element = textarea;
		const start = element?.selectionStart ?? value.length;
		const end = element?.selectionEnd ?? start;
		const insertion = emoji;
		value = `${value.slice(0, start)}${insertion}${value.slice(end)}`.slice(0, maxLength);
		emojiPopover.open = false;
		await tick();
		const next = Math.min(maxLength, start + insertion.length);
		element?.focus();
		element?.setSelectionRange(next, next);
		updateSize();
	}

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		void submit();
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
		event.preventDefault();
		void submit();
	}

	function startResize(event: PointerEvent): void {
		if (!resizable || inactive || event.button !== 0) return;
		event.preventDefault();
		stopResize?.();

		const startY = event.clientY;
		const startHeight = viewportHeight;
		const previousCursor = document.body.style.cursor;
		const previousUserSelect = document.body.style.userSelect;
		document.body.style.cursor = 'ns-resize';
		document.body.style.userSelect = 'none';

		const handlePointerMove = (moveEvent: PointerEvent) => {
			const nextHeight = startHeight - (moveEvent.clientY - startY);
			manualHeight = Math.min(maxHeight, Math.max(minHeight, nextHeight));
		};
		const finishResize = () => {
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', finishResize);
			window.removeEventListener('pointercancel', finishResize);
			document.body.style.cursor = previousCursor;
			document.body.style.userSelect = previousUserSelect;
			stopResize = undefined;
		};

		stopResize = finishResize;
		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', finishResize);
		window.addEventListener('pointercancel', finishResize);
	}

	function handleResizeKeydown(event: KeyboardEvent): void {
		if (!resizable || inactive) return;
		let nextHeight: number | null = null;
		if (event.key === 'ArrowUp') nextHeight = viewportHeight + 16;
		else if (event.key === 'ArrowDown') nextHeight = viewportHeight - 16;
		else if (event.key === 'Home') nextHeight = minHeight;
		else if (event.key === 'End') nextHeight = maxHeight;
		if (nextHeight === null) return;
		event.preventDefault();
		manualHeight = Math.min(maxHeight, Math.max(minHeight, nextHeight));
	}

	function resetManualHeight(): void {
		manualHeight = null;
		void tick().then(() => updateSize());
	}

	onDestroy(() => stopResize?.());
</script>

<form onsubmit={handleSubmit} class={className}>
	<label class="sr-only" for={id}>{ariaLabel}</label>
	{#if replyTo}
		<div
			class="mb-2 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-left"
		>
			<ReplyOutline class="size-4 shrink-0 text-blue-600" strokeWidth={1.7} />
			<div class="min-w-0 flex-1">
				<p class="truncate text-xs font-semibold text-blue-800">
					Ответ для {replyTo.senderDisplayName}
				</p>
				<p class="truncate text-xs text-slate-600">{replyTo.text}</p>
			</div>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				class="size-7 shrink-0 text-slate-500"
				aria-label="Отменить ответ"
				title="Отменить ответ"
				onclick={() => onCancelReply?.()}
			>
				<CloseOutline class="size-3.5" strokeWidth={1.8} />
			</Button>
		</div>
	{/if}
	<div class={styles.root()} style={`height: ${viewportHeight}px;`} aria-disabled={inactive}>
		{#if resizable}
			<!-- A focusable ARIA separator is an interactive resize control. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div
				class={styles.resizeHandle()}
				role="separator"
				tabindex={inactive ? undefined : 0}
				aria-label="Изменить высоту поля сообщения"
				aria-orientation="horizontal"
				aria-valuemin={minHeight}
				aria-valuemax={maxHeight}
				aria-valuenow={Math.round(viewportHeight)}
				onpointerdown={startResize}
				onkeydown={handleResizeKeydown}
				ondblclick={resetManualHeight}
			>
				<span class={styles.resizeGrip()} aria-hidden="true"></span>
			</div>
		{/if}
		<ScrollArea
			class={styles.scrollArea()}
			contentId={`${id}-scroll`}
			horizontal={false}
			scrollbarSize={6}
			scrollbarVisibility="hover"
			verticalLabel="Прокрутка поля сообщения"
		>
			<textarea
				{id}
				bind:this={textarea}
				bind:value
				maxlength={maxLength}
				rows="1"
				{placeholder}
				disabled={inactive}
				oninput={(event) => updateSize(event.currentTarget)}
				onkeydown={handleKeydown}
				onpaste={handlePaste}
				class={`${styles.textarea()} ${selectedFiles.length ? 'pb-24' : 'pb-12'}`}
				style={`height: ${textareaHeight}px;`}
			></textarea>
		</ScrollArea>
		{#if selectedFiles.length}
			<div class="absolute right-3 bottom-10 left-3 z-10 flex gap-1.5 overflow-x-auto pb-1">
				{#each selectedFiles as file, index (`${file.name}-${file.size}-${file.lastModified}`)}
					<span
						class="flex max-w-48 shrink-0 items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] text-slate-600"
					>
						<span class="truncate" title={file.name}>{file.name}</span>
						<button
							type="button"
							class="rounded px-1 text-slate-400 hover:text-red-500"
							aria-label={`Убрать ${file.name}`}
							onclick={() => removeFile(index)}>×</button
						>
					</span>
				{/each}
			</div>
		{/if}
		<div class={styles.footer()}>
			{#if attachments && onSendAttachments}
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class="size-8 shrink-0 !bg-transparent text-gray-400 hover:!bg-transparent hover:text-blue-600"
					disabled={inactive}
					aria-label="Прикрепить файлы"
					title="Прикрепить файлы"
					onclick={() => fileInput?.click()}
				>
					<PaperClipOutline class="size-4" strokeWidth={1.5} />
				</Button>
				<input
					bind:this={fileInput}
					type="file"
					class="hidden"
					multiple
					accept={attachmentAccept}
					disabled={inactive}
					onchange={chooseFiles}
				/>
			{/if}
			<button
				{...emojiPopover.trigger}
				type="button"
				class="grid size-8 shrink-0 place-items-center rounded-lg text-gray-400 transition outline-none hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500"
				disabled={inactive}
				aria-label="Добавить эмодзи"
				title="Добавить эмодзи"
			>
				<FaceGrinOutline class="size-4" strokeWidth={1.5} />
			</button>
			<span
				class={styles.counter()}
				aria-label={`Введено символов: ${value.length} из ${maxLength}`}
			>
				{value.length} / {maxLength}
			</span>
			<div class={styles.hints()} aria-hidden="true">
				<span><kbd class={styles.key()}>Enter</kbd> отправить</span>
				<span><kbd class={styles.key()}>Shift + Enter</kbd> новая строка</span>
			</div>
			<Button
				type="submit"
				variant="ghost"
				size="icon"
				class={`size-8 shrink-0 rounded-lg border-0 !bg-transparent p-0 shadow-none hover:!bg-transparent hover:shadow-none focus-visible:ring-blue-500 active:!bg-transparent disabled:!bg-transparent disabled:opacity-100 ${(value.trim() || selectedFiles.length) && !inactive ? '!text-blue-500 hover:!text-blue-700' : '!text-gray-400 hover:!text-gray-400'}`}
				disabled={(!value.trim() && selectedFiles.length === 0) || inactive}
				aria-label="Отправить сообщение"
				title="Отправить сообщение"
			>
				<PaperPlaneSolid class="size-4 rotate-90" />
			</Button>
		</div>
	</div>
	{#if attachmentError}<p class="mt-1 text-xs text-red-600" role="alert">{attachmentError}</p>{/if}
	{#if attachments && onSendAttachments}
		<p class="mt-1.5 text-xs text-slate-500">
			Вложения можно выбрать по скрепке или вставить из буфера сочетанием
			<kbd class="rounded bg-slate-100 px-1.5 py-0.5 font-sans text-slate-600">Ctrl+V</kbd>.
		</p>
	{/if}
	<div
		{...emojiPopover.content}
		class="z-[220] m-0 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
	>
		<ScrollArea
			class="h-56"
			horizontal={false}
			scrollbarSize={5}
			scrollbarVisibility="hover"
			verticalLabel="Прокрутка списка эмодзи"
		>
			<div class="grid grid-cols-8 gap-1 p-2 pr-3">
				{#each emojis as emoji (emoji)}
					<button
						type="button"
						class="grid min-h-8 place-items-center rounded-lg text-base transition hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
						aria-label={`Добавить эмодзи ${emoji}`}
						title={emoji}
						onclick={() => insertEmoji(emoji)}>{emoji}</button
					>
				{/each}
			</div>
		</ScrollArea>
	</div>
</form>
