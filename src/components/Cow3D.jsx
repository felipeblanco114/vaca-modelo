import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, ContactShadows } from '@react-three/drei'
import { getCow } from '../three/cowBuilder.js'
import { tendonTexture, furTexture } from '../three/textures.js'
import { makeCutMaterials, muscleTex, rotated } from '../three/materials.js'
import { CUTS_BY_ID } from '../data/cuts.js'

const EXPLODE_K = 0.8 // cuánto se alejan las piezas con el control al máximo
const TARGET = [-0.45, 2.0, 0]
function CutMesh({ piece, material, explode, hidden, ghost, onSelect, onHover }) {
  const ref = useRef()
  const target = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    target.copy(piece.dir).multiplyScalar(explode * EXPLODE_K)
    ref.current.position.lerp(target, 0.16)
  })
  return (
    <mesh
      ref={ref}
      geometry={piece.geometry}
      material={material}
      visible={!hidden}
      renderOrder={ghost ? 2 : 0}
      onClick={(e) => {
        if (hidden || ghost) return // deja pasar el toque a lo que está detrás
        e.stopPropagation()
        if (e.delta < 6) onSelect(piece.id)
      }}
      onPointerOver={(e) => { if (!hidden && !ghost) { e.stopPropagation(); onHover(piece.id) } }}
      onPointerOut={() => onHover(null)}
    />
  )
}

// Aleja la cámara en pantallas angostas para que la vaca entre completa
const CAM_DIR = new THREE.Vector3(-4.2, 1.7, 10.2)
function FitCamera({ controlsRef }) {
  const { camera, size } = useThree()
  useEffect(() => {
    const k = Math.max(1, 1.35 / (size.width / size.height))
    camera.position.set(...TARGET).addScaledVector(CAM_DIR, k)
    camera.lookAt(...TARGET)
    controlsRef.current?.update()
    controlsRef.current?.saveState()
  }, [camera, size.width, size.height, controlsRef])
  return null
}

function Scene({ cow, selected, onSelect, filter, mode, explode, isolate, hiddenIds, controlsRef }) {
  const [hovered, setHovered] = useState(null)

  // un juego de materiales por corte, para poder resaltar o atenuar cada uno
  const mats = useMemo(() => {
    const out = {}
    for (const id of new Set(cow.pieces.map((p) => p.id))) out[id] = makeCutMaterials(id)
    return out
  }, [cow])

  const hideMats = useMemo(() => ({
    brown: new THREE.MeshStandardMaterial({ map: furTexture('#7d3d23', 'rgba(50,20,8,0.22)'), roughness: 0.9 }),
    white: new THREE.MeshStandardMaterial({ map: furTexture('#ebe2d5', 'rgba(120,100,80,0.14)'), roughness: 0.9 }),
  }), [])
  // materiales que no se vuelven transparentes: cabeza, pezuñas y lo que queda sin cuero
  const solidMats = useMemo(() => {
    const m = muscleTex(2)
    return {
      brown: hideMats.brown.clone(), white: hideMats.white.clone(),
      dark: new THREE.MeshStandardMaterial({ color: '#241814', roughness: 0.5 }),
      pink: new THREE.MeshStandardMaterial({ color: '#dfb1a6', roughness: 0.6 }),
      muscle: new THREE.MeshPhysicalMaterial({ map: rotated(m.map, 50), bumpMap: rotated(m.bump, 50), bumpScale: 1.6, roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.35 }),
      tendon: new THREE.MeshStandardMaterial({ map: tendonTexture(), roughness: 0.5 }),
    }
  }, [hideMats])

  const isGhost = (id) =>
    (isolate && id !== selected) || (filter && !CUTS_BY_ID[id].methods.includes(filter) && id !== selected)

  useEffect(() => {
    for (const [id, pair] of Object.entries(mats)) {
      const ghost = isGhost(id)
      const glow = id === selected ? 0.5 : id === hovered ? 0.2 : 0
      for (const m of Object.values(pair)) {
        m.emissive.set(glow ? '#ff4a26' : '#000000')
        m.emissiveIntensity = glow
        if (m.transparent !== ghost) { m.transparent = ghost; m.needsUpdate = true }
        m.opacity = ghost ? 0.07 : 1
        m.depthWrite = !ghost
      }
    }
  }, [mats, selected, hovered, filter, isolate])

  useEffect(() => {
    const see = mode === 'trans'
    for (const m of Object.values(hideMats)) {
      if (m.transparent !== see) { m.transparent = see; m.needsUpdate = true }
      m.opacity = see ? 0.3 : 1
      m.depthWrite = !see
    }
  }, [hideMats, mode])

  useEffect(() => { document.body.style.cursor = hovered ? 'pointer' : ''; return () => { document.body.style.cursor = '' } }, [hovered])

  const labelPiece = cow.pieces.find((p) => p.id === selected && p.side >= 0)
  const labelPos = labelPiece && labelPiece.center.clone().add(labelPiece.dir.clone().multiplyScalar(explode * EXPLODE_K))

  return (
    <>
      <hemisphereLight args={['#fff6e8', '#b08a70', 1.5]} />
      <directionalLight position={[-3, 7, 8]} intensity={2.3} />
      <directionalLight position={[5, 4, -7]} intensity={1.1} />

      {cow.pieces.map((p, i) => (
        <CutMesh
          key={i}
          piece={p}
          material={p.hasOuter ? [mats[p.id].outer, mats[p.id].meat] : mats[p.id].meat}
          explode={explode}
          hidden={hiddenIds.has(p.id)}
          ghost={isGhost(p.id)}
          onSelect={onSelect}
          onHover={setHovered}
        />
      ))}

      {/* cuero: no intercepta los toques, así se puede tocar la vaca y ver qué corte hay debajo */}
      <group visible={mode !== 'carne'}>
        {cow.fur.map((h, i) => (
          <mesh key={i} geometry={h.geometry} material={h.mat === 'dark' ? solidMats.dark : hideMats[h.mat]} raycast={() => null} renderOrder={3} />
        ))}
      </group>
      {/* lo que queda al sacar el cuero: canillas con tendones y pezuñas */}
      <group visible={mode !== 'cuero'}>
        {cow.bare.map((h, i) => <mesh key={i} geometry={h.geometry} material={solidMats[h.mat]} raycast={() => null} />)}
      </group>
      {(mode === 'cuero' ? cow.head.fur : cow.head.bare).map((h, i) => (
        <mesh key={i} geometry={h.geometry} material={solidMats[h.mat]} onClick={(e) => { e.stopPropagation(); if (e.delta < 6) onSelect('lengua') }} />
      ))}

      {labelPos && !hiddenIds.has(selected) && (
        <Html position={labelPos} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <div className="label3d">{CUTS_BY_ID[selected].name}</div>
        </Html>
      )}

      <FitCamera controlsRef={controlsRef} />
      <ContactShadows position={[0, -0.02, 0]} scale={12} blur={2.4} opacity={0.35} far={4} />
      <OrbitControls ref={controlsRef} makeDefault target={TARGET} minDistance={2.5} maxDistance={30} maxPolarAngle={Math.PI * 0.62} />
    </>
  )
}

