<script module lang="ts">
	export type ExportFormat = 'xlsx' | 'csv';

	export type ExportMenuOption = {
		format: ExportFormat;
		label: string;
		description?: string;
		disabled?: boolean;
	};

	export const defaultExportOptions: readonly ExportMenuOption[] = [
		{
			format: 'xlsx',
			label: 'Excel (.xlsx)',
			description: 'Для просмотра и редактирования в таблицах'
		},
		{
			format: 'csv',
			label: 'CSV (.csv)',
			description: 'Для импорта в другие системы'
		}
	];
</script>

<script lang="ts">
	import { Popover } from 'melt/builders';
	import {
		AngleDownOutline,
		FileChartBarOutline,
		FileCsvOutline,
		FileExportOutline
	} from 'flowbite-svelte-icons';
	import Spinner from '../spinner/Spinner.svelte';
	import { buttonVariants, type ButtonSize, type ButtonVariant } from '../button/button.variants';
	import { exportMenuVariants } from './export-menu.variants';

	type Props = {
		label?: string;
		options?: readonly ExportMenuOption[];
		variant?: ButtonVariant;
		size?: ButtonSize;
		fullWidth?: boolean;
		disabled?: boolean;
		loading?: boolean;
		class?: string;
		buttonClass?: string;
		onExport?: (format: ExportFormat) => void | Promise<void>;
	};

	let {
		label = 'Экспорт',
		options = defaultExportOptions,
		variant = 'secondary',
		size = 'default',
		fullWidth = false,
		disabled = false,
		loading = false,
		class: className = '',
		buttonClass = '',
		onExport
	}: Props = $props();

	const popover = new Popover({
		floatingConfig: {
			computePosition: { placement: 'bottom-end' },
			offset: { mainAxis: 8 }
		}
	});

	const styles = exportMenuVariants();
	let activeFormat = $state<ExportFormat | null>(null);
	let busy = $derived(loading || activeFormat !== null);

	async function handleExport(option: ExportMenuOption): Promise<void> {
		if (disabled || busy || option.disabled || !onExport) return;

		popover.open = false;
		activeFormat = option.format;
		try {
			await onExport(option.format);
		} finally {
			activeFormat = null;
		}
	}
</script>

<div class={styles.root({ class: className })}>
	<button
		{...popover.trigger}
		type="button"
		disabled={disabled || busy || options.length === 0}
		aria-busy={busy}
		class={buttonVariants({ variant, size, fullWidth, class: buttonClass })}
	>
		<FileExportOutline aria-hidden="true" class={styles.triggerIcon()} strokeWidth={1.5} />
		<span>{label}</span>
		{#if busy}
			<Spinner size="sm" label="Подготовка файла" class="text-current" />
		{:else}
			<AngleDownOutline
				aria-hidden="true"
				class={styles.triggerChevron()}
				strokeWidth={1.5}
				style={`transform: ${popover.open ? 'rotate(180deg)' : 'rotate(0deg)'}`}
			/>
		{/if}
	</button>

	<div {...popover.content} class={styles.content()}>
		{#each options as option (option.format)}
			<button
				type="button"
				disabled={disabled || busy || option.disabled}
				class={styles.item()}
				onclick={() => void handleExport(option)}
			>
				{#if option.format === 'xlsx'}
					<FileChartBarOutline aria-hidden="true" class={styles.itemIcon()} strokeWidth={1.5} />
				{:else}
					<FileCsvOutline aria-hidden="true" class={styles.itemIcon()} strokeWidth={1.5} />
				{/if}
				<span class={styles.itemText()}>
					<span class={styles.itemLabel()}>{option.label}</span>
					{#if option.description}
						<span class={styles.itemDescription()}>{option.description}</span>
					{/if}
				</span>
			</button>
		{/each}
	</div>
</div>
