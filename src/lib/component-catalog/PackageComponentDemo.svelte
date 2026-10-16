<script lang="ts">
	import ActionMenu from '../action-menu/ActionMenu.svelte';
	import Avatar from '../avatar/Avatar.svelte';
	import Badge from '../badge/Badge.svelte';
	import Button from '../button/Button.svelte';
	import ChatComposer from '../chat-composer/ChatComposer.svelte';
	import ChatMessageList, { type ChatMessageListItem } from '../chat-message-list/ChatMessageList.svelte';
	import Checkbox from '../checkbox/Checkbox.svelte';
	import ColorPicker from '../color-picker/ColorPicker.svelte';
	import ConfirmDialog from '../confirm-dialog/ConfirmDialog.svelte';
	import DataTable, { type DataTableColumn } from '../data-table/DataTable.svelte';
	import DataTableColumnSettings, { type DataTableColumnSettingsItem } from '../data-table/DataTableColumnSettings.svelte';
	import EditLineText from '../edit-line-text/EditLineText.svelte';
	import ExportMenu from '../export-menu/ExportMenu.svelte';
	import FileDropzone from '../file-dropzone/FileDropzone.svelte';
	import FilterButton from '../filter-button/FilterButton.svelte';
	import ImageGallery from '../image-gallery/ImageGallery.svelte';
	import ImageViewer from '../image-viewer/ImageViewer.svelte';
	import LinkifiedText from '../linkified-text/LinkifiedText.svelte';
	import OverflowReveal from '../OverflowReveal.svelte';
	import PageHeader from '../page-header/PageHeader.svelte';
	import PageSizeSelect from '../PageSizeSelect.svelte';
	import Pagination from '../Pagination.svelte';
	import PaginationFooter from '../PaginationFooter.svelte';
	import ProgressBar from '../progress-bar/ProgressBar.svelte';
	import Radio from '../radio/Radio.svelte';
	import RadioGroup from '../radio/RadioGroup.svelte';
	import ResizableDrawer from '../resizable-drawer/ResizableDrawer.svelte';
	import ScrollArea from '../ScrollArea.svelte';
	import SearchForm from '../SearchForm.svelte';
	import Select from '../select/Select.svelte';
	import SortableList from '../sortable-list/SortableList.svelte';
	import Spinner from '../spinner/Spinner.svelte';
	import Spoiler from '../spoiler/Spoiler.svelte';
	import StatCard from '../stat-card/StatCard.svelte';
	import StatsGrid from '../stats-grid/StatsGrid.svelte';
	import Switch from '../Switch.svelte';
	import Tabs from '../Tabs.svelte';
	import TagInput from '../tag-input/TagInput.svelte';
	import TextArea from '../text-area/TextArea.svelte';
	import TextField from '../text-field/TextField.svelte';
	import ToastViewport from '../toast/ToastViewport.svelte';
	import { toast } from '../toast/toast';
	import TreeView, { type TreeViewItem } from '../tree-view/TreeView.svelte';

	type DemoRow = { id: number; task: string; status: string };
	let { name }: { name: string } = $props();
	let selectedValue = $state('active');
	let checked = $state(true);
	let radioValue = $state('telegram');
	let tags = $state(['php', 'css', 'js']);
	let textValue = $state('Пример значения');
	let searchValue = $state('');
	let page = $state(2);
	let pageSize = $state(20);
	let drawerOpen = $state(false);
	let tabValue = $state('main');
	let colorValue = $state('#2563eb');
	let selectedTree = $state('/public_html');
	let expandedTree = $state(['/']);
	let sortItems = $state(['Описание задачи', 'Комментарии', 'История изменений']);
	let columnItems = $state<DataTableColumnSettingsItem[]>([
		{ id: 'task', title: 'Задача', visible: true, hideable: true },
		{ id: 'project', title: 'Проект', visible: true, hideable: true },
		{ id: 'status', title: 'Состояние', visible: true, hideable: true }
	]);

	const rows: DemoRow[] = [
		{ id: 2037555, task: 'Проверить форму обратной связи', status: 'Принята' },
		{ id: 2036792, task: 'Обновить группы товаров', status: 'Условно завершена' }
	];
	const columns: DataTableColumn<DemoRow>[] = [
		{ id: 'id', title: 'ID', width: '110px', value: (row) => row.id, sortKey: 'id' },
		{ id: 'task', title: 'Задача', width: '1.5', value: (row) => row.task },
		{ id: 'status', title: 'Состояние', width: '1', value: (row) => row.status }
	];
	const messages: ChatMessageListItem[] = [
		{ id: 'demo-1', sender: { type: 'customer', displayName: 'Анна Смирнова' }, text: 'Добрый день! Посмотрите, пожалуйста, задачу.', createdAt: new Date(Date.now() - 180_000) },
		{ id: 'demo-2', sender: { type: 'staff', displayName: 'Вы' }, text: 'Да, уже проверяю.', createdAt: new Date() }
	];
	const treeItems: TreeViewItem[] = [{ id: '/', label: 'Корень сайта', children: [
		{ id: '/public_html', label: 'public_html', children: [{ id: '/public_html/assets', label: 'assets' }] },
		{ id: '/backups', label: 'backups' }
	] }];
	const image = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="100%" height="100%" fill="#dbeafe"/><circle cx="320" cy="150" r="82" fill="#2563eb"/><text x="320" y="285" text-anchor="middle" font-family="Arial" font-size="30" fill="#1e3a8a">Скриншот задачи</text></svg>');

	function pageChange({ next }: { curr: number; next: number }): number { page = next; return next; }
	function toggleColumn(columnId: string, visible: boolean): void {
		columnItems = columnItems.map((item) => item.id === columnId ? { ...item, visible } : item);
	}
