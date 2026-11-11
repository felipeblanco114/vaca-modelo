// Carga un modelo 3D realista de la vaca (public/models/cow.glb) y lo parte en cortes.
//
// El modelo llega como una sola superficie. Para separarlo:
//  1. se detecta cómo está orientado (largo, alto, ancho, dónde está la cabeza y dónde el piso)
//  2. se lo lleva a las coordenadas del póster usando las patas como referencia
//  3. cada triángulo se asigna al corte cuyo polígono (vista lateral) contiene su centro
// Los cortes internos (lomo, entraña, achuras) no existen en el modelo: se usan los generados.

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { BODY_CUTS, P3, BODY_CENTER, getCow } from './cowBuilder.js'

const FRONT_LEG_X = 285, HIND_LEG_X = 675, GROUND_Y = 452, BACK_Y = 108
const INTERNAL = ['lomo', 'entrana', 'rinon', 'mollejas', 'chinchulines']
const SUBDIVISIONS = 2 // más divisiones = bordes de corte más prolijos

// polígonos visibles desde afuera; el matambre va primero porque cubre a la falda y al vacío
const OUTER = Object.entries(BODY_CUTS)
  .flatMap(([id, parts]) => parts.filter((p) => (p.d ? p.d[1] : 1) >= 1).map((p) => ({
    id, pts: p.p.trim().split(/\s+/).map((s) => s.split(',').map(Number)),
  })))
  .sort((a, b) => (b.id === 'matambre') - (a.id === 'matambre'))

function inside(pts, x, y) {
  let c = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}

// x, y: coordenadas del póster (y ya normalizada para la asignación)
function cutAt(x, y) {
  if (x < 150 && y < 250 && x < 118) return 'resto' // cabeza
  if (x > 731) return 'rabo'
  if (y > 338) {
    if (Math.abs(x - FRONT_LEG_X) < 48) return y < 396 ? 'osobuco' : 'resto'
    if (Math.abs(x - HIND_LEG_X) < 52) return y < 396 ? 'tortuguita' : 'resto'
  }
  for (const { id, pts } of OUTER) if (inside(pts, x, y)) return id
  return 'resto'
}

