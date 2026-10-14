<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import Button from './button/Button.svelte';

	type SearchHandler = (query: string) => void | Promise<void>;
	type ResetHandler = () => void | Promise<void>;

	let {
		class: className,
		value = $bindable(''),
		name = 'query',
		label = 'Поиск',
		placeholder = 'Введите запрос',
		searchLabel = 'Найти',
		resetLabel = 'Сбросить',
		disabled = false,
		loading = false,
		canReset,
		onSearch,
		onReset
	}: {
		class?: string;
		value?: string;
		name?: string;
		label?: string;
		placeholder?: string;
		searchLabel?: string;
		resetLabel?: string;
		disabled?: boolean;
		loading?: boolean;
		canReset?: boolean;
		onSearch: SearchHandler;
		onReset?: ResetHandler;
	} = $props();

	let resetDisabled = $derived(disabled || loading || !(canReset ?? Boolean(value.trim())));

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		if (disabled || loading) return;

		void onSearch(value.trim());
	}

	function handleReset(): void {
		if (resetDisabled) return;

		value = '';
		if (onReset) {
			void onReset();
		} else {
			void onSearch('');
		}
	}
</script>

<form
	class={twMerge(
		'flex h-11 w-full overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm transition outline-none focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 hover:border-blue-300 hover:bg-blue-50/30',
		disabled && 'bg-gray-50 text-gray-400 shadow-none hover:border-gray-300 hover:bg-gray-50',
		className
	)}
	aria-busy={loading}
	onsubmit={handleSubmit}
>
	<input
		class="min-w-0 flex-1 appearance-none border-0 bg-transparent px-3 text-sm focus:ring-0 disabled:cursor-not-allowed disabled:bg-gray-50"
		type="search"
		{name}
		aria-label={label}
		{placeholder}
		{disabled}
		bind:value
	/>
	<Button
		variant="ghost"
		class="h-full rounded-none px-3 text-blue-800 shadow-none hover:translate-y-0 hover:bg-blue-50 hover:shadow-none active:scale-100 disabled:hover:bg-transparent"
		type="submit"
		disabled={disabled || loading}
	>
		{searchLabel}
	</Button>
	<Button
		variant="secondary"
		class="h-full rounded-none border-y-0 border-r-0 border-l border-gray-300 bg-gray-50 px-4 shadow-none hover:translate-y-0 hover:bg-gray-100 hover:shadow-none active:scale-100 disabled:hover:bg-gray-50"
		type="button"
		disabled={resetDisabled}
		onclick={handleReset}
	>
		{resetLabel}
	</Button>
</form>
