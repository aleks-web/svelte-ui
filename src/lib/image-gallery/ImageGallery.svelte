<script module lang="ts">
	export type ImageGalleryItem = {
		src: string;
		alt?: string;
		title?: string;
		sourceUrl?: string;
	};
</script>

<script lang="ts">
	import '@splidejs/splide/css/core';
	import Splide from '@splidejs/splide';
	import { AngleLeftOutline, AngleRightOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import ImageViewer from '../image-viewer/ImageViewer.svelte';

	let {
		images,
		label = 'Галерея изображений',
		class: className = ''
	}: {
		images: ImageGalleryItem[];
		label?: string;
		class?: string;
	} = $props();

	let sliderElement: HTMLElement;

	onMount(() => {
		const slider = new Splide(sliderElement, {
			type: 'slide',
			perPage: 4,
			perMove: 1,
			gap: '0.75rem',
			pagination: false,
			arrows: images.length > 1,
			drag: images.length > 1,
			rewind: false,
			trimSpace: true,
			breakpoints: {
				1280: { perPage: 3 },
				900: { perPage: 2 },
				560: { perPage: 1 }
			},
			i18n: {
				prev: 'Предыдущее изображение',
				next: 'Следующее изображение',
				first: 'Перейти к первому изображению',
				last: 'Перейти к последнему изображению',
				slideX: 'Перейти к изображению %s',
				pageX: 'Перейти на страницу %s',
				play: 'Запустить прокрутку',
				pause: 'Остановить прокрутку',
				carousel: 'галерея',
				select: 'Выберите изображение',
				slide: 'изображение',
				slideLabel: '%s из %s'
			}
		});
		slider.mount();
		return () => slider.destroy(true);
	});
</script>

<section
	class={`splide relative ${className}`}
	bind:this={sliderElement}
	aria-label={label}
	data-image-gallery
>
	{#if images.length > 1}
		<div
			class="splide__arrows pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-between px-2"
		>
			<button
				class="splide__arrow splide__arrow--prev pointer-events-auto inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-lg transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-default disabled:opacity-35"
				type="button"
			>
				<AngleLeftOutline class="size-4" strokeWidth={1.8} />
			</button>
			<button
				class="splide__arrow splide__arrow--next pointer-events-auto inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-lg transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-default disabled:opacity-35"
				type="button"
			>
				<AngleRightOutline class="size-4" strokeWidth={1.8} />
			</button>
		</div>
	{/if}

	<div class="splide__track rounded-xl">
		<ul class="splide__list">
			{#each images as image, index (`${image.src}-${index}`)}
				<li class="splide__slide min-w-0">
					<div class="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
						<ImageViewer
							src={image.src}
							alt={image.alt ?? `Скриншот ${index + 1}`}
							title={image.title ?? `Скриншот ${index + 1}`}
							triggerLabel={`Открыть скриншот ${index + 1} полностью`}
						>
							{#snippet trigger()}
								<img
									src={image.src}
									alt={image.alt ?? `Скриншот ${index + 1}`}
									loading="lazy"
									decoding="async"
									class="aspect-video w-full bg-white object-cover transition duration-200 hover:scale-[1.02]"
								/>
							{/snippet}
						</ImageViewer>
						<div class="flex items-center justify-between gap-2 px-3 py-2">
							<span class="truncate text-xs font-medium text-slate-600">
								{image.title ?? `Скриншот ${index + 1}`}
							</span>
							{#if image.sourceUrl}
								<a
									href={image.sourceUrl}
									target="_blank"
									rel="noreferrer"
									class="shrink-0 text-xs font-semibold text-blue-700 hover:underline"
								>
									Источник
								</a>
							{/if}
						</div>
					</div>
				</li>
			{/each}
		</ul>
	</div>
</section>
