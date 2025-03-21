<script lang="ts">
	import { Trash, Play } from '@lucide/svelte';
	import { Pause } from '@lucide/svelte';
	import { Repeat } from '@lucide/svelte';
	import { MoveHorizontal } from '@lucide/svelte';

	// Uniform Parameters for Real Numbers
	let minimum = $state(0);
	let maximum = $state(1);
	let speed = $state(1);
	let playing = $state(false);
	let direction = $state(true);
	let loop = $state(false);
	let intervalId = $state(-1);

	// Uniform Parameters for Complex Numbers
	let moving = $state(false);
	let real = $state(0);
	let imaginary = $state(0);

	function playSlider() {
		if (direction) {
			if (value < maximum) {
				value += ((maximum - minimum) / 100) * speed;
			} else {
				direction = false;
				if (loop) {
					value = minimum;
					direction = true;
				}
			}
		} else {
			if (value > minimum) {
				value -= ((maximum - minimum) / 100) * speed;
			} else {
				direction = true;
			}
		}
	}

	function handlePlay() {
		playing = !playing;
		if (playing) {
			intervalId = setInterval(playSlider, 10);
		} else {
			clearInterval(intervalId);
		}
	}

	function handleDrag(event: MouseEvent) {
		if (moving && uniformType === 'complex') {
			real = 2 * (event.offsetX / event.target.clientWidth - 0.5);
			imaginary = 2 * (-event.offsetY / event.target.clientHeight + 0.5);
			value = [real, imaginary];
		}
	}

	function handleSelect() {
		if (uniformType === 'real') {
			value = 0;
		} else if (uniformType === 'complex') {
			value = [0, 0];
		}
	}

	let {
		value = $bindable(),
		variable = $bindable(),
		uniformType = $bindable(),
		...props
	} = $props();
</script>

<div class="mb-1 rounded-lg bg-gray-300 p-2">
	{#if uniformType === 'real'}
		<div class="m-auto flex flex-row items-center justify-center gap-1 space-y-2 align-middle">
			<input
				type="text"
				bind:value={variable}
				class=" m-0 h-8 min-w-18 cursor-pointer appearance-none rounded-lg bg-gray-200"
			/>
			<input
				type="range"
				onchange={() => {}}
				min={minimum}
				max={maximum}
				bind:value
				step={(maximum - minimum) / 100}
				class="m-0 h-2 flex-grow cursor-pointer appearance-none rounded-lg bg-gray-200"
			/>
			<p class="min-w-6">{value.toFixed(2)}</p>
		</div>

		<div
			class="m-auto mt-2 flex grid-cols-2 items-center justify-center gap-1 border-t-2 border-gray-400 pt-2 align-middle"
		>
			<label for="minimum" class="mb-1 block text-sm font-medium text-gray-700">Min</label>
			<input
				type="text"
				bind:value={minimum}
				class="m-0 h-8 w-1/2 cursor-pointer appearance-none rounded-lg bg-gray-200"
			/>
			<label for="maximum" class="mb-1 block text-sm font-medium text-gray-700">Max</label>
			<input
				type="text"
				bind:value={maximum}
				class="m-0 h-8 w-1/2 cursor-pointer appearance-none rounded-lg bg-gray-200"
			/>
			<label for="speed" class="mb-1 block text-sm font-medium text-gray-700">Speed</label>
			<input
				type="number"
				step={0.1}
				bind:value={speed}
				class="m-0 h-8 w-1/2 cursor-pointer appearance-none rounded-lg bg-gray-200"
			/>
		</div>
		<div
			class="m-auto mt-2 flex grid-cols-2 items-center justify-center gap-1 border-t-2 border-gray-400 pt-2 align-middle"
		>
			<button
				onclick={() => {
					loop = !loop;
					if (loop) {
						direction = true;
					}
				}}
				class="m-0 cursor-pointer appearance-none rounded-lg p-1 hover:bg-gray-200"
			>
				{#if loop}
					<Repeat size={26} />
				{:else}
					<MoveHorizontal size={26} />
				{/if}
			</button>
			<button
				onclick={handlePlay}
				class="m-0 cursor-pointer appearance-none rounded-lg p-1 hover:bg-gray-200"
			>
				{#if playing}
					<Pause size={26} />
				{:else}
					<Play size={26} />
				{/if}
			</button>
		</div>
	{:else if uniformType === 'complex'}
		<div class="relative">
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="relative aspect-square bg-gray-200"
				onmousedown={() => (moving = true)}
				onmouseup={() => (moving = false)}
				onmousemove={handleDrag}
			>
				<div
					class="absolute aspect-square h-3 rounded-full bg-red-500"
					style="pointer-events: none; left: calc(50% + 50% * {real} - 2%); top: calc(50% + 50% * {-imaginary} - 2%)"
				></div>
			</div>

			<input
				type="text"
				bind:value={variable}
				class=" m-0 h-8 min-w-18 cursor-pointer appearance-none rounded-lg bg-gray-200"
			/>
			{real.toFixed(2)} + {imaginary.toFixed(2)}i
		</div>
	{/if}
	<div class="flex justify-between">
		<p>
			Type:
			<select bind:value={uniformType} onchange={handleSelect}>
				<option value="real">Real</option>
				<option value="complex">Complex</option>
			</select>
		</p>
		<button class="mr-2 rounded-lg p-1 align-middle hover:bg-gray-200" onclick={props.delete}>
			<Trash size={30} />
		</button>
	</div>
</div>
