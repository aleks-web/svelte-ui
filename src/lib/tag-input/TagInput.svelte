<script lang="ts">
	import { CloseOutline } from 'flowbite-svelte-icons';
	import { tagInputVariants } from './tag-input.variants';

	type Props = {
		value?: string[];
		name?: string;
		label?: string;
		description?: string;
		placeholder?: string;
		ariaLabel?: string;
		disabled?: boolean;
		required?: boolean;
		unique?: boolean;
		maxTags?: number;
		separators?: readonly string[];
		normalize?: (value: string) => string;
		validate?: (value: string) => boolean;
		invalidText?: string;
		class?: string;
		inputClass?: string;
		onChange?: (value: string[]) => void | Promise<void>;
	};

	let {
		value = $bindable([]),
		name,
		label,
		description,
		placeholder = 'Добавить значение…',
		ariaLabel = label ?? placeholder,
		disabled = false,
		required = false,
		unique = true,
		maxTags = Number.POSITIVE_INFINITY,
		separators = [',', ';'],
		normalize = (candidate) => candidate.trim(),
		validate = () => true,
		invalidText = 'Значение не соответствует формату',
		class: className = '',
		inputClass = '',
		onChange
	}: Props = $props();

	let draft = $state('');
	let invalid = $state(false);
	let styles = $derived(tagInputVariants({ disabled, invalid }));

	function publish(next: string[]) {
		value = next;
		if (onChange) void onChange(next);
	}

	function addCandidate(raw: string) {
		const candidate = normalize(raw);
		if (!candidate) return;
		if (!validate(candidate)) {
			invalid = true;
			return;
		}
		invalid = false;
		if (value.length >= maxTags) return;
		if (unique && value.some((item) => item.toLocaleLowerCase() === candidate.toLocaleLowerCase())) {
			draft = '';
			return;
		}
		publish([...value, candidate]);
		draft = '';
	}

	function addDraftParts(raw = draft) {
		const escaped = separators.map((separator) => separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
		const parts = escaped.length ? raw.split(new RegExp(`[${escaped.join('')}]`)) : [raw];
		for (const part of parts) addCandidate(part);
	}

	function removeTag(index: number) {
		if (disabled) return;
		publish(value.filter((_, itemIndex) => itemIndex !== index));
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || separators.includes(event.key)) {
			event.preventDefault();
			addDraftParts();
			return;
		}
		if (event.key === 'Backspace' && !draft && value.length) {
			event.preventDefault();
			removeTag(value.length - 1);
		}
	}

	function handlePaste(event: ClipboardEvent) {
		const text = event.clipboardData?.getData('text') ?? '';
		if (!separators.some((separator) => text.includes(separator))) return;
		event.preventDefault();
		addDraftParts(text);
	}
</script>

<div class={styles.root({ class: className })}>
	{#if label}<span class={styles.label()}>{label}</span>{/if}
	<div class={styles.field()} aria-invalid={invalid || undefined}>
		{#each value as tag, index (`${tag}-${index}`)}
			<span class={styles.tag()}>
				<span class={styles.tagLabel()}>{tag}</span>
				<button
					type="button"
					class={styles.remove()}
					disabled={disabled}
					aria-label={`Удалить ${tag}`}
					onclick={() => removeTag(index)}
				>
					<CloseOutline class="size-3.5" strokeWidth={2} />
				</button>
			</span>
		{/each}
		<input
			type="text"
			bind:value={draft}
			{placeholder}
			{disabled}
			required={required && value.length === 0}
			aria-label={ariaLabel}
			aria-invalid={invalid || undefined}
			class={styles.input({ class: inputClass })}
			onkeydown={handleKeydown}
			onpaste={handlePaste}
			onblur={() => addDraftParts()}
		/>
	</div>
	{#if name}<input type="hidden" {name} value={value.join(',')} />{/if}
	{#if invalid}
		<p class={styles.error()}>{invalidText}</p>
	{:else if description}
		<p class={styles.description()}>{description}</p>
	{/if}
</div>
