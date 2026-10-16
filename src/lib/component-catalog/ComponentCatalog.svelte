<script lang="ts">
	import type { Snippet } from 'svelte';
	import Tabs from '../Tabs.svelte';
	import ComponentShowcase from './ComponentShowcase.svelte';
	import PackageComponentDemo from './PackageComponentDemo.svelte';
	import { packageComponentCatalog, packageComponentGroups } from './package-components';
	import type { ComponentCatalogGroup, ComponentCatalogScope } from './component-catalog';

	let {
		applicationGroups = [],
		applicationCount = 0,
		applicationComponents
	}: {
		applicationGroups?: readonly ComponentCatalogGroup[];
		applicationCount?: number;
		applicationComponents?: Snippet<[activeGroup: string]>;
	} = $props();

	let activeScope = $state<ComponentCatalogScope>('package');
	let activePackageGroup = $state(packageComponentGroups[0]?.value ?? '');
	let activeApplicationGroup = $state('');
	let scopeTabs = $derived([
		{ value: 'package', label: 'Компоненты из пакета', badge: packageComponentCatalog.length },
		{ value: 'application', label: 'Компоненты приложения', badge: applicationCount }
	]);
	let visiblePackageComponents = $derived(packageComponentCatalog.filter((component) => component.group === activePackageGroup));

	$effect(() => {
		if (!applicationGroups.some((group) => group.value === activeApplicationGroup)) {
			activeApplicationGroup = applicationGroups[0]?.value ?? '';
		}
	});
</script>

<Tabs items={scopeTabs} bind:value={activeScope} ariaLabel="Источник компонентов" contentClass="pt-5">
	{#if activeScope === 'package'}
		<Tabs items={packageComponentGroups} bind:value={activePackageGroup} ariaLabel="Группы компонентов пакета" contentClass="pt-5">
			<div class="grid gap-4">
				{#each visiblePackageComponents as component (component.path)}
					<ComponentShowcase name={component.name} description={component.description} source={component.path} group={component.group} usage={component.usage} props={component.props} importCode={component.importCode} scopeLabel="Компонент пакета">
						{#snippet demo()}<PackageComponentDemo name={component.name} />{/snippet}
					</ComponentShowcase>
				{/each}
			</div>
		</Tabs>
	{:else if applicationComponents && applicationGroups.length}
		<Tabs items={applicationGroups} bind:value={activeApplicationGroup} ariaLabel="Группы компонентов приложения" contentClass="pt-5">
			{@render applicationComponents(activeApplicationGroup)}
		</Tabs>
	{/if}
</Tabs>
