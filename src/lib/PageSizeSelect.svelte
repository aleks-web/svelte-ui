<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import Select from './select/Select.svelte';

	const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

	type ChangeHandler = (value: number) => void | Promise<void>;

	let {
		class: className,
		value = $bindable(20),
		options = DEFAULT_PAGE_SIZE_OPTIONS,
		name = 'page_size',
		label = 'На странице',
		disabled = false,
		onChange
	}: {
		class?: string;
		value?: number;
		options?: readonly number[];
		name?: string;
		label?: string;
		disabled?: boolean;
		onChange?: ChangeHandler;
	} = $props();

	let selectOptions = $derived(
		options.map((item) => ({ value: String(item), label: String(item) }))
	);

	function handleChange(nextValue: string): void {
		const parsedValue = Number(nextValue);
		if (!Number.isFinite(parsedValue) || parsedValue === value) return;

		value = parsedValue;
		if (onChange) void onChange(parsedValue);
	}
</script>

<div class={twMerge('flex h-9 shrink-0', className)}>
	<span
		class="flex items-center rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 px-3 text-sm font-medium whitespace-nowrap text-slate-600"
	>
		{label}
	</span>
	<Select
		{name}
		value={String(value)}
		options={selectOptions}
		ariaLabel={label}
		{disabled}
		size="compact"
		class="min-w-20"
		triggerClass="rounded-l-none rounded-r-lg border-slate-200 shadow-none"
		onChange={handleChange}
	/>
</div>
