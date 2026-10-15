<script module lang="ts">
	export type DataTableAlign = 'left' | 'center' | 'right';
	export type DataTableCellValue = string | number | null | undefined;
	export type DataTableSortDirection = 'ASC' | 'DESC';
	export type DataTableResizeMode = 'fit' | 'overflow';
	export type DataTableDensity = 'compact' | 'default' | 'comfortable';
	export type DataTableColumnKind = 'data' | 'actions';
	export type DataTableSortState = {
		key: string;
		direction: DataTableSortDirection;
	};
	export type DataTableRowState = {
		hovered: boolean;
		focusWithin: boolean;
		active: boolean;
	};

	export type DataTableColumn<T> = {
		id: string;
		title: string;
		kind?: DataTableColumnKind;
		actionPlacement?: 'start' | 'end';
		width?: string;
		align?: DataTableAlign;
		headerClass?: string;
		cellClass?: string;
		sortKey?: string;
		defaultSortDirection?: DataTableSortDirection;
		resizable?: boolean;
		hideable?: boolean;
		minWidth?: number;
		maxWidth?: number;
		value?: (row: T) => DataTableCellValue;
	};
</script>

<script lang="ts" generics="T, C extends DataTableColumn<T>">
	import Checkbox, { type CheckboxState } from '../checkbox/Checkbox.svelte';
	import ScrollArea, { type ScrollAreaState } from '../ScrollArea.svelte';
	import Spinner from '../spinner/Spinner.svelte';
	import type { SpinnerSize } from '../spinner/spinner.variants';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import {
		dataTableCellVariants,
		dataTableHeadCellVariants,
		dataTableResizeHandleVariants,
		dataTableResizeLineVariants,
		dataTableRowVariants,
		dataTableSortButtonVariants,
		dataTableSortIconVariants,
		dataTableVariants
	} from './data-table.variants';
	import Button from '../button/Button.svelte';
	import DataTableColumnSettings, {
		type DataTableColumnSettingsItem
	} from './DataTableColumnSettings.svelte';

	type Props = {
		rows: T[];
		columns: readonly C[];
		rowKey: (row: T) => string | number;
		cells?: Partial<Record<C['id'], Snippet<[row: T, state: DataTableRowState]>>>;
		ariaLabel: string;
		emptyText?: string;
		minWidth?: string;
		id?: string;
		class?: string;
		rowClass?: string | ((row: T) => string);
		sort?: DataTableSortState | null;
		onSortChange?: (sort: DataTableSortState) => void | Promise<void>;
		resizableColumns?: boolean;
		resizeMode?: DataTableResizeMode;
		minColumnWidth?: number;
		maxColumnWidth?: number;
		columnResizeStep?: number;
		onColumnResize?: (columnId: string, width: number) => void | Promise<void>;
		onRowClick?: (row: T) => void | Promise<void>;
		rowLabel?: (row: T) => string;
		topFade?: boolean;
		topFadeHeight?: number;
		bottomFade?: boolean;
		bottomFadeHeight?: number;
		density?: DataTableDensity;
		persistColumnWidths?: boolean;
		storageKey?: string;
		loadingSpinnerSize?: SpinnerSize | number;
		selectableRows?: boolean;
		selectedRowKeys?: Array<string | number>;
		isRowSelectable?: (row: T) => boolean;
		onSelectionChange?: (keys: Array<string | number>) => void | Promise<void>;
		selectionColumnWidth?: number;
		columnSettings?: boolean;
		persistColumnLayout?: boolean;
		defaultHiddenColumnIds?: readonly string[];
		onColumnOrderChange?: (columnIds: string[]) => void | Promise<void>;
		onColumnVisibilityChange?: (visibleColumnIds: string[]) => void | Promise<void>;
	};

	type StoredColumnWidths = {
		version: 3;
		columns: Record<string, number>;
	};
	type StoredColumnLayout = {
		version: 1;
		order: string[];
		hidden: string[];
	};

	let {
		rows,
		columns,
		rowKey,
		cells = {},
		ariaLabel,
		emptyText = 'Нет данных',
		minWidth = '48rem',
		id,
		class: className = '',
		rowClass = '',
		sort = null,
		onSortChange,
		resizableColumns = true,
		resizeMode = 'fit',
		minColumnWidth = 72,
		maxColumnWidth,
		columnResizeStep = 16,
		onColumnResize,
		onRowClick,
		rowLabel,
		topFade = true,
		topFadeHeight = 64,
		bottomFade = true,
		bottomFadeHeight = 64,
		density = 'default',
		persistColumnWidths = true,
		storageKey,
		loadingSpinnerSize = 'lg',
		selectableRows = false,
		selectedRowKeys = $bindable([]),
		isRowSelectable,
		onSelectionChange,
		selectionColumnWidth = 52,
		columnSettings = true,
		persistColumnLayout = true,
		defaultHiddenColumnIds = [],
		onColumnOrderChange,
		onColumnVisibilityChange
	}: Props = $props();

	const COLUMN_WIDTH_STORAGE_PREFIX = 'saas:data-table:column-widths:v3:';
	const COLUMN_LAYOUT_STORAGE_PREFIX = 'saas:data-table:column-layout:v1:';
	const HEADER_HEIGHT = 46;
	let hoveredRowKey: string | number | null = $state(null);
	let focusedRowKey: string | number | null = $state(null);
	let headerRowElement: HTMLTableRowElement | undefined = $state();
	let headerHeight = $state(HEADER_HEIGHT);
	let columnWidths: Record<string, number> = $state({});
	let columnOrder: string[] = $state([]);
	let hiddenColumnIds: string[] = $state([]);
	let hasMeasuredColumnWidths = $state(false);
	let resizingColumnId: string | null = $state(null);
	let verticalScrollTop = $state(0);
	let remainingVerticalScroll = $state(0);
	let scrollViewportHeight = $state(0);
	let restoreFrame: number | undefined;
	let restoreObserver: ResizeObserver | undefined;
	let headerSizeObserver: ResizeObserver | undefined;
	let tableReady = $state(false);
	let hiddenColumnIdSet = $derived(new Set(hiddenColumnIds));
	let orderedColumns = $derived.by(() => reconcileColumnOrder(columns, columnOrder));
	let visibleColumns = $derived(
		orderedColumns.filter(
			(column) => column.kind === 'actions' || !hiddenColumnIdSet.has(column.id)
		)
	);
	let fillColumnId = $derived(
		[...visibleColumns].reverse().find((column) => column.kind !== 'actions')?.id ??
			visibleColumns.at(-1)?.id
	);
	let configurableColumns = $derived(orderedColumns.filter((column) => column.kind !== 'actions'));
	let columnSettingsItems = $derived<DataTableColumnSettingsItem[]>(
		configurableColumns.map((column) => ({
			id: column.id,
			title: column.title,
			visible: !hiddenColumnIdSet.has(column.id),
			hideable: column.hideable !== false
		}))
	);
	let showsColumnSettings = $derived(columnSettings && configurableColumns.length > 1);
	let resizedColumnsWidth = $derived(
		hasMeasuredColumnWidths
			? visibleColumns.reduce((total, column) => total + (columnWidths[column.id] ?? 0), 0)
			: null
	);
	let safeSelectionColumnWidth = $derived(Math.max(40, selectionColumnWidth));
	let resizedTableWidth = $derived(
		resizedColumnsWidth === null
			? null
			: resizedColumnsWidth + (selectableRows ? safeSelectionColumnWidth : 0)
	);
	let selectedKeySet = $derived(new Set(selectedRowKeys));
	let selectableVisibleKeys = $derived(
		selectableRows
			? rows.filter((row) => isRowSelectable?.(row) ?? true).map((row) => rowKey(row))
			: []
	);
	let selectedVisibleCount = $derived(
		selectableVisibleKeys.filter((key) => selectedKeySet.has(key)).length
	);
	let visibleSelectionState = $derived<CheckboxState>(
		selectableVisibleKeys.length === 0 || selectedVisibleCount === 0
			? false
			: selectedVisibleCount === selectableVisibleKeys.length
				? true
				: 'indeterminate'
	);
	let initialColumnWeightTotal = $derived(
		visibleColumns.reduce((total, column) => total + getInitialColumnWeight(column), 0)
	);
	let safeTopFadeHeight = $derived(Math.max(0, topFadeHeight));
	let safeBottomFadeHeight = $derived(Math.max(0, bottomFadeHeight));
	let topFadeStrength = $derived(
		topFade && safeTopFadeHeight > 0 ? Math.min(1, verticalScrollTop / safeTopFadeHeight) : 0
	);
	let bottomFadeStrength = $derived(
		bottomFade && safeBottomFadeHeight > 0
			? Math.min(1, remainingVerticalScroll / safeBottomFadeHeight)
			: 0
	);
	let topMaskOpacity = $derived(1 - topFadeStrength);
	let bottomMaskOpacity = $derived(1 - bottomFadeStrength);
	let scrollMask = $derived.by(() => {
		const hasTopFade = topFadeStrength > 0 && safeTopFadeHeight > 0;
		const hasBottomFade = bottomFadeStrength > 0 && safeBottomFadeHeight > 0;

		if (!hasTopFade && !hasBottomFade) return 'none';

		const availableBodyHeight = Math.max(0, scrollViewportHeight - headerHeight);
		const activeFadeCount = Number(hasTopFade) + Number(hasBottomFade);
		const maximumFadeHeight =
			activeFadeCount > 0 ? availableBodyHeight / activeFadeCount : availableBodyHeight;
		const effectiveTopFadeHeight = Math.min(safeTopFadeHeight, maximumFadeHeight);
		const effectiveBottomFadeHeight = Math.min(safeBottomFadeHeight, maximumFadeHeight);
		const stops = ['black 0', `black ${headerHeight}px`];

		if (hasTopFade) {
			stops.push(
				`rgb(0 0 0 / ${topMaskOpacity}) ${headerHeight}px`,
				`black ${headerHeight + effectiveTopFadeHeight}px`
			);
		}

		if (hasBottomFade) {
			stops.push(
				`black calc(100% - ${effectiveBottomFadeHeight}px)`,
				`rgb(0 0 0 / ${bottomMaskOpacity}) 100%`
			);
		} else {
			stops.push('black 100%');
		}

		return `linear-gradient(to bottom, ${stops.join(', ')})`;
	});
	let stopActiveResize: (() => void) | undefined;
	const styles = dataTableVariants();

	function getTableStorageIdentity(): string {
		return storageKey?.trim() || id?.trim() || ariaLabel.trim();
	}

	function reconcileColumnOrder(
		sourceColumns: readonly C[],
		requestedOrder: readonly string[]
	): C[] {
		const dataColumns = sourceColumns.filter((column) => column.kind !== 'actions');
		const leadingActionColumns = sourceColumns.filter(
			(column) => column.kind === 'actions' && column.actionPlacement === 'start'
		);
		const trailingActionColumns = sourceColumns.filter(
			(column) => column.kind === 'actions' && column.actionPlacement !== 'start'
		);
		const dataColumnsById = new Map(dataColumns.map((column) => [column.id, column]));
		const reconciledIds = [
			...new Set(requestedOrder.filter((columnId) => dataColumnsById.has(columnId)))
		];

		for (const column of dataColumns) {
			if (reconciledIds.includes(column.id)) continue;

			const sourceIndex = dataColumns.indexOf(column);
			const previousColumn = [...dataColumns.slice(0, sourceIndex)]
				.reverse()
				.find((candidate) => reconciledIds.includes(candidate.id));
			const nextColumn = dataColumns
				.slice(sourceIndex + 1)
				.find((candidate) => reconciledIds.includes(candidate.id));

			if (previousColumn) {
				reconciledIds.splice(reconciledIds.indexOf(previousColumn.id) + 1, 0, column.id);
			} else if (nextColumn) {
				reconciledIds.splice(reconciledIds.indexOf(nextColumn.id), 0, column.id);
			} else {
				reconciledIds.push(column.id);
			}
		}

		return [
			...leadingActionColumns,
			...reconciledIds.flatMap((columnId) => {
				const column = dataColumnsById.get(columnId);
				return column ? [column] : [];
			}),
			...trailingActionColumns
		];
	}

	function getColumnLayoutStorageKey(): string | null {
		if (!persistColumnLayout) return null;
		const tableKey = getTableStorageIdentity();
		return tableKey ? `${COLUMN_LAYOUT_STORAGE_PREFIX}${tableKey}` : null;
	}

	function readStoredColumnLayout(): StoredColumnLayout | null {
		const key = getColumnLayoutStorageKey();
		if (!key) return null;

		try {
			const rawValue = window.localStorage.getItem(key);
			if (!rawValue) return null;

			const value = JSON.parse(rawValue) as Partial<StoredColumnLayout>;
			if (
				value.version !== 1 ||
				!Array.isArray(value.order) ||
				!value.order.every((columnId) => typeof columnId === 'string') ||
				!Array.isArray(value.hidden) ||
				!value.hidden.every((columnId) => typeof columnId === 'string')
			) {
				window.localStorage.removeItem(key);
				return null;
			}

			return value as StoredColumnLayout;
		} catch {
			return null;
		}
	}

	function normalizeHiddenColumnIds(candidateIds: readonly string[]): string[] {
		const dataColumns = columns.filter((column) => column.kind !== 'actions');
		const hideableColumnIds = new Set(
			dataColumns.filter((column) => column.hideable !== false).map((column) => column.id)
		);
		const normalizedIds = [
			...new Set(candidateIds.filter((columnId) => hideableColumnIds.has(columnId)))
		];

		if (
			dataColumns.length > 0 &&
			dataColumns.every((column) => normalizedIds.includes(column.id))
		) {
			return normalizedIds.filter((columnId) => columnId !== dataColumns[0].id);
		}

		return normalizedIds;
	}

	function applyStoredColumnLayout(stored: StoredColumnLayout): void {
		columnOrder = reconcileColumnOrder(columns, stored.order)
			.filter((column) => column.kind !== 'actions')
			.map((column) => column.id);
		hiddenColumnIds = normalizeHiddenColumnIds(stored.hidden);
	}

	function saveColumnLayout(
		nextOrder: readonly string[] = columnOrder,
		nextHidden: readonly string[] = hiddenColumnIds
	): void {
		const key = getColumnLayoutStorageKey();
		if (!key) return;

		try {
			window.localStorage.setItem(
				key,
				JSON.stringify({
					version: 1,
					order: [...nextOrder],
					hidden: [...nextHidden]
				} satisfies StoredColumnLayout)
			);
		} catch {
			// The table remains usable when browser storage is unavailable or full.
		}
	}

	function scheduleColumnMeasurement(): void {
		window.requestAnimationFrame(() => {
			measureColumnWidths();
			saveColumnWidths();
			measureHeaderHeight();
		});
	}

	function handleColumnReorder(items: DataTableColumnSettingsItem[]): void {
		const nextOrder = items.map((item) => item.id);
		columnOrder = nextOrder;
		saveColumnLayout(nextOrder, hiddenColumnIds);
		if (onColumnOrderChange) void onColumnOrderChange([...nextOrder]);

		// Widths are stored by column id, so reordering must not measure them again.
		// The last visible column can be stretched to fill the remaining space; persisting
		// that rendered width and then moving it produces an artificial table overflow.
		window.requestAnimationFrame(measureHeaderHeight);
	}

	function handleColumnVisibilityChange(columnId: string, visible: boolean): void {
		const column = columns.find((candidate) => candidate.id === columnId);
		if (!column || column.kind === 'actions' || column.hideable === false) return;

		const nextHidden = normalizeHiddenColumnIds(
			visible
				? hiddenColumnIds.filter((hiddenColumnId) => hiddenColumnId !== columnId)
				: [...hiddenColumnIds, columnId]
		);
		hiddenColumnIds = nextHidden;
		saveColumnLayout(columnOrder, nextHidden);

		if (onColumnVisibilityChange) {
			const hiddenSet = new Set(nextHidden);
			const nextVisibleIds = reconcileColumnOrder(columns, columnOrder)
				.filter((candidate) => candidate.kind !== 'actions' && !hiddenSet.has(candidate.id))
				.map((candidate) => candidate.id);
			void onColumnVisibilityChange(nextVisibleIds);
		}
		scheduleColumnMeasurement();
	}

	function resetColumnLayout(): void {
		const layoutKey = getColumnLayoutStorageKey();
		const widthKey = getColumnWidthStorageKey();
		if (layoutKey) window.localStorage.removeItem(layoutKey);
		if (widthKey) window.localStorage.removeItem(widthKey);

		columnOrder = columns.filter((column) => column.kind !== 'actions').map((column) => column.id);
		hiddenColumnIds = normalizeHiddenColumnIds(defaultHiddenColumnIds);
		columnWidths = {};
		hasMeasuredColumnWidths = false;
		tableReady = false;

		if (onColumnOrderChange) void onColumnOrderChange([...columnOrder]);
		if (onColumnVisibilityChange) {
			const hiddenSet = new Set(hiddenColumnIds);
			void onColumnVisibilityChange(
				columnOrder.filter((columnId) => !hiddenSet.has(columnId))
			);
		}

		window.requestAnimationFrame(() => {
			window.requestAnimationFrame(() => {
				measureHeaderHeight();
				tableReady = true;
			});
		});
	}

	function getAriaSort(column: C): 'ascending' | 'descending' | 'none' | undefined {
		if (!column.sortKey) return undefined;
		if (sort?.key !== column.sortKey) return 'none';
		return sort.direction === 'ASC' ? 'ascending' : 'descending';
	}

	function getNextSort(column: C): DataTableSortState | null {
		if (!column.sortKey) return null;

		return {
			key: column.sortKey,
			direction:
				sort?.key === column.sortKey
					? sort.direction === 'ASC'
						? 'DESC'
						: 'ASC'
					: (column.defaultSortDirection ?? 'ASC')
		};
	}

	function getSortButtonLabel(column: C): string {
		const nextSort = getNextSort(column);
		const directionLabel = nextSort?.direction === 'DESC' ? 'по убыванию' : 'по возрастанию';

		return `Сортировать «${column.title}» ${directionLabel}`;
	}

	function handleSort(column: C): void {
		const nextSort = getNextSort(column);
		if (nextSort && onSortChange) void onSortChange(nextSort);
	}

	function getInitialColumnWeight(column: C): number {
		const parsedWidth = Number.parseFloat(column.width ?? '');
		return Number.isFinite(parsedWidth) && parsedWidth > 0 ? parsedWidth : 1;
	}

	function getColumnWidth(column: C): string | undefined {
		const resizedWidth = columnWidths[column.id];
		if (column.kind === 'actions') {
			return resizedWidth === undefined ? (column.width ?? 'max-content') : `${resizedWidth}px`;
		}

		if (resizeMode === 'fit') {
			const width = resizedWidth ?? getInitialColumnWeight(column);
			const totalWidth =
				resizedWidth === undefined
					? initialColumnWeightTotal
					: resizedColumnsWidth === null
						? null
						: resizedColumnsWidth + (selectableRows ? safeSelectionColumnWidth : 0);

			return totalWidth && totalWidth > 0 ? `${(width / totalWidth) * 100}%` : undefined;
		}

		if (resizedWidth === undefined) return column.width;
		if (column.id !== fillColumnId || resizedTableWidth === null) return `${resizedWidth}px`;

		const occupiedWidth = Math.max(0, resizedTableWidth - resizedWidth);
		return `max(${resizedWidth}px, calc(100% - ${occupiedWidth}px))`;
	}

	function canResizeColumn(column: C): boolean {
		return (
			resizableColumns &&
			column.resizable !== false &&
			(column.kind !== 'actions' || column.resizable === true)
		);
	}

	function showsResizeHandle(column: C): boolean {
		return canResizeColumn(column);
	}

	function isBeforeActionsColumn(column: C): boolean {
		const columnIndex = visibleColumns.indexOf(column);
		return columnIndex >= 0 && visibleColumns[columnIndex + 1]?.kind === 'actions';
	}

	function getColumnAlign(column: C): DataTableAlign {
		return column.align ?? (column.kind === 'actions' ? 'right' : 'left');
	}

	function getColumnMinWidth(column: C): number {
		return Math.max(1, column.minWidth ?? minColumnWidth);
	}

	function getColumnMaxWidth(column: C): number {
		return Math.max(getColumnMinWidth(column), column.maxWidth ?? maxColumnWidth ?? Infinity);
	}

	function getColumnWidthStorageKey(): string | null {
		if (!persistColumnWidths) return null;
		const tableKey = getTableStorageIdentity();
		return tableKey ? `${COLUMN_WIDTH_STORAGE_PREFIX}${tableKey}` : null;
	}

	function readStoredColumnWidths(): StoredColumnWidths | null {
		const key = getColumnWidthStorageKey();
		if (!key) return null;

		try {
			const rawValue = window.localStorage.getItem(key);
			if (!rawValue) return null;

			const value = JSON.parse(rawValue) as Partial<StoredColumnWidths>;
			if (value.version !== 3 || !value.columns || typeof value.columns !== 'object') {
				window.localStorage.removeItem(key);
				return null;
			}

			return value as StoredColumnWidths;
		} catch {
			return null;
		}
	}

	function saveColumnWidths(): void {
		const key = getColumnWidthStorageKey();
		if (!key || !hasMeasuredColumnWidths) return;

		const persistableColumns = columns.filter(
			(column) => column.kind !== 'actions' || column.resizable === true
		);
		const savedColumns = Object.fromEntries(
			persistableColumns.flatMap((column) => {
				const width = columnWidths[column.id];
				return Number.isFinite(width) && width > 0
					? [[column.id, Math.round(width * 100) / 100] as const]
					: [];
			})
		);

		if (Object.keys(savedColumns).length === 0) return;

		try {
			window.localStorage.setItem(
				key,
				JSON.stringify({ version: 3, columns: savedColumns } satisfies StoredColumnWidths)
			);
		} catch {
			// The table remains usable when browser storage is unavailable or full.
		}
	}

	function measureColumnWidths(): Record<string, number> | null {
		const selectionOffset = selectableRows ? 1 : 0;
		if (
			!headerRowElement ||
			headerRowElement.cells.length !== visibleColumns.length + selectionOffset
		)
			return null;
		const headerCells = headerRowElement.cells;

		const measuredWidths = Object.fromEntries(
			visibleColumns.map((column, index) => [
				column.id,
				headerCells[index + selectionOffset].getBoundingClientRect().width
			])
		);
		if (Object.values(measuredWidths).some((width) => !Number.isFinite(width) || width <= 0)) {
			return null;
		}

		columnWidths = { ...columnWidths, ...measuredWidths };
		hasMeasuredColumnWidths = true;
		return columnWidths;
	}

	function restoreColumnWidths(stored: StoredColumnWidths): boolean {
		const measuredWidths = measureColumnWidths();
		if (!measuredWidths) return false;

		const restoredWidths = { ...measuredWidths };
		for (const column of columns) {
			if (column.kind === 'actions' && column.resizable !== true) continue;
			const storedWidth = stored.columns[column.id];
			if (!Number.isFinite(storedWidth) || storedWidth <= 0) continue;

			restoredWidths[column.id] = Math.min(
				getColumnMaxWidth(column),
				Math.max(getColumnMinWidth(column), storedWidth)
			);
		}

		columnWidths = restoredWidths;
		hasMeasuredColumnWidths = true;
		return true;
	}

	function getResizePartners(column: C): C[] {
		const columnIndex = visibleColumns.indexOf(column);
		if (columnIndex < 0) return [];

		return [
			...visibleColumns.slice(columnIndex + 1),
			...visibleColumns.slice(0, columnIndex).reverse()
		].filter((candidate) => canResizeColumn(candidate));
	}

	function distributeWidthDelta(
		column: C,
		delta: number,
		widths: Record<string, number>
	): Record<string, number> {
		if (resizeMode === 'overflow') {
			const nextWidths = { ...widths, [column.id]: widths[column.id] + delta };

			// The last data column fills otherwise unused table space, so use it first.
			// Other columns can then yield width down to their own minimums. Only the
			// remainder is allowed to increase the total table width and create overflow.
			if (delta > 0) {
				let remainingDelta = delta;
				const partners = getResizePartners(column).sort((left, right) => {
					if (left.id === fillColumnId) return -1;
					if (right.id === fillColumnId) return 1;
					return 0;
				});

				for (const partner of partners) {
					if (remainingDelta <= 0) break;
					const partnerWidth = nextWidths[partner.id];
					const transferableWidth = Math.min(
						remainingDelta,
						Math.max(0, partnerWidth - getColumnMinWidth(partner))
					);
					nextWidths[partner.id] = partnerWidth - transferableWidth;
					remainingDelta -= transferableWidth;
				}
			}

			return nextWidths;
		}

		const nextWidths = { ...widths };
		let remainingDelta = Math.abs(delta);

		for (const partner of getResizePartners(column)) {
			if (remainingDelta <= 0) break;

			const partnerWidth = nextWidths[partner.id];
			const availableWidth =
				delta > 0
					? Math.max(0, partnerWidth - getColumnMinWidth(partner))
					: Math.max(0, getColumnMaxWidth(partner) - partnerWidth);
			const transferredWidth = Math.min(remainingDelta, availableWidth);

			nextWidths[partner.id] = partnerWidth - Math.sign(delta) * transferredWidth;
			remainingDelta -= transferredWidth;
		}

		const appliedDelta = Math.sign(delta) * (Math.abs(delta) - remainingDelta);
		nextWidths[column.id] = widths[column.id] + appliedDelta;
		return nextWidths;
	}

	function setColumnWidth(
		column: C,
		width: number,
		widths: Record<string, number> = columnWidths
	): void {
		const currentWidth = widths[column.id];
		if (currentWidth === undefined) return;

		const nextWidth = Math.min(
			getColumnMaxWidth(column),
			Math.max(getColumnMinWidth(column), width)
		);
		const nextWidths = distributeWidthDelta(column, nextWidth - currentWidth, widths);
		const appliedWidth = nextWidths[column.id];
		if (Math.abs(currentWidth - appliedWidth) < 0.01) return;

		columnWidths = nextWidths;
		if (onColumnResize) void onColumnResize(column.id, Math.round(appliedWidth));
	}

	function startColumnResize(column: C, event: PointerEvent): void {
		if (!canResizeColumn(column) || event.button !== 0) return;

		event.preventDefault();
		event.stopPropagation();
		stopActiveResize?.();

		const widths = measureColumnWidths();
		if (!widths) return;

		const startX = event.clientX;
		const startWidth = widths[column.id];
		const previousCursor = document.body.style.cursor;
		const previousUserSelect = document.body.style.userSelect;
		let stopped = false;

		resizingColumnId = column.id;
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';

		const pointerId = event.pointerId;
		const handlePointerMove = (moveEvent: PointerEvent): void => {
			if (moveEvent.pointerId !== pointerId) return;
			setColumnWidth(column, startWidth + moveEvent.clientX - startX, widths);
		};

		const stopResize = (): void => {
			if (stopped) return;
			stopped = true;
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', handlePointerEnd);
			window.removeEventListener('pointercancel', handlePointerEnd);
			document.body.style.cursor = previousCursor;
			document.body.style.userSelect = previousUserSelect;
			resizingColumnId = null;
			stopActiveResize = undefined;
			saveColumnWidths();
		};
		const handlePointerEnd = (endEvent: PointerEvent): void => {
			if (endEvent.pointerId === pointerId) stopResize();
		};

		stopActiveResize = stopResize;
		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', handlePointerEnd);
		window.addEventListener('pointercancel', handlePointerEnd);
	}

	function handleResizeKeydown(column: C, event: KeyboardEvent): void {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

		event.preventDefault();
		event.stopPropagation();
		const widths = measureColumnWidths();
		if (!widths) return;

		const direction = event.key === 'ArrowRight' ? 1 : -1;
		setColumnWidth(column, widths[column.id] + direction * Math.max(1, columnResizeStep), widths);
		saveColumnWidths();
	}

	function getRowClass(row: T): string {
		return typeof rowClass === 'function' ? rowClass(row) : rowClass;
	}

	function getCustomCell(
		columnId: string
	): Snippet<[row: T, state: DataTableRowState]> | undefined {
		return cells[columnId as C['id']];
	}

	function getRowState(key: string | number): DataTableRowState {
		const hovered = hoveredRowKey === key;
		const focusWithin = focusedRowKey === key;

		return {
			hovered,
			focusWithin,
			active: hovered || focusWithin
		};
	}

	function handleRowPointerLeave(key: string | number): void {
		if (hoveredRowKey === key) hoveredRowKey = null;
	}

	function handleRowFocusOut(key: string | number, event: FocusEvent): void {
		const rowElement = event.currentTarget as HTMLTableRowElement | null;

		if (focusedRowKey === key && !rowElement?.contains(event.relatedTarget as Node | null)) {
			focusedRowKey = null;
		}
	}

	function isInteractiveTarget(target: EventTarget | null): boolean {
		return (
			target instanceof Element &&
			Boolean(
				target.closest(
					'a, button, input, select, textarea, [role="button"], [data-row-click-ignore]'
				)
			)
		);
	}

	function handleRowClick(row: T, event: MouseEvent): void {
		if (!onRowClick || isInteractiveTarget(event.target)) return;
		void onRowClick(row);
	}

	function handleRowKeydown(row: T, event: KeyboardEvent): void {
		if (!onRowClick || event.target !== event.currentTarget) return;
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		void onRowClick(row);
	}

	function updateSelection(nextKeys: Array<string | number>): void {
		selectedRowKeys = [...new Set(nextKeys)];
		if (onSelectionChange) void onSelectionChange(selectedRowKeys);
	}

	function handleRowSelection(row: T): void {
		const key = rowKey(row);
		const nextKeys = new SvelteSet(selectedRowKeys);
		if (nextKeys.has(key)) nextKeys.delete(key);
		else nextKeys.add(key);
		updateSelection([...nextKeys]);
	}

	function handleVisibleSelection(checked: CheckboxState): void {
		const nextKeys = new SvelteSet(selectedRowKeys);
		if (checked === true) {
			for (const key of selectableVisibleKeys) nextKeys.add(key);
		} else {
			for (const key of selectableVisibleKeys) nextKeys.delete(key);
		}
		updateSelection([...nextKeys]);
	}

	function toggleVisibleSelection(): void {
		handleVisibleSelection(visibleSelectionState !== true);
	}

	function handleScrollStateChange(state: ScrollAreaState): void {
		verticalScrollTop = state.canScrollUp ? state.scrollTop : 0;
		remainingVerticalScroll = state.canScrollDown
			? Math.max(0, state.maxVerticalScroll - state.scrollTop)
			: 0;
		scrollViewportHeight = state.viewportHeight;
	}

	function measureHeaderHeight(): void {
		const measuredHeight = headerRowElement?.getBoundingClientRect().height;
		if (measuredHeight && Number.isFinite(measuredHeight)) headerHeight = measuredHeight;
	}

	onMount(() => {
		const storedLayout = readStoredColumnLayout();
		if (storedLayout) {
			applyStoredColumnLayout(storedLayout);
		} else {
			columnOrder = columns
				.filter((column) => column.kind !== 'actions')
				.map((column) => column.id);
			hiddenColumnIds = normalizeHiddenColumnIds(defaultHiddenColumnIds);
		}

		measureHeaderHeight();
		if (typeof ResizeObserver !== 'undefined' && headerRowElement) {
			headerSizeObserver = new ResizeObserver(measureHeaderHeight);
			headerSizeObserver.observe(headerRowElement);
		}

		const stored = readStoredColumnWidths();
		if (!stored) {
			restoreFrame = window.requestAnimationFrame(() => {
				measureHeaderHeight();
				tableReady = true;
			});
			return;
		}

		const tryRestore = (): void => {
			if (!restoreColumnWidths(stored)) return;
			measureHeaderHeight();
			tableReady = true;
			restoreObserver?.disconnect();
			restoreObserver = undefined;
		};

		restoreFrame = window.requestAnimationFrame(tryRestore);
		if (typeof ResizeObserver !== 'undefined' && headerRowElement) {
			restoreObserver = new ResizeObserver(tryRestore);
			restoreObserver.observe(headerRowElement);
		}
	});

	onDestroy(() => {
		stopActiveResize?.();
		if (restoreFrame !== undefined) window.cancelAnimationFrame(restoreFrame);
		restoreObserver?.disconnect();
		headerSizeObserver?.disconnect();
	});
