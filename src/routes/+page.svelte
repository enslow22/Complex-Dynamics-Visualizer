<script lang="ts">
	import Main from "../Main.svelte";
  import { parseExpression } from "../parse";
  import UniformSlider from "../UniformSlider.svelte";
  import { Plus } from '@lucide/svelte';
	import Modal from "../Modal.svelte";
  import katex from 'katex';



    // States for the fragment shader
    let uniformList = $state<{ variable: string; value: number | number[]; uniformType: string }[]>([]);
    let functionInput = $state("z^2+c");
    let anonFunction = $derived(parseExpression(functionInput, uniformList));

    // States for moving the canvas
    let moving = $state(false);
    let insideOptions = $state(false);
    let offsetX = $state(-1.5);
    let offsetY = $state(0);
    let useSmooth = $state(false);

    // Inputs
    let zoom = $state(-1);
    let iterations = $state(40);
    let escapeRadius = $state(2);
    let iterateFromZero = $state(false);

    //TODO: ADD COLOR FUNCTION OPTIONS
    //TODO: ADD AN ORBIT VISUALIZER (HARD) (could either do inside the shader, or on top of the canvas)
    let colorFunction = $state("iteration"); // Can also be domain

    // Misc States
    let hidden = $state(false);
    let modalShown = $state(false);


    // Event handlers
    function handleZoom(event: WheelEvent) {
      if (!insideOptions) {
        zoom -= event.deltaY / 1000;
      }
    }

    function handleDrag(event: MouseEvent) {
      if (moving) {
        offsetX -= event.movementX / 1000 / Math.exp(zoom)
        offsetY += event.movementY / 1000 / Math.exp(zoom)
      }
    }

    function handleAddUniform() {
      uniformList.push({variable: `u${uniformList.length+1}`, value: 0, uniformType: 'real'});
    }
</script>

