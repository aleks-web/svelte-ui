import { tv } from 'tailwind-variants';

export const exportMenuVariants = tv({
	slots: {
		root: 'relative inline-flex',
		content:
			'z-[260] w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl shadow-gray-950/10 outline-none',
		item: 'flex w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 py-2.5 text-left text-sm text-gray-700 outline-none transition-colors hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 focus:text-blue-900 disabled:cursor-not-allowed disabled:opacity-45',
		itemIcon: 'size-5 shrink-0 text-gray-500',
		itemText: 'min-w-0 flex-1',
		itemLabel: 'block font-semibold text-gray-900',
		itemDescription: 'mt-0.5 block text-xs leading-4 text-gray-500',
		triggerIcon: 'size-4 shrink-0',
		triggerChevron: 'size-3.5 shrink-0 transition-transform duration-150'
	}
});
