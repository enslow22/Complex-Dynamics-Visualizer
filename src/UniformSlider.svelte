<script lang="ts">

let minimum = $state(0)
let maximum = $state(1)
let { value = $bindable(), variable = $bindable(), ...props} = $props()
</script>


<div>
    <input type="text" bind:value={variable} class="w-full h-8 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
    <input type="range" min={minimum} max={maximum} bind:value={value} step={(maximum - minimum)/100} class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
    <span>{value}</span>
</div>