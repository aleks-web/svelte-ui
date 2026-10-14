import { tv, type VariantProps } from 'tailwind-variants';

export const statsGridVariants = tv({
	base: 'grid min-w-0',
	variants: {
		columns: {
			two: 'sm:grid-cols-2',
			three: 'sm:grid-cols-3',
			four: 'sm:grid-cols-2 xl:grid-cols-4'
		},
		gap: {
			compact: 'gap-3',
			default: 'gap-4'
		}
	},
	defaultVariants: {
		columns: 'three',
		gap: 'compact'
	}
});

export const statsGridChromeVariants = tv({
	slots: {
		root: 'min-w-0',
		toolbar: 'mb-2 flex min-h-8 items-center justify-start',
		toggle:
			'text-gray-500 hover:bg-blue-50/70 hover:text-blue-800 focus-visible:ring-blue-500'
	}
});

export type StatsGridColumns = NonNullable<VariantProps<typeof statsGridVariants>['columns']>;
export type StatsGridGap = NonNullable<VariantProps<typeof statsGridVariants>['gap']>;
