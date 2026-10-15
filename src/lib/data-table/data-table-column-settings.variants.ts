import { tv } from 'tailwind-variants';

export const dataTableColumnSettingsVariants = tv({
	slots: {
		root: 'relative',
		trigger:
			'inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none',
		triggerIcon: 'size-4',
		triggerText: 'hidden sm:inline',
		content:
			'z-[220] flex max-h-[min(calc(100dvh-2rem),calc(var(--melt-popover-available-height)-1rem))] w-[min(21rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl shadow-slate-950/15 outline-none',
		header:
			'shrink-0 border-b border-blue-100 bg-linear-to-r from-blue-50/90 to-indigo-50/70 px-4 py-3',
		title: 'text-sm font-bold text-slate-900',
		description: 'mt-1 text-xs leading-4 text-slate-500',
		body:
			'min-h-0 max-h-[max(4.75rem,calc(var(--melt-popover-available-height)-9rem))] shrink p-3 pr-1.5',
		list: 'gap-2',
		item: 'flex min-h-12 min-w-0 items-center rounded-xl border border-slate-200 bg-white px-3 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/35',
		itemText: 'min-w-0 flex-1 truncate text-sm font-medium text-slate-700',
		footer:
			'flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 px-4 py-3',
		note: 'text-[11px] leading-4 text-slate-400'
	}
});
