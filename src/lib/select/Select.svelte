<script module lang="ts">
	export type SelectOption = {
		value: string;
		label: string;
		disabled?: boolean;
	};
</script>

<script lang="ts">
	import { Select as MeltSelect } from 'melt/builders';
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
		size = 'default',
		class: className = '',
		triggerClass = '',
		menuClass = '',
		onChange
	}: Props = $props();

	const select = new MeltSelect<string>({
		value: () => value || undefined,
		sameWidth: true,
		floatingConfig: {
			computePosition: { placement: 'bottom-start' },
			offset: { mainAxis: 6 }
		},
		onValueChange: (next) => {
			const nextValue = next ?? '';
			if (nextValue !== value) {
				value = nextValue;
				if (onChange) void onChange(nextValue);
			}
		}
	});

	let selectedOption = $derived(options.find((option) => option.value === select.value));
	let styles = $derived(selectVariants({ size, open: select.open }));
</script>

<div class={styles.root({ class: className })}>
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

	{#if name}<input type="hidden" {name} {value} aria-required={required || undefined} />{/if}

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
</div>
