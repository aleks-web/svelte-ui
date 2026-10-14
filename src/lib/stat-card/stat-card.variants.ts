import { tv, type VariantProps } from 'tailwind-variants';

export const DEFAULT_STAT_CARD_GRADIENT =
	'linear-gradient(90deg, #f5f9ff 0%, #f7fbff 50%, #f5f6ff 100%)';

export const DEFAULT_STAT_CARD_BORDER = '1px solid rgb(191 219 254 / 0.8)';

export const PRIMARY_STAT_CARD_GRADIENT =
	'linear-gradient(135deg, rgb(30 64 175) 0%, rgb(30 58 138) 55%, rgb(67 56 202) 100%)';

export const PRIMARY_STAT_CARD_BORDER = '1px solid rgb(30 64 175)';

export const statCardVariants = tv({
	slots: {
		root: 'min-w-0 rounded-2xl bg-white',
		header: 'flex min-w-0 items-start justify-between gap-3',
		body: 'min-w-0',
		label: 'text-sm',
		value: 'font-bold break-words',
		description: 'text-sm',
		icon: 'flex size-10 shrink-0 items-center justify-center rounded-xl'
	},
	variants: {
		tone: {
			default: {
				root: 'shadow-sm shadow-slate-950/5',
				label: 'text-gray-500',
				value: 'text-gray-950',
				description: 'text-gray-600',
				icon: 'bg-blue-50 text-blue-700'
			},
			primary: {
				root: 'bg-blue-800 text-white shadow-sm shadow-blue-950/15',
				label: 'text-blue-100',
				value: 'text-white',
				description: 'text-blue-100',
				icon: 'bg-white/10 text-blue-50'
			},
			subtle: {
				root: 'bg-gray-50',
				label: 'text-gray-500',
				value: 'text-gray-950',
				description: 'text-gray-600',
				icon: 'bg-white text-gray-600'
			}
		},
		size: {
			compact: {
				root: 'p-4',
				value: 'mt-1 text-2xl',
				description: 'mt-2'
			},
			default: {
				root: 'p-5',
				value: 'mt-2 text-2xl',
				description: 'mt-2'
			}
		},
		valueSize: {
			default: { value: 'text-2xl' },
			large: { value: 'text-3xl' }
		}
	},
	defaultVariants: {
		tone: 'default',
		size: 'compact',
		valueSize: 'default'
	}
});

export type StatCardTone = NonNullable<VariantProps<typeof statCardVariants>['tone']>;
export type StatCardSize = NonNullable<VariantProps<typeof statCardVariants>['size']>;
export type StatCardValueSize = NonNullable<VariantProps<typeof statCardVariants>['valueSize']>;
