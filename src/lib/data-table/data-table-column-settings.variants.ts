import { tv } from 'tailwind-variants';

export const dataTableColumnSettingsVariants = tv({
	slots: {
		root: 'relative',
		trigger:
			'flex size-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-blue-600 shadow-none transition-colors hover:bg-blue-100/70 hover:text-blue-800 focus-visible:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none',
		triggerIcon: 'size-4',
		content:
			'z-[220] w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl shadow-slate-950/15 outline-none',
		header: 'border-b border-blue-100 bg-linear-to-r from-blue-50/90 to-indigo-50/70 px-4 py-3',
		title: 'text-sm font-bold text-slate-900',
		description: 'mt-1 text-xs leading-4 text-slate-500',
		body: 'max-h-[min(26rem,60vh)] p-3',
		list: 'gap-2',
		item: 'flex min-h-12 min-w-0 items-center rounded-xl border border-slate-200 bg-white px-3 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/35',
		itemText: 'min-w-0 flex-1 truncate text-sm font-medium text-slate-700',
		footer: 'flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3',
		note: 'text-[11px] leading-4 text-slate-400'
	}
});
