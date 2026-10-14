<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = Omit<HTMLInputAttributes, 'value' | 'class' | 'type'> & {
		value?: string | null;
		label: string;
		type?: 'text' | 'url' | 'email' | 'password' | 'date';
		description?: string;
		class?: string;
		inputClass?: string;
	};

	let {
		value = $bindable(''),
		label,
		type = 'text',
		description,
		class: className = '',
		inputClass = '',
		id,
		name,
		...rest
	}: Props = $props();

	let fieldId = $derived(id ?? (name ? `field-${name}` : undefined));
</script>

<label for={fieldId} class={`block ${className}`}>
	<span class="text-sm font-semibold text-slate-800">{label}</span>
	{#if description}<span class="mt-1 block text-xs leading-5 text-slate-500">{description}</span
		>{/if}
	<input
		{...rest}
		id={fieldId}
		{name}
		{type}
		bind:value
		class={`mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${inputClass}`}
	/>
</label>
