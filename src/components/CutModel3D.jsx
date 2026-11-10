import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { getCow } from '../three/cowBuilder.js'
import { makeCutMaterials } from '../three/materials.js'

// Busca public/models/<id>.glb. Devuelve la URL si existe, null si no, undefined mientras busca.
export function useModelUrl(id) {
  const [url, setUrl] = useState(undefined)
  useEffect(() => {
    let alive = true
    const candidate = `${import.meta.env.BASE_URL}models/${id}.glb`
    setUrl(undefined)
    fetch(candidate, { method: 'HEAD' })
      .then((r) => r.ok && !(r.headers.get('content-type') || '').includes('text/html'))
      .catch(() => false)
      .then((ok) => alive && setUrl(ok ? candidate : null))
    return () => { alive = false }
  }, [id])
  return url
}

// Luz ambiente de estudio generada por código (sin descargar nada): da reflejos y evita modelos oscuros
function StudioLight() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    return () => { scene.environment = null; env.dispose(); pmrem.dispose() }
  }, [gl, scene])
  return null
}

// Centra el contenido y lo lleva a un tamaño fijo. layFlat: apoya la pieza sobre su cara más grande.
function Fitted({ children, layFlat, paused }) {
  const outer = useRef(), inner = useRef()
  // gira sola; se detiene mientras la persona la mueve
  useFrame((_, dt) => { if (!paused.current) outer.current.rotation.y += dt * 0.45 })
  useLayoutEffect(() => {
    const o = outer.current, g = inner.current
    o.scale.setScalar(1); g.rotation.set(0, 0, 0); g.position.set(0, 0, 0)
    o.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(g)
    const size = box.getSize(new THREE.Vector3())
    if (layFlat) {
      if (size.x <= size.y && size.x <= size.z) g.rotation.z = Math.PI / 2
      else if (size.z <= size.x && size.z <= size.y) g.rotation.x = -Math.PI / 2
      o.updateMatrixWorld(true)
      box.setFromObject(g)
      box.getSize(size)
    }
    g.position.sub(box.getCenter(new THREE.Vector3()))
    o.scale.setScalar(2.3 / Math.max(size.x, size.y, size.z))
  })
  return <group ref={outer}><group ref={inner}>{children}</group></group>
}

// Modelo realista (escaneado o generado a partir de una foto)
function ScannedModel({ url }) {
  const { scene } = useGLTF(url, false)
  useMemo(() => {
    scene.traverse((o) => {
      if (o.isMesh && o.material) { o.material.metalness = 0; o.material.roughness = 0.55 }
    })
  }, [scene])
  return <primitive object={scene} />
}

// Pieza generada por código: la misma que forma parte de la vaca
function GeneratedPiece({ id }) {
  const pieces = useMemo(() => getCow().pieces.filter((p) => p.id === id && p.side >= 0), [id])
  const mats = useMemo(() => makeCutMaterials(id), [id])
  return pieces.map((p, i) => (
    <mesh key={i} geometry={p.geometry} material={p.hasOuter ? [mats.outer, mats.meat] : mats.meat} />
  ))
}

export default function CutModel3D({ id, modelUrl }) {
  const paused = useRef(false)
  return (
    <div className="model3d">
      <Canvas camera={{ position: [2.4, 2.5, 3.4], fov: 30 }} dpr={[1, 2]}>
        <StudioLight />
        <hemisphereLight args={['#fff6e8', '#b08a70', 0.7]} />
        <directionalLight position={[3, 6, 5]} intensity={1.6} />
        <Suspense fallback={null}>
          <Fitted key={id + (modelUrl || '')} layFlat={!!modelUrl} paused={paused}>
            {modelUrl ? <ScannedModel url={modelUrl} /> : <GeneratedPiece id={id} />}
          </Fitted>
        </Suspense>
        <OrbitControls makeDefault enablePan={false} minDistance={2.5} maxDistance={9} onStart={() => { paused.current = true }} onEnd={() => { paused.current = false }} />
      </Canvas>
    </div>
  )
}
