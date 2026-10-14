<script lang="ts">
	import Pagination from './Pagination.svelte';
	import PageSizeSelect from './PageSizeSelect.svelte';
	import { twMerge } from 'tailwind-merge';

	type PageChangeState = {
		curr: number;
		next: number;
	};

	let {
		total,
		page,
		pageSize,
		onPageChange,
		onPageSizeChange,
		pageSizeLabel = 'На странице',
		hideOnSinglePage = false,
		class: className
	}: {
		total: number;
		page: number;
		pageSize: number;
		onPageChange: (state: PageChangeState) => number;
		onPageSizeChange?: (pageSize: number) => void | Promise<void>;
		pageSizeLabel?: string;
		hideOnSinglePage?: boolean;
		class?: string;
	} = $props();

	let safeTotal = $derived(Math.max(0, total));
	let safePageSize = $derived(Math.max(1, pageSize));
	let pageCount = $derived(Math.max(1, Math.ceil(safeTotal / safePageSize)));
	let safePage = $derived(Math.min(pageCount, Math.max(1, page)));
	let displayedFrom = $derived(safeTotal > 0 ? (safePage - 1) * safePageSize + 1 : 0);
	let displayedTo = $derived(safeTotal > 0 ? Math.min(safePage * safePageSize, safeTotal) : 0);
</script>

{#if !hideOnSinglePage || pageCount > 1}
	<div
		class={twMerge('flex w-full shrink-0 flex-wrap items-center justify-between gap-3', className)}
	>
		<p class="flex flex-wrap items-center gap-x-2 text-sm text-slate-500" aria-live="polite">
			<span>Страница {safePage} из {pageCount}</span>
			<span aria-hidden="true" class="text-slate-300">•</span>
			<span>Показано {displayedFrom}–{displayedTo} из {safeTotal}</span>
		</p>

		<div class="ml-auto flex shrink-0 items-center gap-2">
			{#if onPageSizeChange}
				<PageSizeSelect value={safePageSize} label={pageSizeLabel} onChange={onPageSizeChange} />
			{/if}

			{#if pageCount > 1}
				<Pagination total={safeTotal} page={safePage} size={safePageSize} {onPageChange} />
			{/if}
		</div>
	</div>
{/if}
