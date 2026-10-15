import { tv } from 'tailwind-variants';

export const treeViewVariants = tv({
	slots: {
		root: 'min-w-0 rounded-xl border border-gray-200 bg-white p-2 outline-none',
		group: 'space-y-0.5',
		item:
			'group flex min-h-9 cursor-pointer items-center gap-2 rounded-lg py-1.5 pr-2 text-sm text-gray-700 outline-none transition hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500/30 data-[selected]:bg-blue-50 data-[selected]:font-semibold data-[selected]:text-blue-900 aria-disabled:pointer-events-none aria-disabled:opacity-45',
		expander:
			'inline-flex size-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition hover:bg-white hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30',
		chevron: 'size-3.5 transition-transform duration-150',
		icon: 'size-4 shrink-0 text-amber-500',
		content: 'min-w-0 flex-1',
		label: 'block truncate',
		description: 'block truncate text-xs font-normal text-gray-500',
		status: 'px-3 py-2 text-xs text-gray-500',
		empty: 'px-3 py-6 text-center text-sm text-gray-500'
	}
});
