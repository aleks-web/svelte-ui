import { tv } from 'tailwind-variants';

export const spoilerVariants = tv({
	slots: {
		root: 'overflow-hidden rounded-xl border border-blue-200/80 bg-white',
		trigger:
			'group flex w-full cursor-pointer items-center gap-3 bg-linear-to-r from-white via-slate-50/70 to-blue-50/70 p-4 text-left text-gray-900 transition-colors outline-none hover:from-slate-50 hover:via-blue-50/70 hover:to-blue-100/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
		summary: 'min-w-0 flex-1',
		icon: 'size-4 shrink-0 text-gray-400 transition-transform duration-200 group-hover:text-blue-700',
		content: 'border-t border-blue-100'
	},
	variants: {
		open: {
			true: { trigger: 'spoiler-trigger-open', icon: 'rotate-180 text-blue-700' },
			false: ''
		}
	},
	defaultVariants: { open: false }
});
