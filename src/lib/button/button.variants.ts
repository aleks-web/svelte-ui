import { tv, type VariantProps } from 'tailwind-variants';

export const buttonVariants = tv({
	base: 'inline-flex cursor-pointer select-none items-center justify-center gap-2 font-semibold outline-none transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-50',
	variants: {
		variant: {
			primary: 'bg-blue-800 text-white shadow-sm hover:bg-blue-900 hover:shadow-md',
			secondary:
				'border border-gray-300 bg-white text-gray-700 shadow-sm hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-800 hover:shadow-md',
			soft: 'border border-blue-200 bg-blue-50 text-blue-800 hover:border-blue-300 hover:bg-blue-100/70',
			danger:
				'border border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100/70',
			success:
				'border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm hover:border-emerald-300 hover:bg-emerald-100/70 hover:shadow-md',
			warning:
				'border border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300 hover:bg-amber-100/70',
			ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-950',
			link: 'bg-transparent text-blue-700 hover:text-blue-900 hover:underline active:scale-100'
		},
		size: {
			inline: 'h-auto rounded-none p-0 text-sm',
			xs: 'h-8 rounded-lg px-3 text-xs',
			compact: 'h-9 rounded-lg px-3 text-xs',
			default: 'h-11 rounded-xl px-4 text-sm',
			icon: 'size-10 rounded-xl p-0'
		},
		fullWidth: {
			true: 'w-full',
			false: ''
		}
	},
	defaultVariants: {
		variant: 'primary',
		size: 'default',
		fullWidth: false
	}
});

type ButtonVariants = VariantProps<typeof buttonVariants>;
export type ButtonVariant = NonNullable<ButtonVariants['variant']>;
export type ButtonSize = NonNullable<ButtonVariants['size']>;
