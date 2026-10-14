import { tv } from 'tailwind-variants';

export const filterButtonVariants = tv({
	slots: {
		root: 'inline-flex h-11 overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm transition hover:border-blue-300 hover:bg-blue-50/30',
		main: 'h-full rounded-none px-4 shadow-none hover:translate-y-0 hover:bg-blue-50 hover:shadow-none active:scale-100',
		reset:
			'h-full rounded-none border-y-0 border-r-0 border-l border-gray-300 bg-gray-50 px-4 shadow-none hover:translate-y-0 hover:bg-gray-100 hover:shadow-none active:scale-100 disabled:hover:bg-gray-50',
		icon: 'size-4 shrink-0 stroke-[1.5]'
	}
});
