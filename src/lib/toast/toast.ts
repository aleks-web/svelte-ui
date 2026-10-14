import { Toaster } from 'melt/builders';
import type { ToastVariant } from './toast.variants';

export type ToastData = {
	variant: ToastVariant;
	title: string;
	description?: string;
	onClick?: () => void | Promise<void>;
	actionLabel?: string;
};

export type ToastOptions = {
	title?: string;
	duration?: number;
	onClick?: () => void | Promise<void>;
	actionLabel?: string;
};

type FormToastResult = {
	message?: unknown;
	success?: unknown;
	toast?: unknown;
};

export const toaster = new Toaster<ToastData>({
	closeDelay: 5000,
	type: 'polite',
	hover: 'pause'
});

const defaultTitles: Record<ToastVariant, string> = {
	success: 'Готово',
	error: 'Не удалось выполнить действие',
	warning: 'Обратите внимание',
	info: 'Информация'
};

function show(variant: ToastVariant, description: string, options: ToastOptions = {}) {
	if (typeof window === 'undefined') return;
	return toaster.addToast({
		data: {
			variant,
			title: options.title ?? defaultTitles[variant],
			description,
			onClick: options.onClick,
			actionLabel: options.actionLabel
		},
		closeDelay: options.duration ?? (variant === 'error' ? 7000 : 5000),
		type: variant === 'error' ? 'assertive' : 'polite'
	});
}

export const toast = {
	show,
	success: (description: string, options?: ToastOptions) => show('success', description, options),
	error: (description: string, options?: ToastOptions) => show('error', description, options),
	warning: (description: string, options?: ToastOptions) => show('warning', description, options),
	info: (description: string, options?: ToastOptions) => show('info', description, options),
	dismiss: (id: string) => toaster.removeToast(id)
};

export function showFormResultToast(result: unknown): void {
	if (!result || typeof result !== 'object') return;
	const formResult = result as FormToastResult;
	if (formResult.toast === false || typeof formResult.message !== 'string') return;

	const variant: ToastVariant = formResult.success === true ? 'success' : 'error';
	show(variant, formResult.message);
}
