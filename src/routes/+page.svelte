<script lang="ts">
	import { e } from "mathjs";
	import Main from "../Main.svelte";
  import { parseExpression } from "../parse";
	import { exp } from "mathjs";
  import UniformSlider from "../UniformSlider.svelte";

  

    let uniformList = $state<{ variable: string; value: number }[]>([]);
    let functionInput = $state("z^2+c");
    let anonFunction = $derived(parseExpression(functionInput, uniformList));

    // States for moving the canvas
    let moving = $state(false);
    let insideOptions = $state(false);
    let offsetX = $state(0);
    let offsetY = $state(0);

    // Inputs
    let zoom = $state(1);
    let iterations = $state(40);

    function handleZoom(event: WheelEvent) {
      zoom -= event.deltaY / 1000;
    }

    function handleDrag(event: MouseEvent) {
      if (moving) {
        offsetX -= event.movementX / 1000 / Math.exp(zoom)
        offsetY += event.movementY / 1000 / Math.exp(zoom)
      }
    }

    function handleAddUniform() {
      uniformList.push({variable: `iFloat${uniformList.length+1}`, value: 0});
    }

</script>

<div role="presentation" onmousedown={() => moving=(true && !insideOptions)} onmouseup={() => moving=false} onmousemove={handleDrag} onwheel={handleZoom} class="relative w-full h-screen bg-gray-100">
    <!-- Full-screen canvas -->
     <Main anonFunction={anonFunction} zoom={zoom} xyOffset={[offsetX, offsetY]} iterations={iterations} uniformList={uniformList}/>

    <!-- Top left floating div for function input -->
    <div role="region" onmouseenter={() => insideOptions=true} onmouseleave={() => insideOptions=false} class="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg w-80">
      <div class="text-lg font-semibold mb-2">Function Input</div>
      <div class="flex items-center space-x-2">
        <span class="text-gray-600 text-xl">f_c(z) =</span>
        <input 
          type="text" 
          id="function-input" 
          class="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter a function..."
          bind:value={functionInput}
        />
      </div>
      {anonFunction}
    </div>
    
    <!-- Top right floating div for controls -->
    <div role="region" onmouseenter={() => insideOptions=true} onmouseleave={() => insideOptions=false} class="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg w-72">
      <div class="text-lg font-semibold mb-3">Graph Options</div>
      
      <!-- Option A: Dropdown -->
      <div class="mb-3">
        <label for="option-a" class="block text-sm font-medium text-gray-700 mb-1">Option A</label>
        <select id="option-a" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option>Choice 1</option>
          <option>Choice 2</option>
          <option>Choice 3</option>
        </select>
      </div>
      
      <!-- Option B: Checkbox -->
      <div class="mb-3 flex items-center">
        <input 
          type="checkbox" 
          id="option-b" 
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label for="option-b" class="ml-2 block text-sm text-gray-700">Option B</label>
      </div>
      
      <!-- Option C: Slider -->
      <div class="mb-3">
        <label for="option-c" class="block text-sm font-medium text-gray-700 mb-1">Option C</label>
        <input 
          type="range" 
          id="option-c" 
          min="0" 
          max="100" 
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      <!-- Option D: Dropdown -->
      <div class="mb-3">
        <label for="option-d" class="block text-sm font-medium text-gray-700 mb-1">Option D</label>
        <select id="option-d" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option>Mode 1</option>
          <option>Mode 2</option>
          <option>Mode 3</option>
        </select>
      </div>
      
      <!-- Option E: Checkbox -->
      <div class="mb-3 flex items-center">
        <input 
          type="checkbox" 
          id="option-e" 
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label for="option-e" class="ml-2 block text-sm text-gray-700">Option E</label>
      </div>
      
      <!-- Option F: Slider -->
      <div class="mb-3">
        <label for="option-f" class="block text-sm font-medium text-gray-700 mb-1">Iterations</label>
        <input 
          type="range" 
          id="option-f" 
          min={0}
          max={500} 
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          bind:value={iterations}
        />{iterations}
      </div>
    </div>

    <!-- Bottom left floating div for credits -->
    <div role="region" onmouseenter={() => insideOptions=true} onmouseleave={() => insideOptions=false} class="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg w-80">
    <div class="text-lg font-semibold mb-2">Extra Parameters</div>
      <div class="text-sm text-gray-600">

        {#each uniformList as uniform}
          <UniformSlider bind:value={uniform.value} bind:variable={uniform.variable} />
        {/each}
        <button onclick={handleAddUniform}>+</button>
    </div>
  </div>
</div>