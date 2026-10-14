import { tv, type VariantProps } from 'tailwind-variants';

export const fileDropzoneVariants = tv({
	slots: {
		root: 'file-dropzone group relative flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center border border-dashed text-center outline-none transition-[color,background-color,border-color,box-shadow] duration-200',
		iconWrap:
			'flex items-center justify-center rounded-2xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-100',
		icon: 'size-6',
		title: 'font-semibold text-gray-950',
		description: 'max-w-xl text-sm text-gray-500',
		actions: 'flex flex-col items-center gap-2',
		fileList: 'mt-1 grid w-full gap-2 sm:grid-cols-2',
		error: 'text-sm font-medium text-red-700',
		input: 'sr-only'
	},
	variants: {
		size: {
			default: {
				root: 'min-h-64 gap-4 rounded-2xl p-6 md:p-8',
				iconWrap: 'size-14',
				title: 'text-base'
			},
			compact: {
				root: 'min-h-44 gap-3 rounded-xl p-5',
				iconWrap: 'size-11',
				title: 'text-sm'
			}
		},
		dragging: {
			true: {
				root: 'border-blue-600 bg-blue-50/80 shadow-[0_0_0_4px_rgb(37_99_235/0.12)]',
				iconWrap: 'bg-blue-700 text-white'
			},
			false: {
				root: 'border-blue-200 bg-linear-to-br from-white to-blue-50/40 hover:border-blue-400 hover:bg-blue-50/60'
			}
		},
		invalid: {
			true: { root: 'border-red-300 bg-red-50/50', iconWrap: 'bg-red-100 text-red-700' },
			false: ''
		},
		disabled: {
			true: {
				root: 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60 hover:border-gray-200 hover:bg-gray-50',
				iconWrap: 'bg-gray-100 text-gray-400'
			},
			false: ''
		}
	},
	defaultVariants: { size: 'default', dragging: false, invalid: false, disabled: false }
});

type FileDropzoneVariants = VariantProps<typeof fileDropzoneVariants>;
export type FileDropzoneSize = NonNullable<FileDropzoneVariants['size']>;
