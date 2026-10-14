<script lang="ts">
	import Button from '../button/Button.svelte';
	import { EyeOutline, EyeSlashOutline } from 'flowbite-svelte-icons';
	import { getContext, type Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import {
		STATS_GRID_PREFERENCES_CONTEXT,
		writeStatsGridPreference,
		type StatsGridPreferencesContext
	} from './stats-grid.persistence';
	import {
		statsGridChromeVariants,
		statsGridVariants,
		type StatsGridColumns,
		type StatsGridGap
	} from './stats-grid.variants';

	let {
		children,
		columns = 'three',
		gap = 'compact',
		class: className = '',
		wrapperClass = '',
		collapsible = true,
		storageKey,
		initiallyCollapsed = false
	}: {
		children: Snippet;
		columns?: StatsGridColumns;
		gap?: StatsGridGap;
		class?: string;
		wrapperClass?: string;
		collapsible?: boolean;
		storageKey?: string;
		initiallyCollapsed?: boolean;
	} = $props();

	const chrome = statsGridChromeVariants();
	const preferencesContext = getContext<StatsGridPreferencesContext | undefined>(
		STATS_GRID_PREFERENCES_CONTEXT
	);
	let collapsed = $state(getInitialCollapsedState());

	function getStorageIdentity(): string | null {
		const normalizedKey = storageKey?.trim();
		return normalizedKey || null;
	}

	function getInitialCollapsedState(): boolean {
		if (!collapsible) return false;
		const identity = getStorageIdentity();
		if (!identity) return initiallyCollapsed;
		return preferencesContext?.getPreferences()[identity] ?? initiallyCollapsed;
	}

	function saveCollapsedState(value: boolean): void {
		const identity = getStorageIdentity();
		if (identity) {
			preferencesContext?.setPreference(identity, value);
			writeStatsGridPreference(identity, value);
		}
	}

	function toggleCollapsed(): void {
		collapsed = !collapsed;
		saveCollapsedState(collapsed);
	}
</script>

<div class={chrome.root({ class: wrapperClass })}>
	{#if collapsible}
		<div class={chrome.toolbar()}>
			<Button
				type="button"
				variant="ghost"
				size="xs"
				class={chrome.toggle()}
				onclick={toggleCollapsed}
				aria-expanded={!collapsed}
				aria-label={collapsed ? 'Показать карточки показателей' : 'Скрыть карточки показателей'}
			>
				{#if collapsed}
					<EyeOutline class="size-4" strokeWidth={1.5} />
					Показать показатели
				{:else}
					<EyeSlashOutline class="size-4" strokeWidth={1.5} />
					Скрыть показатели
				{/if}
			</Button>
		</div>
	{/if}

	{#if !collapsed || !collapsible}
		<div transition:slide={{ duration: 240 }}>
			<section class={statsGridVariants({ columns, gap, class: className })}>
				{@render children()}
			</section>
		</div>
	{/if}
</div>
