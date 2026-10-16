import { tv } from 'tailwind-variants';

export const pageHeaderVariants = tv({
	slots: {
		root: 'flex min-w-0 flex-wrap items-start justify-between gap-3',
		content: 'flex min-w-0 flex-col gap-1.5',
		breadcrumbs: 'min-w-0',
		breadcrumbList: 'flex min-w-0 flex-wrap items-center gap-y-1 text-sm',
		breadcrumbItem: 'flex min-w-0 items-center',
		breadcrumbSeparator: 'mx-2 shrink-0 text-slate-300',
		breadcrumbLink:
			'max-w-48 truncate font-medium text-slate-500 transition-colors hover:text-blue-700 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
		breadcrumbCurrent: 'max-w-56 truncate font-medium text-slate-700',
		titleRow: 'flex min-w-0 flex-wrap items-center gap-2',
		title: 'shrink-0 text-2xl font-bold text-gray-950',
		titleAfter: 'flex min-w-0 flex-wrap items-center gap-2',
		actions: 'flex shrink-0 flex-wrap items-center gap-2'
	}
});
