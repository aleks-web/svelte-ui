import { tv } from 'tailwind-variants';

export const actionMenuVariants = tv({
	slots: {
		root: 'relative inline-flex',
		trigger: 'size-8 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-800',
		triggerIcon: 'size-4',
		content:
			'z-[260] w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-950/10 outline-none',
		item: 'flex w-full cursor-pointer items-start gap-2.5 rounded-lg border-0 bg-transparent px-3 py-2 text-left outline-none transition-colors hover:bg-blue-50 focus:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-55',
		itemIcon: 'mt-0.5 size-4 shrink-0 text-slate-500',
		itemText: 'min-w-0 flex-1',
		itemLabel: 'block text-sm font-semibold text-slate-800',
		itemDescription: 'mt-0.5 block text-xs leading-4 text-slate-500'
	},
	variants: {
		tone: {
			default: {},
			warning: {
				item: 'hover:bg-amber-50 focus:bg-amber-50',
				itemIcon: 'text-amber-700',
				itemLabel: 'text-amber-800'
			},
			danger: {
				item: 'hover:bg-red-50 focus:bg-red-50',
				itemIcon: 'text-red-600',
				itemLabel: 'text-red-700'
			}
		}
	}
});
