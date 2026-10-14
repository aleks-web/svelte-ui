<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		badgeVariants,
		type BadgeShape,
		type BadgeSize,
		type BadgeVariant
	} from './badge.variants';

	type Props = {
		children: Snippet;
		variant?: BadgeVariant;
		size?: BadgeSize;
		shape?: BadgeShape;
		class?: string;
		title?: string;
		style?: string;
	};

	let {
		children,
		variant = 'neutral',
		size = 'small',
		shape = 'pill',
		class: className = '',
		title,
		style
	}: Props = $props();
</script>

<span {title} {style} class={badgeVariants({ variant, size, shape, class: className })}>
	{@render children()}
</span>
