import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Bounds, Center, useGLTF } from '@react-three/drei'
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

// Modelo realista (escaneado o generado a partir de una foto)
function ScannedModel({ url }) {
  const { scene } = useGLTF(url, false)
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
  return (
    <div className="model3d">
      <Canvas camera={{ position: [2.2, 1.6, 3.2], fov: 32 }} dpr={[1, 2]}>
        <hemisphereLight args={['#fff6e8', '#b08a70', 1.5]} />
        <directionalLight position={[3, 6, 5]} intensity={2.2} />
        <directionalLight position={[-4, 2, -5]} intensity={1} />
        <Suspense fallback={null}>
          <Bounds key={id + (modelUrl || '')} fit clip observe margin={1.25}>
            <Center>
              {modelUrl ? <ScannedModel url={modelUrl} /> : <GeneratedPiece id={id} />}
            </Center>
          </Bounds>
        </Suspense>
        <OrbitControls makeDefault autoRotate autoRotateSpeed={1.6} enablePan={false} />
      </Canvas>
    </div>
  )
}
