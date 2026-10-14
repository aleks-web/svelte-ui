<script lang="ts">
	type AvatarSize = 'small' | 'default' | 'large';

	let {
		name,
		src = null,
		fallbackSrcs = [],
		size = 'default',
		class: className = ''
	}: {
		name: string;
		src?: string | null;
		fallbackSrcs?: Array<string | null | undefined>;
		size?: AvatarSize;
		class?: string;
	} = $props();

	let failedSrcs = $state<string[]>([]);
	let imageSources = $derived([
		...new Set([src, ...fallbackSrcs].filter((value): value is string => Boolean(value)))
	]);
	let activeSrc = $derived(imageSources.find((value) => !failedSrcs.includes(value)) ?? null);
	let showImage = $derived(Boolean(activeSrc));
	let initials = $derived(
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toLocaleUpperCase('ru'))
			.join('') || '—'
	);
	let sizeClass = $derived(
		size === 'small'
			? 'size-8 text-[0.65rem] rounded-lg'
			: size === 'large'
				? 'size-16 text-lg rounded-2xl'
				: 'size-11 text-xs rounded-xl'
	);
</script>

<span
	class={`relative inline-grid shrink-0 place-items-center overflow-hidden bg-blue-100 font-bold text-blue-800 ring-1 ring-blue-200 ${sizeClass} ${className}`}
	aria-label={name}
>
	{#if showImage}
		<img
			src={activeSrc ?? ''}
			alt={name}
			class="size-full object-cover"
			onerror={() => {
				if (activeSrc && !failedSrcs.includes(activeSrc)) {
					failedSrcs = [...failedSrcs, activeSrc];
				}
			}}
		/>
	{:else}
		<span aria-hidden="true">{initials}</span>
	{/if}
</span>
