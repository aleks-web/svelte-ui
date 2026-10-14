import { tv, type VariantProps } from 'tailwind-variants';

export const badgeVariants = tv({
	base: 'inline-flex w-fit items-center rounded-full font-semibold whitespace-nowrap ring-1 ring-inset',
	variants: {
		variant: {
			neutral: 'bg-gray-100 text-gray-700 ring-gray-200',
			primary: 'bg-blue-700 text-white ring-blue-700',
			info: 'bg-blue-50 text-blue-700 ring-blue-200',
			success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
			warning: 'bg-amber-50 text-amber-700 ring-amber-200',
			danger: 'bg-red-50 text-red-700 ring-red-200',
			violet: 'bg-violet-50 text-violet-700 ring-violet-200'
		},
		size: {
			small: 'px-2.5 py-1 text-xs',
			default: 'px-3 py-1.5 text-sm'
		},
		shape: {
			pill: '',
			circle: 'justify-center p-0 leading-none'
		}
	},
	compoundVariants: [
		{ shape: 'circle', size: 'small', class: 'size-5' },
		{ shape: 'circle', size: 'default', class: 'size-7' }
	],
	defaultVariants: {
		variant: 'neutral',
		size: 'small',
		shape: 'pill'
	}
});

type BadgeVariants = VariantProps<typeof badgeVariants>;
export type BadgeVariant = NonNullable<BadgeVariants['variant']>;
export type BadgeSize = NonNullable<BadgeVariants['size']>;
export type BadgeShape = NonNullable<BadgeVariants['shape']>;
