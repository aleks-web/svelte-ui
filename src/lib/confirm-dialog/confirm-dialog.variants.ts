import { tv, type VariantProps } from 'tailwind-variants';

export const confirmDialogVariants = tv({
	slots: {
		portalled: 'fixed inset-0 z-[220]',
		overlay: 'absolute inset-0 bg-gray-950/40 backdrop-blur-[2px]',
		positioner: 'absolute inset-0 flex items-center justify-center p-4',
		content:
			'fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg overflow-x-hidden overflow-y-auto rounded-2xl border bg-white text-center whitespace-normal normal-case shadow-2xl shadow-gray-950/20 outline-none',
		header: 'border-b px-6 py-5 text-center whitespace-normal',
		title: 'text-lg leading-7 font-bold break-words text-gray-950 [overflow-wrap:anywhere]',
		description:
			'mx-auto mt-2 max-w-md text-sm leading-6 font-normal break-words text-gray-600 whitespace-normal [overflow-wrap:anywhere]',
		body: 'p-5 text-left whitespace-normal',
		footer:
			'flex flex-col-reverse justify-center gap-2 border-t bg-gray-50/70 p-4 whitespace-normal sm:flex-row'
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
