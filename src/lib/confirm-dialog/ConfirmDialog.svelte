<script lang="ts">
	import { Dialog } from 'melt/builders';
	import { onMount, type Snippet } from 'svelte';
	import Button from '../button/Button.svelte';
	import { buttonVariants, type ButtonSize, type ButtonVariant } from '../button/button.variants';
	import { confirmDialogVariants, type ConfirmDialogVariant } from './confirm-dialog.variants';

	type Props = {
		trigger: Snippet;
		children?: Snippet;
		title: string;
		description?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		variant?: ConfirmDialogVariant;
		triggerVariant?: ButtonVariant;
		triggerSize?: ButtonSize;
		triggerClass?: string;
		confirmForm?: string;
		disabled?: boolean;
		loading?: boolean;
		open?: boolean;
		closeOnOutsideClick?: boolean;
		onConfirm?: () => void | Promise<void>;
		onOpenChange?: (open: boolean) => void;
	};

	let {
		trigger,
		children,
		title,
		description,
		confirmLabel = 'Подтвердить',
		cancelLabel = 'Отмена',
		variant = 'default',
		triggerVariant = 'secondary',
		triggerSize = 'default',
		triggerClass = '',
		confirmForm,
		disabled = false,
		loading = false,
		open = $bindable(false),
		closeOnOutsideClick = true,
		onConfirm,
		onOpenChange
	}: Props = $props();

	const componentId = $props.id();
	const titleId = `${componentId}-title`;
	const descriptionId = `${componentId}-description`;
	let mounted = false;
	const dialog = new Dialog({
		open: () => open,
		closeOnOutsideClick: () => closeOnOutsideClick,
		onOpenChange: (next) => {
			open = next;
			onOpenChange?.(next);
		}
	});

	let styles = $derived(confirmDialogVariants({ variant }));
	let confirmVariant = $derived<ButtonVariant>(
		variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'primary'
	);

	$effect(() => {
		const nextOpen = open;
		if (mounted) dialog.open = nextOpen;
	});

	onMount(() => {
		mounted = true;
		dialog.open = open;
	});

	async function handleConfirm(): Promise<void> {
		await onConfirm?.();
		if (confirmForm) {
			const targetForm = document.getElementById(confirmForm);
			if (!(targetForm instanceof HTMLFormElement)) return;
			targetForm.requestSubmit();
		}
		dialog.open = false;
	}
</script>

<button
	{...dialog.trigger}
	type="button"
	{disabled}
	class={buttonVariants({
		variant: triggerVariant,
		size: triggerSize,
		class: triggerClass
	})}
>
	{@render trigger()}
</button>

<dialog
	{...dialog.content}
	role="alertdialog"
	aria-labelledby={titleId}
	aria-describedby={description ? descriptionId : undefined}
	class={`${styles.content()} melt-dialog-content m-auto p-0 opacity-0 transition-[opacity,scale] duration-200 data-[open]:scale-100 data-[open]:opacity-100`}
>
	<header class={styles.header()}>
		<h2 id={titleId} class={styles.title()}>{title}</h2>
		{#if description}
			<p id={descriptionId} class={styles.description()}>{description}</p>
		{/if}
	</header>

	{#if children}
		<div class={styles.body()}>{@render children()}</div>
	{/if}

	<footer class={styles.footer()}>
		<button
			type="button"
			class={buttonVariants({ variant: 'secondary' })}
			onclick={() => (dialog.open = false)}
		>
			{cancelLabel}
		</button>
		<Button
			type="button"
			variant={confirmVariant}
			disabled={loading}
			{loading}
			onclick={handleConfirm}
		>
			{confirmLabel}
		</Button>
	</footer>
</dialog>

<style>
	.melt-dialog-content {
		scale: 0.96;
	}

	.melt-dialog-content::backdrop {
		background: transparent;
		transition: background-color 180ms ease;
	}

	.melt-dialog-content[data-open]::backdrop {
		background: rgb(3 7 18 / 0.4);
	}
</style>
