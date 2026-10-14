<script module lang="ts">
	export type ScrollAreaState = {
		scrollTop: number;
		scrollLeft: number;
		scrollHeight: number;
		scrollWidth: number;
		viewportHeight: number;
		viewportWidth: number;
		maxVerticalScroll: number;
		maxHorizontalScroll: number;
		hasVerticalScroll: boolean;
		hasHorizontalScroll: boolean;
		canScrollUp: boolean;
		canScrollDown: boolean;
		canScrollLeft: boolean;
		canScrollRight: boolean;
	};

	export type ScrollbarVisibility = 'always' | 'hover';
</script>

<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	type Props = {
		children: Snippet;
		class?: string;
		contentClass?: string;
		contentStyle?: string;
		contentId?: string;
		horizontal?: boolean;
		scrollbarSize?: number;
		scrollbarVisibility?: ScrollbarVisibility;
		verticalStartOffset?: number;
		verticalLabel?: string;
		horizontalLabel?: string;
		onScrollStateChange?: (state: ScrollAreaState) => void;
	};

	let {
		children,
		class: className = '',
		contentClass = '',
		contentStyle,
		contentId,
		horizontal = true,
		scrollbarSize = 10,
		scrollbarVisibility = 'always',
		verticalStartOffset = 0,
		verticalLabel = 'Вертикальная прокрутка',
		horizontalLabel = 'Горизонтальная прокрутка',
		onScrollStateChange
	}: Props = $props();

	let scrollElement: HTMLDivElement | undefined = $state();
	let scrollTop = $state(0);
	let scrollLeft = $state(0);
	let scrollHeight = $state(0);
	let scrollWidth = $state(0);
	let viewportHeight = $state(0);
	let viewportWidth = $state(0);
	let draggingAxis: 'vertical' | 'horizontal' | null = $state(null);

	const CORNER_SAFE_INSET = 10;
	const TRACK_EDGE_OFFSET = 4;
	const MIN_THUMB_SIZE = 32;

	let safeScrollbarSize = $derived(Math.max(4, scrollbarSize));
	let thumbBorderWidth = $derived(Math.min(2, safeScrollbarSize / 4));
	let maxVerticalScroll = $derived(Math.max(0, scrollHeight - viewportHeight));
	let maxHorizontalScroll = $derived(Math.max(0, scrollWidth - viewportWidth));
	let hasVerticalScroll = $derived(maxVerticalScroll > 1);
	let hasHorizontalScroll = $derived(horizontal && maxHorizontalScroll > 1);
	let verticalTopInset = $derived(Math.max(verticalStartOffset, CORNER_SAFE_INSET));
	let verticalBottomInset = $derived(
		hasHorizontalScroll
			? Math.max(CORNER_SAFE_INSET, safeScrollbarSize + TRACK_EDGE_OFFSET)
			: CORNER_SAFE_INSET
	);
	let horizontalRightInset = $derived(
		hasVerticalScroll
			? Math.max(CORNER_SAFE_INSET, safeScrollbarSize + TRACK_EDGE_OFFSET)
			: CORNER_SAFE_INSET
	);
	let verticalTrackSize = $derived(
		Math.max(0, viewportHeight - verticalTopInset - verticalBottomInset)
	);
	let horizontalTrackSize = $derived(
		Math.max(0, viewportWidth - CORNER_SAFE_INSET - horizontalRightInset)
	);
	let verticalThumbSize = $derived(
		hasVerticalScroll
			? Math.min(
					verticalTrackSize,
					Math.max(MIN_THUMB_SIZE, verticalTrackSize * (viewportHeight / scrollHeight))
				)
			: 0
	);
	let horizontalThumbSize = $derived(
		hasHorizontalScroll
			? Math.min(
					horizontalTrackSize,
					Math.max(MIN_THUMB_SIZE, horizontalTrackSize * (viewportWidth / scrollWidth))
				)
			: 0
	);
	let verticalThumbPosition = $derived(
		maxVerticalScroll > 0
			? (scrollTop / maxVerticalScroll) * (verticalTrackSize - verticalThumbSize)
			: 0
	);
	let horizontalThumbPosition = $derived(
		maxHorizontalScroll > 0
			? (scrollLeft / maxHorizontalScroll) * (horizontalTrackSize - horizontalThumbSize)
			: 0
	);

	let stopActiveDrag: (() => void) | undefined;

	function updateMetrics(): void {
		if (!scrollElement) return;

		const nextScrollTop = scrollElement.scrollTop;
		const nextScrollLeft = scrollElement.scrollLeft;
		const nextScrollHeight = scrollElement.scrollHeight;
		const nextScrollWidth = scrollElement.scrollWidth;
		const nextViewportHeight = scrollElement.clientHeight;
		const nextViewportWidth = scrollElement.clientWidth;
		const nextMaxVerticalScroll = Math.max(0, nextScrollHeight - nextViewportHeight);
		const nextMaxHorizontalScroll = Math.max(0, nextScrollWidth - nextViewportWidth);
		const nextHasVerticalScroll = nextMaxVerticalScroll > 1;
		const nextHasHorizontalScroll = nextMaxHorizontalScroll > 1;

		scrollTop = nextScrollTop;
		scrollLeft = nextScrollLeft;
		scrollHeight = nextScrollHeight;
		scrollWidth = nextScrollWidth;
		viewportHeight = nextViewportHeight;
		viewportWidth = nextViewportWidth;

		onScrollStateChange?.({
			scrollTop: nextScrollTop,
			scrollLeft: nextScrollLeft,
			scrollHeight: nextScrollHeight,
			scrollWidth: nextScrollWidth,
			viewportHeight: nextViewportHeight,
			viewportWidth: nextViewportWidth,
			maxVerticalScroll: nextMaxVerticalScroll,
			maxHorizontalScroll: nextMaxHorizontalScroll,
			hasVerticalScroll: nextHasVerticalScroll,
			hasHorizontalScroll: nextHasHorizontalScroll,
			canScrollUp: nextHasVerticalScroll && nextScrollTop > 1,
			canScrollDown: nextHasVerticalScroll && nextScrollTop < nextMaxVerticalScroll - 1,
			canScrollLeft: nextHasHorizontalScroll && nextScrollLeft > 1,
			canScrollRight: nextHasHorizontalScroll && nextScrollLeft < nextMaxHorizontalScroll - 1
		});
	}

	function startDrag(axis: 'vertical' | 'horizontal', event: PointerEvent): void {
		if (!scrollElement) return;

		event.preventDefault();
		stopActiveDrag?.();
		draggingAxis = axis;

		const startPointerPosition = axis === 'vertical' ? event.clientY : event.clientX;
		const startScrollPosition =
			axis === 'vertical' ? scrollElement.scrollTop : scrollElement.scrollLeft;
		const maxScroll = axis === 'vertical' ? maxVerticalScroll : maxHorizontalScroll;
		const thumbTravel =
			axis === 'vertical'
				? verticalTrackSize - verticalThumbSize
				: horizontalTrackSize - horizontalThumbSize;

		const handlePointerMove = (moveEvent: PointerEvent): void => {
			if (!scrollElement || thumbTravel <= 0) return;

			const pointerPosition = axis === 'vertical' ? moveEvent.clientY : moveEvent.clientX;
			const nextScroll =
				startScrollPosition + ((pointerPosition - startPointerPosition) / thumbTravel) * maxScroll;

			if (axis === 'vertical') scrollElement.scrollTop = nextScroll;
			else scrollElement.scrollLeft = nextScroll;
		};

		const stopDrag = (): void => {
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', stopDrag);
			window.removeEventListener('pointercancel', stopDrag);
			stopActiveDrag = undefined;
			draggingAxis = null;
		};

		stopActiveDrag = stopDrag;
		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', stopDrag);
		window.addEventListener('pointercancel', stopDrag);
	}

	function getTrackVisibilityClass(axis: 'vertical' | 'horizontal'): string {
		if (scrollbarVisibility === 'always' || draggingAxis === axis) return 'opacity-100';
		return 'opacity-0 group-hover/scroll-area:opacity-100 group-focus-within/scroll-area:opacity-100';
	}

	function handleKeydown(axis: 'vertical' | 'horizontal', event: KeyboardEvent): void {
		if (!scrollElement) return;

		const current = axis === 'vertical' ? scrollElement.scrollTop : scrollElement.scrollLeft;
		const pageSize = axis === 'vertical' ? viewportHeight : viewportWidth;
		const maximum = axis === 'vertical' ? maxVerticalScroll : maxHorizontalScroll;
		let next: number | undefined;

		if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = maximum;
		else if (event.key === 'PageUp') next = current - pageSize;
		else if (event.key === 'PageDown') next = current + pageSize;
		else if (event.key === 'ArrowUp' && axis === 'vertical') next = current - 40;
		else if (event.key === 'ArrowDown' && axis === 'vertical') next = current + 40;
		else if (event.key === 'ArrowLeft' && axis === 'horizontal') next = current - 40;
		else if (event.key === 'ArrowRight' && axis === 'horizontal') next = current + 40;

		if (next === undefined) return;
		event.preventDefault();

		if (axis === 'vertical') scrollElement.scrollTop = next;
		else scrollElement.scrollLeft = next;
	}

	onMount(() => {
		if (!scrollElement) return;

		const resizeObserver = new ResizeObserver(updateMetrics);
		resizeObserver.observe(scrollElement);

		const observeChildren = () => {
			if (!scrollElement) return;
			for (const child of scrollElement.children) resizeObserver.observe(child);
			updateMetrics();
		};
		const mutationObserver = new MutationObserver(observeChildren);
		mutationObserver.observe(scrollElement, { childList: true });
		observeChildren();

		return () => {
			mutationObserver.disconnect();
			resizeObserver.disconnect();
			stopActiveDrag?.();
		};
	});
