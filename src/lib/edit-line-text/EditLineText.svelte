<script lang="ts">
	import IMask from 'imask';
	import { CheckOutline, EditOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import Button from '../button/Button.svelte';
	import { editLineTextVariants } from './edit-line-text.variants';

	let {
		text = $bindable(),
		blurCallback,
		maskOptions,
		name = 'editLineText',
		placeholder,
		maxlength,
		ariaLabel = 'Редактируемый текст',
		emptyLabel = 'Добавить текст',
		class: className = '',
		inputClass = ''
	}: {
		text?: string | null;
		blurCallback?: (text?: string) => void;
		maskOptions?: object;
		name?: string;
		placeholder?: string;
		maxlength?: number;
		ariaLabel?: string;
		emptyLabel?: string;
		class?: string;
		inputClass?: string;
	} = $props();

	let isActive = $state(false);
	let inputElement = $state<HTMLInputElement>();
	let hasText = $derived(typeof text === 'string' && text.trim().length > 0);
	let actionLabel = $derived(
		isActive
			? `Завершить редактирование: ${ariaLabel}`
			: hasText
				? `Редактировать: ${ariaLabel}`
				: emptyLabel
	);
	let styles = $derived(editLineTextVariants({ active: isActive }));

	$effect(() => {
		if (isActive) inputElement?.focus();
	});

	onMount(() => {
		if (maskOptions && inputElement) IMask(inputElement, maskOptions);
	});

	function startEditing(): void {
		isActive = true;
	}

	function finishEditing(): void {
		if (!isActive) return;
		isActive = false;
		blurCallback?.(text ?? undefined);
	}

	function handleActionPointerDown(event: PointerEvent): void {
		if (isActive) event.preventDefault();
	}
</script>

<div class={styles.root({ class: className })}>
	{#if isActive}
		<input
			bind:value={text}
			{name}
			{placeholder}
			{maxlength}
			aria-label={ariaLabel}
			onblur={finishEditing}
			bind:this={inputElement}
			class={styles.input({ class: inputClass })}
		/>
	{:else}
		<input type="hidden" {name} value={text ?? ''} />
		<span
			class={styles.value({ class: hasText ? '' : 'text-gray-400 italic' })}
			title={hasText ? (text ?? undefined) : undefined}
		>
			{hasText ? text : (placeholder ?? emptyLabel)}
		</span>
	{/if}
	<Button
		type="button"
		variant={isActive ? 'secondary' : 'ghost'}
		size="icon"
		aria-label={actionLabel}
		title={actionLabel}
		onpointerdown={handleActionPointerDown}
		onclick={isActive ? finishEditing : startEditing}
		class={styles.action()}
	>
		{#if isActive}
			<CheckOutline class="size-4" strokeWidth={1.75} />
		{:else}
			<EditOutline class="size-4" strokeWidth={1.75} />
		{/if}
	</Button>
</div>
