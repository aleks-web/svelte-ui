import { tv } from 'tailwind-variants';

export const tagInputVariants = tv({
	slots: {
		root: 'min-w-0',
		label: 'mb-1.5 block text-sm font-semibold text-gray-800',
		field:
			'flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-2.5 py-2 shadow-sm transition focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20',
		tag: 'inline-flex max-w-full items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-sm font-medium text-blue-800 ring-1 ring-inset ring-blue-200',
		tagLabel: 'min-w-0 truncate',
		remove:
			'inline-flex size-5 shrink-0 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-100 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
		input:
			'min-w-28 flex-1 bg-transparent px-1 py-0.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:text-gray-400',
		description: 'mt-1.5 text-xs leading-5 text-gray-500',
		error: 'mt-1.5 text-xs font-medium text-red-600'
	},
	variants: {
		disabled: {
			true: { field: 'cursor-not-allowed bg-gray-50 opacity-70' },
			false: ''
		},
		invalid: {
			true: { field: 'border-red-400 focus-within:border-red-500 focus-within:ring-red-500/15' },
			false: ''
		}
	},
	defaultVariants: { disabled: false, invalid: false }
});
