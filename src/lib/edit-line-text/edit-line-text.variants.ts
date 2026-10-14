import { tv } from 'tailwind-variants';

export const editLineTextVariants = tv({
	slots: {
		root: 'flex w-full min-w-0 items-center outline-none',
		input:
			'min-w-0 flex-1 appearance-none border-0 bg-transparent px-3 text-sm font-normal text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0 read-only:cursor-default',
		value: 'min-w-0 flex-1 truncate text-left text-sm font-normal text-gray-800',
		action: 'shrink-0 p-0 shadow-none hover:translate-y-0 hover:shadow-none active:scale-100'
	},
	variants: {
		active: {
			true: {
				root: 'h-11 overflow-hidden rounded-xl border border-blue-300 bg-white ring-2 ring-blue-300/20',
				input: 'bg-blue-50/30',
				action:
					'h-full size-11 rounded-none border-y-0 border-r-0 border-l border-blue-200 bg-blue-50 text-blue-800 hover:border-blue-300 hover:bg-blue-100/70'
			},
			false: {
				root: 'h-11',
				action:
					'size-11 rounded-xl border-0 bg-transparent text-gray-500 hover:bg-blue-50 hover:text-blue-700'
			}
		}
	},
	defaultVariants: { active: false }
});
