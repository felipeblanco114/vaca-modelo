// Construye la vaca 3D por código.
// Cada corte es una pieza sólida independiente (una por cada media res), así se puede
// seleccionar, aislar, ocultar y separar.
//
// Cómo funciona: los cortes se definen en vista lateral (x, y) con las mismas coordenadas
// del póster 2D, y se les da volumen con el perfil del cuerpo:
//   - top(x) / bottom(x): línea del lomo y de la panza
//   - halfWidth(x): medio ancho del animal en cada punto
//   - d0..d1: profundidad de la pieza (0 = plano medio / columna, 1 = superficie exterior)
// Con d0/d1 se logran cortes internos (lomo, entraña) y capas externas (matambre).
//
// Para pasar a un modelo hecho en Blender: exportar un .glb con un mesh por corte, nombrado
// con el id del corte, y reemplazar buildCow() por la carga de ese archivo.

import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export const S = 0.01 // escala: unidades del póster → unidades 3D
const CX = 450
const GROUND = 452
export const P3 = (x, y, z = 0) => [(x - CX) * S, (GROUND - y) * S, z * S]
export const BODY_CENTER = new THREE.Vector3(...P3(450, 232, 0))

/* ---------- perfil del cuerpo ---------- */
function curve(keys) {
  const n = keys.length
  const m = keys.map((k, i) => {
    const a = keys[Math.max(0, i - 1)], b = keys[Math.min(n - 1, i + 1)]
    return (b[1] - a[1]) / (b[0] - a[0])
  })
  return (x) => {
    if (x <= keys[0][0]) return keys[0][1]
    if (x >= keys[n - 1][0]) return keys[n - 1][1]
    let i = 0
    while (x > keys[i + 1][0]) i++
    const [x0, y0] = keys[i], [x1, y1] = keys[i + 1]
    const h = x1 - x0, t = (x - x0) / h, t2 = t * t, t3 = t2 * t
    return (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * h * m[i + 1]
  }
}

const X0 = 120, X1 = 726
// línea superior: nuca, cruz, lomo, anca · línea inferior: papada, pecho, panza, verija
const top = curve([[120, 172], [150, 160], [195, 148], [235, 128], [262, 110], [300, 113], [380, 116], [470, 114], [540, 110], [600, 104], [650, 106], [690, 116], [714, 140], [726, 178]])
const bottom = curve([[120, 214], [145, 232], [172, 262], [196, 300], [225, 326], [262, 338], [318, 346], [400, 354], [480, 354], [545, 344], [600, 330], [660, 322], [700, 296], [726, 224]])
const halfWidth = curve([[120, 20], [150, 27], [190, 40], [240, 62], [300, 74], [420, 86], [520, 84], [590, 76], [650, 80], [700, 60], [726, 24]])

// masas musculares y huecos: [x, y, radio, cuánto sobresale]
const BUMPS = [
  [258, 222, 62, 0.11], // paleta
  [206, 205, 44, 0.05], // base del cuello
  [652, 238, 76, 0.13], // cuarto trasero
  [575, 194, 44, -0.08], // hueco del ijar
  [400, 272, 120, 0.05], // costillar
  [628, 128, 34, 0.06], // punta de cadera
]

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const clampToBody = ([x, y]) => {
  const cx = clamp(x, X0, X1)
  return [cx, clamp(y, top(cx), bottom(cx))]
}
// medio ancho del cuerpo en el punto (x, y) de la vista lateral
function zMax(x, y) {
  const t = top(x), b = bottom(x)
  const k = clamp((y - (t + b) / 2) / ((b - t) / 2), -1, 1)
  let w = halfWidth(x) * Math.pow(1 - Math.pow(Math.abs(k), 2.3), 1 / 2.3)
  if (k < 0) w *= 1 - 0.2 * Math.pow(-k, 1.6) // el lomo es más angosto que la panza
  let m = 1
  for (const [bx, by, r, amp] of BUMPS) m += amp * Math.exp(-((x - bx) ** 2 + (y - by) ** 2) / (r * r))
  return w * m
}

/* ---------- generador de piezas ---------- */
function makeGeometry(pos, uv, index) {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(index)
  g.computeVertexNormals()
  return g
}

// Devuelve { outer: [geoms], inner: [geoms] } para un polígono con profundidad d0..d1
function buildPart(pointsStr, d0, d1, side, { inset = 1.5, maxLevels = 4 } = {}) {
  let pts = pointsStr.trim().split(/\s+/).map((s) => s.split(',').map(Number))
  const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length
  const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length
  if (inset) {
    pts = pts.map(([x, y]) => {
      const dx = cx - x, dy = cy - y, l = Math.hypot(dx, dy) || 1
      return [x + (dx / l) * inset, y + (dy / l) * inset]
    })
  }
  const verts = pts.map((p) => [...p])
  let tris = THREE.ShapeUtils.triangulateShape(pts.map((p) => new THREE.Vector2(p[0], p[1])), [])

  // subdividir para que la superficie curva quede suave
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1])
  const maxDim = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))
  const levels = clamp(Math.round(Math.log2(maxDim / 6)), 2, maxLevels)
  for (let l = 0; l < levels; l++) {
    const cache = new Map()
    const mid = (a, b) => {
      const key = a < b ? `${a}_${b}` : `${b}_${a}`
      if (!cache.has(key)) {
        verts.push([(verts[a][0] + verts[b][0]) / 2, (verts[a][1] + verts[b][1]) / 2])
        cache.set(key, verts.length - 1)
      }
      return cache.get(key)
    }
    const next = []
    for (const [a, b, c] of tris) {
      const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a)
      next.push([a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca])
    }
    tris = next
  }

  // orientar: la cara exterior mira hacia afuera (±z según el lado)
  tris = tris.map(([a, b, c]) => {
    const A = verts[a], B = verts[b], C = verts[c]
    const area = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])
    return area * side > 0 ? [a, c, b] : [a, b, c]
  })

  const cl = verts.map(clampToBody)
  const zs = cl.map(([x, y]) => zMax(x, y))
  // cada pieza exterior se hunde en los bordes y se abomba al centro, como un músculo
  const EDGE = 0.94
  const puff = verts.map(([x, y]) => {
    if (d1 < 1 || !inset) return 1
    let dist = Infinity
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]
      const vx = bx - ax, vy = by - ay
      const t = clamp(((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy), 0, 1)
      dist = Math.min(dist, Math.hypot(x - ax - vx * t, y - ay - vy * t))
    }
    const f = clamp(dist / 16, 0, 1)
    return EDGE + (1.03 - EDGE) * f * f * (3 - 2 * f)
  })
  const wallTop = d1 >= 1 && inset ? d1 * EDGE : d1
  const surface = (d, flip, puffed) => {
    const pos = [], uv = []
    cl.forEach(([x, y], i) => { pos.push(...P3(x, y, side * zs[i] * d * (puffed ? puff[i] : 1))); uv.push(x / 160, y / 160) })
    return makeGeometry(pos, uv, tris.flatMap(([a, b, c]) => (flip ? [a, c, b] : [a, b, c])))
  }

  // paredes: bordes que pertenecen a un solo triángulo
  const edges = new Map()
  for (const [a, b, c] of tris) {
    for (const [p, q] of [[a, b], [b, c], [c, a]]) {
      const key = p < q ? `${p}_${q}` : `${q}_${p}`
      edges.set(key, edges.has(key) ? null : [p, q])
    }
  }
  const wPos = [], wUv = [], wIdx = [], map = new Map()
  const wv = (i) => {
    if (!map.has(i)) {
      const [x, y] = cl[i]
      map.set(i, wPos.length / 3)
      wPos.push(...P3(x, y, side * zs[i] * wallTop), ...P3(x, y, side * zs[i] * d0))
      wUv.push((x + y) / 160, (zs[i] * d1) / 160, (x + y) / 160, (zs[i] * d0) / 160)
    }
    return map.get(i)
  }
  for (const e of edges.values()) {
    if (!e) continue
    const aT = wv(e[0]), bT = wv(e[1]), aB = aT + 1, bB = bT + 1
    wIdx.push(aT, aB, bB, aT, bB, bT)
  }

  const topGeom = surface(d1, false, true)
  const inner = [surface(d0, true), makeGeometry(wPos, wUv, wIdx)]
  return d1 >= 1 ? { outer: [topGeom], inner } : { outer: [], inner: [topGeom, ...inner] }
}

