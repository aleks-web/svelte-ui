import { tv } from 'tailwind-variants';

export type CheckboxVisualState = 'unchecked' | 'checked' | 'indeterminate';

export const checkboxVariants = tv({
	slots: {
		root: 'group inline-flex cursor-pointer items-center gap-2 text-left text-sm text-gray-700 transition-colors outline-none hover:text-gray-950 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
		indicator:
			'relative flex size-4.5 shrink-0 items-center justify-center overflow-hidden rounded-[5px] border bg-white shadow-sm transition-colors',
		icon: 'absolute inset-0 m-auto size-3.5 transition-opacity duration-150',
		indeterminateIcon:
			'absolute inset-0 m-auto h-0.5 w-2 rounded-full bg-current transition-opacity duration-150',
		label: 'min-w-0'
	},
	variants: {
		state: {
			unchecked: {
				indicator: 'border-gray-300 text-transparent group-hover:border-blue-400',
				icon: 'opacity-0',
				indeterminateIcon: 'opacity-0'
			},
			checked: {
				indicator:
					'border-blue-700 bg-blue-700 text-white group-hover:border-blue-800 group-hover:bg-blue-800',
				icon: 'opacity-100',
				indeterminateIcon: 'opacity-0'
			},
			indeterminate: {
				indicator:
					'border-blue-700 bg-blue-700 text-white group-hover:border-blue-800 group-hover:bg-blue-800',
				icon: 'opacity-0',
				indeterminateIcon: 'opacity-100'
			}
		}
	},
	defaultVariants: { state: 'unchecked' }
});