<div role="presentation" onmousedown={() => moving=(true && !insideOptions)} onmouseup={() => moving=false} onmousemove={handleDrag} onwheel={handleZoom} class="relative w-full h-screen bg-gray-100">
    <!-- Full-screen canvas -->
    <Main colorFunction={colorFunction} escapeRadius={escapeRadius} iterateFromZero={iterateFromZero} anonFunction={anonFunction} zoom={zoom} xyOffset={[offsetX, offsetY]} iterations={iterations} uniformList={uniformList}/>

  {#if !hidden}
      
    <!-- Top left floating div for function input -->
    <div role="region" onmouseenter={() => insideOptions=true} onmouseleave={() => insideOptions=false} class="absolute top-4 left-4 bg-zinc-300 p-4 rounded-lg shadow-lg w-80">
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
    <div role="region" onmouseenter={() => insideOptions=true} onmouseleave={() => insideOptions=false} class="absolute top-4 right-4 bg-zinc-300 p-4 rounded-lg shadow-lg w-72">
      <div class="text-lg font-semibold mb-3">Graph Options</div>
      

      <div class="mb-3">
        <label for="coloring" class="block text-sm font-medium text-gray-700 mb-1">Color</label>
        <select bind:value={colorFunction} id="coloring" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="iteration">Iteration Coloring</option>
          <option value="domain">Domain Coloring</option>
        </select>
      </div>
      
      <!-- Option E: Checkbox -->
      <div class="mb-3 flex items-center">
        <input 
          type="checkbox" 
          id="option-e" 
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          bind:checked={iterateFromZero}
        />
        <label for="option-e" class="ml-2 block text-sm text-gray-700">let z_0 = 0</label>
      </div>
      
      <!-- Option F: Slider -->
      <div class="mb-3 flex flex-row items-center gap-2">
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


      <div class="mb-3 flex flex-row items-center">
        <label for="option-f" class="block text-sm font-medium text-gray-700 mb-1">Escape Radius</label>
        <input 
          type="number" 
          id="option-f"
          min={0}
          class="w-full h-10 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          bind:value={escapeRadius}
        />
      </div>
    </div>

    <!-- Bottom left floating div for credits -->
    <div role="region" onmouseenter={() => insideOptions=true} onmouseleave={() => insideOptions=false} class=" max-h-1/2 overflow-auto absolute bottom-4 left-4 bg-zinc-300 p-4 rounded-lg shadow-lg w-96">
    <div class="my-2 items-center justify-between flex">
      <span class="align-middle text-xl">Extra Parameters</span>
      <button class="align-middle" onclick={handleAddUniform}>
        <Plus size={26} />
      </button>
    </div>
      <div class="text-sm text-gray-600">

        {#each uniformList as uniform}
          <UniformSlider bind:value={uniform.value} bind:variable={uniform.variable} bind:uniformType={uniform.uniformType} delete={() => {uniformList = uniformList.filter(u => uniform.variable != u.variable)}}/>
        {/each}

    </div>
  </div>
  
  {/if}

  {#if hidden}
  <button class="hover:opacity-100 opacity-20 transition ease-in-out max-h-1/2 overflow-auto absolute bottom-4 right-4 bg-zinc-300 p-4 rounded-lg shadow-lg w-20 cursor-pointer" onclick={() => hidden = !hidden}>Show</button>
  {:else}
  <button class="max-h-1/2 overflow-auto absolute bottom-4 right-4 bg-zinc-300 p-4 rounded-lg shadow-lg w-20 cursor-pointer" onclick={() => hidden = !hidden}>Hide</button>
  {/if}
  
  {#if !hidden}
  <button class="max-h-1/2 overflow-auto absolute bottom-4 right-28 bg-zinc-300 p-4 rounded-lg shadow-lg w-20 cursor-pointer" onclick={() => modalShown = !modalShown}>Info</button>
  {/if}

  {#if modalShown}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div onmouseenter={() => insideOptions=true} onmouseleave={() => insideOptions=false}>
  <Modal bind:showModal={modalShown}>
    {#snippet header()}
      <h1 class="font-semibold text-4xl">
        Tutorial and About
      </h1>
    {/snippet}
    <p>This program visualizes the dynamics of iterated complex valued functions of the form {@html katex.renderToString("f_c(z): \\mathbb{C} \\rightarrow \\mathbb{C}")} </p>
    <p>For each point {@html katex.renderToString("c")} in the complex plane, it calculates the sequence</p>
    {@html katex.renderToString("\\begin{aligned} z_0 &= c \\newline z_1 &= f_c(z_0) \\newline &\\;... \\newline z_{n+1} &= f_c(z_n) \\end{aligned}", {displayMode: true})}
    <p>until {@html katex.renderToString("|z_n|\\geq \\text{escape radius.}")}</p>
    <p>If the sequence eventually surpasses the defined escape radius, it is colored based on the number of iterations it took to do so.</p>
    <hr>
    <h1 class="text-xl font-semibold">
      Uniforms
    </h1>
    I've also added support for adding shader uniforms for complex numbers. You can basically just treat them as veriables in your function definitions.
    <hr>
    <h1 class="text-xl font-semibold">Examples</h1>
    <p>Here are some fractals that you can plot with this tool</p>
    <div class="flex flex-row gap-2 mb-1">
      <button class=" bg-blue-100 rounded-lg p-1 border" onclick={() => {functionInput="z^2+c", uniformList=[]}}>The Mandelbrot Set</button>
      <button class=" bg-blue-100 rounded-lg p-1 border" onclick={() => {functionInput="abs(z^2+c)", uniformList=[]}}>Burning Ship</button>
      <button class=" bg-blue-100 rounded-lg p-1 border" onclick={() => {functionInput="z^2+u1"; iterations=100; uniformList=[{variable: `u1`, value: [0.40, -0.11], uniformType: 'complex'}]}}>Julia Sets of the Mandelbrot Set</button>
      <button class=" bg-blue-100 rounded-lg p-1 border" onclick={() => {functionInput="abs(z^2+2*u1)"; iterations=100; uniformList=[{variable: `u1`, value: [0.40, -0.58], uniformType: 'complex'}]}}>Julia Sets of the Burning Ship</button>
      <button class=" bg-blue-100 rounded-lg p-1 border" onclick={() => {functionInput="z^(u1*5+1)+c"; iterations=100; uniformList=[{variable: `u1`, value: 1, uniformType: 'real'}];}}>Multibrots</button>
      
    </div>
  </Modal></div>
  {/if}
</div>