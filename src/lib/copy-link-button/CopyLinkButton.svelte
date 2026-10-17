<script lang="ts">
	import { ClipboardOutline, CheckOutline } from 'flowbite-svelte-icons';
	import Button from '../button/Button.svelte';
	import type { ButtonSize, ButtonVariant } from '../button/button.variants';

	type Props = {
		value?: string | (() => string);
		label?: string;
		copiedLabel?: string;
		errorLabel?: string;
		variant?: ButtonVariant;
		size?: ButtonSize;
		iconOnly?: boolean;
		disabled?: boolean;
		class?: string;
		resetAfter?: number;
		onCopied?: (value: string) => void;
		onError?: (error: unknown) => void;
	};

	let {
		value,
		label = 'Скопировать ссылку',
		copiedLabel = 'Ссылка скопирована',
		errorLabel = 'Не удалось скопировать ссылку',
		variant = 'secondary',
		size = 'compact',
		iconOnly = false,
		disabled = false,
		class: className = '',
		resetAfter = 2_000,
		onCopied,
		onError
	}: Props = $props();

	let state = $state<'idle' | 'copied' | 'error'>('idle');
	let resetTimer: ReturnType<typeof setTimeout> | undefined;
	let currentLabel = $derived(
		state === 'copied' ? copiedLabel : state === 'error' ? errorLabel : label
	);

	function sourceValue(): string {
		if (typeof value === 'function') return value();
		if (typeof value === 'string') return value;
		return window.location.href;
	}

	async function writeClipboard(text: string): Promise<void> {
		if (navigator.clipboard?.writeText) {
			try {
				await navigator.clipboard.writeText(text);
				return;
			} catch {
				// Sandboxed webviews may expose Clipboard API but reject writes.
			}
		}
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.setAttribute('readonly', '');
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';
		document.body.append(textarea);
		textarea.select();
		const copied = document.execCommand('copy');
		textarea.remove();
		if (!copied) throw new Error('Clipboard API is unavailable.');
	}

	function scheduleReset(): void {
		if (resetTimer) clearTimeout(resetTimer);
		resetTimer = setTimeout(() => (state = 'idle'), Math.max(0, resetAfter));
	}

	async function copy(): Promise<void> {
		try {
			const text = sourceValue();
			await writeClipboard(text);
			state = 'copied';
			onCopied?.(text);
		} catch (error) {
			state = 'error';
			onError?.(error);
		} finally {
			scheduleReset();
		}
	}
</script>

<Button
	type="button"
	{variant}
	size={iconOnly ? 'icon' : size}
	{disabled}
	class={className}
	aria-label={currentLabel}
	title={currentLabel}
	onclick={copy}
>
	{#if state === 'copied'}
		<CheckOutline class="size-4" aria-hidden="true" />
	{:else}
		<ClipboardOutline class="size-4" aria-hidden="true" />
	{/if}
	{#if !iconOnly}<span aria-live="polite">{currentLabel}</span>{/if}
</Button>