</script>

<div class={twMerge('group/scroll-area relative min-h-0 min-w-0', className)}>
	<div
		id={contentId}
		class={twMerge(
			`h-full w-full overflow-y-auto ${horizontal ? 'overflow-x-auto' : 'overflow-x-hidden'} [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0`,
			contentClass
		)}
		bind:this={scrollElement}
		style={contentStyle}
		onscroll={updateMetrics}
	>
		{@render children()}
	</div>

	{#if hasVerticalScroll}
		<div
			class={`pointer-events-none absolute z-[8] touch-none bg-transparent transition-opacity duration-150 ${getTrackVisibilityClass('vertical')}`}
			style:top={`${verticalTopInset}px`}
			style:right={`${TRACK_EDGE_OFFSET}px`}
			style:bottom={`${verticalBottomInset}px`}
			style:width={`${safeScrollbarSize}px`}
		>
			<div
				class="pointer-events-auto absolute top-0 right-0 cursor-grab touch-none rounded-full border-transparent bg-slate-400 bg-clip-padding p-0 transition-colors duration-150 outline-none select-none hover:bg-blue-500 focus-visible:bg-blue-500 active:cursor-grabbing active:bg-blue-600"
				style:height={`${verticalThumbSize}px`}
				style:width={`${safeScrollbarSize}px`}
				style:border-width={`${thumbBorderWidth}px`}
				style:transform={`translateY(${verticalThumbPosition}px)`}
				onpointerdown={(event) => startDrag('vertical', event)}
				onkeydown={(event) => handleKeydown('vertical', event)}
				role="scrollbar"
				tabindex="0"
				aria-label={verticalLabel}
				aria-controls={contentId}
				aria-orientation="vertical"
				aria-valuemin="0"
				aria-valuemax={Math.round(maxVerticalScroll)}
				aria-valuenow={Math.round(scrollTop)}
			></div>
		</div>
	{/if}

	{#if hasHorizontalScroll}
		<div
			class={`pointer-events-none absolute z-[8] touch-none bg-transparent transition-opacity duration-150 ${getTrackVisibilityClass('horizontal')}`}
			style:bottom={`${TRACK_EDGE_OFFSET}px`}
			style:left={`${CORNER_SAFE_INSET}px`}
			style:right={`${horizontalRightInset}px`}
			style:height={`${safeScrollbarSize}px`}
		>
			<div
				class="pointer-events-auto absolute bottom-0 left-0 cursor-grab touch-none rounded-full border-transparent bg-slate-400 bg-clip-padding p-0 transition-colors duration-150 outline-none select-none hover:bg-blue-500 focus-visible:bg-blue-500 active:cursor-grabbing active:bg-blue-600"
				style:width={`${horizontalThumbSize}px`}
				style:height={`${safeScrollbarSize}px`}
				style:border-width={`${thumbBorderWidth}px`}
				style:transform={`translateX(${horizontalThumbPosition}px)`}
				onpointerdown={(event) => startDrag('horizontal', event)}
				onkeydown={(event) => handleKeydown('horizontal', event)}
				role="scrollbar"
				tabindex="0"
				aria-label={horizontalLabel}
				aria-controls={contentId}
				aria-orientation="horizontal"
				aria-valuemin="0"
				aria-valuemax={Math.round(maxHorizontalScroll)}
				aria-valuenow={Math.round(scrollLeft)}
			></div>
		</div>
	{/if}
</div>