export async function loadScanCow(url) {
  const gltf = await new GLTFLoader().loadAsync(url)
  gltf.scene.updateMatrixWorld(true)
  let source = null
  const P = [], U = [], N = []
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return
    source ??= o.material
    let g = o.geometry.clone().applyMatrix4(o.matrixWorld)
    g.computeVertexNormals() // normales suaves antes de separar
    g = g.index ? g.toNonIndexed() : g
    P.push(...g.attributes.position.array); N.push(...g.attributes.normal.array)
    U.push(...(g.attributes.uv ? g.attributes.uv.array : new Array((g.attributes.position.count) * 2).fill(0)))
  })
  const count = P.length / 3

  /* 1. orientación */
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < count; i++) for (let a = 0; a < 3; a++) {
    min[a] = Math.min(min[a], P[i * 3 + a]); max[a] = Math.max(max[a], P[i * 3 + a])
  }
  const size = [0, 1, 2].map((a) => max[a] - min[a])
  const L = size.indexOf(Math.max(...size)), W = size.indexOf(Math.min(...size)), H = 3 - L - W
  // el piso es el extremo donde la vaca ocupa menos largo (solo las patas)
  const occupied = (from, to) => {
    const bins = new Set()
    for (let i = 0; i < count; i++) {
      const h = (P[i * 3 + H] - min[H]) / size[H]
      if (h >= from && h <= to) bins.add(Math.floor(((P[i * 3 + L] - min[L]) / size[L]) * 24))
    }
    return bins.size
  }
  const up = occupied(0, 0.12) <= occupied(0.88, 1) ? 1 : -1
  const height = (i) => (up > 0 ? P[i * 3 + H] - min[H] : max[H] - P[i * 3 + H])
  // patas: lo que toca el piso. La cabeza está del lado que más sobresale de las patas.
  const feet = []
  for (let i = 0; i < count; i++) if (height(i) < size[H] * 0.1) feet.push(P[i * 3 + L])
  const fMin = Math.min(...feet), fMax = Math.max(...feet), fMid = (fMin + fMax) / 2
  const headLow = fMin - min[L] > max[L] - fMax // ¿la cabeza está en el extremo bajo del eje?
  const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
  const lowLeg = mean(feet.filter((v) => v < fMid)), highLeg = mean(feet.filter((v) => v >= fMid))
  const front = headLow ? lowLeg : highLeg, hind = headLow ? highLeg : lowLeg
  const dirL = headLow ? 1 : -1

  /* 2. a coordenadas del póster */
  const s = (HIND_LEG_X - FRONT_LEG_X) / Math.abs(hind - front)
  let backH = 0
  for (let i = 0; i < count; i++) {
    const l = P[i * 3 + L]
    if (l > Math.min(front, hind) && l < Math.max(front, hind)) backH = Math.max(backH, height(i))
  }
  const yFit = (GROUND_Y - BACK_Y) / backH
  // se elige el signo del ancho para no espejar el modelo
  const e = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  e[0][L] = dirL; e[1][H] = up; e[2][W] = 1
  const det = new THREE.Matrix3().set(...e[0], ...e[1], ...e[2]).determinant()
  const dirW = det > 0 ? 1 : -1
  const wMid = (min[W] + max[W]) / 2

  // vértice → { p: posición en póster [x, y, z], ya: y para asignar, n: normal en mundo, uv }
  const vert = (i) => ({
    p: [FRONT_LEG_X + (P[i * 3 + L] - front) * dirL * s, GROUND_Y - height(i) * s, (P[i * 3 + W] - wMid) * dirW * s],
    ya: GROUND_Y - height(i) * yFit,
    n: [N[i * 3 + L] * dirL, N[i * 3 + H] * up, N[i * 3 + W] * dirW],
    uv: [U[i * 2], U[i * 2 + 1]],
  })
  const mid = (a, b) => ({
    p: a.p.map((v, k) => (v + b.p[k]) / 2), ya: (a.ya + b.ya) / 2,
    n: a.n.map((v, k) => v + b.n[k]), uv: a.uv.map((v, k) => (v + b.uv[k]) / 2),
  })
  let tris = []
  for (let i = 0; i < count; i += 3) tris.push([vert(i), vert(i + 1), vert(i + 2)])
  for (let k = 0; k < SUBDIVISIONS; k++) {
    tris = tris.flatMap(([a, b, c]) => {
      const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a)
      return [[a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]]
    })
  }

  /* 3. asignar cada triángulo a un corte y a un lado */
  const groups = new Map()
  for (const t of tris) {
    const cx = (t[0].p[0] + t[1].p[0] + t[2].p[0]) / 3, cy = (t[0].ya + t[1].ya + t[2].ya) / 3
    const cz = t[0].p[2] + t[1].p[2] + t[2].p[2]
    const id = cutAt(cx, cy)
    const key = id === 'resto' ? 'resto' : `${id}|${cz >= 0 ? 1 : -1}`
    if (!groups.has(key)) groups.set(key, { pos: [], nor: [], uv: [] })
    const g = groups.get(key)
    for (const v of t) {
      g.pos.push(...P3(...v.p))
      const l = Math.hypot(...v.n) || 1
      g.nor.push(v.n[0] / l, v.n[1] / l, v.n[2] / l)
      g.uv.push(...v.uv)
    }
  }
  const toGeometry = ({ pos, nor, uv }) => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
    g.computeBoundingBox()
    return g
  }

  const pieces = [], rest = []
  for (const [key, data] of groups) {
    const geometry = toGeometry(data)
    if (key === 'resto') { rest.push({ geometry }); continue }
    const [id, side] = key.split('|')
    const center = geometry.boundingBox.getCenter(new THREE.Vector3())
    pieces.push({ id, side: +side, kind: 'scan', geometry, hasOuter: false, center, dir: center.clone().sub(BODY_CENTER) })
  }
  // cortes internos: los generados por código, ajustados al alto y ancho de este modelo
  let halfW = 0, xMin = Infinity, xMax = -Infinity, yMin = Infinity
  for (const t of tris) for (const v of t) {
    halfW = Math.max(halfW, Math.abs(v.p[2]))
    xMin = Math.min(xMin, v.p[0]); xMax = Math.max(xMax, v.p[0]); yMin = Math.min(yMin, v.p[1])
  }
  const fitY = s / yFit, fitZ = Math.min(1, (halfW / 86) * 0.9)
  for (const p of getCow().pieces.filter((q) => INTERNAL.includes(q.id))) {
    const geometry = p.geometry.clone().scale(1, fitY, fitZ)
    geometry.computeBoundingBox()
    const center = geometry.boundingBox.getCenter(new THREE.Vector3())
    pieces.push({ ...p, geometry, center, internal: true, dir: center.clone().sub(BODY_CENTER) })
  }
  // encuadre: dónde mirar y cuánto alejarse para que entre el modelo completo
  const view = {
    target: P3((xMin + xMax) / 2, (GROUND_Y + yMin) / 2 + 20, 0),
    zoom: Math.max((xMax - xMin) / 640, (GROUND_Y - yMin) / 330),
  }

  const scanMaterial = new THREE.MeshStandardMaterial({
    map: source?.map ?? null, color: source?.map ? '#ffffff' : '#a3261e', roughness: 0.55, metalness: 0, side: THREE.DoubleSide,
  })
  return { pieces, rest, scanMaterial, view, fur: [], bare: [], head: { fur: [], bare: [] } }
}
