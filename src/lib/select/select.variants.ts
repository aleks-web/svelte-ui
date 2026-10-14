import { tv, type VariantProps } from 'tailwind-variants';

export const selectVariants = tv({
	slots: {
		root: 'relative min-w-0',
		trigger:
			'group flex w-full cursor-pointer items-center justify-between gap-3 border border-gray-300 bg-white text-left text-gray-800 shadow-sm transition outline-none hover:border-blue-300 hover:bg-blue-50/30 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 disabled:shadow-none',
		value: 'min-w-0 flex-1 truncate',
		icon: 'size-4 shrink-0 text-gray-400 transition-transform duration-150 group-hover:text-blue-700',
		menu: 'z-[240] max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl shadow-gray-950/10 outline-none',
		option:
			'flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 text-sm text-gray-700 transition-colors outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900 data-[selected]:bg-blue-50 data-[selected]:font-semibold data-[selected]:text-blue-800'
	},
	variants: {
		size: {
			default: { trigger: 'h-11 rounded-xl px-3.5 text-sm', option: 'min-h-9' },
			compact: { trigger: 'h-9 rounded-lg px-3 text-sm', option: 'min-h-8' }
		},
		open: {
			true: {
				trigger: 'border-blue-600 ring-2 ring-blue-600/15',
				icon: 'rotate-180 text-blue-700'
			},
			false: ''
		}
	},
	defaultVariants: { size: 'default', open: false }
});

type SelectVariants = VariantProps<typeof selectVariants>;
export type SelectSize = NonNullable<SelectVariants['size']>;
