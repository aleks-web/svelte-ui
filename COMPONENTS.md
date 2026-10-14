# `@aleks-web/ui` component reference

This file is the canonical human- and AI-readable API reference. Update it whenever an exported component, prop, type, default value, variant or behavior changes.

## Conventions

Import public APIs from the package root:

```svelte
<script lang="ts">
  import { Button, DataTable, toast, type DataTableColumn } from '@aleks-web/ui';
</script>
```

Most components accept `class` for root-level additions. Classes are merged with component styles. Visual variants are implemented with Tailwind Variants; their public values are listed below. Components using `$bindable` support Svelte's `bind:` syntax.

## Actions and compact indicators

### `Button`

Standard action or form button. It forwards ordinary HTML button attributes and can render a loading spinner.

- `variant`: `primary` (default), `secondary`, `soft`, `danger`, `success`, `warning`, `ghost`, `link`.
- `size`: `default` (default), `inline`, `xs`, `compact`, `icon`.
- `fullWidth=false`, `loading=false`, `disabled=false`, `children?`, `class?`.

```svelte
<Button variant="success" loading={saving} onclick={save}>Сохранить</Button>
<Button variant="ghost" size="icon" aria-label="Закрыть"><CloseOutline /></Button>
```

### `Badge`

Compact status, count or label. `circle` is intended for short counts.

- `variant`: `neutral` (default), `primary`, `info`, `success`, `warning`, `danger`, `violet`.
- `size`: `small` (default), `default`.
- `shape`: `pill` (default), `circle`.
- `children` is required; `title?`, `style?`, `class?`.

```svelte
<Badge variant="success">Активен</Badge>
<Badge variant="info" shape="circle">3</Badge>
```

### `FilterButton`

Composite button for opening a filter drawer and resetting active filters without shifting surrounding layout.

- `activeCount=0`, `label='Фильтры'`, `resetLabel='Сбросить'`, `class?`.
- `onOpen()` and `onReset()` are required.

```svelte
<FilterButton activeCount={filterCount} onOpen={() => filtersOpen = true} onReset={resetFilters} />
```

### `ExportMenu`

Reusable export action with a dropdown of formats.

- `label='Экспорт'`, `options=defaultExportOptions`, `variant='secondary'`, `size='default'`.
- `fullWidth=false`, `disabled=false`, `loading=false`, `class?`, `buttonClass?`.
- `onExport(format)` receives `xlsx` or `csv` by default.
- Exports: `ExportFormat`, `ExportMenuOption`, `defaultExportOptions`.

```svelte
<ExportMenu loading={exporting} onExport={(format) => exportRows(format)} />
```

## Form controls

### `Select`

Accessible Melt-based single select. Use instead of native `<select>` in application UI.

- `options: SelectOption[]` is required; each option has `value`, `label`, optional `disabled`.
- `value` is bindable; `name?`, `placeholder='Выберите значение'`, `ariaLabel?`.
- `disabled=false`, `required=false`.
- `size`: `default` (default), `compact`.
- `class?`, `triggerClass?`, `menuClass?`, `onChange(value)?`.

```svelte
<Select bind:value={status} options={statusOptions} name="status" ariaLabel="Статус" />
```

### `Checkbox`

Accessible independent boolean/multiple-choice control. Do not use for mutually exclusive choices.

- `checked` is bindable and accepts `boolean | 'indeterminate'`.
- `children?`, `name?`, `value?`, `disabled=false`, `required=false`, `ariaLabel?`.
- `class?`, `labelClass?`, `onChange(state)?`, `onclick?`.

```svelte
<Checkbox bind:checked={enabled} name="enabled">Активен</Checkbox>
```

### `RadioGroup` and `Radio`

Visible single-choice control. Place `Radio` children inside `RadioGroup`.

- `RadioGroup`: bindable `value`; required `children`; `name?`, `disabled?`, `required?`, `orientation?`, `loop?`, `ariaLabel?`, `class?`, `onChange?`.
- `Radio`: required `value`; `children?`, `disabled?`, `ariaLabel?`, `class?`, `indicatorClass?`, `labelClass?`.

```svelte
<RadioGroup bind:value={mode} name="mode" ariaLabel="Режим">
  <Radio value="delivery">Доставка</Radio>
  <Radio value="pickup">Самовывоз</Radio>
</RadioGroup>
```

### `Switch`

Compact bindable boolean toggle. Public API: `bind:checked`.

```svelte
<Switch bind:checked={notificationsEnabled} />
```

### `ColorPicker`

Popover color selector with presets and optional custom color input.