/* ---------- patas, cola y órganos ---------- */
// Tubo de sección elíptica que sigue el recorrido de keys: [x, y, radio en el plano, radio en z]
function limb(keys, z, seg = 22) {
  const pos = [], uv = [], idx = []
  keys.forEach(([x, y, r, rz], i) => {
    const p = keys[Math.max(0, i - 1)], q = keys[Math.min(keys.length - 1, i + 1)]
    const l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1
    const nx = -(q[1] - p[1]) / l, ny = (q[0] - p[0]) / l // perpendicular al recorrido
    for (let j = 0; j < seg; j++) {
      const a = (j / seg) * Math.PI * 2
      pos.push(...P3(x + nx * r * Math.cos(a), y + ny * r * Math.cos(a), z + rz * Math.sin(a)))
      uv.push((j / seg) * 2, (x + y) / 160)
    }
    if (i < keys.length - 1) {
      for (let j = 0; j < seg; j++) {
        const a = i * seg + j, b = i * seg + ((j + 1) % seg), c = a + seg, d = b + seg
        idx.push(a, c, b, b, c, d)
      }
    }
  })
  const first = keys[0], last = keys[keys.length - 1], n = keys.length
  const T = pos.length / 3
  pos.push(...P3(first[0], first[1], z)); uv.push(0.5, first[1] / 160)
  const B = T + 1
  pos.push(...P3(last[0], last[1], z)); uv.push(0.5, last[1] / 160)
  for (let j = 0; j < seg; j++) {
    const j2 = (j + 1) % seg
    idx.push(T, j, j2, B, (n - 1) * seg + j2, (n - 1) * seg + j)
  }
  // si quedó al revés, dar vuelta las caras
  let vol = 0
  const v = (i) => new THREE.Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2])
  for (let i = 0; i < idx.length; i += 3) vol += v(idx[i]).dot(v(idx[i + 1]).cross(v(idx[i + 2])))
  if (vol < 0) for (let i = 0; i < idx.length; i += 3) [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]]
  return makeGeometry(pos, uv, idx)
}

