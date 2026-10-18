import { tv } from 'tailwind-variants';

export const pageHeaderVariants = tv({
	slots: {
		root: 'flex min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between',
		content: 'flex min-w-0 flex-1 flex-col gap-1.5',
		breadcrumbs: 'min-w-0',
		breadcrumbList: 'flex min-w-0 flex-wrap items-center gap-y-1 text-sm',
		breadcrumbItem: 'flex min-w-0 items-center',
		breadcrumbSeparator: 'mx-2 shrink-0 text-slate-300',
		breadcrumbLink:
			'max-w-48 truncate font-medium text-slate-500 transition-colors hover:text-blue-700 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
		breadcrumbCurrent: 'max-w-56 truncate font-medium text-slate-700',
		titleRow: 'flex min-w-0 flex-wrap items-center gap-2',
		title: 'min-w-0 text-xl font-bold break-words text-gray-950 sm:text-2xl',
		titleAfter: 'flex min-w-0 flex-wrap items-center gap-2',
		actions: 'flex min-w-0 flex-wrap items-center gap-2 sm:shrink-0'
	}
});
