import { useState } from 'react'
import CutIllustration, { IllustrationDefs, P } from './CutIllustration.jsx'
import CutModel3D, { useModelUrl } from './CutModel3D.jsx'

// Vista del corte en la ficha:
//  - 3D: public/models/<id>.glb si existe (modelo realista); si no, la pieza 3D generada
//  - Imagen: public/cuts/<id>.jpg si existe (foto real); si no, la ilustración
export default function CutPreview({ cut }) {
  const [view, setView] = useState('3d')
  const [noPhoto, setNoPhoto] = useState(false)
  const modelUrl = useModelUrl(cut.id)

  let body, caption
  if (view === '3d') {
    body = modelUrl === undefined ? <div className="model3d" /> : <CutModel3D id={cut.id} modelUrl={modelUrl} />
    caption = modelUrl ? 'Modelo 3D · arrastrá para girar' : 'Pieza 3D generada · arrastrá para girar'
  } else if (!noPhoto) {
    body = <img src={`${import.meta.env.BASE_URL}cuts/${cut.id}.jpg`} alt={cut.name} onError={() => setNoPhoto(true)} />
    caption = 'Foto'
  } else {
    body = (
      <svg viewBox="0 0 300 190" role="img" aria-label={`Ilustración: ${cut.name}`}>
        <defs>
          <IllustrationDefs />
          <radialGradient id={`${P}board`} cx="0.5" cy="0.4" r="0.8">
            <stop offset="0" stopColor="#dcbd93" />
            <stop offset="1" stopColor="#b48b5f" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="300" height="190" rx="14" fill={`url(#${P}board)`} />
        {[22, 50, 84, 118, 150, 176].map((y, i) => (
          <path key={y} d={`M0 ${y} C80 ${y - 6 + i} 200 ${y + 6} 300 ${y - 2}`} stroke="#9c744a" strokeOpacity="0.32" fill="none" />
        ))}
        <CutIllustration cut={cut} />
      </svg>
    )
    caption = 'Ilustración'
  }

  return (
    <figure className="preview">
      {body}
      <figcaption>
        <span>{caption}</span>
        <span className="seg small">
          <button className={view === '3d' ? 'on' : ''} onClick={() => setView('3d')}>3D</button>
          <button className={view === 'img' ? 'on' : ''} onClick={() => setView('img')}>Imagen</button>
        </span>
      </figcaption>
    </figure>
  )
}
