import { tv } from 'tailwind-variants';

export const resizableDrawerVariants = tv({
	slots: {
		root: 'fixed inset-0 flex justify-end',
		overlay:
			'absolute inset-0 cursor-pointer bg-gray-950/30 transition-colors hover:bg-gray-950/35',
		shell: 'relative h-full w-full max-w-full overflow-visible sm:pl-3',
		panel:
			'pointer-events-auto relative z-10 flex h-full w-full max-w-full flex-col bg-gray-50 shadow-2xl outline-none will-change-transform [backface-visibility:hidden]',
		handle:
			'pointer-events-auto absolute top-5 left-3 z-30 hidden h-14 w-5 -translate-x-1/2 touch-none cursor-ew-resize items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-lg shadow-slate-950/10 transition-colors outline-none hover:border-blue-300 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 sm:flex',
		handleLines: 'flex gap-0.5',
		handleLine: 'h-6 w-px rounded-full bg-slate-300',
		handleLineActive: 'h-6 w-px rounded-full bg-slate-400'
	},
	variants: {
		resizing: {
			true: {
				panel: 'select-none',
				handle: 'border-blue-400 bg-blue-50'
			}
		}
	},
	defaultVariants: {
		resizing: false
	}
});
