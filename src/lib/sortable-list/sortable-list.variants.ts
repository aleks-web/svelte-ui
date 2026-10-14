import { tv } from 'tailwind-variants';

export const sortableListVariants = tv({
	slots: {
		root: 'grid gap-3',
		item: 'grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] items-stretch gap-2',
		handle:
			'group flex min-h-12 touch-none cursor-grab items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 shadow-sm outline-none transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 active:cursor-grabbing disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45',
		handleIcon: 'size-4 transition-transform group-hover:scale-110',
		content: 'min-w-0',
		liveRegion: 'sr-only'
	},
	variants: {
		dragging: {
			true: {
				item: 'z-10 opacity-60',
				handle: 'border-blue-400 bg-blue-50 text-blue-700 shadow-md'
			},
			false: ''
		},
		grabbed: {
			true: {
				item: 'rounded-2xl ring-2 ring-blue-500/20',
				handle: 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
			},
			false: ''
		},
		saving: {
			true: { root: 'pointer-events-none' },
			false: ''
		}
	},
	defaultVariants: { dragging: false, grabbed: false, saving: false }
});
