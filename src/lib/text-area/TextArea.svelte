<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	type Props = Omit<HTMLTextareaAttributes, 'value' | 'class'> & {
		value?: string | null;
		label: string;
		description?: string;
		class?: string;
		textareaClass?: string;
		element?: HTMLTextAreaElement;
	};

	let {
		value = $bindable(''),
		label,
		description,
		class: className = '',
		textareaClass = '',
		element = $bindable(),
		id,
		name,
		rows = 8,
		...rest
	}: Props = $props();

	let fieldId = $derived(id ?? (name ? `field-${name}` : undefined));
</script>

<label for={fieldId} class={`block ${className}`}>
	<span class="text-sm font-semibold text-slate-800">{label}</span>
	{#if description}<span class="mt-1 block text-xs leading-5 text-slate-500">{description}</span
		>{/if}
	<textarea
		{...rest}
		bind:this={element}
		id={fieldId}
		{name}
		{rows}
		bind:value
		class={`mt-2 block w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-900 shadow-sm transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${textareaClass}`}
	></textarea>
</label>
