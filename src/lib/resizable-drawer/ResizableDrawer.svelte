<script lang="ts">
	import { Dialog } from 'melt/builders';
	import { onMount, untrack, type Snippet } from 'svelte';
	import { resizableDrawerVariants } from './resizable-drawer.variants';

	type Props = {
		open: boolean;
		onClose: () => void;
		children: Snippet;
		ariaLabel?: string;
		ariaLabelledby?: string;
		backdropLabel?: string;
		defaultWidth?: number;
		minWidth?: number;
		minViewportWidth?: number;
		maxWidth?: number;
		storageKey?: string;
		resizable?: boolean;
		closeOnBackdrop?: boolean;
		zIndex?: number;
		panelClass?: string;
		overlayClass?: string;
		showOverlay?: boolean;
		panelElement?: HTMLDivElement;
	};

	let {
		open,
		onClose,
		children,
		ariaLabel,
		ariaLabelledby,
		backdropLabel = 'Закрыть окно',
		defaultWidth = 760,
		minWidth = 520,
		minViewportWidth = 0,
		maxWidth = 1080,
		storageKey,
		resizable = true,
		closeOnBackdrop = true,
		zIndex = 100,
		panelClass = '',
		overlayClass = '',
		showOverlay = true,
		panelElement = $bindable()
	}: Props = $props();

	let mounted = false;
	const dialog = new Dialog({
		open: false,
		closeOnOutsideClick: () => closeOnBackdrop,
		onOpenChange: (next) => {
			if (!next && open) onClose();
		}
	});

	let drawerWidth = $state(untrack(() => defaultWidth));
	let drawerMinWidth = $state(untrack(() => minWidth));
	let drawerMaxWidth = $state(untrack(() => maxWidth));
	let resizing = $state(false);
	let resizePointerId: number | null = null;
	let resizeStartX = 0;
	let resizeStartWidth = 0;
	let previousBodyCursor = '';
	let previousBodyUserSelect = '';
	const styles = $derived(resizableDrawerVariants({ resizing }));
	const handleSafeGutter = 12;

	function updateBounds(): void {
		const safeGutter =
			resizable && window.matchMedia('(min-width: 640px)').matches ? handleSafeGutter : 0;
		drawerMaxWidth = Math.min(maxWidth, Math.max(0, window.innerWidth - safeGutter));
		drawerMinWidth = Math.min(
			Math.max(minWidth, window.innerWidth * Math.max(0, Math.min(1, minViewportWidth))),
			drawerMaxWidth
		);
		drawerWidth = Math.min(drawerMaxWidth, Math.max(drawerMinWidth, drawerWidth));
	}

	function persistWidth(): void {
		if (!storageKey) return;
		try {
			localStorage.setItem(storageKey, String(Math.round(drawerWidth)));
		} catch {
			// Keep the selected width for the current session when storage is unavailable.
		}
	}

	function setWidth(width: number, persist = false): void {
		drawerWidth = Math.min(drawerMaxWidth, Math.max(drawerMinWidth, width));
		if (persist) persistWidth();
	}

	function startResize(event: PointerEvent): void {
		if (!resizable || event.button !== 0) return;
		event.preventDefault();
		resizePointerId = event.pointerId;
		resizeStartX = event.clientX;
		resizeStartWidth = drawerWidth;
		resizing = true;
		(event.currentTarget as HTMLButtonElement).setPointerCapture(event.pointerId);
		previousBodyCursor = document.body.style.cursor;
		previousBodyUserSelect = document.body.style.userSelect;
		document.body.style.cursor = 'ew-resize';
		document.body.style.userSelect = 'none';
	}

	function moveResize(event: PointerEvent): void {
		if (!resizing || event.pointerId !== resizePointerId) return;
		setWidth(resizeStartWidth + resizeStartX - event.clientX);
	}

	function finishResize(event: PointerEvent): void {
		if (event.pointerId !== resizePointerId) return;
		resizePointerId = null;
		resizing = false;
		document.body.style.cursor = previousBodyCursor;
		document.body.style.userSelect = previousBodyUserSelect;
		persistWidth();
	}

	function handleResizeKeydown(event: KeyboardEvent): void {
		let nextWidth: number | null = null;
		if (event.key === 'ArrowLeft') nextWidth = drawerWidth + 24;
		if (event.key === 'ArrowRight') nextWidth = drawerWidth - 24;
		if (event.key === 'Home') nextWidth = drawerMinWidth;
		if (event.key === 'End') nextWidth = drawerMaxWidth;
		if (nextWidth === null) return;
		event.preventDefault();
		setWidth(nextWidth, true);
	}

	function resetWidth(): void {
		setWidth(defaultWidth, true);
	}

	$effect(() => {
		const nextOpen = open;
		if (mounted) dialog.open = nextOpen;
	});

	onMount(() => {
		mounted = true;
		updateBounds();
		if (storageKey) {
			try {
				const storedWidth = Number(localStorage.getItem(storageKey));
				if (Number.isFinite(storedWidth) && storedWidth > 0) setWidth(storedWidth);
			} catch {
				// Use the configured default when storage is unavailable.
			}
		}
		dialog.open = open;
		window.addEventListener('resize', updateBounds);
		return () => {
			window.removeEventListener('resize', updateBounds);
			document.body.style.cursor = previousBodyCursor;
			document.body.style.userSelect = previousBodyUserSelect;
		};
	});
</script>

<dialog
	{...dialog.content}
	class={`melt-resizable-drawer m-0 ml-auto h-dvh max-h-none max-w-full translate-x-full overflow-visible border-0 bg-transparent p-0 transition-transform duration-300 ease-out will-change-transform outline-none data-[open]:translate-x-0 motion-reduce:transition-none ${showOverlay ? 'drawer-with-overlay' : ''}`}
	style:z-index={zIndex + 1}
	style:--drawer-panel-width={`${drawerWidth}px`}
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	data-backdrop-label={backdropLabel}
	data-overlay-class={overlayClass || undefined}
>
	<div class={styles.shell()}>
		{#if resizable}
			<button
				type="button"
				aria-label={`Изменить ширину окна. Текущая ширина ${Math.round(drawerWidth)} пикселей`}
				title="Потяните, чтобы изменить ширину. Двойной клик — сбросить"
				class={styles.handle()}
				onpointerdown={startResize}
				onpointermove={moveResize}
				onpointerup={finishResize}
				onpointercancel={finishResize}
				onkeydown={handleResizeKeydown}
				ondblclick={resetWidth}
			>
				<span class={styles.handleLines()} aria-hidden="true">
					<span class={styles.handleLine()}></span>
					<span class={styles.handleLineActive()}></span>
					<span class={styles.handleLine()}></span>
				</span>
			</button>
		{/if}
		<div bind:this={panelElement} class={styles.panel({ class: panelClass })} style:width="100%">
			{@render children()}
		</div>
	</div>
</dialog>

<style>
	.melt-resizable-drawer::backdrop {
		background: transparent;
		transition: background-color 200ms ease;
	}

	.melt-resizable-drawer {
		width: var(--drawer-panel-width);
	}

	@media (min-width: 640px) {
		.melt-resizable-drawer {
			width: calc(var(--drawer-panel-width) + 12px);
		}
	}

	.melt-resizable-drawer.drawer-with-overlay[data-open]::backdrop {
		background: rgb(3 7 18 / 0.3);
	}
</style>
