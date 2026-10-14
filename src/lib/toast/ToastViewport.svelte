<script lang="ts">
	import {
		CheckCircleOutline,
		CloseOutline,
		ExclamationCircleOutline,
		InfoCircleOutline
	} from 'flowbite-svelte-icons';
	import { cubicOut } from 'svelte/easing';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { toaster, type ToastData } from './toast';
	import { toastVariants, type ToastPosition } from './toast.variants';

	let {
		position = 'bottom-right',
		class: className = ''
	}: { position?: ToastPosition; class?: string } = $props();

	let viewportStyles = $derived(toastVariants({ position }));

	function stylesFor(data: ToastData) {
		return toastVariants({ variant: data.variant, position });
	}

	async function activateToast(id: string, data: ToastData): Promise<void> {
		if (!data.onClick) return;
		toaster.removeToast(id);
		try {
			await data.onClick();
		} catch (error) {
			console.error('Не удалось выполнить действие уведомления', error);
		}
	}
</script>

<div
	{...toaster.root}
	class={viewportStyles.viewport({ class: className })}
	aria-label="Уведомления"
>
	{#each toaster.toasts as item (item.id)}
		{@const styles = stylesFor(item.data)}
		<article
			{...item.content}
			class={styles.content()}
			animate:flip={{ duration: 180 }}
			in:fly={{ x: 36, duration: 240, easing: cubicOut }}
			out:fly={{ x: 24, duration: 160 }}
		>
			{#if item.data.onClick}
				<button
					type="button"
					class={styles.action()}
					aria-label={item.data.actionLabel ?? item.data.title}
					onclick={() => activateToast(item.id, item.data)}
				></button>
			{/if}

			<div
				class={styles.iconWrap({
					class: item.data.onClick ? 'pointer-events-none relative z-10' : ''
				})}
				aria-hidden="true"
			>
				{#if item.data.variant === 'success'}
					<CheckCircleOutline class={styles.icon()} strokeWidth={1.7} />
				{:else if item.data.variant === 'info'}
					<InfoCircleOutline class={styles.icon()} strokeWidth={1.7} />
				{:else}
					<ExclamationCircleOutline class={styles.icon()} strokeWidth={1.7} />
				{/if}
			</div>

			<div class={`min-w-0 ${item.data.onClick ? 'pointer-events-none relative z-10' : ''}`}>
				<h2 {...item.title} class={styles.title()}>{item.data.title}</h2>
				{#if item.data.description}
					<p {...item.description} class={styles.description()}>
						{item.data.description}
					</p>
				{/if}
			</div>

			<button type="button" {...item.close} class={styles.close()} aria-label="Закрыть уведомление">
				<CloseOutline class="size-4" strokeWidth={1.7} />
			</button>
		</article>
	{/each}
</div>