function blob(x, y, z, sx, sy, sz, { bumps = 0, rot = 0 } = {}) {
  const g = new THREE.IcosahedronGeometry(1, 4)
  if (bumps) {
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const X = p.getX(i), Y = p.getY(i), Z = p.getZ(i)
      const k = 1 + bumps * Math.sin(X * 7 + 1) * Math.sin(Y * 8 + 2) * Math.sin(Z * 7 + 3)
      p.setXYZ(i, X * k, Y * k, Z * k)
    }
  }
  g.scale(sx * S, sy * S, sz * S)
  if (rot) g.rotateZ(rot)
  g.translate(...P3(x, y, z))
  g.computeVertexNormals()
  return g
}

const merge = (list) => (list.length === 1 ? list[0] : mergeGeometries(list, false))

/* ---------- definición de los cortes ---------- */
// d: [d0, d1] profundidad. Sin d = pieza completa, de la columna a la superficie.
export const BODY_CUTS = {
  aguja: [{ p: '112,88 282,88 286,176 205,190 172,215 112,236' }],
  bife_ancho: [{ p: '282,88 392,88 392,185 300,185 286,176' }],
  bife_angosto: [
    { p: '392,88 512,88 512,180 410,184 392,185' },
    { p: '410,184 512,180 512,218 470,220 410,222', d: [0.54, 1] }, // tapa sobre el lomo
  ],
  cuadril: [
    { p: '512,88 627,88 632,175 560,185 512,180' },
    { p: '512,180 560,185 555,215 512,218', d: [0.54, 1] },
  ],
  nalga: [{ p: '627,88 735,88 735,182 632,175' }],
  paleta: [{ p: '172,215 205,190 286,176 300,185 305,228 308,268 230,276 182,272' }],
  pecho: [{ p: '112,236 172,215 182,272 230,276 308,268 312,300 315,365 112,365', d: [0.3, 1] }],
  tapa_asado: [{ p: '300,185 410,184 410,222 305,228' }],
  // el lomo va por dentro, pegado a la columna
  lomo: [{ p: '410,186 512,182 558,187 553,213 470,218 410,220', d: [0.06, 0.5], inset: 2.5 }],
  colita: [{ p: '560,185 632,175 640,240 600,236 555,215' }],
  peceto: [{ p: '632,175 735,182 735,247 640,240' }],
  cuadrada: [{ p: '640,240 735,247 735,320 682,322 652,300' }],
  bola_lomo: [{ p: '600,236 640,240 652,300 682,322 682,365 590,365 580,300' }],
  // el costillar es una pared: adentro queda la cavidad
  asado: [{ p: '305,228 410,222 470,220 470,295 312,300 308,268', d: [0.5, 1] }],
  falda: [{ p: '312,300 470,295 470,365 315,365', d: [0.5, 0.87] }],
  // el matambre es una lámina fina por fuera de la falda y el vacío
  matambre: [{ p: '312,300 470,295 580,300 590,365 315,365', d: [0.89, 1] }],
  vacio: [
    { p: '470,220 555,215 600,236 580,300 470,295', d: [0.5, 1] },
    { p: '470,295 580,300 590,365 470,365', d: [0.5, 0.87] },
  ],
  // la entraña (diafragma) cruza la cavidad en diagonal
  entrana: [{ p: '322,238 342,231 464,284 452,298', d: [0.1, 0.44], inset: 0 }],
}