</script>

<div
	class={styles.root({ class: className })}
	data-column-settings={showsColumnSettings ? 'true' : undefined}
	aria-busy={!tableReady}
>
	{#if !tableReady}
		<div class={styles.loading()}>
			<Spinner size={loadingSpinnerSize} label={`Загрузка таблицы «${ariaLabel}»`} />
		</div>
	{:else}
		<div
			aria-hidden="true"
			class={styles.topAccent()}
			style="-webkit-mask-image: linear-gradient(to right, transparent 0, black 12px, black calc(100% - 12px), transparent 100%); mask-image: linear-gradient(to right, transparent 0, black 12px, black calc(100% - 12px), transparent 100%);"
		></div>
		<div aria-hidden="true" class={styles.headerBorder()} style:top={`${headerHeight}px`}></div>
	{/if}
	{#if tableReady && showsColumnSettings}
		<div class={styles.columnSettings()}>
			<DataTableColumnSettings
				items={columnSettingsItems}
				onReorder={handleColumnReorder}
				onVisibilityChange={handleColumnVisibilityChange}
				onReset={resetColumnLayout}
			/>
		</div>
	{/if}

	<ScrollArea
		class={tableReady ? 'h-full w-full' : 'invisible h-full w-full'}
		contentId={id ? `${id}-scroll` : undefined}
		contentStyle={`-webkit-mask-image: ${scrollMask}; mask-image: ${scrollMask};`}
		verticalStartOffset={headerHeight + 1}
		verticalLabel={`Вертикальная прокрутка: ${ariaLabel}`}
		horizontalLabel={`Горизонтальная прокрутка: ${ariaLabel}`}
		onScrollStateChange={handleScrollStateChange}
	>
		<table
			class={styles.table()}
			style:min-width={resizeMode === 'fit' ? '100%' : minWidth}
			style:width={resizedTableWidth === null
				? undefined
				: resizeMode === 'fit'
					? '100%'
					: `max(100%, ${resizedTableWidth}px)`}
			aria-label={ariaLabel}
		>
			<colgroup>
				{#if selectableRows}
					<col style:width={`${safeSelectionColumnWidth}px`} />
				{/if}
				{#each visibleColumns as column (column.id)}
					<col style:width={getColumnWidth(column)} />
				{/each}
			</colgroup>
			<thead class={styles.head()}>
				<tr bind:this={headerRowElement}>
					{#if selectableRows}
						<th class={styles.selectionHead()} scope="col">
							<Checkbox
								checked={visibleSelectionState}
								disabled={selectableVisibleKeys.length === 0}
								ariaLabel="Выбрать все строки на текущей странице"
								class={styles.selectionControl()}
								onclick={(event) => {
									event.stopPropagation();
									toggleVisibleSelection();
								}}
							/>
						</th>
					{/if}
					{#each visibleColumns as column (column.id)}
						<th
							class={dataTableHeadCellVariants({
								resizeMode,
								sortable: Boolean(column.sortKey),
								align: getColumnAlign(column),
								kind: column.kind ?? 'data',
								class: column.headerClass
							})}
							data-column-kind={column.kind ?? 'data'}
							data-before-actions={isBeforeActionsColumn(column) ? 'true' : undefined}
							data-last-column={visibleColumns.at(-1)?.id === column.id ? 'true' : undefined}
							data-sortable={column.sortKey ? 'true' : 'false'}
							aria-sort={getAriaSort(column)}
						>
							{#if column.sortKey}
								<Button
									type="button"
									variant="ghost"
									size="inline"
									class={dataTableSortButtonVariants({ align: getColumnAlign(column) })}
									aria-label={getSortButtonLabel(column)}
									onclick={() => handleSort(column)}
								>
									<span>{column.title}</span>
									<svg
										aria-hidden="true"
										class={dataTableSortIconVariants({ active: sort?.key === column.sortKey })}
										viewBox="0 0 16 16"
										fill="none"
										stroke="currentColor"
										stroke-width="1.75"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										{#if sort?.key === column.sortKey && sort.direction === 'ASC'}
											<path d="m4.5 9.5 3.5-3.5 3.5 3.5" />
										{:else if sort?.key === column.sortKey}
											<path d="m4.5 6.5 3.5 3.5 3.5-3.5" />
										{:else}
											<path d="m5 6 3-3 3 3M5 10l3 3 3-3" />
										{/if}
									</svg>
								</Button>
							{:else}
								{column.title}
							{/if}
							{#if showsResizeHandle(column)}
								<!-- A focusable ARIA separator is an interactive resize widget. -->
								<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
								<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
								<div
									class={dataTableResizeHandleVariants({
										active: resizingColumnId === column.id
									})}
									role="separator"
									tabindex="0"
									aria-label={`Изменить ширину колонки «${column.title}»`}
									aria-orientation="vertical"
									aria-valuemin={Math.round(getColumnMinWidth(column))}
									aria-valuemax={Number.isFinite(getColumnMaxWidth(column))
										? Math.round(getColumnMaxWidth(column))
										: undefined}
									aria-valuenow={Math.round(columnWidths[column.id] ?? getColumnMinWidth(column))}
									onfocus={() => void measureColumnWidths()}
									onpointerdown={(event) => startColumnResize(column, event)}
									onkeydown={(event) => handleResizeKeydown(column, event)}
								>
									<span
										aria-hidden="true"
										class={dataTableResizeLineVariants({
											active: resizingColumnId === column.id
										})}
									></span>
								</div>
							{/if}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody class={styles.body()}>
				{#each rows as row (rowKey(row))}
					{@const key = rowKey(row)}
					{@const state = getRowState(key)}
					<tr
						class={dataTableRowVariants({
							interactive: Boolean(onRowClick),
							selected: selectableRows && selectedKeySet.has(key),
							class: getRowClass(row)
						})}
						tabindex={onRowClick ? 0 : undefined}
						aria-label={onRowClick ? rowLabel?.(row) : undefined}
						onclick={(event) => handleRowClick(row, event)}
						onkeydown={(event) => handleRowKeydown(row, event)}
						onpointerenter={() => (hoveredRowKey = key)}
						onpointerleave={() => handleRowPointerLeave(key)}
						onfocusin={() => (focusedRowKey = key)}
						onfocusout={(event) => handleRowFocusOut(key, event)}
					>
						{#if selectableRows}
							<td class={styles.selectionCell()}>
								<Checkbox
									checked={selectedKeySet.has(key)}
									disabled={!(isRowSelectable?.(row) ?? true)}
									ariaLabel={`Выбрать строку ${rowLabel?.(row) ?? key}`}
									class={styles.selectionControl()}
									onclick={(event) => {
										event.stopPropagation();
										handleRowSelection(row);
									}}
								/>
							</td>
						{/if}
						{#each visibleColumns as column (column.id)}
							{@const customCell = getCustomCell(column.id)}
							<td
								class={dataTableCellVariants({
									density,
									resizeMode,
									align: getColumnAlign(column),
									kind: column.kind ?? 'data',
									class: column.cellClass
								})}
							>
								{#if customCell}
									{@render customCell(row, state)}
								{:else if column.value}
									{column.value(row)}
								{/if}
							</td>
						{/each}
					</tr>
				{:else}
					<tr>
						<td
							class={styles.emptyCell()}
							colspan={visibleColumns.length + (selectableRows ? 1 : 0)}
						>
							{emptyText}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</ScrollArea>
</div>

<style>
	.data-table {
		--data-table-header-height: 46px;
	}

	.data-table__head-cell {
		height: var(--data-table-header-height);
		box-shadow: inset -1px 0 var(--color-blue-100);
	}

	.data-table__head-cell:last-child {
		box-shadow: none;
	}

	.data-table__head-cell[data-column-kind='actions'],
	.data-table__head-cell[data-before-actions='true'] {
		box-shadow: none;
	}

	.data-table[data-column-settings='true']
		.data-table__head-cell[data-last-column='true'][data-sortable='false'] {
		padding-right: 3.5rem;
	}

	.data-table[data-column-settings='true']
		.data-table__head-cell[data-last-column='true'][data-sortable='true']
		.data-table__sort-button {
		padding-right: 3.5rem;
	}
</style>
