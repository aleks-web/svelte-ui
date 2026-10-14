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
	import { DotsVerticalOutline } from 'flowbite-svelte-icons';
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
	};

	let {
		items,
		onReorder,
		onVisibilityChange,
		onReset,
		ariaLabel = 'Настроить колонки таблицы'
	}: Props = $props();

	const popover = new Popover({
		floatingConfig: {
			computePosition: { placement: 'bottom-end' },
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
		<DotsVerticalOutline class={styles.triggerIcon()} strokeWidth={1.75} />
	</button>

	<section {...popover.content} class={styles.content()} aria-label={ariaLabel}>
		<header class={styles.header()}>
			<h2 class={styles.title()}>Колонки таблицы</h2>
			<p class={styles.description()}>Перетаскивайте колонки за ручку и отключайте ненужные.</p>
		</header>
		<div class={styles.body()} style:height={`${Math.min(416, Math.max(76, items.length * 58))}px`}>
			<ScrollArea
				class="h-full"
				horizontal={false}
				scrollbarSize={5}
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
