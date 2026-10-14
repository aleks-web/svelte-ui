import { tv } from 'tailwind-variants';

export const colorPickerVariants = tv({
	slots: {
		root: 'relative min-w-0',
		trigger:
			'group flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl border border-gray-300 bg-white px-3.5 text-left text-sm text-gray-800 shadow-sm transition outline-none hover:border-blue-300 hover:bg-blue-50/30 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 disabled:shadow-none',
		triggerSwatch:
			'size-6 shrink-0 rounded-lg ring-1 ring-gray-950/10 shadow-sm shadow-gray-950/10',
		triggerText: 'min-w-0 flex-1',
		triggerLabel: 'block truncate font-medium text-gray-800',
		triggerValue: 'block font-mono text-[11px] leading-4 text-gray-400 uppercase',
		triggerIcon:
			'size-4 shrink-0 text-gray-400 transition-transform duration-150 group-hover:text-blue-700',
		content:
			'z-[200] w-[19rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 bg-white p-3 shadow-xl shadow-gray-950/10 outline-none',
		heading: 'mb-2.5 text-xs font-semibold tracking-wide text-gray-500 uppercase',
		palette: 'grid grid-cols-7 gap-2',
		option:
			'group/swatch relative flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-transparent outline-none transition duration-150 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/25',
		optionColor: 'absolute inset-1 rounded-lg ring-1 ring-gray-950/10',
		optionCheck:
			'relative z-10 size-4 rounded-full bg-gray-950/70 p-0.5 text-white shadow-sm',
		customSection: 'mt-3 border-t border-gray-100 pt-3',
		customLabel: 'mb-1.5 block text-xs font-semibold text-gray-600',
		customRow: 'flex items-center gap-2',
		customPreview: 'size-9 shrink-0 rounded-xl ring-1 ring-gray-950/10',
		customInput:
			'h-9 min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 font-mono text-sm uppercase outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15',
		error: 'mt-1.5 text-xs text-red-600'
	},
	variants: {
		open: {
			true: {
				trigger: 'border-blue-600 ring-2 ring-blue-600/15',
				triggerIcon: 'rotate-180 text-blue-700'
			},
			false: ''
		}
	},
	defaultVariants: { open: false }
});
