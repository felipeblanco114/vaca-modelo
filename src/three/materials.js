// Materiales de cada corte, compartidos por la vaca 3D y por la pieza 3D de la ficha.
import * as THREE from 'three'
import { meatTexture, muscleTextures } from './textures.js'
import { CUTS_BY_ID } from '../data/cuts.js'

// dirección de la fibra de cada músculo, en grados
const FIBER = {
  aguja: 20, bife_ancho: 0, bife_angosto: 0, cuadril: -30, nalga: -60, paleta: 60, pecho: 30, tapa_asado: 80,
  colita: 20, peceto: -70, cuadrada: -80, bola_lomo: -50, asado: 75, falda: 80, matambre: 10, vacio: 40,
}
const ORGAN_COLORS = { rinon: '#74241d', mollejas: '#ecc9b8', chinchulines: '#e2c39a', lengua: '#d89a98' }

export const rotated = (tex, deg) => {
  const t = tex.clone()
  t.rotation = (deg * Math.PI) / 180
  t.needsUpdate = true
  return t
}

// las texturas se generan una sola vez por nivel de grasa
const cache = { meat: {}, muscle: {} }
const meatTex = (fat) => (cache.meat[fat] ??= meatTexture(fat))
export const muscleTex = (fat) => (cache.muscle[fat] ??= muscleTextures(fat))

// meat: caras de corte e interior · outer: superficie exterior con la fibra orientada
export function makeCutMaterials(id) {
  const fat = CUTS_BY_ID[id].fat
  const meat = ORGAN_COLORS[id]
    ? new THREE.MeshStandardMaterial({ color: ORGAN_COLORS[id], roughness: 0.45 })
    : new THREE.MeshStandardMaterial({ map: meatTex(fat), roughness: 0.42, side: THREE.DoubleSide })
  const m = muscleTex(fat), deg = FIBER[id] ?? 0
  const outer = new THREE.MeshPhysicalMaterial({
    map: rotated(m.map, deg), bumpMap: rotated(m.bump, deg), bumpScale: 1.1,
    roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.35,
  })
  return { meat, outer }
}
