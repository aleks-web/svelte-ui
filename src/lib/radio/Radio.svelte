<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
	import { RADIO_GROUP_CONTEXT, type RadioGroupContext } from './radio-context';
	import { radioVariants } from './radio.variants';

	type Props = {
		value: string;
		children?: Snippet;
		disabled?: boolean;
		ariaLabel?: string;
		class?: string;
		indicatorClass?: string;
		labelClass?: string;
	};

	let {
		value,
		children,
		disabled = false,
		ariaLabel,
		class: className = '',
		indicatorClass = '',
		labelClass = ''
	}: Props = $props();

	const context = getContext<RadioGroupContext>(RADIO_GROUP_CONTEXT);
	if (!context) throw new Error('Radio должен использоваться внутри RadioGroup.');
	const { group } = context;
	let item = $derived(group.getItem(value));
	const styles = radioVariants();
</script>

<button
	{...item.attrs}
	type="button"
	{disabled}
	data-disabled={disabled ? '' : undefined}
	aria-label={ariaLabel}
	class={styles.root({ class: className })}
>
	<span aria-hidden="true" class={styles.indicator({ class: indicatorClass })}>
		<span class={styles.dot()}></span>
	</span>
	{#if children}
		<span class={styles.label({ class: labelClass })}>{@render children()}</span>
	{/if}
</button>
