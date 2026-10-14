<script lang="ts">
	import { untrack } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	let {
		class: className,
		total,
		count,
		page: currentPage,
		defaultPage,
		size,
		perPage,
		onPageChange = $bindable((state) => state.next)
	}: {
		class?: string;
		total?: number;
		count?: number;
		page?: number;
		defaultPage?: number;
		size?: number;
		perPage?: number;
		onPageChange?: (state: { curr: number; next: number }) => number;
	} = $props();

	const resolvedTotal = $derived(total ?? count ?? 0);
	let internalPage = $state(untrack(() => currentPage ?? defaultPage ?? 1));
	const resolvedPage = $derived(currentPage ?? internalPage);
	const resolvedSize = $derived(size ?? perPage ?? 5);
	const totalPages = $derived(Math.max(1, Math.ceil(resolvedTotal / Math.max(1, resolvedSize))));
	type PageItem = { type: 'page'; value: number; key: string } | { type: 'ellipsis'; key: string };
	let pages = $derived.by<PageItem[]>(() => {
		const candidates = new Set([1, totalPages, resolvedPage - 1, resolvedPage, resolvedPage + 1]);
		const pageNumbers = [...candidates]
			.filter((page) => page >= 1 && page <= totalPages)
			.sort((left, right) => left - right);
		const result: PageItem[] = [];
		for (const [index, page] of pageNumbers.entries()) {
			const previous = pageNumbers[index - 1];
			if (previous !== undefined && page - previous > 1) {
				result.push({ type: 'ellipsis', key: `ellipsis-${previous}-${page}` });
			}
			result.push({ type: 'page', value: page, key: `page-${page}` });
		}
		return result;
	});

	const controlButton = `
		inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3
		cursor-pointer text-sm font-medium text-slate-600 transition-colors
		hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700
		focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
		disabled:pointer-events-none disabled:cursor-default disabled:bg-slate-50 disabled:text-slate-300
	`;

	const pageButton = `
		inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-transparent px-2
		cursor-pointer text-sm font-medium text-slate-600 transition-colors
		hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700
		focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
		data-[selected]:border-blue-700 data-[selected]:bg-blue-700 data-[selected]:text-white
		data-[selected]:pointer-events-none data-[selected]:cursor-default data-[selected]:hover:bg-blue-700
	`;

	function selectPage(nextPage: number): void {
		const next = Math.min(totalPages, Math.max(1, nextPage));
		if (next === resolvedPage) return;
		internalPage = onPageChange({ curr: resolvedPage, next });
	}
</script>

<nav class={twMerge(className)} aria-label="Постраничная навигация">
	<div class="flex flex-wrap items-center gap-1.5">
		<button
			type="button"
			class={controlButton}
			disabled={resolvedPage <= 1}
			aria-label="Предыдущая страница"
			onclick={() => selectPage(resolvedPage - 1)}
		>
			<svg
				aria-hidden="true"
				class="h-4 w-4"
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				stroke-width="1.75"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="m10 3-5 5 5 5" />
			</svg>
			<span>Назад</span>
		</button>

		<div class="flex items-center gap-1" aria-label="Страницы">
			{#each pages as pageItem (pageItem.key)}
				{#if pageItem.type === 'ellipsis'}
					<span
						class="inline-flex h-9 min-w-7 items-center justify-center text-slate-400"
						aria-hidden="true"
					>
						&hellip;
					</span>
				{:else}
					<button
						type="button"
						class={pageButton}
						data-selected={pageItem.value === resolvedPage ? '' : undefined}
						aria-current={pageItem.value === resolvedPage ? 'page' : undefined}
						aria-label={`Страница ${pageItem.value}`}
						onclick={() => selectPage(pageItem.value)}
					>
						{pageItem.value}
					</button>
				{/if}
			{/each}
		</div>

		<button
			type="button"
			class={controlButton}
			disabled={resolvedPage >= totalPages}
			aria-label="Следующая страница"
			onclick={() => selectPage(resolvedPage + 1)}
		>
			<span>Вперёд</span>
			<svg
				aria-hidden="true"
				class="h-4 w-4"
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				stroke-width="1.75"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="m6 3 5 5-5 5" />
			</svg>
		</button>
	</div>
</nav>
