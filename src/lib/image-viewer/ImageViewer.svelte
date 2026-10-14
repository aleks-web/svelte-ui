<script lang="ts">
	import { Dialog } from 'melt/builders';
	import { CloseOutline } from 'flowbite-svelte-icons';
	import { onMount, type Snippet } from 'svelte';
	import { imageViewerVariants } from './image-viewer.variants';

	type Props = {
		src: string;
		alt?: string;
		title?: string;
		trigger: Snippet;
		triggerLabel?: string;
		class?: string;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	};

	let {
		src,
		alt = '',
		title = '',
		trigger,
		triggerLabel = 'Открыть изображение на весь экран',
		class: className = '',
		open = $bindable(false),
		onOpenChange
	}: Props = $props();

	const componentId = $props.id();
	const titleId = `${componentId}-title`;
	let mounted = false;
	const dialog = new Dialog({
		open: () => open,
		closeOnOutsideClick: true,
		onOpenChange: (next) => {
			open = next;
			onOpenChange?.(next);
		}
	});

	let styles = $derived(imageViewerVariants());
	let accessibleTitle = $derived(title || alt || 'Просмотр изображения');

	$effect(() => {
		const nextOpen = open;
		if (mounted) dialog.open = nextOpen;
	});

	onMount(() => {
		mounted = true;
		dialog.open = open;
	});
</script>

<button
	{...dialog.trigger}
	type="button"
	class={styles.trigger({ class: className })}
	aria-label={triggerLabel}
>
	{@render trigger()}
</button>

<dialog
	{...dialog.content}
	aria-labelledby={titleId}
	class={`${styles.content()} melt-image-dialog m-auto border-0 bg-transparent p-0 opacity-0 transition-opacity duration-150 data-[open]:opacity-100`}
>
	<h2 id={titleId} class="sr-only">{accessibleTitle}</h2>
	<button
		type="button"
		class={styles.close()}
		aria-label="Закрыть полноэкранный просмотр"
		title="Закрыть"
		onclick={() => (dialog.open = false)}
	>
		<CloseOutline class="size-5" strokeWidth={1.7} />
	</button>

	<div class={styles.imageWrap()}>
		<img class={styles.image()} {src} {alt} />
	</div>
</dialog>

<style>
	.melt-image-dialog::backdrop {
		background: transparent;
		transition: background-color 150ms ease;
	}

	.melt-image-dialog[data-open]::backdrop {
		background: rgb(255 255 255 / 0.65);
	}
</style>
