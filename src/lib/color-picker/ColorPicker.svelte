<script module lang="ts">
	export type ColorPickerOption = {
		value: string;
		label: string;
	};

	export const defaultColorOptions: readonly ColorPickerOption[] = [
		{ value: '#eff6ff', label: 'Голубой' },
		{ value: '#eef2ff', label: 'Индиго' },
		{ value: '#f5f3ff', label: 'Фиолетовый' },
		{ value: '#faf5ff', label: 'Лиловый' },
		{ value: '#fdf2f8', label: 'Розовый' },
		{ value: '#fff1f2', label: 'Коралловый' },
		{ value: '#fff7ed', label: 'Оранжевый' },
		{ value: '#fffbeb', label: 'Янтарный' },
		{ value: '#fefce8', label: 'Жёлтый' },
		{ value: '#f7fee7', label: 'Лаймовый' },
		{ value: '#ecfdf5', label: 'Зелёный' },
		{ value: '#ecfeff', label: 'Бирюзовый' },
		{ value: '#f0fdfa', label: 'Мятный' },
		{ value: '#f1f5f9', label: 'Серый' }
	];
</script>

<script lang="ts">
	import { Popover } from 'melt/builders';
	import { AngleDownOutline, CheckOutline } from 'flowbite-svelte-icons';
	import { untrack } from 'svelte';
	import { colorPickerVariants } from './color-picker.variants';

	type Props = {
		value?: string;
		name?: string;
		options?: readonly ColorPickerOption[];
		ariaLabel?: string;
		disabled?: boolean;
		required?: boolean;
		allowCustom?: boolean;
		class?: string;
		onChange?: (value: string) => void | Promise<void>;
	};

	let {
		value = $bindable('#eff6ff'),
		name,
		options = defaultColorOptions,
		ariaLabel = 'Выберите цвет',
		disabled = false,
		required = false,
		allowCustom = true,
		class: className = '',
		onChange
	}: Props = $props();

	const hexPattern = /^#[0-9a-f]{6}$/i;
	const normalizeColor = (color: string) => color.trim().toLowerCase();
	const initialValue = untrack(() => value);
	const componentId = $props.id();

	const popover = new Popover({
		floatingConfig: {
			computePosition: { placement: 'bottom-start' },
			offset: { mainAxis: 6 }
		}
	});

	let hexDraft = $state(hexPattern.test(initialValue) ? initialValue.toUpperCase() : '#EFF6FF');
	let selectedOption = $derived(
		options.find((option) => normalizeColor(option.value) === normalizeColor(value))
	);
	let validValue = $derived(hexPattern.test(value) ? value : '#f1f5f9');
	let validDraft = $derived(hexPattern.test(hexDraft));
	let styles = $derived(colorPickerVariants({ open: popover.open }));

	$effect(() => {
		if (hexPattern.test(value)) hexDraft = value.toUpperCase();
	});

	function setColor(nextValue: string, close = true): void {
		const normalized = normalizeColor(nextValue);
		if (!hexPattern.test(normalized)) return;
		if (normalized !== normalizeColor(value)) {
			value = normalized;
			if (onChange) void onChange(normalized);
		}
		if (close) popover.open = false;
	}

	function updateHex(event: Event): void {
		hexDraft = (event.currentTarget as HTMLInputElement).value.toUpperCase();
		if (hexPattern.test(hexDraft)) setColor(hexDraft, false);
	}

	function handleHexKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Enter' || !validDraft) return;
		event.preventDefault();
		setColor(hexDraft);
	}
</script>

<div class={styles.root({ class: className })}>
	<button
		{...popover.trigger}
		type="button"
		class={styles.trigger()}
		aria-label={ariaLabel}
		{disabled}
	>
		<span class={styles.triggerSwatch()} style={`background-color: ${validValue}`}></span>
		<span class={styles.triggerText()}>
			<span class={styles.triggerLabel()}>{selectedOption?.label ?? 'Свой цвет'}</span>
			<span class={styles.triggerValue()}>{value}</span>
		</span>
		<AngleDownOutline class={styles.triggerIcon()} strokeWidth={1.5} />
	</button>

	{#if name}<input type="hidden" {name} {value} {required} />{/if}

	<div {...popover.content} class={styles.content()}>
		<p class={styles.heading()}>Палитра статуса</p>
		<div class={styles.palette()} role="listbox" aria-label={ariaLabel}>
			{#each options as option (option.value)}
				<button
					type="button"
					class={styles.option()}
					role="option"
					aria-label={`${option.label}, ${option.value}`}
					aria-selected={normalizeColor(option.value) === normalizeColor(value)}
					title={option.label}
					onclick={() => setColor(option.value)}
				>
					<span class={styles.optionColor()} style={`background-color: ${option.value}`}></span>
					{#if normalizeColor(option.value) === normalizeColor(value)}
						<CheckOutline class={styles.optionCheck()} strokeWidth={2.25} />
					{/if}
				</button>
			{/each}
		</div>

		{#if allowCustom}
			<div class={styles.customSection()}>
				<label class={styles.customLabel()} for={`${componentId}-hex`}>Свой HEX-цвет</label>
				<div class={styles.customRow()}>
					<span
						class={styles.customPreview()}
						style={`background-color: ${validDraft ? hexDraft : validValue}`}
					></span>
					<input
						id={`${componentId}-hex`}
						class={styles.customInput()}
						value={hexDraft}
						maxlength="7"
						spellcheck="false"
						aria-invalid={!validDraft}
						oninput={updateHex}
						onkeydown={handleHexKeydown}
					/>
				</div>
				{#if !validDraft}<p class={styles.error()}>Введите цвет в формате #EFF6FF</p>{/if}
			</div>
		{/if}
	</div>
</div>
