<script module lang="ts">
	export type ProgressBarTone = 'primary' | 'success' | 'danger' | 'warning';
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let {
		value = null,
		max = 100,
		ariaLabel = 'Прогресс',
		tone = 'primary',
		class: className = ''
	}: {
		value?: number | null;
		max?: number;
		ariaLabel?: string;
		tone?: ProgressBarTone;
		class?: string;
	} = $props();

	let normalizedMax = $derived(Number.isFinite(max) && max > 0 ? max : 100);
	let percentage = $derived(
		value === null || !Number.isFinite(value)
			? null
			: Math.min(100, Math.max(0, (value / normalizedMax) * 100))
	);
	let color = $derived(
		tone === 'success'
			? 'bg-emerald-500'
			: tone === 'danger'
				? 'bg-red-500'
				: tone === 'warning'
					? 'bg-amber-500'
					: 'bg-blue-600'
	);
</script>

<div
	class={twMerge('h-2.5 w-full overflow-hidden rounded-full bg-slate-200', className)}
	role="progressbar"
	aria-label={ariaLabel}
	aria-valuemin="0"
	aria-valuemax={normalizedMax}
	aria-valuenow={value === null ? undefined : Math.min(normalizedMax, Math.max(0, value))}
>
	{#if percentage === null}
		<div class={`progress-bar__indeterminate h-full w-2/5 rounded-full ${color}`}></div>
	{:else}
		<div
			class={`h-full rounded-full transition-[width] duration-300 ease-out ${color}`}
			style={`width: ${percentage}%`}
		></div>
	{/if}
</div>

<style>
	.progress-bar__indeterminate {
		animation: progress-bar-indeterminate 1.25s ease-in-out infinite;
	}

	@keyframes progress-bar-indeterminate {
		0% {
			transform: translateX(-110%);
		}
		100% {
			transform: translateX(260%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.progress-bar__indeterminate {
			animation: none;
			transform: translateX(75%);
		}
	}
</style>
