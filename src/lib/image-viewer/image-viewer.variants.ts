import { tv } from 'tailwind-variants';

export const imageViewerVariants = tv({
	slots: {
		trigger:
			'block w-full cursor-zoom-in overflow-hidden border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
		portalled: 'fixed inset-0 z-[140]',
		overlay: 'absolute inset-0 bg-white/65',
		positioner: 'pointer-events-none absolute inset-0 flex items-center justify-center p-3 sm:p-6',
		content:
			'pointer-events-auto relative max-h-[calc(100dvh-1.5rem)] max-w-[calc(100vw-1.5rem)] outline-none sm:max-h-[calc(100dvh-3rem)] sm:max-w-[calc(100vw-3rem)]',
		imageWrap: 'flex max-h-[inherit] max-w-[inherit] items-center justify-center',
		image:
			'block max-h-[calc(100dvh-1.5rem)] max-w-[calc(100vw-1.5rem)] object-contain sm:max-h-[calc(100dvh-3rem)] sm:max-w-[calc(100vw-3rem)]',
		close:
			'absolute top-2 right-2 z-10 inline-flex size-10 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white/90 text-slate-700 shadow-lg shadow-slate-950/15 backdrop-blur-sm transition-colors hover:border-blue-300 hover:bg-white hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none'
	}
});
