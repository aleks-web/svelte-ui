<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		DEFAULT_STAT_CARD_BORDER,
		DEFAULT_STAT_CARD_GRADIENT,
		PRIMARY_STAT_CARD_BORDER,
		PRIMARY_STAT_CARD_GRADIENT,
		statCardVariants,
		type StatCardSize,
		type StatCardTone,
		type StatCardValueSize
	} from './stat-card.variants';

	type Props = {
		label: string;
		value?: string | number | null;
		description?: string;
		valueContent?: Snippet;
		descriptionContent?: Snippet;
		icon?: Snippet;
		/** Полное CSS-значение background-image. Передайте null, чтобы отключить градиент. */
		gradient?: string | null;
		/** Полное CSS-значение border. Передайте null, чтобы убрать рамку. */
		border?: string | null;
		tone?: StatCardTone;
		size?: StatCardSize;
		valueSize?: StatCardValueSize;
		class?: string;
		valueClass?: string;
		descriptionClass?: string;
		iconClass?: string;
	};

	let {
		label,
		value = null,
		description,
		valueContent,
		descriptionContent,
		icon,
		gradient,
		border,
		tone = 'default',
		size = 'compact',
		valueSize = 'default',
		class: className = '',
		valueClass = '',
		descriptionClass = '',
		iconClass = ''
	}: Props = $props();

	let styles = $derived(statCardVariants({ tone, size, valueSize }));
	let resolvedGradient = $derived(
		gradient === undefined
			? tone === 'primary'
				? PRIMARY_STAT_CARD_GRADIENT
				: DEFAULT_STAT_CARD_GRADIENT
			: (gradient ?? 'none')
	);
	let resolvedBorder = $derived(
		border === undefined
			? tone === 'primary'
				? PRIMARY_STAT_CARD_BORDER
				: DEFAULT_STAT_CARD_BORDER
			: (border ?? 'none')
	);
</script>

<article
	class={styles.root({ class: className })}
	style:background-image={resolvedGradient}
	style:border={resolvedBorder}
>
	<div class={styles.header()}>
		<div class={styles.body()}>
			<p class={styles.label()}>{label}</p>
			<div class={styles.value({ class: valueClass })}>
				{#if valueContent}
					{@render valueContent()}
				{:else}
					{value ?? '—'}
				{/if}
			</div>
		</div>
		{#if icon}
			<div class={styles.icon({ class: iconClass })} aria-hidden="true">{@render icon()}</div>
		{/if}
	</div>

	{#if descriptionContent}
		<div class={styles.description({ class: descriptionClass })}>
			{@render descriptionContent()}
		</div>
	{:else if description}
		<p class={styles.description({ class: descriptionClass })}>{description}</p>
	{/if}
</article>
