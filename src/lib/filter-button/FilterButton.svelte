<script lang="ts">
	import { FilterOutline } from 'flowbite-svelte-icons';
	import Badge from '../badge/Badge.svelte';
	import Button from '../button/Button.svelte';
	import { filterButtonVariants } from './filter-button.variants';

	type Props = {
		activeCount?: number;
		onOpen: () => void;
		onReset: () => void;
		label?: string;
		resetLabel?: string;
		class?: string;
	};

	let {
		activeCount = 0,
		onOpen,
		onReset,
		label = 'Фильтры',
		resetLabel = 'Сбросить',
		class: className = ''
	}: Props = $props();
	const styles = filterButtonVariants();
</script>

<div class={styles.root({ class: className })}>
	<Button type="button" variant="ghost" class={styles.main()} onclick={onOpen}>
		<FilterOutline class={styles.icon()} aria-hidden="true" />
		{label}
		{#if activeCount > 0}<Badge variant="primary" shape="circle">{activeCount}</Badge>{/if}
	</Button>
	<Button
		type="button"
		variant="secondary"
		class={styles.reset()}
		disabled={activeCount === 0}
		onclick={onReset}
	>
		{resetLabel}
	</Button>
</div>
