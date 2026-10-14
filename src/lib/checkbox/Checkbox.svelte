<script lang="ts">
	import { Toggle } from 'melt/builders';
	import { CheckOutline } from 'flowbite-svelte-icons';
	import type { Snippet } from 'svelte';
	import { checkboxVariants, type CheckboxVisualState } from './checkbox.variants';

	export type CheckboxState = boolean | 'indeterminate';

	type Props = {
		children?: Snippet;
		checked?: CheckboxState;
		name?: string;
		value?: string;
		disabled?: boolean;
		required?: boolean;
		ariaLabel?: string;
		class?: string;
		labelClass?: string;
		onChange?: (checked: CheckboxState) => void | Promise<void>;
		onclick?: (event: MouseEvent) => void;
	};

	let {
		children,
		checked = $bindable(),
		name,
		value = 'on',
		disabled = false,
		required = false,
		ariaLabel,
		class: className = '',
		labelClass = '',
		onChange,
		onclick
	}: Props = $props();

	const toggle = new Toggle({
		value: () => checked === true,
		disabled: () => disabled,
		onValueChange: (next) => {
			const nextChecked = checked === 'indeterminate' ? true : next;
			checked = nextChecked;
			if (onChange) void onChange(nextChecked);
		}
	});

	let visualState = $derived<CheckboxVisualState>(
		checked === 'indeterminate' ? 'indeterminate' : checked ? 'checked' : 'unchecked'
	);
	let styles = $derived(checkboxVariants({ state: visualState }));

	function handleClick(event: MouseEvent): void {
		toggle.trigger.onclick();
		onclick?.(event);
	}
</script>

<button
	{...toggle.trigger}
	type="button"
	role="checkbox"
	aria-label={ariaLabel}
	aria-checked={checked === 'indeterminate' ? 'mixed' : Boolean(checked)}
	aria-required={required || undefined}
	class={styles.root({ class: className })}
	onclick={handleClick}
>
	<span aria-hidden="true" class={styles.indicator()}>
		<CheckOutline class={styles.icon()} strokeWidth={2} />
		<span class={styles.indeterminateIcon()}></span>
	</span>
	{#if children}
		<span class={styles.label({ class: labelClass })}>{@render children()}</span>
	{/if}
</button>

{#if name && checked === true}
	<input type="hidden" {name} {value} />
{/if}
