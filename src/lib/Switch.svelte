<script lang="ts">
	import { Toggle } from 'melt/builders';

	let { checked = $bindable(false) }: { checked?: boolean } = $props();

	const toggle = new Toggle({
		value: () => checked,
		onValueChange: (next) => {
			checked = next;
		}
	});
</script>

<div class="flex items-center">
	<button
		{...toggle.trigger}
		class:checked={toggle.value}
		class="group data-[state=checked][&>*]:bg-red-200 relative h-6 cursor-pointer rounded-full
                 bg-blue-100 transition-colors
				 outline-none hover:bg-blue-200 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
				 data-[state=checked]:bg-blue-300 data-[state=checked]:hover:bg-blue-400
            "
	>
		<span class="thumb block rounded-full bg-blue-400 transition group-[.checked]:bg-blue-600"
		></span>
	</button>
	<input {...toggle.hiddenInput} />
</div>

<style>
	button {
		--w: 2.75rem;
		--padding: 0.125rem;
		width: var(--w);
	}

	.thumb {
		--size: 1.25rem;
		width: var(--size);
		height: var(--size);
		transform: translateX(var(--padding));
	}

	:global([data-state='checked']) .thumb {
		transform: translateX(calc(var(--w) - var(--size) - var(--padding)));
	}
</style>
