import { tv } from 'tailwind-variants';

export const chatComposerVariants = tv({
	slots: {
		root: 'relative overflow-hidden rounded-xl border border-gray-300 bg-white transition focus-within:border-gray-400 hover:border-gray-400',
		resizeHandle:
			'group/resize absolute top-0 right-0 left-0 z-20 flex h-3 cursor-ns-resize touch-none items-center justify-center outline-none select-none',
		resizeGrip:
			'h-1 w-10 rounded-full bg-gray-200 transition-colors group-hover/resize:bg-gray-400 group-focus-visible/resize:bg-gray-400 group-active/resize:bg-gray-500',
		scrollArea:
			'h-full [&_[role=scrollbar]]:!bg-slate-300 [&_[role=scrollbar]:active]:!bg-slate-500 [&_[role=scrollbar]:focus-visible]:!bg-slate-400 [&_[role=scrollbar]:hover]:!bg-slate-400',
		textarea:
			'block w-full resize-none appearance-none overflow-hidden !border-0 bg-transparent px-3 pt-4 pr-5 text-sm leading-5 !shadow-none !ring-0 !outline-none placeholder:text-gray-400 focus:!border-0 focus:!shadow-none focus:!ring-0 focus:!outline-none',
		footer: 'absolute right-3 bottom-2 left-3 z-10 flex items-center justify-end gap-2',
		counter: 'shrink-0 text-[11px] text-gray-400 tabular-nums',
		hints:
			'pointer-events-none flex min-w-0 flex-1 flex-wrap items-center justify-end gap-x-2 gap-y-1 text-[11px] text-gray-400',
		key: 'rounded bg-gray-100 px-1.5 py-0.5 font-sans'
	},
	variants: {
		disabled: {
			true: {
				root: 'cursor-not-allowed bg-gray-50 opacity-60',
				textarea: 'cursor-not-allowed'
			},
			false: {}
		}
	},
	defaultVariants: {
		disabled: false
	}
});
