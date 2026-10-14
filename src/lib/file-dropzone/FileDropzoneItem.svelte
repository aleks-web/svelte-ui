<script lang="ts">
	import { FileOutline, TrashBinOutline } from 'flowbite-svelte-icons';
	import type { Snippet } from 'svelte';
	import Button from '../button/Button.svelte';

	let { file, onRemove, children }: { file: File; onRemove: () => void; children?: Snippet } =
		$props();
	let previewUrl = $state('');
	let isImage = $derived(file.type.startsWith('image/'));

	$effect(() => {
		if (!isImage) {
			previewUrl = '';
			return;
		}

		const url = URL.createObjectURL(file);
		previewUrl = url;
		return () => URL.revokeObjectURL(url);
	});

	function formatBytes(value: number): string {
		if (value < 1024) return `${value} Б`;
		if (value < 1024 * 1024) return `${Math.round(value / 1024)} КБ`;
		return `${(value / (1024 * 1024)).toFixed(1)} МБ`;
	}
</script>

<article
	class="flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-white p-2.5 text-left shadow-sm"
>
	<div
		class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-500"
	>
		{#if previewUrl}
			<img src={previewUrl} alt="" class="h-full w-full object-cover" />
		{:else}
			<FileOutline class="size-5" strokeWidth={1.5} />
		{/if}
	</div>
	<div class="min-w-0 flex-1">
		<p class="truncate text-sm font-semibold text-gray-900" title={file.name}>{file.name}</p>
		<p class="mt-0.5 truncate text-xs text-gray-500">
			{file.type || 'Неизвестный тип'} · {formatBytes(file.size)}
		</p>
		{#if children}
			<div class="mt-2">{@render children()}</div>
		{/if}
	</div>
	<Button
		type="button"
		variant="ghost"
		size="icon"
		class="size-9 shrink-0 text-gray-500 hover:bg-red-50 hover:text-red-700"
		aria-label={`Удалить файл ${file.name}`}
		title="Удалить из списка"
		onclick={onRemove}
	>
		<TrashBinOutline class="size-4" strokeWidth={1.5} />
	</Button>
</article>
