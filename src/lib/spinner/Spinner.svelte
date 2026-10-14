<script lang="ts">
	import { spinnerVariants, type SpinnerSize } from './spinner.variants';

	type Props = {
		size?: SpinnerSize | number;
		label?: string;
		class?: string;
	};

	let { size = 'md', label = 'Загрузка', class: className = '' }: Props = $props();
	let numericSize = $derived(
		typeof size === 'number' ? `${Math.max(1, Math.round(size))}px` : undefined
	);
</script>

<span
	role="status"
	aria-label={label}
	class={spinnerVariants({
		size: typeof size === 'number' ? undefined : size,
		class: className
	})}
	style:width={numericSize}
	style:height={numericSize}
>
	<svg
		aria-hidden="true"
		class="size-full animate-spin motion-reduce:animate-none"
		viewBox="0 0 24 24"
		fill="none"
	>
		<circle class="opacity-20" cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3"
		></circle>
		<path
			class="opacity-90"
			d="M21 12a9 9 0 0 0-9-9"
			stroke="currentColor"
			stroke-width="3"
			stroke-linecap="round"
		></path>
	</svg>
</span>