// antebrazo (osobuco) y pierna (tortuguita / garrón)
const FRONT_LEG = [[270, 298, 37, 30], [275, 334, 31, 25], [280, 362, 21, 18], [283, 386, 16, 15]]
const HIND_LEG = [[646, 288, 50, 32], [656, 322, 39, 27], [669, 350, 24, 20], [685, 374, 16, 15]]
// rodilla / garrón, caña, nudo y pezuña
const FRONT_SHIN = [[283, 384, 16, 15], [284, 393, 18, 16], [285, 405, 14, 13], [286, 422, 10.5, 10.5], [286, 433, 11, 11], [285, 441, 14, 13], [283, 447, 12, 12]]
const HIND_SHIN = [[685, 372, 16, 15], [690, 383, 18, 15], [688, 397, 13.5, 13], [682, 419, 10.5, 10.5], [679, 433, 11, 11], [677, 441, 14, 13], [675, 447, 12, 12]]
const FRONT_HOOF = [[283, 444, 13, 12.5], [280, 454, 18, 15]]
const HIND_HOOF = [[675, 444, 13, 12.5], [672, 454, 18, 15]]
const LEG_Z = 41
const grow = (keys, g) => keys.map(([x, y, r, rz]) => [x, y, r + g, rz + g])

function tailCurve() {
  return new THREE.CatmullRomCurve3(
    [[721, 132], [739, 166], [745, 230], [744, 300], [742, 346]].map(([x, y]) => new THREE.Vector3(...P3(x, y, 0)))
  )
}

function finishPiece(id, outer, inner) {
  const hasOuter = outer.length > 0
  const geometry = hasOuter ? mergeGeometries([merge(outer), merge(inner)], true) : merge(inner)
  geometry.computeBoundingBox()
  const center = geometry.boundingBox.getCenter(new THREE.Vector3())
  return { id, geometry, hasOuter, center, dir: center.clone().sub(BODY_CENTER) }
}

