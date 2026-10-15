<script module lang="ts">
	export type DataTableColumnSettingsItem = {
		id: string;
		title: string;
		visible: boolean;
		hideable: boolean;
	};
</script>

<script lang="ts">
	import { Popover } from 'melt/builders';
	import { TableColumnOutline } from 'flowbite-svelte-icons';
	import Button from '../button/Button.svelte';
	import Checkbox from '../checkbox/Checkbox.svelte';
	import ScrollArea from '../ScrollArea.svelte';
	import SortableList from '../sortable-list/SortableList.svelte';
	import { dataTableColumnSettingsVariants } from './data-table-column-settings.variants';

	type Props = {
		items: readonly DataTableColumnSettingsItem[];
		onReorder: (items: DataTableColumnSettingsItem[]) => void | Promise<void>;
		onVisibilityChange: (columnId: string, visible: boolean) => void | Promise<void>;
		onReset: () => void | Promise<void>;
		ariaLabel?: string;
		triggerText?: string;
	};

	let {
		items,
		onReorder,
		onVisibilityChange,
		onReset,
		ariaLabel = 'Настроить колонки таблицы',
		triggerText = 'Колонки'
	}: Props = $props();

	const popover = new Popover({
		floatingConfig: {
			computePosition: { placement: 'bottom-end', strategy: 'fixed' },
			shift: { padding: 16 },
			flip: { padding: 16 },
			offset: { mainAxis: 8 }
		}
	});
	const styles = dataTableColumnSettingsVariants();
	let visibleCount = $derived(items.filter((item) => item.visible).length);

	function canToggle(item: DataTableColumnSettingsItem): boolean {
		return item.hideable && (!item.visible || visibleCount > 1);
	}
</script>

<div class={styles.root()}>
	<button
		type="button"
		{...popover.trigger}
		class={styles.trigger()}
		aria-label={ariaLabel}
		title={ariaLabel}
	>
		<TableColumnOutline class={styles.triggerIcon()} strokeWidth={1.75} />
		<span class={styles.triggerText()}>{triggerText}</span>
	</button>

	<section
		{...popover.content}
		class={styles.content()}
		aria-label={ariaLabel}
		data-column-settings-popover
	>
		<header class={styles.header()}>
			<h2 class={styles.title()}>Колонки таблицы</h2>
			<p class={styles.description()}>Перетаскивайте колонки за ручку и отключайте ненужные.</p>
		</header>
		<div
			class={styles.body()}
			style:height={`${Math.min(416, Math.max(76, items.length * 58))}px`}
		>
			<ScrollArea
				class="h-full"
				contentClass="pr-3"
				horizontal={false}
				scrollbarSize={6}
				scrollbarVisibility="hover"
				verticalLabel="Прокрутка списка колонок"
			>
				<SortableList
					{items}
					getKey={(item) => item.id}
					itemLabel={(item) => `колонка «${item.title}»`}
					ariaLabel="Порядок колонок таблицы"
					class={styles.list()}
					itemClass="gap-1.5"
					{onReorder}
				>
					{#snippet children(item)}
						<div class={styles.item()}>
							<span class={styles.itemText()} title={item.title}>{item.title}</span>
							<Checkbox
								checked={item.visible}
								disabled={!canToggle(item)}
								ariaLabel={item.visible
									? `Скрыть колонку «${item.title}»`
									: `Показать колонку «${item.title}»`}
								onChange={(checked) => onVisibilityChange(item.id, checked === true)}
							/>
						</div>
					{/snippet}
				</SortableList>
			</ScrollArea>
		</div>
		<footer class={styles.footer()}>
			<p class={styles.note()}>Колонка действий и выбор строк закреплены.</p>
			<Button type="button" variant="secondary" size="xs" onclick={onReset}>Сбросить</Button>
		</footer>
	</section>
</div>

<style>
	section[data-column-settings-popover] {
		opacity: 0;
		transform: translateY(-0.25rem) scale(0.98);
		transition:
			opacity 160ms ease-out,
			transform 160ms ease-out,
			display 160ms allow-discrete,
			overlay 160ms allow-discrete;
	}

	section[data-column-settings-popover]:popover-open {
		opacity: 1;
		transform: translateY(0) scale(1);
	}

	@starting-style {
		section[data-column-settings-popover]:popover-open {
			opacity: 0;
			transform: translateY(-0.25rem) scale(0.98);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		section[data-column-settings-popover] {
			transition: none;
		}
	}
</style>
