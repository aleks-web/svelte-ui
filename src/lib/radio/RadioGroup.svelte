<script lang="ts">
	import { RadioGroup as MeltRadioGroup } from 'melt/builders';
	import { setContext, type Snippet } from 'svelte';
	import { RADIO_GROUP_CONTEXT, type RadioGroupContext } from './radio-context';
	import { radioGroupVariants } from './radio.variants';

	type Props = {
		children: Snippet;
		value?: string;
		name?: string;
		disabled?: boolean;
		required?: boolean;
		orientation?: 'horizontal' | 'vertical';
		loop?: boolean;
		ariaLabel?: string;
		class?: string;
		onChange?: (value: string) => void | Promise<void>;
	};

	let {
		children,
		value = $bindable(''),
		name,
		disabled = false,
		required = false,
		orientation = 'vertical',
		loop = true,
		ariaLabel,
		class: className = '',
		onChange
	}: Props = $props();

	const group = new MeltRadioGroup({
		value: () => value,
		name: () => name,
		disabled: () => disabled,
		required: () => required,
		orientation: () => orientation,
		loop: () => loop,
		onValueChange: (next) => {
			if (next !== value) {
				value = next;
				if (onChange) void onChange(next);
			}
		}
	});

	setContext<RadioGroupContext>(RADIO_GROUP_CONTEXT, { group });
</script>

<div {...group.root} aria-label={ariaLabel} class={radioGroupVariants({ class: className })}>
	{@render children()}
</div>
<input {...group.hiddenInput} type="hidden" />
