<script lang="ts">
	import type { Snippet } from 'svelte';
	import Badge from '../badge/Badge.svelte';
	import Spoiler from '../spoiler/Spoiler.svelte';

	type Props = {
		name: string;
		description: string;
		source: string;
		group: string;
		usage: string;
		props?: readonly string[];
		importCode: string;
		scopeLabel?: string;
		demo?: Snippet;
	};

	let { name, description, source, group, usage, props = [], importCode, scopeLabel = 'Компонент', demo }: Props = $props();
	let open = $state(false);
</script>

<article data-showcase-group={group}>
	<Spoiler bind:open class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" contentClass="p-0">
		{#snippet summary()}
			<div class="min-w-0 text-left">
				<div class="flex flex-wrap items-center gap-2"><span class="text-base font-bold text-slate-900">{name}</span><Badge variant="info">{scopeLabel}</Badge></div>
				<p class="mt-1 line-clamp-2 text-sm font-normal text-slate-600">{description}</p>
				<p class="mt-2 flex min-w-0 items-start gap-1.5 text-xs font-normal text-slate-400"><span class="shrink-0 font-medium text-slate-500">Путь:</span><code class="min-w-0 break-all text-blue-700">{source}</code></p>
			</div>
		{/snippet}
		{#if open}
			<div class="grid gap-5 bg-slate-50/70 p-5 lg:grid-cols-3">
				<div><p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Для чего</p><p class="mt-1 text-sm text-slate-700">{description}</p></div>
				<div><p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Когда использовать</p><p class="mt-1 text-sm text-slate-700">{usage}</p></div>
				<div><p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Группа</p><p class="mt-1 text-sm text-slate-700">{group}</p></div>
				<div class="lg:col-span-2"><p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Публичные props</p><div class="mt-2 flex flex-wrap gap-1.5">{#if props.length}{#each props as prop (prop)}<Badge variant="neutral">{prop}</Badge>{/each}{:else}<span class="text-sm text-slate-500">Публичные props не объявлены.</span>{/if}</div></div>
				<div><p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Путь</p><code class="mt-1 block text-xs break-all text-blue-700">{source}</code></div>
				<div class="lg:col-span-3"><p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Подключение</p><pre class="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 text-xs leading-5 text-slate-100"><code>{importCode}</code></pre></div>
			</div>
			{#if demo}<div class="border-t border-slate-200 bg-slate-50/70 p-5">{@render demo()}</div>{/if}
		{/if}
	</Spoiler>
</article>
