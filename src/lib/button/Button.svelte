<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { buttonVariants, type ButtonSize, type ButtonVariant } from './button.variants';

	type Props = Omit<HTMLButtonAttributes, 'children' | 'class' | 'disabled'> & {
		children?: Snippet;
		variant?: ButtonVariant;
		size?: ButtonSize;
		fullWidth?: boolean;
		loading?: boolean;
		disabled?: boolean;
		class?: string;
	};

	let {
		children,
		variant = 'primary',
		size = 'default',
		fullWidth = false,
		loading = false,
		disabled = false,
		class: className = '',
		...rest
	}: Props = $props();
</script>

<button
	{...rest}
	disabled={disabled || loading}
	aria-busy={loading}
	class={buttonVariants({ variant, size, fullWidth, class: className })}
>
	{#if children}{@render children()}{/if}
</button>