export default function Cow3D({ selected, onSelect, filter }) {
  const cow = useMemo(() => getCow(), [])
  const [mode, setMode] = useState('carne') // cuero | trans | carne
  const [explode, setExplode] = useState(0)
  const [isolate, setIsolate] = useState(false)
  const [hiddenIds, setHiddenIds] = useState(() => new Set())
  const controlsRef = useRef()

  const onExplode = (v) => {
    setExplode(v)
    if (v > 0.02 && mode === 'cuero') setMode('carne')
  }
  const hideSelected = () => setHiddenIds((s) => new Set(s).add(selected))
  const showAll = () => { setHiddenIds(new Set()); setIsolate(false); setExplode(0) }
  // elegir un corte desde la lista lo vuelve a mostrar si estaba oculto
  useEffect(() => {
    setHiddenIds((s) => { if (!s.has(selected)) return s; const n = new Set(s); n.delete(selected); return n })
  }, [selected])

  return (
    <div className="cow3d">
      <div className="canvas-wrap">
        <Canvas camera={{ position: [-4.6, 3.9, 12.5], fov: 32 }} dpr={[1, 2]}>
          <Scene
            cow={cow} selected={selected} onSelect={onSelect} filter={filter}
            mode={mode} explode={explode} isolate={isolate} hiddenIds={hiddenIds} controlsRef={controlsRef}
          />
        </Canvas>
        <button className="recenter" onClick={() => controlsRef.current?.reset()} aria-label="Centrar vista">⟲ Centrar</button>
        <div className="hint3d">Arrastrá para girar · rueda o pellizco para acercar · tocá un corte</div>
      </div>

      <div className="controls3d">
        <div className="ctl">
          <span>Cuero</span>
          <div className="seg">
            {[['cuero', 'Con cuero'], ['trans', 'Transparente'], ['carne', 'Sin cuero']].map(([k, v]) => (
              <button key={k} className={mode === k ? 'on' : ''} onClick={() => setMode(k)}>{v}</button>
            ))}
          </div>
        </div>
        <label className="ctl grow">
          <span>Separar cortes</span>
          <input type="range" min="0" max="1" step="0.01" value={explode} onChange={(e) => onExplode(+e.target.value)} />
        </label>
        <div className="ctl">
          <span>Corte elegido</span>
          <div className="btns">
            <button className={'chip' + (isolate ? ' on' : '')} onClick={() => { setIsolate((v) => !v); if (mode === 'cuero') setMode('carne') }}>Aislar</button>
            <button className="chip" onClick={hideSelected}>Ocultar</button>
            <button className="chip" onClick={showAll}>Mostrar todo</button>
          </div>
        </div>
      </div>
    </div>
  )
}
