<script module lang="ts">
	import type { BadgeVariant } from './badge/badge.variants';

	export type TabItem = {
		value: string;
		label: string;
		disabled?: boolean;
		badge?: string | number;
		badgeVariant?: BadgeVariant;
	};
</script>

<script lang="ts">
	import { Tabs as MeltTabs } from 'melt/builders';
	import { untrack, type Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import Badge from './badge/Badge.svelte';

	type Props = {
		items: readonly TabItem[];
		children: Snippet<[string]>;
		value?: string;
		defaultValue?: string;
		orientation?: 'horizontal' | 'vertical';
		loop?: boolean;
		activateOnFocus?: boolean;
		ariaLabel?: string;
		class?: string;
		listClass?: string;
		triggerClass?: string;
		contentClass?: string;
		keepMounted?: boolean;
		onValueChange?: (value: string) => void;
	};

	let {
		items,
		children,
		value = $bindable(),
		defaultValue,
		orientation = 'horizontal',
		loop = true,
		activateOnFocus = true,
		ariaLabel = 'Вкладки',
		class: className = '',
		listClass = '',
		triggerClass = '',
		contentClass = '',
		keepMounted = false,
		onValueChange
	}: Props = $props();

	const componentId = $props.id();
	const toInternalValue = (externalValue: string): string =>
		`${componentId}-tab-${encodeURIComponent(externalValue)}`;
	const toExternalValue = (internalValue: string): string | undefined =>
		items.find((item) => toInternalValue(item.value) === internalValue)?.value;
	const initialValue = untrack(
		() => value ?? defaultValue ?? items.find((item) => !item.disabled)?.value
	);
	value ??= initialValue;

	const tabs = new MeltTabs({
		value: () => (value ? toInternalValue(value) : ''),
		orientation: () => orientation,
		loop: () => loop,
		selectWhenFocused: () => activateOnFocus,
		onValueChange: (next) => {
			const externalValue = toExternalValue(next);
			if (externalValue === undefined) return;

			value = externalValue;
			onValueChange?.(externalValue);
		}
	});

	$effect(() => {
		const firstEnabledValue = items.find((item) => !item.disabled)?.value;
		const selectedItem = items.find((item) => item.value === value && !item.disabled);
		const nextValue = selectedItem?.value ?? firstEnabledValue;

		if (nextValue === undefined) return;
		if (value !== nextValue) value = nextValue;
	});
</script>

<div class={twMerge('min-w-0', orientation === 'vertical' && 'flex items-start gap-4', className)}>
	<div
		{...tabs.triggerList}
		aria-label={ariaLabel}
		class={twMerge(
			'flex gap-1',
			orientation === 'horizontal'
				? 'w-full min-w-0 overflow-x-auto border-b border-gray-200'
				: 'min-w-max shrink-0 flex-col border-r border-gray-200',
			listClass
		)}
	>
		{#each items as item (item.value)}
			{@const internalValue = toInternalValue(item.value)}
			<button
				{...tabs.getTrigger(internalValue)}
				disabled={item.disabled}
				id={internalValue}
				aria-controls={`${internalValue}-panel`}
				class={twMerge(
					'inline-flex shrink-0 cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 transition-colors outline-none hover:text-gray-950 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[active]:font-semibold data-[active]:text-blue-800',
					orientation === 'horizontal'
						? 'border-b-2 border-transparent px-4 py-3 data-[active]:border-blue-800'
						: 'border-r-2 border-transparent px-4 py-3 text-left data-[active]:border-blue-800',
					triggerClass
				)}
			>
				<span>{item.label}</span>
				{#if item.badge !== undefined}
					<Badge
						variant={item.badgeVariant ?? (tabs.value === internalValue ? 'info' : 'neutral')}
						shape={typeof item.badge === 'number' ? 'circle' : 'pill'}
					>
						{item.badge}
					</Badge>
				{/if}
			</button>
		{/each}
	</div>

	{#each items as item (item.value)}
		{@const internalValue = toInternalValue(item.value)}
		<div
			{...tabs.getContent(internalValue)}
			id={`${internalValue}-panel`}
			class={twMerge(
				'min-w-0 flex-1 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
				contentClass
			)}
		>
			{#if keepMounted || tabs.value === internalValue}
				{@render children(item.value)}
			{/if}
		</div>
	{/each}
</div>
