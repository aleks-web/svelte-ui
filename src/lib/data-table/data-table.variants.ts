import { tv } from 'tailwind-variants';

export const dataTableVariants = tv({
	slots: {
		root: 'data-table relative min-h-0 w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white',
		loading: 'absolute inset-0 z-20 flex items-center justify-center bg-white',
		columnSettings: 'absolute top-[7px] right-2 z-[12]',
		topAccent:
			'pointer-events-none absolute inset-x-0 top-0 z-10 h-4 rounded-t-xl border-t-2 border-blue-700/80',
		headerBorder: 'pointer-events-none absolute inset-x-0 z-[7] h-px bg-blue-200',
		table: 'w-full table-fixed text-left text-sm',
		head: 'sticky top-0 z-[5] bg-linear-to-r from-blue-50 via-sky-50 to-indigo-50 text-[13px] font-semibold text-slate-700',
		body: 'divide-y divide-gray-100',
		selectionHead: 'px-3 py-3.5 text-center',
		selectionCell: 'px-3 text-center align-middle',
		selectionControl: 'mx-auto',
		emptyCell: 'px-4 py-10 text-center text-gray-500'
	}
});

export const dataTableHeadCellVariants = tv({
	base: 'data-table__head-cell relative whitespace-nowrap',
	variants: {
		resizeMode: { fit: 'overflow-hidden', overflow: '' },
		sortable: { true: 'p-0', false: 'px-4 py-3.5' },
		align: { left: 'text-left', center: 'text-center', right: 'text-right' },
		kind: {
			data: '',
			actions: 'w-px min-w-max overflow-visible whitespace-nowrap pl-4 pr-8'
		}
	},
	defaultVariants: { resizeMode: 'fit', sortable: false, align: 'left', kind: 'data' }
});

export const dataTableSortButtonVariants = tv({
	base: 'data-table__sort-button group flex h-full w-full cursor-pointer items-center gap-1.5 bg-transparent px-4 text-inherit transition-colors outline-none hover:bg-blue-100/60 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-inset',
	variants: {
		align: { left: 'justify-start', center: 'justify-center', right: 'justify-end' }
	},
	defaultVariants: { align: 'left' }
});

export const dataTableSortIconVariants = tv({
	base: 'h-3.5 w-3.5 shrink-0 transition-colors',
	variants: {
		active: { true: 'text-blue-700', false: 'text-slate-400 group-hover:text-blue-600' }
	},
	defaultVariants: { active: false }
});

export const dataTableResizeHandleVariants = tv({
	base: 'group absolute inset-y-0 -right-1 z-10 w-2 cursor-col-resize touch-none border-0 p-0 outline-none',
	variants: { active: { true: 'bg-blue-600/10', false: 'bg-transparent' } },
	defaultVariants: { active: false }
});

export const dataTableResizeLineVariants = tv({
	base: 'absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors group-hover:bg-blue-500 group-focus-visible:bg-blue-600',
	variants: { active: { true: 'bg-blue-600', false: 'bg-transparent' } },
	defaultVariants: { active: false }
});

export const dataTableRowVariants = tv({
	base: 'transition hover:bg-gray-50',
	variants: {
		interactive: {
			true: 'cursor-pointer outline-none focus-visible:bg-blue-50/70 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600',
			false: ''
		},
		selected: {
			true: 'bg-blue-50/60 hover:bg-blue-50/80',
			false: ''
		}
	},
	defaultVariants: { interactive: false, selected: false }
});

export const dataTableCellVariants = tv({
	variants: {
		density: {
			compact: 'px-3 py-2',
			default: 'px-4 py-3',
			comfortable: 'px-4 py-4'
		},
		resizeMode: { fit: 'overflow-hidden', overflow: '' },
		align: { left: 'text-left', center: 'text-center', right: 'text-right' },
		kind: {
			data: '',
			actions: 'w-px min-w-max overflow-visible whitespace-nowrap pl-4 pr-8'
		}
	},
	defaultVariants: { density: 'default', resizeMode: 'fit', align: 'left', kind: 'data' }
});
