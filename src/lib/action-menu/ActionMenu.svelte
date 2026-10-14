<script module lang="ts">
	import type { Component } from 'svelte';

	export type ActionMenuTone = 'default' | 'warning' | 'danger';

	export type ActionMenuOption = {
		id: string;
		label: string;
		description?: string;
		disabled?: boolean;
		tone?: ActionMenuTone;
		icon?: Component;
	};
</script>

<script lang="ts">
	import { Popover } from 'melt/builders';
	import { DotsHorizontalOutline } from 'flowbite-svelte-icons';
	import { buttonVariants } from '../button/button.variants';
	import { actionMenuVariants } from './action-menu.variants';

	type Props = {
		options: readonly ActionMenuOption[];
		ariaLabel?: string;
		disabled?: boolean;
		class?: string;
		onSelect?: (option: ActionMenuOption) => void | Promise<void>;
		onOpenChange?: (open: boolean) => void | Promise<void>;
	};

	let {
		options,
		ariaLabel = 'Действия',
		disabled = false,
		class: className = '',
		onSelect,
		onOpenChange
	}: Props = $props();

	const popover = new Popover({
		floatingConfig: {
			computePosition: { placement: 'bottom-start' },
			offset: { mainAxis: 6 }
		}
	});
	const styles = actionMenuVariants();
	let previousOpen = popover.open;

	$effect(() => {
		const open = popover.open;
		if (open === previousOpen) return;
		previousOpen = open;
		if (onOpenChange) void onOpenChange(open);
	});

	async function selectOption(option: ActionMenuOption): Promise<void> {
		if (disabled || option.disabled || !onSelect) return;
		popover.open = false;
		await onSelect(option);
	}
</script>

<div class={styles.root({ class: className })}>
	<button
		{...popover.trigger}
		type="button"
		{disabled}
		aria-label={ariaLabel}
		title={ariaLabel}
		class={buttonVariants({ variant: 'ghost', size: 'icon', class: styles.trigger() })}
	>
		<DotsHorizontalOutline aria-hidden="true" class={styles.triggerIcon()} strokeWidth={2} />
	</button>

	<div {...popover.content} class={styles.content()} aria-label={ariaLabel}>
		{#each options as option (option.id)}
			{@const optionStyles = actionMenuVariants({ tone: option.tone ?? 'default' })}
			{@const Icon = option.icon}
			<button
				type="button"
				disabled={disabled || option.disabled}
				class={optionStyles.item()}
				onclick={() => void selectOption(option)}
			>
				{#if Icon}
					<Icon aria-hidden="true" class={optionStyles.itemIcon()} strokeWidth={1.8} />
				{/if}
				<span class={optionStyles.itemText()}>
					<span class={optionStyles.itemLabel()}>{option.label}</span>
					{#if option.description}
						<span class={optionStyles.itemDescription()}>{option.description}</span>
					{/if}
				</span>
			</button>
		{/each}
	</div>
</div>
