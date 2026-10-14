<script lang="ts">
	import { UploadOutline } from 'flowbite-svelte-icons';
	import type { Snippet } from 'svelte';
	import Button from '../button/Button.svelte';
	import FileDropzoneItem from './FileDropzoneItem.svelte';
	import { fileDropzoneVariants, type FileDropzoneSize } from './file-dropzone.variants';

	type Props = {
		name?: string;
		accept?: string;
		multiple?: boolean;
		required?: boolean;
		disabled?: boolean;
		maxSize?: number;
		maxFiles?: number;
		size?: FileDropzoneSize;
		label?: string;
		description?: string;
		buttonLabel?: string;
		class?: string;
		files?: File[];
		trigger?: Snippet<[openFileDialog: () => void, disabled: boolean]>;
		item?: Snippet<[file: File, index: number, remove: () => void]>;
		onFilesChange?: (files: File[]) => void;
	};

	let {
		name = 'files',
		accept,
		multiple = false,
		required = false,
		disabled = false,
		maxSize,
		maxFiles,
		size = 'default',
		label = 'Перетащите файлы сюда',
		description = 'или выберите их на устройстве',
		buttonLabel = 'Выбрать файлы',
		class: className = '',
		files = $bindable([]),
		trigger,
		item,
		onFilesChange
	}: Props = $props();

	const descriptionId = $props.id();
	let inputElement = $state<HTMLInputElement>();
	let dragDepth = $state(0);
	let dragging = $derived(dragDepth > 0 && !disabled);
	let errorMessage = $state('');
	let styles = $derived(
		fileDropzoneVariants({ size, dragging, invalid: Boolean(errorMessage), disabled })
	);

	function formatBytes(value: number): string {
		if (value < 1024) return `${value} Б`;
		if (value < 1024 * 1024) return `${Math.round(value / 1024)} КБ`;
		return `${(value / (1024 * 1024)).toFixed(1)} МБ`;
	}

	function matchesAccept(file: File): boolean {
		if (!accept) return true;

		return accept.split(',').some((rawRule) => {
			const rule = rawRule.trim().toLowerCase();
			if (!rule) return false;
			if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule);
			if (rule.endsWith('/*')) return file.type.toLowerCase().startsWith(rule.slice(0, -1));
			return file.type.toLowerCase() === rule;
		});
	}

	function setInputFiles(nextFiles: File[]): void {
		if (!inputElement || typeof DataTransfer === 'undefined') return;
		const transfer = new DataTransfer();
		nextFiles.forEach((file) => transfer.items.add(file));
		inputElement.files = transfer.files;
	}

	$effect(() => {
		setInputFiles(files);
	});

	function updateFiles(nextFiles: File[]): void {
		files = nextFiles;
		setInputFiles(nextFiles);
		onFilesChange?.(nextFiles);
	}

	function selectFiles(nextFiles: File[]): void {
		if (disabled || nextFiles.length === 0) return;
		errorMessage = '';

		const candidates = multiple
			? [...files, ...nextFiles].filter(
					(file, index, allFiles) =>
						allFiles.findIndex(
							(candidate) =>
								candidate.name === file.name &&
								candidate.size === file.size &&
								candidate.lastModified === file.lastModified
						) === index
				)
			: nextFiles.slice(0, 1);
		const invalidType = candidates.find((file) => !matchesAccept(file));
		if (invalidType) {
			errorMessage = `Файл «${invalidType.name}» имеет неподдерживаемый формат.`;
			return;
		}

		const oversizedFile = maxSize ? candidates.find((file) => file.size > maxSize) : undefined;
		if (oversizedFile) {
			errorMessage = `Файл «${oversizedFile.name}» больше ${formatBytes(maxSize!)}.`;
			return;
		}

		if (multiple && maxFiles && candidates.length > maxFiles) {
			errorMessage = `Можно выбрать не больше ${maxFiles} файлов.`;
			return;
		}

		updateFiles(candidates);
	}

	function removeFile(index: number): void {
		errorMessage = '';
		updateFiles(files.filter((_, fileIndex) => fileIndex !== index));
	}

	function clearFiles(): void {
		errorMessage = '';
		updateFiles([]);
	}

	function handleInput(event: Event): void {
		const input = event.currentTarget as HTMLInputElement;
		selectFiles(Array.from(input.files ?? []));
	}

	function openFileDialog(): void {
		if (!disabled) inputElement?.click();
	}

	function handleDragEnter(event: DragEvent): void {
		event.preventDefault();
		if (disabled) return;
		dragDepth += 1;
	}

	function handleDragOver(event: DragEvent): void {
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
	}

	function handleDragLeave(event: DragEvent): void {
		event.preventDefault();
		dragDepth = Math.max(0, dragDepth - 1);
	}

	function handleDrop(event: DragEvent): void {
		event.preventDefault();
		dragDepth = 0;
		if (disabled) return;
		selectFiles(Array.from(event.dataTransfer?.files ?? []));
	}
</script>

<div
	class={styles.root({ class: className })}
	role="group"
	aria-disabled={disabled}
	aria-describedby={descriptionId}
	data-dragging={dragging}
	data-invalid={Boolean(errorMessage)}
	ondragenter={handleDragEnter}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
>
	<div class={styles.iconWrap()} aria-hidden="true">
		<UploadOutline class={styles.icon()} strokeWidth={1.5} />
	</div>

	<div class="space-y-1">
		<p class={styles.title()}>{dragging ? 'Отпустите файлы для загрузки' : label}</p>
		<p id={descriptionId} class={styles.description()}>{description}</p>
	</div>

	<div class={styles.actions()}>
		{#if trigger}
			{@render trigger(openFileDialog, disabled)}
		{:else}
			<Button type="button" variant="soft" {disabled} onclick={openFileDialog}>
				{buttonLabel}
			</Button>
		{/if}
		<input
			bind:this={inputElement}
			class={styles.input()}
			type="file"
			tabindex="-1"
			aria-hidden="true"
			{name}
			{accept}
			{multiple}
			{required}
			{disabled}
			onchange={handleInput}
		/>
	</div>

	{#if files.length}
		<div class={styles.fileList()} aria-live="polite">
			{#each files as file, index (`${file.name}-${file.size}-${file.lastModified}`)}
				{#if item}
					{@render item(file, index, () => removeFile(index))}
				{:else}
					<FileDropzoneItem {file} onRemove={() => removeFile(index)} />
				{/if}
			{/each}
		</div>
		<Button type="button" variant="link" size="inline" onclick={clearFiles}>Очистить список</Button>
	{/if}

	{#if errorMessage}
		<p class={styles.error()} role="alert">{errorMessage}</p>
	{/if}
</div>

<style>
	.file-dropzone[data-dragging='false'][data-invalid='false'][aria-disabled='false']:hover {
		background-image: linear-gradient(
			110deg,
			#ffffff 0%,
			#f0f9ff 20%,
			#f5f3ff 40%,
			#f7fbf9 60%,
			#faf5ff 80%,
			#ffffff 100%
		);
		background-size: 300% 100%;
		animation: file-dropzone-gradient-shimmer 14s ease-in-out infinite;
	}

	@keyframes file-dropzone-gradient-shimmer {
		0%,
		100% {
			background-position: 0% 50%;
		}

		50% {
			background-position: 100% 50%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.file-dropzone[data-dragging='false'][data-invalid='false'][aria-disabled='false']:hover {
			animation: none;
			background-position: 50% 50%;
		}
	}
</style>
