<script lang="ts" generics="Item">
	import { flip } from 'svelte/animate';
	import { BarsOutline } from 'flowbite-svelte-icons';
	import { untrack, type Snippet } from 'svelte';
	import { sortableListVariants } from './sortable-list.variants';

	type Props = {
		items: readonly Item[];
		getKey: (item: Item) => string;
		children: Snippet<[item: Item, index: number]>;
		onReorder?: (items: Item[]) => void | Promise<void>;
		itemLabel?: (item: Item, index: number) => string;
		ariaLabel?: string;
		disabled?: boolean;
		class?: string;
		itemClass?: string;
	};

	let {
		items,
		getKey,
		children,
		onReorder,
		itemLabel = (_item, index) => `элемент ${index + 1}`,
		ariaLabel = 'Изменяемый порядок элементов',
		disabled = false,
		class: className = '',
		itemClass = ''
	}: Props = $props();

	let orderedItems = $state.raw<Item[]>([...untrack(() => items)]);
	let dragSnapshot = $state.raw<Item[]>([]);
	let draggingKey = $state<string | null>(null);
	let keyboardGrabbedKey = $state<string | null>(null);
	let saving = $state(false);
	let pointerId = $state<number | null>(null);
	let liveMessage = $state('');
	let rootElement: HTMLDivElement;
	const itemElements = new Map<string, HTMLElement>();

	$effect(() => {
		const latestItems = items;
		if (draggingKey || keyboardGrabbedKey || saving) return;
		const listChanged =
			latestItems.length !== orderedItems.length ||
			latestItems.some((item, index) => orderedItems[index] !== item);
		if (listChanged) {
			orderedItems = [...latestItems];
		}
	});

	function registerItem(node: HTMLElement, key: string) {
		itemElements.set(key, node);
		return {
			update(nextKey: string) {
				if (nextKey === key) return;
				itemElements.delete(key);
				key = nextKey;
				itemElements.set(key, node);
			},
			destroy() {
				itemElements.delete(key);
			}
		};
	}

	function indexOf(key: string): number {
		return orderedItems.findIndex((item) => getKey(item) === key);
	}

	function move(key: string, targetIndex: number): boolean {
		const fromIndex = indexOf(key);
		if (fromIndex < 0 || targetIndex < 0 || targetIndex >= orderedItems.length) return false;
		if (fromIndex === targetIndex) return false;
		const next = [...orderedItems];
		const [moved] = next.splice(fromIndex, 1);
		next.splice(targetIndex, 0, moved);
		orderedItems = next;
		return true;
	}

	function beginDrag(key: string): boolean {
		if (disabled || saving) return false;
		dragSnapshot = [...orderedItems];
		draggingKey = key;
		return true;
	}

	function restoreSnapshot(): void {
		if (dragSnapshot.length) orderedItems = [...dragSnapshot];
		dragSnapshot = [];
	}

	async function commit(previousItems: Item[]): Promise<void> {
		const previousKeys = previousItems.map(getKey);
		const nextKeys = orderedItems.map(getKey);
		if (JSON.stringify(previousKeys) === JSON.stringify(nextKeys)) return;
		if (!onReorder) return;

		saving = true;
		try {
			await onReorder([...orderedItems]);
		} catch {
			orderedItems = [...previousItems];
			liveMessage = 'Не удалось сохранить новый порядок. Предыдущий порядок восстановлен.';
		} finally {
			saving = false;
		}
	}

	function moveFromPointer(key: string, targetKey: string, clientY: number): void {
		if (key === targetKey) return;
		const fromIndex = indexOf(key);
		const targetIndex = indexOf(targetKey);
		const targetElement = itemElements.get(targetKey);
		if (fromIndex < 0 || targetIndex < 0 || !targetElement) return;

		const bounds = targetElement.getBoundingClientRect();
		const pointerAfterMiddle = clientY >= bounds.top + bounds.height / 2;
		const movingForward = fromIndex < targetIndex;
		if ((movingForward && !pointerAfterMiddle) || (!movingForward && pointerAfterMiddle)) return;
		move(key, targetIndex);
	}

	function autoScroll(clientY: number): void {
		let scrollParent = rootElement?.parentElement ?? null;
		while (scrollParent) {
			const overflowY = getComputedStyle(scrollParent).overflowY;
			if (
				(scrollParent.scrollHeight > scrollParent.clientHeight &&
					overflowY === 'auto') ||
				overflowY === 'scroll'
			) {
				break;
			}
			scrollParent = scrollParent.parentElement;
		}

		const edgeSize = 64;
		const speed = 14;
		if (scrollParent) {
			const bounds = scrollParent.getBoundingClientRect();
			if (clientY < bounds.top + edgeSize) scrollParent.scrollTop -= speed;
			else if (clientY > bounds.bottom - edgeSize) scrollParent.scrollTop += speed;
			return;
		}

		if (clientY < edgeSize) window.scrollBy(0, -speed);
		else if (clientY > window.innerHeight - edgeSize) window.scrollBy(0, speed);
	}

	function handleDragStart(event: DragEvent, key: string): void {
		if (!beginDrag(key)) {
			event.preventDefault();
			return;
		}
		if (!event.dataTransfer) return;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', key);
		const itemElement = itemElements.get(key);
		if (itemElement) event.dataTransfer.setDragImage(itemElement, 24, 24);
	}

	function handleDragOver(event: DragEvent, targetKey: string): void {
		if (!draggingKey || saving) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
		autoScroll(event.clientY);
		moveFromPointer(draggingKey, targetKey, event.clientY);
	}

	function handleDrop(event: DragEvent): void {
		if (!draggingKey || saving) return;
		event.preventDefault();
		const previousItems = [...dragSnapshot];
		const movedKey = draggingKey;
		draggingKey = null;
		dragSnapshot = [];
		const movedIndex = indexOf(movedKey);
		liveMessage = `Порядок изменён. Новая позиция: ${movedIndex + 1}.`;
		void commit(previousItems);
	}

	function handleDragEnd(): void {
		if (!draggingKey) return;
		restoreSnapshot();
		draggingKey = null;
	}

	function handlePointerDown(event: PointerEvent, key: string): void {
		if (event.pointerType === 'mouse' || !beginDrag(key)) return;
		event.preventDefault();
		pointerId = event.pointerId;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent): void {
		if (pointerId !== event.pointerId || !draggingKey) return;
		event.preventDefault();
		autoScroll(event.clientY);
		const target = document
			.elementFromPoint(event.clientX, event.clientY)
			?.closest<HTMLElement>('[data-sortable-key]');
		const targetKey = target?.dataset.sortableKey;
		if (targetKey) moveFromPointer(draggingKey, targetKey, event.clientY);
	}

	function finishPointerDrag(event: PointerEvent, cancelled = false): void {
		if (pointerId !== event.pointerId || !draggingKey) return;
		const handle = event.currentTarget as HTMLElement;
		if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
		pointerId = null;
		if (cancelled) {
			restoreSnapshot();
			draggingKey = null;
			return;
		}
		const previousItems = [...dragSnapshot];
		const movedKey = draggingKey;
		draggingKey = null;
		dragSnapshot = [];
		liveMessage = `Порядок изменён. Новая позиция: ${indexOf(movedKey) + 1}.`;
		void commit(previousItems);
	}

	function handleKeyboard(event: KeyboardEvent, key: string): void {
		if (disabled || saving) return;
		const currentIndex = indexOf(key);
		if (currentIndex < 0) return;

		if (event.key === ' ' || event.key === 'Enter') {
			event.preventDefault();
			if (keyboardGrabbedKey === key) {
				const previousItems = [...dragSnapshot];
				keyboardGrabbedKey = null;
				dragSnapshot = [];
				liveMessage = `Элемент установлен на позицию ${indexOf(key) + 1}.`;
				void commit(previousItems);
			} else {
				dragSnapshot = [...orderedItems];
				keyboardGrabbedKey = key;
				liveMessage = 'Элемент выбран. Используйте стрелки вверх и вниз, затем Enter.';
			}
			return;
		}

		if (event.key === 'Escape' && keyboardGrabbedKey === key) {
			event.preventDefault();
			restoreSnapshot();
			keyboardGrabbedKey = null;
			liveMessage = 'Перемещение отменено.';
			return;
		}

		if (keyboardGrabbedKey !== key) return;
		const direction = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
		if (!direction) return;
		event.preventDefault();
		const targetIndex = Math.min(orderedItems.length - 1, Math.max(0, currentIndex + direction));
		if (move(key, targetIndex)) {
			liveMessage = `Новая позиция: ${targetIndex + 1} из ${orderedItems.length}.`;
		}
	}