</script>

<div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" data-component-demo={name}>
	<div class="mb-4 flex items-center justify-between gap-3"><div><p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Демонстрация</p><p class="mt-0.5 text-xs text-slate-400">Интерактивный пример компонента</p></div><Badge variant="info" size="small">{name}</Badge></div>
	{#if name === 'ActionMenu'}
		<ActionMenu options={[{ id: 'edit', label: 'Редактировать' }, { id: 'delete', label: 'Удалить', tone: 'danger' }]} onSelect={(item) => { toast.info(`Выбрано: ${item.label}`); }} />
	{:else if name === 'Avatar'}
		<div class="flex items-end gap-3"><Avatar name="Анна Смирнова" size="small" /><Avatar name="Анна Смирнова" /><Avatar name="Анна Смирнова" size="large" /></div>
	{:else if name === 'Badge'}
		<div class="flex flex-wrap gap-2"><Badge>Нейтральный</Badge><Badge variant="info">В работе</Badge><Badge variant="warning">Ожидает</Badge><Badge variant="success">Готово</Badge><Badge variant="danger">Ошибка</Badge></div>
	{:else if name === 'Button'}
		<div class="flex flex-wrap gap-2"><Button>Основная</Button><Button variant="secondary">Вторичная</Button><Button variant="ghost">Без фона</Button><Button variant="danger">Удалить</Button></div>
	{:else if name === 'ChatComposer'}
		<ChatComposer placeholder="Введите демонстрационное сообщение…" attachments onSend={(value) => { toast.success(`Сообщение «${value}» отправлено в демонстрации`); return true; }} />
	{:else if name === 'ChatMessageList'}
		<div class="h-72"><ChatMessageList {messages} onReply={(message) => { toast.info(`Ответ на сообщение ${message.id}`); }} /></div>
	{:else if name === 'Checkbox'}
		<div class="space-y-3"><Checkbox bind:checked>Включить синхронизацию</Checkbox><Checkbox checked="indeterminate">Выбрана часть элементов</Checkbox><Checkbox checked disabled>Недоступный вариант</Checkbox></div>
	{:else if name === 'ColorPicker'}
		<ColorPicker bind:value={colorValue} ariaLabel="Цвет статуса" /><p class="mt-3 text-sm text-slate-600">Выбранный цвет: {colorValue}</p>
	{:else if name === 'ConfirmDialog'}
		<ConfirmDialog title="Удалить запись?" description="Действие показано только в лаборатории." confirmLabel="Удалить" variant="danger" onConfirm={() => { toast.success('Демонстрационное действие подтверждено'); }}><Button variant="danger">Открыть подтверждение</Button></ConfirmDialog>
	{:else if name === 'DataTable'}
		<DataTable {rows} {columns} rowKey={(row) => row.id} ariaLabel="Демонстрационная таблица" storageKey="component-catalog:data-table" columnSettings />
	{:else if name === 'DataTableColumnSettings'}
		<DataTableColumnSettings items={columnItems} onReorder={(items) => { columnItems = items; }} onVisibilityChange={toggleColumn} onReset={() => { columnItems = columnItems.map((item) => ({ ...item, visible: true })); }} />
	{:else if name === 'EditLineText'}
		<div class="max-w-md"><EditLineText bind:text={textValue} placeholder="Нажмите, чтобы изменить" /></div>
	{:else if name === 'ExportMenu'}
		<ExportMenu onExport={(format) => { toast.success(`Выбран экспорт ${format.toUpperCase()}`); }} />
	{:else if name === 'FileDropzone' || name === 'FileDropzoneItem'}
		<FileDropzone label={name === 'FileDropzoneItem' ? 'Элемент файла внутри области загрузки' : 'Вложения'} description="Перетащите файл или выберите его на компьютере" multiple maxFiles={3} />
	{:else if name === 'FilterButton'}
		<FilterButton activeCount={2} onOpen={() => toast.info('Панель фильтров открыта')} onReset={() => toast.success('Фильтры сброшены')} />
	{:else if name === 'ImageGallery'}
		<ImageGallery images={[{ src: image, alt: 'Демонстрационный скриншот', title: 'Скриншот задачи' }, { src: image, alt: 'Второй скриншот', title: 'Результат' }]} />
	{:else if name === 'ImageViewer'}
		<ImageViewer src={image} alt="Демонстрационный скриншот">{#snippet trigger()}<button type="button" class="overflow-hidden rounded-xl border border-slate-200"><img src={image} alt="Открыть изображение" class="h-32 w-56 object-cover" /></button>{/snippet}</ImageViewer>
	{:else if name === 'LinkifiedText'}
		<LinkifiedText text="Документация доступна на https://example.com/docs и откроется в новой вкладке." />
	{:else if name === 'OverflowReveal'}
		<div class="w-64 rounded-lg border border-slate-200 px-3 py-2"><OverflowReveal value="Очень длинное название проекта, которое не помещается в одну строку" /></div>
	{:else if name === 'PageHeader'}
		<PageHeader title="Карточка проекта" breadcrumbs={[{ label: 'Проекты', href: '/projects' }, { label: 'Демонстрация' }]} />
	{:else if name === 'PageSizeSelect'}
		<PageSizeSelect bind:value={pageSize} /><p class="mt-2 text-sm text-slate-500">По {pageSize} записей</p>
	{:else if name === 'Pagination'}
		<Pagination total={120} {page} perPage={20} onPageChange={pageChange} />
	{:else if name === 'PaginationFooter'}
		<PaginationFooter total={120} {page} {pageSize} onPageChange={pageChange} onPageSizeChange={(value) => { pageSize = value; }} />
	{:else if name === 'ProgressBar'}
		<div class="space-y-4"><ProgressBar value={68} /><ProgressBar value={42} tone="success" /><ProgressBar value={24} tone="warning" /></div>
	{:else if name === 'Radio' || name === 'RadioGroup'}
		<RadioGroup bind:value={radioValue} ariaLabel="Канал связи" class="flex flex-wrap gap-4"><Radio value="telegram">Telegram</Radio><Radio value="mattermost">Mattermost</Radio></RadioGroup>
	{:else if name === 'ResizableDrawer'}
		<Button onclick={() => (drawerOpen = true)}>Открыть панель</Button><ResizableDrawer open={drawerOpen} onClose={() => (drawerOpen = false)} ariaLabel="Демонстрационная панель"><div class="p-6"><h3 class="text-lg font-bold">Выезжающая панель</h3><p class="mt-2 text-sm text-slate-600">Потяните за левую границу, чтобы изменить ширину.</p></div></ResizableDrawer>
	{:else if name === 'ScrollArea'}
		<ScrollArea class="h-44 rounded-xl border border-slate-200" contentClass="space-y-2 p-3">{#each Array(10) as _, index}<div class="rounded-lg bg-slate-50 px-3 py-2 text-sm">Строка прокручиваемой области {index + 1}</div>{/each}</ScrollArea>
	{:else if name === 'SearchForm'}
		<SearchForm bind:value={searchValue} placeholder="Найти задачу…" onSearch={(value) => { toast.info(`Поиск: ${value || 'пустой запрос'}`); }} onReset={() => { searchValue = ''; }} />
	{:else if name === 'Select'}
		<div class="max-w-sm"><Select bind:value={selectedValue} searchable options={[{ value: 'active', label: 'Активные задачи' }, { value: 'paused', label: 'На паузе' }, { value: 'done', label: 'Условно завершённые' }]} ariaLabel="Состояние задачи" /></div>
	{:else if name === 'SortableList'}
		<SortableList items={sortItems} getKey={(item) => item} onReorder={(items) => { sortItems = items; }}>{#snippet children(item, index)}<div class="flex-1"><span class="mr-2 text-xs text-slate-400">{index + 1}</span>{item}</div>{/snippet}</SortableList>
	{:else if name === 'Spinner'}
		<div class="flex items-center gap-6"><Spinner size="sm" label="Загрузка" /><Spinner label="Загрузка" /><Spinner size="lg" label="Загрузка" /></div>
	{:else if name === 'Spoiler'}
		<Spoiler title="Дополнительная информация"><p class="text-sm text-slate-600">Это содержимое раскрываемого блока.</p></Spoiler>
	{:else if name === 'StatCard'}
		<div class="max-w-sm"><StatCard label="Ваш КПД" value="92,4%" description="За текущий расчётный период" tone="primary" /></div>
	{:else if name === 'StatsGrid'}
		<StatsGrid columns="three" collapsible storageKey="component-catalog:stats"><StatCard label="КПД" value="92,4%" /><StatCard label="Возвраты" value="3" tone="subtle" /><StatCard label="Задачи" value="18" tone="primary" /></StatsGrid>
	{:else if name === 'Switch'}
		<div class="flex items-center gap-3"><Switch bind:checked ariaLabel="Автообновление" /><span class="text-sm text-slate-700">Автообновление {checked ? 'включено' : 'выключено'}</span></div>
	{:else if name === 'Tabs'}
		<Tabs items={[{ value: 'main', label: 'Основное' }, { value: 'chats', label: 'Чаты', badge: 2 }]} bind:value={tabValue}>{#snippet children(active)}<div class="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Содержимое вкладки «{active === 'main' ? 'Основное' : 'Чаты'}»</div>{/snippet}</Tabs>
	{:else if name === 'TagInput'}
		<TagInput bind:value={tags} label="Разрешённые расширения" placeholder="Введите расширение" /><p class="mt-2 text-xs text-slate-500">Тегов: {tags.length}</p>
	{:else if name === 'TextArea'}
		<TextArea bind:value={textValue} label="Комментарий" description="Многострочное значение" rows={3} />
	{:else if name === 'TextField'}
		<TextField bind:value={textValue} label="Название проекта" description="Однострочное значение" />
	{:else if name === 'ToastViewport'}
		<Button onclick={() => toast.success('Так выглядит системное уведомление')}>Показать уведомление</Button><ToastViewport position="bottom-right" />
	{:else if name === 'TreeView'}
		<div class="max-w-md"><TreeView items={treeItems} bind:selected={selectedTree} bind:expanded={expandedTree} ariaLabel="Каталоги FTP" /></div>
	{/if}
</div>
