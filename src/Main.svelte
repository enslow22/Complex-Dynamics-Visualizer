<script>
    import { WebGlShader } from "svader";

    const { anonFunction, zoom, xyOffset, iterations, uniformList } = $props();


    // TODO:
    // Add extra uniforms
    
    const shaderCode = $derived(
        `#version 300 es

        precision highp float;

        out vec4 fragColor;

        uniform vec2 u_resolution;
        uniform vec2 u_offset;
        uniform vec2 xy_offset;
        uniform float u_zoom;
        uniform float u_iterations;
        uniform float iFloat0;
        uniform float iFloat1;
        uniform float iFloat2;
        uniform float iFloat3;
        uniform float iFloat4;
        uniform float iFloat5;
        uniform float iFloat6;
        uniform float iFloat7;
        uniform float iFloat8;
        uniform float iFloat9;

        #define CENTER vec2(0.,0.)
        //#define COLORFUN 0.5 + 0.5*cos(2.*PI*(mix(i,SMOOTH,1.)/ITERATION + mix(vec3(0.00, 0.10, 0.20), vec3(0.30, 0.20, 0.20), (sin(t/15.)+1.)/2.) ))
        #define COLORFUN 0.5 + 0.5*cos(3.13938 + i*vec3(0.2,.25,0.25)+vec3(0.219, 0.243, 0.735))
        #define ITERATION 160.0
        #define ESCAPE 50.0
        #define ANONFUNCTION ${anonFunction}

        // Complex number operations
        vec2 cmul(vec2 a, vec2 b){
            return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
        }

        vec2 cmul(float a, vec2 b){
            return vec2(a*b.x, a*b.y);
        }

        vec2 cmul(vec2 a, float b){
            return vec2(a.x*b, a.y*b);
        }

        vec2 cmul(float a, float b){
            return vec2(a*b, 0.0);
        }

        vec2 cdiv(vec2 a, vec2 b){
            return vec2((a.x*b.x + a.y*b.y)/(b.x*b.x + b.y*b.y), (a.y*b.x - a.x*b.y)/(b.x*b.x + b.y*b.y));
        }

        vec2 cdiv(vec2 a, float b){
            return vec2(a.x/b, a.y/b);
        }

        vec2 cdiv(float a, vec2 b){
            return vec2(a/b.x, a/b.y);
        }

        vec2 cpowi(vec2 a, float b) {
            vec2 original = a;
            for (int i=1; i<int(b); i++){
                a = cmul(a, original);
            }
            return a;
        }

        vec3 anon (in vec2 z){
            vec2 c = z; //Original point
            vec2 temp;
            vec3 outv;
            bool br;
            for (float i=0.0; i<u_iterations;i += 1.0){
                if (length(z) > ESCAPE){
                    outv = COLORFUN;
                    break;
                }

                z = ANONFUNCTION;
            }
            return outv;
        }

        void main() {
            vec2 pos = gl_FragCoord.xy + u_offset + xy_offset;
            vec2 a = u_resolution;
            vec2 st = ((pos / u_resolution.y) - vec2(0.5, 0.5))/exp(u_zoom) + xy_offset;
            vec3 col;
            col = anon(st);
            
            fragColor = vec4(col, 1.0);
        }
    `);

    let uniformValues = $derived(uniformList.map((uniform, index) => ({name: `iFloat${index}`, value: uniform.value, type: "float"})));

    let parameters = $derived([
        { name: "u_resolution", value: "resolution" },
        { name: "u_offset", value: "offset" },
        { name: "u_zoom", type: "float", value: zoom },
        { name: "xy_offset", type: "vec2", value: [xyOffset[0], xyOffset[1]] },
        { name: "u_iterations", type: "float", value: iterations }
    ].concat(uniformValues));
</script>

{#key shaderCode}
    <WebGlShader
    code={shaderCode}
    parameters={parameters}>
    <div class="fallback">{anonFunction}</div>
    </WebGlShader>
{/key}