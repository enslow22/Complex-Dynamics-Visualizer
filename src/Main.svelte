<script>
    import { WebGlShader } from "svader";

    const { anonFunction, zoom, xyOffset, iterations, escapeRadius, uniformList, iterateFromZero, colorFunction } = $props();


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
        uniform float u_escape;
        uniform vec2 iTuple0;
        uniform vec2 iTuple1;
        uniform vec2 iTuple2;
        uniform vec2 iTuple3;
        uniform vec2 iTuple4;
        uniform vec2 iTuple5;
        uniform vec2 iTuple6;
        uniform vec2 iTuple7;
        uniform vec2 iTuple8;
        uniform vec2 iTuple9;
        
        float ARG(vec2 a){
            return atan(a.y, a.x);
        }

        // Ty https://www.shadertoy.com/view/MsS3Wc iquilez <3
        vec3 hsb2rgb( in vec3 c ){
            vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                                    6.0)-3.0)-1.0,
                            0.0,
                            1.0 );
            rgb = rgb*rgb*(3.0-2.0*rgb);
            return c.z * mix( vec3(1.0), rgb, c.y);
        }

        #define CENTER vec2(0.,0.)
        //#define COLORFUN 0.5 + 0.5*cos(2.*PI*(mix(i,SMOOTH,1.)/ITERATION + mix(vec3(0.00, 0.10, 0.20), vec3(0.30, 0.20, 0.20), (sin(t/15.)+1.)/2.) ))
        //#define COLORFUN 0.5 + 0.5*cos(3.13938 + (i${iterateFromZero ? '-1.0' : ''})*vec3(0.2,.25,0.25)+vec3(0.219, 0.243, 0.735))
        //#define COLORFUN hsb2rgb(vec3((atan(z.y,z.x)/6.28318530718)+0.5, length(z)*2.0, 1.0));
        #define COLORFUN ${colorFunction == 'iteration' ? `0.5 + 0.5*cos(3.13938 + (i${iterateFromZero ? '-1.0' : ''})*vec3(0.2,.25,0.25)+vec3(0.219, 0.243, 0.735))` : `hsb2rgb(vec3((atan(z.y,z.x)/6.28318530718)+0.5, length(z)*2.0, 1.0));` }
        
        #define ITERATION 160.0
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

        vec2 cpowi(vec2 a, vec2 b) {
            vec2 original = a;
            for (int i=1; i<int(b.x); i++){
                a = cmul(a, original);
            }
            return a;
        }

        vec2 cpow(vec2 a, float b){
            return pow(length(a), b)*vec2(cos(b*ARG(a)), sin(b*ARG(a)));
        }

        vec2 cpow(vec2 a, vec2 b){
            if (b.y == 0.0){
                return cpow(a, b.x);
            }
            return vec2(1.0); //TODO THIS
        }

        vec3 anon (in vec2 z){
            vec2 c = z; //Original point
            vec2 temp;
            vec3 outv;
            bool br;
            ${iterateFromZero ? 'z = vec2(0.0);' : ''}
            for (float i=0.0; i<u_iterations;i += 1.0){
                if (length(z) > u_escape){
                    outv = COLORFUN;
                    break;
                }

                z = ANONFUNCTION;
            }
            ${colorFunction === "domain" ? "outv = COLORFUN;" : ""} 
            return outv;
        }

        void main() {
            vec2 pos = gl_FragCoord.xy - u_offset - xy_offset;
            vec2 a = u_resolution;
            vec2 st = ((pos / u_resolution.y) - vec2(0.88888888, 0.50))/exp(u_zoom) + xy_offset;
            vec3 col;
            col = anon(st);
            
            fragColor = vec4(col, 1.0);
        }
    `);

    
    //let uniformFloats = $derived(uniformList.filter((uniform) => {return uniform.uniformType === 'real'}))
    //let uniformTuples = $derived(uniformList.filter((uniform) => {return uniform.uniformType === 'complex'}))

    //let uniformFloatValues = $derived(uniformFloats.map((uniform, index) => ({name: `iFloat${index}`, value: [uniform.value, 0.0], type: "vec2"})));
    
    //let uniformTupleValues = $derived(uniformTuples.map((uniform, index) => ({name: `iTuple${index}`, value: uniform.value, type: "vec2"})));
    let uniformValues = $derived(uniformList.map((uniform, index) => ({name: `iTuple${index}`, value: uniform.uniformType === "real" ? [uniform.value, 0.0] : uniform.value, type: "vec2"})));


    let parameters = $derived([
        { name: "u_resolution", value: "resolution" },
        { name: "u_offset", value: "offset" },
        { name: "u_zoom", type: "float", value: zoom },
        { name: "xy_offset", type: "vec2", value: [xyOffset[0], xyOffset[1]] },
        { name: "u_iterations", type: "float", value: iterations+iterateFromZero },
        { name: "u_escape", type: "float", value: escapeRadius },
    ].concat(uniformValues));
</script>

{#key shaderCode}
    <WebGlShader
    code={shaderCode}
    parameters={parameters}>
    <div class="fallback">{anonFunction}</div>
    </WebGlShader>
{/key}