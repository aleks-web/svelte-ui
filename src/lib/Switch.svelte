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
		class="switch-track relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
	>
		<span
			aria-hidden="true"
			class="switch-thumb block size-5 rounded-full bg-white shadow-sm ring-1 ring-slate-950/5 transition-transform duration-200"
		></span>
	</button>
	<input {...toggle.hiddenInput} {name} disabled={disabled || undefined} />
</div>

<style>
	.switch-track {
		background-color: #e2e8f0;
	}

	.switch-track:hover {
		background-color: #cbd5e1;
	}

	.switch-track[data-checked] {
		background-color: #2563eb;
	}

	.switch-track[data-checked]:hover {
		background-color: #1d4ed8;
	}

	.switch-thumb {
		transform: translateX(0);
	}

	.switch-track[data-checked] .switch-thumb {
		transform: translateX(1.25rem);
	}
</style>
