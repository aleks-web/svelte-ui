<script lang="ts">
	import { Toggle } from 'melt/builders';
	import { twMerge } from 'tailwind-merge';

	type Props = {
		checked?: boolean;
		name?: string;
		disabled?: boolean;
		ariaLabel?: string;
		class?: string;
		onChange?: (checked: boolean) => void;
	};

	let {
		checked = $bindable(false),
		name,
		disabled = false,
		ariaLabel = 'Переключатель',
		class: className = '',
		onChange
	}: Props = $props();

	const toggle = new Toggle({
		value: () => checked,
		disabled: () => disabled,
		onValueChange: (next) => {
			checked = next;
			onChange?.(next);
		}
	});
</script>

<div class={twMerge('inline-flex items-center', className)}>
	<button
		{...toggle.trigger}
		type="button"
		role="switch"
		aria-checked={toggle.value}
		aria-label={ariaLabel}
		class="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-slate-200 p-0.5 transition-colors duration-200 outline-none hover:bg-slate-300 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-blue-600 data-[checked]:hover:bg-blue-700"
	>
		<span
			aria-hidden="true"
			class:translate-x-5={toggle.value}
			class="block size-5 translate-x-0 rounded-full bg-white shadow-sm ring-1 ring-slate-950/5 transition-transform duration-200"
		></span>
	</button>
	<input {...toggle.hiddenInput} {name} disabled={disabled || undefined} />
</div>
