// Texturas generadas por código (no hay imágenes externas).
import * as THREE from 'three'

const SIZE = 512
const rng = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647

function canvasTexture(draw) {
  const c = document.createElement('canvas')
  c.width = c.height = SIZE
  draw(c.getContext('2d'))
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

// manchas suaves que se repiten sin costura
function blobs(ctx, rand, n, color, rMin, rMax, alpha) {
  for (let i = 0; i < n; i++) {
    const x = rand() * SIZE, y = rand() * SIZE, r = rMin + rand() * (rMax - rMin)
    for (const dx of [-SIZE, 0, SIZE]) for (const dy of [-SIZE, 0, SIZE]) {
      const g = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r)
      g.addColorStop(0, color.replace('A', alpha))
      g.addColorStop(1, color.replace('A', 0))
      ctx.fillStyle = g
      ctx.fillRect(x + dx - r, y + dy - r, r * 2, r * 2)
    }
  }
}

// Carne cruda con vetas de grasa. fat: 1 (magro) a 5 (muy marmoleado)
export function meatTexture(fat) {
  return canvasTexture((ctx) => {
    const rand = rng(11 + fat)
    ctx.fillStyle = '#a3261e'
    ctx.fillRect(0, 0, SIZE, SIZE)
    blobs(ctx, rand, 60, 'rgba(96,14,12,A)', 30, 90, 0.35)
    blobs(ctx, rand, 60, 'rgba(206,70,56,A)', 20, 70, 0.3)
    // fibra
    ctx.strokeStyle = 'rgba(70,8,8,0.16)'
    ctx.lineWidth = 1
    for (let i = 0; i < 260; i++) {
      const x = 20 + rand() * (SIZE - 120), y = rand() * SIZE, l = 30 + rand() * 60
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + l / 2, y + (rand() - 0.5) * 6, x + l, y); ctx.stroke()
    }
    // vetas de grasa
    const veins = [5, 26, 70, 130, 210][fat - 1]
    ctx.lineCap = 'round'
    for (let i = 0; i < veins; i++) {
      let x = 16 + rand() * (SIZE - 32), y = 16 + rand() * (SIZE - 32)
      ctx.strokeStyle = `rgba(246,231,208,${0.55 + rand() * 0.4})`
      ctx.lineWidth = 0.7 + rand() * 1.8
      ctx.beginPath(); ctx.moveTo(x, y)
      const steps = 2 + Math.floor(rand() * 4)
      for (let s = 0; s < steps; s++) {
        x = clampEdge(x + (rand() - 0.3) * 16); y = clampEdge(y + (rand() - 0.5) * 9)
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  })
}
const clampEdge = (v) => Math.max(6, Math.min(SIZE - 6, v))

// Superficie exterior de la res: cobertura de grasa con la carne asomando
export function fatCoverTexture(fat) {
  return canvasTexture((ctx) => {
    const rand = rng(40 + fat)
    ctx.fillStyle = '#e9d3bb'
    ctx.fillRect(0, 0, SIZE, SIZE)
    // zonas grandes donde asoma el músculo: más en los cortes magros
    blobs(ctx, rand, (6 - fat) * 3 + 2, 'rgba(168,58,48,A)', 70, 150, 0.5)
    blobs(ctx, rand, 40, 'rgba(250,243,230,A)', 20, 70, 0.5)
    blobs(ctx, rand, 24, 'rgba(216,186,130,A)', 20, 60, 0.25)
    // membrana: hilos claros
    ctx.strokeStyle = 'rgba(255,250,240,0.35)'
    ctx.lineWidth = 1
    for (let i = 0; i < 120; i++) {
      const x = 20 + rand() * (SIZE - 120), y = 10 + rand() * (SIZE - 20), l = 30 + rand() * 60
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + l / 2, y + (rand() - 0.5) * 14, x + l, y + (rand() - 0.5) * 8); ctx.stroke()
    }
  })
}

// Pelaje
export function furTexture(base, dark) {
  return canvasTexture((ctx) => {
    const rand = rng(77)
    ctx.fillStyle = base
    ctx.fillRect(0, 0, SIZE, SIZE)
    ctx.lineWidth = 1
    for (let i = 0; i < 5000; i++) {
      const x = rand() * SIZE, y = rand() * SIZE
      ctx.strokeStyle = rand() > 0.5 ? dark : 'rgba(255,240,220,0.10)'
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 5 + rand() * 6, y + 3 + rand() * 4); ctx.stroke()
    }
  })
}

// Músculo a la vista: fibras marcadas y fascia blanca. Devuelve color + relieve.
export function muscleTextures(fat) {
  const col = document.createElement('canvas'), hgt = document.createElement('canvas')
  col.width = col.height = hgt.width = hgt.height = SIZE
  const c = col.getContext('2d'), h = hgt.getContext('2d')
  const rand = rng(90 + fat)
  c.fillStyle = '#ad2a20'; c.fillRect(0, 0, SIZE, SIZE)
  h.fillStyle = '#808080'; h.fillRect(0, 0, SIZE, SIZE)
  blobs(c, rand, 40, 'rgba(84,10,10,A)', 30, 100, 0.4)
  blobs(c, rand, 40, 'rgba(196,58,44,A)', 30, 90, 0.35)
  // fascia: velos blancos, más en los cortes con más cobertura
  c.save(); c.scale(1, 0.35)
  blobs(c, rand, 4 + fat * 5, 'rgba(244,232,216,A)', 40, 110, 0.55)
  c.restore()
  // fibras: líneas largas, todas en la misma dirección
  for (let i = 0; i < 1500; i++) {
    const x = rand() * SIZE, y = rand() * SIZE, l = 50 + rand() * 170, dy = (rand() - 0.5) * 5
    const light = rand() > 0.55
    c.strokeStyle = light ? `rgba(238,150,130,${0.1 + rand() * 0.22})` : `rgba(70,6,8,${0.1 + rand() * 0.22})`
    h.strokeStyle = light ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.45)'
    c.lineWidth = h.lineWidth = 0.8 + rand() * 1.6
    for (const ox of [-SIZE, 0]) for (const ctx of [c, h]) {
      ctx.beginPath(); ctx.moveTo(x + ox, y); ctx.quadraticCurveTo(x + ox + l / 2, y + dy, x + ox + l, y); ctx.stroke()
    }
  }
  // hilos de tendón
  c.strokeStyle = 'rgba(250,240,225,0.55)'
  for (let i = 0; i < 10 + fat * 12; i++) {
    const x = rand() * (SIZE - 140), y = rand() * SIZE, l = 40 + rand() * 100
    c.lineWidth = 0.6 + rand() * 1.4
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y + (rand() - 0.5) * 6, x + l, y); c.stroke()
  }
  const make = (canvas, srgb) => {
    const t = new THREE.CanvasTexture(canvas)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    if (srgb) t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    t.center.set(0.5, 0.5)
    return t
  }
  return { map: make(col, true), bump: make(hgt, false) }
}

// Tendones y hueso de las canillas
export function tendonTexture() {
  return canvasTexture((ctx) => {
    const rand = rng(5)
    ctx.fillStyle = '#eadbc6'; ctx.fillRect(0, 0, SIZE, SIZE)
    for (let i = 0; i < 500; i++) {
      const x = rand() * SIZE
      ctx.strokeStyle = rand() > 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(170,110,90,0.3)'
      ctx.lineWidth = 0.8 + rand() * 2
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (rand() - 0.5) * 10, SIZE); ctx.stroke()
    }
  })
}
