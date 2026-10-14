import { tv } from 'tailwind-variants';

export const radioVariants = tv({
	slots: {
		root: 'group inline-flex cursor-pointer items-center gap-2 text-left text-sm text-gray-700 transition outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
		indicator:
			'flex size-4.5 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm transition-colors group-hover:border-blue-400 group-data-[state=checked]:border-blue-700',
		dot: 'size-2 rounded-full bg-blue-700 opacity-0 transition-opacity group-data-[state=checked]:opacity-100',
		label: 'min-w-0'
	}
});

export const radioGroupVariants = tv({
	base: 'min-w-0'
});
