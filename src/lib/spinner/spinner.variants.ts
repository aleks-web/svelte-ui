import { tv, type VariantProps } from 'tailwind-variants';

export const spinnerVariants = tv({
	base: 'inline-flex shrink-0 items-center justify-center text-blue-700',
	variants: {
		size: {
			xs: 'size-3.5',
			sm: 'size-4',
			md: 'size-6',
			lg: 'size-8',
			xl: 'size-10'
		}
	},
	defaultVariants: {
		size: 'md'
	}
});

type SpinnerVariants = VariantProps<typeof spinnerVariants>;
export type SpinnerSize = NonNullable<SpinnerVariants['size']>;
