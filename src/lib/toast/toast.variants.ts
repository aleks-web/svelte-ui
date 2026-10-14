import { tv, type VariantProps } from 'tailwind-variants';

export const toastVariants = tv({
	slots: {
		viewport:
			'pointer-events-none fixed m-0 flex max-h-[100dvh] w-full flex-col gap-3 overflow-clip overscroll-none border-0 bg-transparent p-4 sm:max-w-md',
		content:
			'pointer-events-auto relative grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 overflow-hidden rounded-2xl border bg-white p-4 pr-3 shadow-xl shadow-slate-900/10',
		action:
			'absolute inset-0 z-0 cursor-pointer rounded-[inherit] bg-transparent transition-colors hover:bg-slate-50/70 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset focus-visible:outline-none',
		iconWrap: 'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl',
		icon: 'size-5',
		title: 'text-sm font-bold text-gray-950',
		description: 'mt-0.5 text-sm leading-5 text-gray-600',
		close:
			'relative z-20 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none'
	},
	variants: {
		variant: {
			success: {
				content: 'border-emerald-200',
				iconWrap: 'bg-emerald-50 text-emerald-700'
			},
			error: {
				content: 'border-red-200',
				iconWrap: 'bg-red-50 text-red-700'
			},
			warning: {
				content: 'border-amber-200',
				iconWrap: 'bg-amber-50 text-amber-700'
			},
			info: {
				content: 'border-blue-200',
				iconWrap: 'bg-blue-50 text-blue-700'
			}
		},
		position: {
			'top-right': { viewport: 'top-0 right-0 bottom-auto left-auto items-end' },
			'top-center': {
				viewport: 'top-0 right-auto bottom-auto left-1/2 -translate-x-1/2 items-center'
			},
			'bottom-right': { viewport: 'top-auto right-0 bottom-0 left-auto items-end' }
		}
	},
	defaultVariants: {
		variant: 'info',
		position: 'bottom-right'
	}
});

export type ToastVariant = NonNullable<VariantProps<typeof toastVariants>['variant']>;
export type ToastPosition = NonNullable<VariantProps<typeof toastVariants>['position']>;