- Bindable `value`; `options=defaultColorOptions`, `name?`, `ariaLabel?`.
- `disabled=false`, `required=false`, `allowCustom=true`, `class?`, `onChange(value)?`.
- Exports: `ColorPickerOption`, `defaultColorOptions`.

```svelte
<ColorPicker bind:value={statusColor} name="color" ariaLabel="Цвет статуса" />
```

### `SearchForm`

Styled search field with search and reset behavior.

- Required `onSearch(value)`; bindable `value`.
- `name='search'`, `label?`, `placeholder?`, `searchLabel?`, `resetLabel?`.
- `disabled=false`, `loading=false`, `canReset?`, `onReset?`, `class?`.

```svelte
<SearchForm bind:value={query} onSearch={applySearch} onReset={clearSearch} />
```

### `EditLineText`

Inline display-to-edit field. In display mode it looks like regular text; editing is explicitly activated.

- Bindable `text`; `blurCallback?(value)` for persistence.
- `maskOptions?` (IMask), `name?`, `placeholder?`, `maxlength?`, `ariaLabel?`, `emptyLabel?`.
- `class?`, `inputClass?`.

```svelte
<EditLineText bind:text={title} ariaLabel="Название" blurCallback={saveTitle} />
```

## Data presentation

### `DataTable`

Canonical table for all application data. It supports sorting, resizable/reorderable/hideable columns, persisted layout, loading isolation, row selection, action columns and scroll fades.

Required props:

- `rows: T[]`, `columns: DataTableColumn<T>[]`, `rowKey(row)`, `ariaLabel`.

Important optional props:

- Rendering: `cells?` snippet map, `emptyText`, `minWidth`, `class`, `rowClass?`, `density='default'` (`compact | default | comfortable`).
- Sorting: `sort?`, `onSortChange?`; directions are `ASC | DESC`.
- Widths: `resizableColumns=true`, `resizeMode='fit'` (`fit | overflow`), min/max width, step and `onColumnResize?`.
- Persistence: `persistColumnWidths?`, `persistColumnLayout?`, `storageKey?`, `columnSettings?`, order/visibility callbacks.
- Selection: `selectableRows?`, bindable `selectedRowKeys`, `isRowSelectable?`, `onSelectionChange?`, `selectionColumnWidth?`.
- Interaction: `onRowClick?`, `rowLabel?`.
- Loading and scrolling: `loadingSpinnerSize?`, `topFade?`, `bottomFade?` and fade heights.

Column fields: required `id`, `title`; optional `kind: 'data' | 'actions'`, `width`, `align`, classes, sort settings, `resizable`, `hideable`, min/max width and `value(row)`. Use `kind: 'actions'` for the final command area: it is not user-resizable and keeps action content visible.

```svelte
<script lang="ts">
  import { DataTable, Button, type DataTableColumn } from '@aleks-web/ui';
  const columns: DataTableColumn<Customer>[] = [
    { id: 'name', title: 'Клиент', value: (row) => row.name, resizable: true },
    { id: 'actions', title: '', kind: 'actions', hideable: false }
  ];
</script>

<DataTable
  rows={customers}
  {columns}
  rowKey={(row) => row.id}
  ariaLabel="Клиенты"
  selectableRows
  bind:selectedRowKeys
  persistColumnLayout
  storageKey="customers"
  cells={{ actions: actionsCell }}
/>

{#snippet actionsCell(row: Customer)}
  <Button size="compact" variant="secondary">Подробнее</Button>
{/snippet}
```

### `DataTableColumnSettings`

Low-level column visibility/order popover used with `DataTable` integrations.

- Required: `items: DataTableColumnSettingsItem[]`, `onReorder`, `onVisibilityChange`, `onReset`.
- Optional `ariaLabel`.

Prefer `DataTable`'s built-in `columnSettings` API unless building a specialized wrapper.

### `Pagination`, `PageSizeSelect`, `PaginationFooter`

- `Pagination`: `total`, `count`, `page`, `defaultPage`, `size`, `perPage`, `onPageChange`, `class?`.
- `PageSizeSelect`: bindable `value`; `options=[10,20,50,100]`, `name`, `label`, `disabled`, `onChange`, `class?`.
- `PaginationFooter`: required `total`, `page`, `pageSize`, `onPageChange`; optional `onPageSizeChange`, `pageSizeLabel`, `hideOnSinglePage`, `class`.

Use `PaginationFooter` for the standard combined table footer.

```svelte
<PaginationFooter {total} {page} {pageSize} onPageChange={setPage} onPageSizeChange={setSize} />
```

### `StatCard` and `StatsGrid`

`StatCard` renders one KPI; `StatsGrid` lays out and optionally collapses KPI cards.

`StatCard`:

