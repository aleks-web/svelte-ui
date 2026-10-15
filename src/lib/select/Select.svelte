<script module lang="ts">
	export type SelectOption = {
		value: string;
		label: string;
		disabled?: boolean;
		keywords?: readonly string[];
	};
</script>

<script lang="ts">
	import { Combobox as MeltCombobox, Select as MeltSelect } from 'melt/builders';
	import { AngleDownOutline, CheckOutline } from 'flowbite-svelte-icons';
	import { selectVariants, type SelectSize } from './select.variants';

	type Props = {
		options: readonly SelectOption[];
		value?: string;
		name?: string;
		placeholder?: string;
		ariaLabel?: string;
		disabled?: boolean;
		required?: boolean;
		searchable?: boolean;
		searchPlaceholder?: string;
		emptyText?: string;
		size?: SelectSize;
		class?: string;
		triggerClass?: string;
		menuClass?: string;
		onChange?: (value: string) => void | Promise<void>;
	};

	let {
		options,
		value = $bindable(''),
		name,
		placeholder = 'Выберите значение',
		ariaLabel = placeholder,
		disabled = false,
		required = false,
		searchable = false,
		searchPlaceholder = 'Поиск…',
		emptyText = 'Ничего не найдено',
		size = 'default',
		class: className = '',
		triggerClass = '',
		menuClass = '',
		onChange
	}: Props = $props();

	function updateValue(nextValue: string) {
		if (nextValue === value) return;
		value = nextValue;
		if (onChange) void onChange(nextValue);
	}

	const select = new MeltSelect<string>({
		value: () => value || undefined,
		sameWidth: true,
		floatingConfig: {
			computePosition: { placement: 'bottom-start' },
			offset: { mainAxis: 6 }
		},
		onValueChange: (next) => {
			updateValue(next ?? '');
		}
	});

	let searchQuery = $state('');
	const combobox = new MeltCombobox<string>({
		value: () => value || undefined,
		inputValue: () => searchQuery,
		sameWidth: true,
		floatingConfig: {
			computePosition: { placement: 'bottom-start' },
			offset: { mainAxis: 6 }
		},
		onInputValueChange: (next) => {
			searchQuery = next;
		},
		onValueChange: (next) => {
			updateValue(next ?? '');
		}
	});

	let selectedOption = $derived(options.find((option) => option.value === value));
	let normalizedSearch = $derived(searchQuery.trim().toLocaleLowerCase());
	let filteredOptions = $derived(
		options.filter((option) => {
			if (!normalizedSearch) return true;
			return [option.label, option.value, ...(option.keywords ?? [])]
				.join(' ')
				.toLocaleLowerCase()
				.includes(normalizedSearch);
		})
	);
	let styles = $derived(selectVariants({ size, open: searchable ? combobox.open : select.open }));

	$effect(() => {
		if (!searchable || combobox.open) return;
		searchQuery = selectedOption?.label ?? '';
	});

	function handleSearchFocus(event: FocusEvent) {
		if (disabled) return;
		const wasOpen = combobox.open;
		combobox.input.onfocus(event);
		if (!wasOpen) searchQuery = '';
	}
</script>

<div class={styles.root({ class: className })}>
	{#if searchable}
		<label {...combobox.label} class="sr-only">{ariaLabel}</label>
		<div class={styles.searchField({ class: triggerClass })}>
			<input
				{...combobox.input}
				type="text"
				{disabled}
				placeholder={selectedOption?.label ?? placeholder ?? searchPlaceholder}
				aria-label={ariaLabel}
				onfocus={handleSearchFocus}
				class={styles.searchInput()}
			/>
			<button
				{...combobox.trigger}
				type="button"
				{disabled}
				aria-label="Открыть список"
				class={styles.searchTrigger()}
			>
				<AngleDownOutline class={styles.icon()} strokeWidth={1.5} />
			</button>
		</div>
	{:else}
		<label {...select.label} class="sr-only">{ariaLabel}</label>
		<button
			{...select.trigger}
			type="button"
			{disabled}
			class={styles.trigger({ class: triggerClass })}
		>
			<span class:italic={!selectedOption} class={styles.value()}>
				{selectedOption?.label ?? placeholder}
			</span>
			<AngleDownOutline class={styles.icon()} strokeWidth={1.5} />
		</button>
	{/if}

	{#if name}<input type="hidden" {name} {value} aria-required={required || undefined} />{/if}

	{#if searchable}
		<div {...combobox.content} class={styles.menu({ class: menuClass })}>
			{#each filteredOptions as item (item.value)}
				{@const optionAttrs = combobox.getOption(item.value, item.label)}
				<div
					{...optionAttrs}
					data-disabled={item.disabled ? '' : undefined}
					aria-disabled={item.disabled || undefined}
					onclick={item.disabled ? undefined : optionAttrs.onclick}
					class={styles.option()}
				>
					<span class="min-w-0 flex-1 truncate">{item.label}</span>
					{#if value === item.value}
						<CheckOutline class="size-4 shrink-0 text-blue-700" strokeWidth={1.75} />
					{/if}
				</div>
			{:else}
				<div class={styles.empty()}>{emptyText}</div>
			{/each}
		</div>
	{:else}
		<div {...select.content} class={styles.menu({ class: menuClass })}>
			{#each options as item (item.value)}
				{@const optionAttrs = select.getOption(item.value, item.label)}
				<div
					{...optionAttrs}
					data-disabled={item.disabled ? '' : undefined}
					aria-disabled={item.disabled || undefined}
					onclick={item.disabled ? undefined : optionAttrs.onclick}
					class={styles.option()}
				>
					<span class="min-w-0 flex-1 truncate">{item.label}</span>
					{#if select.value === item.value}
						<CheckOutline class="size-4 shrink-0 text-blue-700" strokeWidth={1.75} />
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
