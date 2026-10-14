<script module lang="ts">
	export type OverflowRevealTrigger = 'self' | 'external' | 'both';
	export type OverflowRevealExternalBehavior = 'reveal' | 'loop';

	let isMaskProgressRegistered = false;

	function registerMaskProgress(): void {
		if (isMaskProgressRegistered || !('registerProperty' in CSS)) return;

		try {
			CSS.registerProperty({
				name: '--overflow-reveal-progress',
				syntax: '<number>',
				inherits: false,
				initialValue: '0'
			});
		} catch {
			// The property can remain registered after a hot module replacement.
		}

		isMaskProgressRegistered = true;
	}
</script>

<script lang="ts">
	import { flushSync, onMount, type Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	type Props = {
		children?: Snippet;
		value?: string | number | null;
		class?: string;
		contentClass?: string;
		fadeWidth?: number;
		speed?: number;
		delay?: number;
		focusable?: boolean;
		title?: string;
		ariaLabel?: string;
		active?: boolean;
		trigger?: OverflowRevealTrigger;
		externalBehavior?: OverflowRevealExternalBehavior;
		loopPause?: number;
	};

	let {
		children,
		value = null,
		class: className,
		contentClass,
		fadeWidth = 24,
		speed = 60,
		delay = 250,
		focusable = true,
		title,
		ariaLabel = 'Показать содержимое полностью',
		active = false,
		trigger = 'self',
		externalBehavior = 'reveal',
		loopPause = 1900
	}: Props = $props();

	let viewportElement: HTMLDivElement | undefined = $state();
	let contentElement: HTMLDivElement | undefined = $state();
	let overflowDistance = $state(0);
	let viewportWidth = $state(0);
	let isHovered = $state(false);
	let hasFocus = $state(false);
	let loopAtEnd = $state(false);
	let prefersReducedMotion = $state(false);
	let isSelectionMode = $state(false);
	let selectionPointerActive = $state(false);
	let selectionScrollLeft = $state(0);
	let resumeOffset: number | null = $state(null);
	let isHandoff = $state(false);
	let isRestoringLoop = $state(false);
	let handoffFrame: number | undefined;
	let resumeFrame: number | undefined;
	let restoreTimeoutId: number | undefined;

	let isOverflowing = $derived(overflowDistance > 1);
	let usesSelfTrigger = $derived(trigger === 'self' || trigger === 'both');
	let usesExternalTrigger = $derived(trigger === 'external' || trigger === 'both');
	let isSelfActive = $derived(usesSelfTrigger && (isHovered || hasFocus));
	let isExternalActive = $derived(usesExternalTrigger && active);
	let wantsExternalLoop = $derived(
		isOverflowing && isExternalActive && externalBehavior === 'loop' && !prefersReducedMotion
	);
	let shouldLoop = $derived(wantsExternalLoop && !isSelectionMode && !isRestoringLoop);
	let isRevealed = $derived(
		wantsExternalLoop
			? shouldLoop && loopAtEnd
			: isOverflowing && (isSelfActive || isExternalActive)
	);
	let transitionDuration = $derived(Math.max(600, (overflowDistance / Math.max(speed, 1)) * 1000));
	let safeFadeWidth = $derived(Math.min(Math.max(0, fadeWidth), viewportWidth / 2));
	let transformOffset = $derived(
		isSelectionMode ? 0 : (resumeOffset ?? (isRevealed ? overflowDistance : 0))
	);
	let maskProgress = $derived(
		isSelectionMode
			? getScrollProgress(selectionScrollLeft)
			: resumeOffset !== null
				? getScrollProgress(resumeOffset)
				: isRevealed
					? 1
					: 0
	);
	let maskImage = $derived(
		!isOverflowing
			? 'none'
			: `linear-gradient(to right, rgb(0 0 0 / calc(1 - var(--overflow-reveal-progress))) 0, black ${safeFadeWidth}px, black calc(100% - ${safeFadeWidth}px), rgb(0 0 0 / var(--overflow-reveal-progress)) 100%)`
	);

	function updateOverflow(): void {
		if (!viewportElement || !contentElement) return;

		viewportWidth = viewportElement.clientWidth;
		overflowDistance = Math.max(0, contentElement.scrollWidth - viewportWidth);
	}

	function getScrollProgress(offset: number): number {
		if (overflowDistance <= 0) return 0;
		return Math.min(1, Math.max(0, offset / overflowDistance));
	}

	function getCurrentTransformOffset(): number {
		if (!contentElement) return 0;

		const transform = window.getComputedStyle(contentElement).transform;
		if (transform === 'none') return 0;

		try {
			return Math.min(overflowDistance, Math.max(0, -new DOMMatrixReadOnly(transform).m41));
		} catch {
			return isRevealed ? overflowDistance : 0;
		}
	}

	function cancelSelectionHandoff(): void {
		if (handoffFrame !== undefined) window.cancelAnimationFrame(handoffFrame);
		if (resumeFrame !== undefined) window.cancelAnimationFrame(resumeFrame);
		if (restoreTimeoutId !== undefined) window.clearTimeout(restoreTimeoutId);

		handoffFrame = undefined;
		resumeFrame = undefined;
		restoreTimeoutId = undefined;
	}

	function enterSelectionMode(): void {
		if (isSelectionMode || !isOverflowing || !viewportElement) return;

		cancelSelectionHandoff();
		const currentOffset = getCurrentTransformOffset();

		isRestoringLoop = false;
		resumeOffset = null;
		selectionScrollLeft = currentOffset;
		isHandoff = true;
		isSelectionMode = true;
		flushSync();
		viewportElement.scrollLeft = currentOffset;

		handoffFrame = window.requestAnimationFrame(() => {
			isHandoff = false;
			handoffFrame = undefined;
		});
	}

	function leaveSelectionMode(): void {
		if (!isSelectionMode || !viewportElement) return;

		cancelSelectionHandoff();
		const currentOffset = viewportElement.scrollLeft;
		const restoreLoopFromCurrentPosition = wantsExternalLoop && currentOffset > 1;

		resumeOffset = currentOffset;
		isRestoringLoop = restoreLoopFromCurrentPosition;
		isHandoff = true;
		viewportElement.scrollLeft = 0;
		selectionScrollLeft = 0;
		isSelectionMode = false;
		flushSync();

		handoffFrame = window.requestAnimationFrame(() => {
			isHandoff = false;
			handoffFrame = undefined;
			flushSync();

			resumeFrame = window.requestAnimationFrame(() => {
				resumeOffset = null;
				resumeFrame = undefined;

				if (restoreLoopFromCurrentPosition) {
					restoreTimeoutId = window.setTimeout(() => {
						isRestoringLoop = false;
						restoreTimeoutId = undefined;
					}, transitionDuration + 50);
				}
			});
		});
	}

	function selectionIntersectsContent(): boolean {
		const selection = document.getSelection();
		if (!selection || selection.isCollapsed || !contentElement) return false;

		for (let index = 0; index < selection.rangeCount; index += 1) {
			try {
				if (selection.getRangeAt(index).intersectsNode(contentElement)) return true;
			} catch {
				// The content may have been replaced during a reactive update.
			}
		}

		return false;
	}

	function syncSelectionMode(): void {
		if (selectionIntersectsContent()) enterSelectionMode();
		else if (!selectionPointerActive) leaveSelectionMode();
	}

	function handlePointerDown(event: PointerEvent): void {
		if (event.button === 0) selectionPointerActive = true;
	}

	function handlePointerEnd(): void {
		if (!selectionPointerActive) return;

		selectionPointerActive = false;
		queueMicrotask(syncSelectionMode);
	}

	function handleSelectionScroll(): void {
		if (isSelectionMode && viewportElement) {
			selectionScrollLeft = viewportElement.scrollLeft;
		}
	}

	function handleContentTransitionEnd(event: TransitionEvent): void {
		if (event.propertyName !== 'transform' || !isRestoringLoop || resumeOffset !== null) return;

		if (restoreTimeoutId !== undefined) window.clearTimeout(restoreTimeoutId);
		restoreTimeoutId = undefined;
		isRestoringLoop = false;
	}

	function handleFocusOut(event: FocusEvent): void {
		if (!viewportElement?.contains(event.relatedTarget as Node | null)) hasFocus = false;
	}

	$effect(() => {
		if (!wantsExternalLoop) isRestoringLoop = false;
	});

	$effect(() => {
		if (!shouldLoop) {
			loopAtEnd = false;
			return;
		}

		const travelDuration = transitionDuration;
		const endpointPause = Math.max(0, loopPause);
		const startDelay = Math.max(0, delay);
		let timeoutId: number | undefined;
		let stopped = false;

		function scheduleMove(toEnd: boolean, waitBefore: number): void {
			timeoutId = window.setTimeout(() => {
				if (stopped) return;
				loopAtEnd = toEnd;

				timeoutId = window.setTimeout(() => {
					if (!stopped) scheduleMove(!toEnd, endpointPause);
				}, travelDuration);
			}, waitBefore);
		}

		loopAtEnd = false;
		scheduleMove(true, startDelay);

		return () => {
			stopped = true;
			if (timeoutId !== undefined) window.clearTimeout(timeoutId);
			loopAtEnd = false;
		};
	});

	onMount(() => {
		if (!viewportElement || !contentElement) return;
		registerMaskProgress();
		const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const updateMotionPreference = (): void => {
			prefersReducedMotion = reducedMotionQuery.matches;
		};

		const resizeObserver = new ResizeObserver(updateOverflow);
		resizeObserver.observe(viewportElement);
		resizeObserver.observe(contentElement);
		reducedMotionQuery.addEventListener('change', updateMotionPreference);
		updateMotionPreference();
		updateOverflow();

		return () => {
			resizeObserver.disconnect();
			reducedMotionQuery.removeEventListener('change', updateMotionPreference);
			cancelSelectionHandoff();
		};
	});
</script>

<svelte:document onselectionchange={syncSelectionMode} />
<svelte:window onpointerup={handlePointerEnd} onpointercancel={handlePointerEnd} />

<!-- The role and tabindex only become active together after overflow is measured. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	bind:this={viewportElement}
	class={twMerge(
		'block max-w-full min-w-0 overflow-x-hidden overflow-y-hidden transition-[--overflow-reveal-progress] duration-200 ease-out motion-reduce:transition-none',
		isSelectionMode &&
			'overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0',
		className
	)}
	style={`--overflow-reveal-progress: ${maskProgress}; -webkit-mask-image: ${maskImage}; mask-image: ${maskImage};`}
	tabindex={focusable && usesSelfTrigger && isOverflowing ? 0 : undefined}
	role={focusable && usesSelfTrigger && isOverflowing ? 'region' : undefined}
	aria-label={isOverflowing ? ariaLabel : undefined}
	{title}
	onpointerdown={handlePointerDown}
	onpointerenter={() => (isHovered = true)}
	onpointerleave={() => (isHovered = false)}
	onfocusin={() => (hasFocus = true)}
	onfocusout={handleFocusOut}
	onscroll={handleSelectionScroll}
	onselectstart={enterSelectionMode}
>
	<div
		bind:this={contentElement}
		class={twMerge(
			'inline-flex max-w-none min-w-max items-center whitespace-nowrap transition-transform ease-linear select-text motion-reduce:transition-none',
			isOverflowing && 'will-change-transform',
			(isSelectionMode || isHandoff) && 'transition-none',
			contentClass
		)}
		style:transform={`translate3d(-${transformOffset}px, 0, 0)`}
		style:transition-duration={`${transitionDuration}ms`}
		style:transition-delay={!isSelectionMode &&
		!isHandoff &&
		resumeOffset === null &&
		!shouldLoop &&
		isRevealed
			? `${Math.max(0, delay)}ms`
			: '0ms'}
		ontransitionend={handleContentTransitionEnd}
	>
		{#if children}
			{@render children()}
		{:else}
			{value ?? ''}
		{/if}
	</div>
</div>