</script>

<div
	bind:this={rootElement}
	class={sortableListVariants({ saving }).root({ class: className })}
	role="list"
	aria-label={ariaLabel}
	aria-busy={saving}
>
	{#each orderedItems as item, index (getKey(item))}
		{@const key = getKey(item)}
		{@const styles = sortableListVariants({
			dragging: draggingKey === key,
			grabbed: keyboardGrabbedKey === key,
			saving
		})}
		<div
			use:registerItem={key}
			data-sortable-key={key}
			class={styles.item({ class: itemClass })}
			role="listitem"
			animate:flip={{ duration: draggingKey === key ? 0 : 160 }}
			ondragover={(event) => handleDragOver(event, key)}
			ondrop={handleDrop}
		>
			<button
				type="button"
				class={styles.handle()}
				draggable={!disabled && !saving}
				disabled={disabled || saving}
				aria-label={`Изменить порядок: ${itemLabel(item, index)}. Нажмите Enter и используйте стрелки.`}
				aria-pressed={keyboardGrabbedKey === key}
				title="Перетащите или нажмите Enter для перемещения стрелками"
				ondragstart={(event) => handleDragStart(event, key)}
				ondragend={handleDragEnd}
				onpointerdown={(event) => handlePointerDown(event, key)}
				onpointermove={handlePointerMove}
				onpointerup={(event) => finishPointerDrag(event)}
				onpointercancel={(event) => finishPointerDrag(event, true)}
				onkeydown={(event) => handleKeyboard(event, key)}
			>
				<BarsOutline class={styles.handleIcon()} strokeWidth={1.75} />
			</button>
		<div class={styles.content()}>{@render children(item, index)}</div>
		</div>
	{/each}
	<div class={sortableListVariants().liveRegion()} aria-live="polite">{liveMessage}</div>
</div>
