<script lang="ts">
	type TextPart = { type: 'text'; value: string } | { type: 'link'; value: string; href: string };

	let {
		text,
		class: className = '',
		linkClass = 'font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-900 hover:decoration-blue-700'
	}: {
		text: string;
		class?: string;
		linkClass?: string;
	} = $props();

	function textParts(value: string): TextPart[] {
		const parts: TextPart[] = [];
		const pattern = /(?:https?:\/\/|www\.)[^\s<>"']+/giu;
		const trailingPunctuation = new Set(['.', ',', '!', '?', ';', ':', ']', ')', '}', '>', '»']);
		let cursor = 0;

		for (const match of value.matchAll(pattern)) {
			const start = match.index ?? 0;
			let linkText = match[0];
			let suffix = '';
			while (linkText && trailingPunctuation.has(linkText.at(-1) ?? '')) {
				suffix = `${linkText.at(-1)}${suffix}`;
				linkText = linkText.slice(0, -1);
			}
			if (start > cursor) parts.push({ type: 'text', value: value.slice(cursor, start) });
			if (linkText) {
				parts.push({
					type: 'link',
					value: linkText,
					href: linkText.toLocaleLowerCase('ru').startsWith('www.')
						? `https://${linkText}`
						: linkText
				});
			}
			if (suffix) parts.push({ type: 'text', value: suffix });
			cursor = start + match[0].length;
		}

		if (cursor < value.length) parts.push({ type: 'text', value: value.slice(cursor) });
		return parts.length ? parts : [{ type: 'text', value }];
	}
</script>

<span class={className}>
	{#each textParts(text) as part, index (`${part.type}-${index}`)}
		{#if part.type === 'link'}
			<a href={part.href} target="_blank" rel="noopener noreferrer" class={`break-all ${linkClass}`}
				>{part.value}</a
			>
		{:else}{part.value}{/if}
	{/each}
</span>
