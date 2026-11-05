'use client'

import { useEffect, useRef } from 'react'

// Ajustes do efeito: velocidade das dobras e força da luz/sombra entre elas
const SPEED = 0.75
const FOLD_STRENGTH = 0.42

// Desenhar em meia resolução basta para algo tão suave e poupa GPU e bateria
const RESOLUTION_SCALE = 0.5
const FRAME_MS = 1000 / 30

// Todos os coeficientes de tempo do shader têm 2 casas, então este período fecha o ciclo sem salto
const TIME_LOOP = Math.PI * 200

const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`

const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uTime;
uniform float uStrength;

// Altura do tecido: ondas que viajam na horizontal e se deformam ao longo da vertical
float cloth(vec2 p) {
  float warp = 0.16 * sin(p.y * 1.7 + uTime * 0.40)
             + 0.07 * sin(p.y * 3.6 + p.x * 0.8 - uTime * 0.31);
  float x = p.x + warp;
  return 0.62 * sin(x * 4.2 - uTime * 0.85)
       + 0.30 * sin(x * 7.9 + p.y * 1.1 - uTime * 1.25)
       + 0.16 * sin(x * 13.0 - p.y * 1.8 - uTime * 1.70);
}

void main() {
  vec2 p = gl_FragCoord.xy / uResolution.y;

  // A inclinação do tecido define a luz: é o que faz as dobras parecerem ter volume
  float height = cloth(p);
  float slope = (cloth(p + vec2(0.004, 0.0)) - height) / 0.004 / 7.0;
  float light = 0.5 + slope * uStrength + height * 0.08;

  vec3 shadow = vec3(0.13, 0.012, 0.035);
  vec3 wine = vec3(0.36, 0.033, 0.082);
  vec3 scarlet = vec3(0.62, 0.090, 0.165);
  vec3 color = mix(shadow, wine, smoothstep(0.0, 0.55, light));
  color = mix(color, scarlet, smoothstep(0.55, 1.0, light));

  gl_FragColor = vec4(color, 1.0);
}`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
}

// Sem WebGL o canvas fica transparente e aparece o gradiente estático do CSS
export default function FlagBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' })
    if (!canvas || !gl) return

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    const program = gl.createProgram()
    if (!vertex || !fragment || !program) return

    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    // Um triângulo que cobre a tela inteira
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const uResolution = gl.getUniformLocation(program, 'uResolution')
    const uTime = gl.getUniformLocation(program, 'uTime')
    gl.uniform1f(gl.getUniformLocation(program, 'uStrength'), FOLD_STRENGTH)

    const draw = (seconds: number) => {
      gl.uniform1f(uTime, (seconds * SPEED) % TIME_LOOP)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const resize = () => {
      canvas.width = Math.ceil(window.innerWidth * RESOLUTION_SCALE)
      canvas.height = Math.ceil(window.innerHeight * RESOLUTION_SCALE)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uResolution, canvas.width, canvas.height)
      draw(performance.now() / 1000)
    }
    resize()
    window.addEventListener('resize', resize)

    // Com "reduzir movimento" ligado, fica só o quadro desenhado no resize
    let frame = 0
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let last = 0
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop)
        if (now - last < FRAME_MS) return
        last = now
        draw(now / 1000)
      }
      frame = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="rl-flag" aria-hidden="true" />
}
