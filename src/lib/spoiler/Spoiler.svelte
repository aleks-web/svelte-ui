<script lang="ts">
	import { Collapsible } from 'melt/builders';
	import { AngleDownOutline } from 'flowbite-svelte-icons';
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import { spoilerVariants } from './spoiler.variants';

	type Props = {
		children: Snippet;
		summary?: Snippet<[boolean]>;
		title?: string;
		open?: boolean;
		disabled?: boolean;
		ariaLabel?: string;
		class?: string;
		triggerClass?: string;
		contentClass?: string;
		animationDuration?: number;
		onOpenChange?: (open: boolean) => void;
	};

	let {
		children,
		summary,
		title,
		open = $bindable(false),
		disabled = false,
		ariaLabel,
		class: className = '',
		triggerClass = '',
		contentClass = '',
		animationDuration = 180,
		onOpenChange
	}: Props = $props();

	const collapsible = new Collapsible({
		open: () => open,
		disabled: () => disabled,
		onOpenChange: (next) => {
			open = next;
			onOpenChange?.(next);
		}
	});

	let styles = $derived(spoilerVariants({ open: collapsible.open }));
</script>

<div class={styles.root({ class: className })}>
	<button
		type="button"
		{...collapsible.trigger}
		aria-label={ariaLabel}
		class={styles.trigger({ class: triggerClass })}
	>
		<span class={styles.summary()}>
			{#if summary}
				{@render summary(collapsible.open)}
			{:else if title}
				<span class="font-semibold">{title}</span>
			{/if}
		</span>
		<AngleDownOutline class={styles.icon()} strokeWidth={1.5} />
	</button>

	{#if collapsible.open}
		<div
			{...collapsible.content}
			transition:slide={{ duration: animationDuration }}
			class={styles.content({ class: contentClass })}
		>
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.spoiler-trigger-open {
		background-image: linear-gradient(
			110deg,
			#ffffff 0%,
			#f0f9ff 20%,
			#f5f3ff 40%,
			#f7fbf9 60%,
			#faf5ff 80%,
			#ffffff 100%
		);
		background-size: 300% 100%;
		animation: spoiler-gradient-shimmer 14s ease-in-out infinite;
	}

	@keyframes spoiler-gradient-shimmer {
		0%,
		100% {
			background-position: 0% 50%;
		}

		50% {
			background-position: 100% 50%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spoiler-trigger-open {
			animation: none;
			background-position: 50% 50%;
		}
	}
</style>
