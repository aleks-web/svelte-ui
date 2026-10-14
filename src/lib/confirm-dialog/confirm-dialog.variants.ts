import { tv, type VariantProps } from 'tailwind-variants';

export const confirmDialogVariants = tv({
	slots: {
		portalled: 'fixed inset-0 z-[220]',
		overlay: 'absolute inset-0 bg-gray-950/40 backdrop-blur-[2px]',
		positioner: 'absolute inset-0 flex items-center justify-center p-4',
		content:
			'relative w-full max-w-md overflow-hidden rounded-2xl border bg-white shadow-2xl shadow-gray-950/20 outline-none',
		header: 'border-b p-5',
		title: 'text-lg font-bold text-gray-950',
		description: 'mt-1.5 text-sm leading-6 text-gray-600',
		body: 'p-5',
		footer: 'flex flex-col-reverse gap-2 border-t bg-gray-50/70 p-4 sm:flex-row sm:justify-end'
	},
	variants: {
		variant: {
			default: { content: 'border-gray-200', header: 'border-gray-100' },
			warning: { content: 'border-amber-200', header: 'border-amber-100 bg-amber-50/40' },
			danger: { content: 'border-red-200', header: 'border-red-100 bg-red-50/40' }
		}
	},
	defaultVariants: { variant: 'default' }
});

type ConfirmDialogVariants = VariantProps<typeof confirmDialogVariants>;
export type ConfirmDialogVariant = NonNullable<ConfirmDialogVariants['variant']>;