export function buildCow() {
  const pieces = []

  // cortes del cuerpo, una pieza por media res
  for (const [id, parts] of Object.entries(BODY_CUTS)) {
    for (const side of [1, -1]) {
      const outer = [], inner = []
      for (const part of parts) {
        const [d0, d1] = part.d || [0, 1]
        const r = buildPart(part.p, d0, d1, side, { inset: part.inset ?? 1.5 })
        outer.push(...r.outer); inner.push(...r.inner)
      }
      pieces.push({ ...finishPiece(id, outer, inner), side })
    }
  }

  // patas
  for (const side of [1, -1]) {
    pieces.push({ ...finishPiece('osobuco', [], [limb(FRONT_LEG, side * LEG_Z)]), side })
    pieces.push({ ...finishPiece('tortuguita', [], [limb(HIND_LEG, side * (LEG_Z + 1))]), side })
    // riñones, uno por lado, debajo del lomo
    pieces.push({ ...finishPiece('rinon', [], [blob(536, 240, side * 17, 17, 11, 9, { bumps: 0.14 })]), side })
  }

  // piezas del plano medio
  pieces.push({ ...finishPiece('rabo', [], [new THREE.TubeGeometry(tailCurve(), 28, 4.6 * S, 10)]), side: 0 })
  pieces.push({ ...finishPiece('lengua', [], [blob(58, 274, 0, 10, 4.5, 8, { rot: 1.0 })]), side: 0 })
  pieces.push({
    ...finishPiece('mollejas', [], [
      blob(222, 262, 0, 11, 8, 8, { bumps: 0.12 }),
      blob(238, 272, 6, 9, 7, 7, { bumps: 0.12 }),
      blob(230, 282, -6, 8, 6, 7, { bumps: 0.12 }),
    ]),
    side: 0,
  })
  const coil = []
  for (let i = 0; i <= 64; i++) {
    const a = i * 0.85, r = 13 + 6 * Math.sin(i * 0.5)
    coil.push(new THREE.Vector3(...P3(482 + i * 1.35 + r * Math.cos(a), 300 + r * Math.sin(a) * 1.25, 20 * Math.sin(a * 0.7))))
  }
  pieces.push({
    ...finishPiece('chinchulines', [], [new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil), 260, 4.2 * S, 8)]),
    side: 0,
  })

  /* ---- fur: lo que se ve con cuero · bare: lo que queda al sacarlo (tendones, cabeza) ---- */
  const fur = [], bare = []
  for (const side of [1, -1]) {
    const r = buildPart('112,88 735,88 735,365 112,365', 0.93, 1, side, { inset: 0, maxLevels: 6 })
    const shell = merge([...r.outer, ...r.inner])
    shell.translate(-BODY_CENTER.x, -BODY_CENTER.y, 0)
    shell.scale(1.025, 1.035, 1.06)
    shell.translate(BODY_CENTER.x, BODY_CENTER.y, 0)
    fur.push({ geometry: shell, mat: 'brown' })

    const zf = side * LEG_Z, zh = side * (LEG_Z + 1)
    fur.push({ geometry: limb(grow(FRONT_LEG, 2.5), zf), mat: 'brown' })
    fur.push({ geometry: limb(grow(HIND_LEG, 2.5), zh), mat: 'brown' })
    fur.push({ geometry: limb(grow(FRONT_SHIN, 1.5), zf), mat: 'white' })
    fur.push({ geometry: limb(grow(HIND_SHIN, 1.5), zh), mat: 'white' })
    bare.push({ geometry: limb(FRONT_SHIN, zf), mat: 'tendon' })
    bare.push({ geometry: limb(HIND_SHIN, zh), mat: 'tendon' })
    for (const [keys, z] of [[FRONT_HOOF, zf], [HIND_HOOF, zh]]) {
      const hoof = { geometry: limb(keys, z), mat: 'dark' }
      fur.push(hoof); bare.push(hoof)
    }
  }
  fur.push({ geometry: new THREE.TubeGeometry(tailCurve(), 28, 5.8 * S, 10), mat: 'brown' })
  fur.push({ geometry: blob(742, 372, 0, 8, 22, 8), mat: 'white' })

  /* ---- cabeza ---- */
  const skull = limb([[142, 152, 26, 28], [128, 164, 34, 33], [112, 182, 35, 32], [96, 206, 29, 26], [80, 230, 23, 21], [66, 250, 23, 23], [58, 262, 15, 18]], 0, 26)
  const headParts = [
    { geometry: skull, fur: 'white', bare: 'muscle' },
    { geometry: blob(61, 258, 0, 15, 13, 19.5, { rot: 1.0 }), fur: 'pink', bare: 'pink' },
    { geometry: blob(140, 150, 0, 22, 14, 30, { rot: 0.7 }), fur: 'brown', bare: 'muscle' }, // nuca
    ...[1, -1].flatMap((s) => [
      { geometry: blob(150, 150, s * 44, 21, 7, 12, { rot: s * 0.25 }), fur: 'brown', bare: 'muscle' }, // orejas
      { geometry: blob(108, 180, s * 30.5, 5, 5, 3), fur: 'dark', bare: 'dark' }, // ojos
      { geometry: blob(54, 256, s * 9, 3.2, 4.5, 3), fur: 'dark', bare: 'dark' }, // ollares
      { geometry: blob(92, 222, s * 22, 20, 15, 9, { rot: 1.0 }), fur: 'white', bare: 'muscle' }, // carrillo
    ]),
  ]
  const head = { fur: headParts.map((h) => ({ geometry: h.geometry, mat: h.fur })), bare: headParts.map((h) => ({ geometry: h.geometry, mat: h.bare })) }

  return { pieces, fur, bare, head }
}

// la vaca se arma una sola vez y la comparten el visor y las fichas
let cached
export const getCow = () => (cached ??= buildCow())