- Required `label`; `value?`, `description?`.
- Snippets: `valueContent?`, `descriptionContent?`, `icon?`.
- `tone`: `default` (default), `primary`, `subtle`.
- `size`: `compact` (default), `default`; `valueSize`: `default`, `large`.
- `gradient?`, `border?` override backgrounds; class props target root/value/description/icon.

`StatsGrid`:

- Required `children`.
- `columns`: `two`, `three` (default), `four`; `gap`: `compact` (default), `default`.
- `collapsible=false`, `storageKey?`, `initiallyCollapsed=false`, `class?`, `wrapperClass?`.
- Server-safe preference helpers are exported from `@aleks-web/ui/stats-grid/persistence`.

```svelte
<StatsGrid columns="four" collapsible storageKey="catalog-stats">
  <StatCard label="Товары" value={productsCount} icon={productIcon} />
</StatsGrid>
```

### `OverflowReveal`

Reveals or loops horizontally clipped text.

- `children?`, `value?`, `class?`, `contentClass?`, `fadeWidth?`, `speed?`, `delay?`.
- `focusable?`, `title?`, `ariaLabel?`, `active?`.
- `trigger`: `self | external | both`; `externalBehavior`: `reveal | loop`.

## Structure, navigation and scrolling

### `Tabs`

Accessible tab list with optional badges.

- Required `items: TabItem[]`, `children` snippet receiving the active item/value.
- Bindable `value`; `defaultValue?`, `orientation?`, `loop?`, `activateOnFocus?`, `ariaLabel?`.
- `class?`, `listClass?`, `triggerClass?`, `contentClass?`, `keepMounted?`, `onValueChange?`.
- Tab item: required `value`, `label`; optional `disabled`, `badge`, `badgeVariant`.

```svelte
<Tabs items={tabs} bind:value={activeTab}>
  {#snippet children(value)}
    {#if value === 'general'}<GeneralTab />{:else}<HistoryTab />{/if}
  {/snippet}
</Tabs>
```

### `Spoiler`

Animated disclosure panel with a reusable gradient header.

- Required `children`; `summary?` snippet or `title?` text.
- Bindable `open`; `disabled?`, `ariaLabel?`, `class?`, `triggerClass?`, `contentClass?`.
- `animationDuration?`, `onOpenChange?`.

```svelte
<Spoiler title="Категория" bind:open><CategoryFields /></Spoiler>
```

### `ScrollArea`

Custom scroll area with narrow hover-aware scrollbars and optional fades.

- Required `children`; `class?`, `contentClass?`, `contentStyle?`, `contentId?`.
- `horizontal=false`, `scrollbarSize?`, `scrollbarVisibility: 'always' | 'hover'`.
- `verticalStartOffset?`, axis labels, `onScrollStateChange?(state)`.

```svelte
<ScrollArea class="min-h-0 flex-1" scrollbarVisibility="hover">{content}</ScrollArea>
```

### `PageHeader`

Compact page title row with breadcrumbs and actions.

- Required `title`.
- `breadcrumbs?`, `titleAfter?` snippet, `actions?` snippet, `class?`.

```svelte
<PageHeader title="Команда" breadcrumbs={[{ label: 'Настройки', href: '/settings' }, { label: 'Команда' }]}>
  {#snippet actions()}<Button>Пригласить</Button>{/snippet}
</PageHeader>
```

### `ResizableDrawer`

Stack-friendly right drawer with shared overlay, enter/exit animation, optional resize handle and persisted width.

- Required `open`, `onClose`, `children`.
- Accessibility: provide `ariaLabel` or `ariaLabelledby`; optional `backdropLabel`.
- Width: `defaultWidth?`, `minWidth?`, `maxWidth?`, `storageKey?`, `resizable=true`.
- Behavior: `closeOnBackdrop=true`, `zIndex?`, `showOverlay=true`.
- Styling: `panelClass?`, `overlayClass?`; bindable `panelElement`.

```svelte
<ResizableDrawer open={drawerOpen} onClose={() => drawerOpen = false} ariaLabel="Карточка клиента" storageKey="customer-drawer">
  <CustomerDetails />
</ResizableDrawer>
```

## Files and media

### `FileDropzone` and `FileDropzoneItem`

Drag-and-drop file staging. Selection is local; the consumer decides when to upload.

`FileDropzone`:

- Bindable `files`; HTML-like `name?`, `accept?`, `multiple?`, `required?`, `disabled?`.
- Limits: `maxSize?`, `maxFiles?`.
- `size`: `default` (default), `compact`.
- Labels: `label?`, `description?`, `buttonLabel?`; `class?`.
- Extensibility: `trigger?` and `item?` snippets; `onFilesChange?(files)`.

`FileDropzoneItem` requires `file` and `onRemove`; optional `children` snippet.

