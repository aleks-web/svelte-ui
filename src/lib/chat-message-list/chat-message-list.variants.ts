import { tv } from 'tailwind-variants';

export const chatMessageListVariants = tv({
	slots: {
		root: 'min-h-0 flex-1 overflow-hidden rounded-2xl bg-slate-100/70 shadow-sm',
		content: 'flex min-h-full flex-col gap-4 p-4 pr-5',
		state: 'm-auto max-w-xs text-center text-sm text-gray-500',
		row: 'flex w-full items-start gap-2.5',
		avatar:
			'relative z-10 mt-0.5 grid size-8 shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-inset shadow-sm',
		avatarFallback: 'text-[11px] font-bold tracking-wide',
		avatarImage: 'absolute inset-0 size-full object-cover',
		messageColumn: 'flex max-w-[70%] shrink-0 flex-col',
		message:
			'relative w-fit max-w-full min-w-0 rounded-2xl px-3.5 py-2.5 shadow-sm transition-[background-color,box-shadow] duration-200 ease-out',
		body: 'text-sm leading-5 whitespace-pre-wrap',
		time: 'mt-1 px-1 text-[11px] text-slate-400'
	},
	variants: {
		own: {
			true: {
				row: 'self-end flex-row-reverse justify-start',
				avatar: 'bg-blue-100 text-blue-700 ring-blue-200',
				messageColumn: 'items-end',
				message: 'self-end bg-blue-400 text-white shadow-blue-950/10',
				time: 'text-right'
			},
			false: {
				row: 'self-start',
				avatar: 'bg-white text-slate-600 ring-slate-200',
				message: 'self-start bg-white text-slate-800 shadow-slate-950/5',
				messageColumn: 'items-start',
				time: 'text-left'
			}
		}
	},
	defaultVariants: {
		own: false
	}
});
