<script module lang="ts">
	export type TreeViewItem = {
		id: string;
		label: string;
		description?: string;
		children?: TreeViewItem[];
		hasChildren?: boolean;
		disabled?: boolean;
	};
</script>

<script lang="ts">
	import { Tree as MeltTree } from 'melt/builders';
	import {
		AngleRightOutline,
		FolderOpenOutline,
		FolderOutline
	} from 'flowbite-svelte-icons';
	import { treeViewVariants } from './tree-view.variants';

	type InternalTreeViewItem = TreeViewItem & {
		children?: InternalTreeViewItem[];
		placeholder?: boolean;
	};

	type Props = {
		items: readonly TreeViewItem[];
		selected?: string;
		expanded?: string[];
		loadingIds?: readonly string[];
		ariaLabel?: string;
		emptyText?: string;
		loadingText?: string;
		class?: string;
		onSelect?: (item: TreeViewItem) => void | Promise<void>;
		onExpandedChange?: (ids: string[]) => void | Promise<void>;
	};

	let {
		items,
		selected = $bindable(''),
		expanded = $bindable([]),
		loadingIds = [],
		ariaLabel = 'Дерево каталогов',
		emptyText = 'Нет элементов',
		loadingText = 'Загрузка…',
		class: className = '',
		onSelect,
		onExpandedChange
	}: Props = $props();

	const placeholderSuffix = '::__tree_placeholder__';
	const styles = treeViewVariants();

	function normalizeItems(source: readonly TreeViewItem[]): InternalTreeViewItem[] {
		return source.map((item) => {
			const children = item.children?.length ? normalizeItems(item.children) : undefined;
			return {
				...item,
				children:
					children ??
					(item.hasChildren
						? [{ id: `${item.id}${placeholderSuffix}`, label: '', placeholder: true, disabled: true }]
						: undefined)
			};
		});
	}

	function findItem(source: readonly TreeViewItem[], id: string): TreeViewItem | undefined {
		for (const item of source) {
			if (item.id === id) return item;
			const found = item.children ? findItem(item.children, id) : undefined;
			if (found) return found;
		}
		return undefined;
	}

	let normalizedItems = $derived(normalizeItems(items));
	let loadingSet = $derived(new Set(loadingIds));

	const tree = new MeltTree<InternalTreeViewItem>({
		items: () => normalizedItems,
		selected: () => selected || undefined,
		expanded: () => expanded,
		expandOnClick: false,
		onSelectedChange: (id) => {
			if (!id || id.endsWith(placeholderSuffix)) return;
			const item = findItem(items, id);
			if (!item || item.disabled) return;
			selected = id;
			if (onSelect) void onSelect(item);
		},
		onExpandedChange: (ids) => {
			expanded = [...ids].filter((id) => !id.endsWith(placeholderSuffix));
			if (onExpandedChange) void onExpandedChange(expanded);
		}
	});
</script>

{#snippet renderChildren(children: typeof tree.children, level: number)}
	{#each children.filter((child) => !child.item.placeholder) as child (child.id)}
		{@const attrs = child.attrs}
		{@const item = child.item}
		<li class="list-none">
			<div
				{...attrs}
				aria-expanded={child.canExpand ? child.expanded : undefined}
				aria-disabled={item.disabled || undefined}
				onclick={item.disabled ? undefined : attrs.onclick}
				class={styles.item()}
				style={`padding-left: ${Math.max(0.25, level * 1.1 + 0.25)}rem`}
			>
				{#if child.canExpand}
					<button
						type="button"
						tabindex="-1"
						class={styles.expander()}
						aria-label={child.expanded ? `Свернуть ${item.label}` : `Развернуть ${item.label}`}
						onclick={(event) => {
							event.stopPropagation();
							child.toggleExpand();
						}}
					>
						<AngleRightOutline
							class={styles.chevron({ class: child.expanded ? 'rotate-90' : '' })}
							strokeWidth={2}
						/>
					</button>
				{:else}
					<span class="size-6 shrink-0"></span>
				{/if}
				{#if child.expanded}
					<FolderOpenOutline class={styles.icon()} strokeWidth={1.75} />
				{:else}
					<FolderOutline class={styles.icon()} strokeWidth={1.75} />
				{/if}
				<span class={styles.content()}>
					<span class={styles.label()}>{item.label}</span>
					{#if item.description}<span class={styles.description()}>{item.description}</span>{/if}
				</span>
			</div>
			{#if child.expanded && child.children}
				<ul {...tree.group} class={styles.group()}>
					{#if loadingSet.has(item.id)}
						<li class={styles.status()} style={`padding-left: ${(level + 2) * 1.1}rem`}>
							{loadingText}
						</li>
					{:else}
						{@render renderChildren(child.children, level + 1)}
					{/if}
				</ul>
			{/if}
		</li>
	{/each}
{/snippet}

<div {...tree.root} role="tree" aria-label={ariaLabel} class={styles.root({ class: className })}>
	{#if tree.children.length}
		<ul class={styles.group()}>
			{@render renderChildren(tree.children, 0)}
		</ul>
	{:else}
		<div class={styles.empty()}>{emptyText}</div>
	{/if}
</div>