```svelte
<FileDropzone bind:files accept="image/*" multiple maxFiles={8} onFilesChange={validateFiles} />
```

### `ImageViewer`

Lightbox for a full-size image.

- Required `src` and `trigger` snippet.
- `alt?`, `title?`, `triggerLabel?`, `class?`, bindable `open`, `onOpenChange?`.

```svelte
<ImageViewer src={image.url} alt={image.alt}>
  {#snippet trigger()}<img src={image.url} alt={image.alt} />{/snippet}
</ImageViewer>
```

## Feedback and confirmation

### `ToastViewport`, `toast`, `showFormResultToast`

Mount one viewport near the application root. Toasts are queued through exported functions.

- `ToastViewport`: `position='bottom-right'`; options `bottom-right`, `top-right`, `top-center`; `class?`.
- `toast({ title, description?, variant?, duration?, action? })`; variants are `info`, `success`, `warning`, `error`.
- `showFormResultToast` maps standard form results to toast feedback.

```svelte
<ToastViewport />
<Button onclick={() => toast({ title: 'Сохранено', variant: 'success' })}>Сохранить</Button>
```

### `ConfirmDialog`

Melt-based confirmation dialog for destructive or consequential actions.

- Required `trigger` snippet and `title`.
- `children?`, `description?`, `confirmLabel?`, `cancelLabel?`.
- `variant`: `default`, `danger`; trigger button variant/size/class can be configured.
- `confirmForm?`, `disabled?`, `loading?`, bindable `open`, `closeOnOutsideClick?`.
- `onConfirm?`, `onOpenChange?`.

```svelte
<ConfirmDialog title="Удалить запись?" variant="danger" onConfirm={remove}>
  {#snippet trigger()}<Button variant="danger">Удалить</Button>{/snippet}
  Действие нельзя отменить.
</ConfirmDialog>
```

### `Spinner`

Accessible loading indicator. `size` accepts `xs | sm | md | lg | xl` or a numeric pixel size; default is `md`. Also accepts `label?` and `class?`.

```svelte
<Spinner size="lg" label="Загружаем таблицу" />
```

## Ordering

### `SortableList`

Keyboard- and pointer-friendly reorderable list wrapper.

- Required `items`, `getKey(item)`, `children(item, index)`.
- `onReorder?(items)`, `itemLabel?(item)`, `ariaLabel?`, `disabled?`, `class?`, `itemClass?`.
- The component owns drag/reorder behavior; persistence remains the consumer's responsibility.

```svelte
<SortableList items={statuses} getKey={(item) => item.id} onReorder={saveOrder}>
  {#snippet children(status)}<StatusRow {status} />{/snippet}
</SortableList>
```

## Chat

### `ChatComposer`

Resizable multiline composer with Enter-to-send, Shift+Enter newline, emoji picker, character count and optional staged attachments.

- Required `onSend(value)`; bindable `value`.
- `onSendAttachments?(value, files)` enables combined file sending.
- `id?`, `placeholder?`, `ariaLabel?`, `maxLength=4000`.
- `minHeight=112`, `maxHeight=320`, `resizable=true`, `disabled=false`.
- `attachments=false`, `attachmentAccept?`, `maxAttachmentSize=10 MiB`, `maxAttachments=5`, `class?`.
- Send callbacks return `boolean | void` or a promise; `false` keeps the draft.

```svelte
<ChatComposer bind:value={draft} onSend={sendMessage} attachments onSendAttachments={sendWithFiles} />
```

### `ChatMessageList`

Scrollable chat transcript with sender avatars/initials, message bubbles, attachments and optional deletion actions.

- Required `messages: ChatMessageListItem[]`.
- `loading=false`, `currentActorType='staff'`, `loadingText?`, `emptyText?`, `contentId?`.
- `attachmentUrl?(attachmentId)`.
- `canDeleteMessage?(message)`, `onDeleteMessage?`, `onDeleteAttachment?`, `class?`.
- Sender types are `customer | staff | system`; attachments carry id, original name, MIME type and byte size.

```svelte
<ChatMessageList {messages} currentActorType="staff" attachmentUrl={(id) => `/api/chat/attachments/${id}`} />
```

## Choosing the correct component

- Data arranged in rows/columns: always start with `DataTable`.
- Many compact choices: `Select`; a small visible mutually exclusive set: `RadioGroup`; independent state: `Checkbox` or `Switch`.
- Destructive confirmation: `ConfirmDialog`, never browser `confirm()`.
- Page/feature-specific behavior belongs in a wrapper in the consuming application, not in this package.
- A component is universal only when its API makes sense without restaurant, order, customer, tenant or billing knowledge.

