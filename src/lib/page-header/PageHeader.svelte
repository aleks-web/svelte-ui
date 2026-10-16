<script lang="ts">
	import type { Snippet } from 'svelte';
	import { pageHeaderVariants } from './page-header.variants';

	type BreadcrumbItem = {
		label: string;
		href?: string;
	};

	type Props = {
		title: string;
		showTitle?: boolean;
		breadcrumbs?: BreadcrumbItem[];
		titleAfter?: Snippet;
		actions?: Snippet;
		class?: string;
	};

	let {
		title,
		showTitle = true,
		breadcrumbs = [],
		titleAfter,
		actions,
		class: className = ''
	}: Props = $props();

	const styles = pageHeaderVariants();
</script>

<header class={styles.root({ class: className })}>
	<div class={styles.content()}>
		{#if breadcrumbs.length}
			<nav class={styles.breadcrumbs()} aria-label="Хлебные крошки">
				<ol class={styles.breadcrumbList()}>
					{#each breadcrumbs as item, index (`${item.href ?? 'current'}-${item.label}-${index}`)}
						<li class={styles.breadcrumbItem()}>
							{#if index > 0}
								<span class={styles.breadcrumbSeparator()} aria-hidden="true">/</span>
							{/if}
							{#if item.href}
								<a class={styles.breadcrumbLink()} href={item.href}>{item.label}</a>
							{:else}
								<span class={styles.breadcrumbCurrent()} aria-current="page">{item.label}</span>
							{/if}
						</li>
					{/each}
				</ol>
			</nav>
		{/if}
		{#if showTitle}
			<div class={styles.titleRow()}>
				<h1 class={styles.title()}>{title}</h1>
				{#if titleAfter}
					<div class={styles.titleAfter()}>{@render titleAfter()}</div>
				{/if}
			</div>
		{:else}
			<h1 class="sr-only">{title}</h1>
		{/if}
	</div>

	{#if actions}
		<div class={styles.actions()}>{@render actions()}</div>
	{/if}
</header>
