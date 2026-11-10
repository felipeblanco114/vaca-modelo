import MeatDefs from './MeatDefs.jsx'
import { CUTS_BY_ID } from '../data/cuts.js'
import {
  VIEWBOX, BODY, BRISKET_WHITE, HEAD, EAR, EAR_INNER, MUZZLE, MOUTH,
  LEG_FRONT, LEG_HIND, HOOF_FRONT, HOOF_HIND, FAR_FRONT, FAR_HIND,
  TAIL, TAIL_SWITCH, CUT_SHAPES, LABELS,
} from '../data/cowGeometry.js'

const P = 'cow-' // prefijo de ids SVG

// mode: 'cuero' (vaca con pelaje, se ve la carne del corte elegido) | 'carne' (todos los cortes a la vista)
export default function CowMap({ selected, onSelect, filter, mode, showLabels }) {
  const matches = (id) => !filter || CUTS_BY_ID[id].methods.includes(filter)

  const cutProps = (id) => {
    const cut = CUTS_BY_ID[id]
    const isSel = id === selected
    const showMeat = mode === 'carne' || isSel || (filter && matches(id))
    const dim = filter && !matches(id) && mode === 'carne'
    const isTongue = id === 'lengua'
    return {
      className: 'cut' + (isSel ? ' sel' : ''),
      fill: isTongue ? `url(#${P}tongue)` : showMeat ? `url(#${P}${isSel ? 'meatSel' : 'meat'})` : 'rgba(0,0,0,0.001)',
      filter: showMeat && !isTongue ? `url(#${P}marble${cut.fat})` : undefined,
      stroke: isSel ? '#fff6e6' : showMeat ? '#f0e2cc' : 'rgba(250,236,215,0.55)',
      strokeWidth: isSel ? 3.5 : showMeat ? 2.6 : 1.4,
      strokeDasharray: showMeat ? undefined : '5 4',
      opacity: dim ? 0.3 : 1,
      tabIndex: 0,
      role: 'button',
      'aria-label': cut.name,
      'aria-pressed': isSel,
      onClick: () => onSelect(id),
      onKeyDown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(id) }
      },
    }
  }

  const renderCut = (id) => {
    const s = CUT_SHAPES[id]
    if (s.type === 'poly') return <polygon key={id} points={s.points} {...cutProps(id)} />
    if (s.type === 'path') return <path key={id} d={s.d} {...cutProps(id)} />
    const [x, y, w, h] = s.rect
    const clip = s.type === 'legFront' ? 'legFrontClip' : 'legHindClip'
    return (
      <g key={id} clipPath={`url(#${P}${clip})`}>
        <rect x={x} y={y} width={w} height={h} {...cutProps(id)} />
      </g>
    )
  }

  const bodyCuts = Object.keys(CUT_SHAPES).filter((id) => CUT_SHAPES[id].type === 'poly')

  const Leg = ({ d, hoof, transform, far }) => (
    <g transform={transform}>
      <path d={d} fill={`url(#${P}${far ? 'legFar' : 'leg'})`} filter={`url(#${P}fur)`} stroke="#2a160e" strokeWidth="2" />
      <path d={hoof} fill="#2a1d18" />
      <path d={hoof} fill={`url(#${P}hoofShine)`} />
    </g>
  )

  return (
    <svg className="cow" viewBox={VIEWBOX} role="img" aria-label="Vaca con sus cortes">
      <defs>
        <MeatDefs p={P} />
        <clipPath id={`${P}bodyClip`}><path d={BODY} /></clipPath>
        <clipPath id={`${P}legFrontClip`}><path d={LEG_FRONT} /></clipPath>
        <clipPath id={`${P}legHindClip`}><path d={LEG_HIND} /></clipPath>
        <clipPath id={`${P}headClip`}><path d={HEAD} /></clipPath>

        {/* pelaje Hereford */}
        <linearGradient id={`${P}hide`} gradientUnits="userSpaceOnUse" x1="0" y1="100" x2="0" y2="360">
          <stop offset="0" stopColor="#8d4529" />
          <stop offset="0.55" stopColor="#74361f" />
          <stop offset="1" stopColor="#552613" />
        </linearGradient>
        <linearGradient id={`${P}leg`} gradientUnits="userSpaceOnUse" x1="0" y1="290" x2="0" y2="452">
          <stop offset="0" stopColor="#5f2b17" />
          <stop offset="0.5" stopColor="#74361f" />
          <stop offset="0.6" stopColor="#ece3d6" />
          <stop offset="1" stopColor="#d9cdbb" />
        </linearGradient>
        <linearGradient id={`${P}legFar`} gradientUnits="userSpaceOnUse" x1="0" y1="290" x2="0" y2="452">
          <stop offset="0" stopColor="#3f1c0f" />
          <stop offset="0.5" stopColor="#4f2414" />
          <stop offset="0.6" stopColor="#b9ad9c" />
          <stop offset="1" stopColor="#a59885" />
        </linearGradient>
        <linearGradient id={`${P}face`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7f1e8" />
          <stop offset="1" stopColor="#ddd1c1" />
        </linearGradient>
        <linearGradient id={`${P}tongue`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3a4a2" />
          <stop offset="1" stopColor="#b8676a" />
        </linearGradient>
        <linearGradient id={`${P}hoofShine`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {/* volumen: luz arriba, sombra en la panza */}
        <linearGradient id={`${P}shade`} gradientUnits="userSpaceOnUse" x1="0" y1="100" x2="0" y2="360">
          <stop offset="0" stopColor="#fff1dd" stopOpacity="0.3" />
          <stop offset="0.28" stopColor="#fff1dd" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.34" />
        </linearGradient>
        <radialGradient id={`${P}glow`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${P}groundShadow`}>
          <stop offset="0" stopColor="#2b1a14" stopOpacity="0.28" />
          <stop offset="1" stopColor="#2b1a14" stopOpacity="0" />
        </radialGradient>
        {/* textura de pelo */}
        <filter id={`${P}fur`} x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.55 0.16" numOctaves="2" seed="4" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0 0.07  1.1 0 0 0 -0.5" result="d" />
          <feComposite in="d" in2="SourceGraphic" operator="in" result="dIn" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="dIn" /></feMerge>
        </filter>
      </defs>

      {/* sombra en el piso */}
      <ellipse cx="455" cy="452" rx="320" ry="14" fill={`url(#${P}groundShadow)`} />

      {/* patas del otro lado */}
      <Leg d={LEG_FRONT} hoof={HOOF_FRONT} transform={FAR_FRONT} far />
      <Leg d={LEG_HIND} hoof={HOOF_HIND} transform={FAR_HIND} far />

      {/* patas cercanas + sus cortes */}
      <Leg d={LEG_FRONT} hoof={HOOF_FRONT} />
      <Leg d={LEG_HIND} hoof={HOOF_HIND} />
      {renderCut('osobuco')}
      {renderCut('tortuguita')}

      {/* cuerpo con pelaje */}
      <g clipPath={`url(#${P}bodyClip)`}>
        <g filter={`url(#${P}fur)`}>
          <rect x="160" y="90" width="580" height="290" fill={`url(#${P}hide)`} />
          <path d={BRISKET_WHITE} fill="#ece3d6" />
        </g>
        {bodyCuts.map(renderCut)}
        {/* volumen sobre todo el cuerpo */}
        <g pointerEvents="none">
          <rect x="160" y="90" width="580" height="290" fill={`url(#${P}shade)`} />
          <circle cx="258" cy="205" r="115" fill={`url(#${P}glow)`} />
          <circle cx="625" cy="170" r="115" fill={`url(#${P}glow)`} />
        </g>
      </g>
      <path d={BODY} fill="none" stroke="#2a160e" strokeWidth="2.6" pointerEvents="none" />

      {/* cola */}
      {renderCut('rabo')}
      <path d={TAIL_SWITCH} fill="#ece3d6" filter={`url(#${P}fur)`} stroke="#2a160e" strokeWidth="1.5" pointerEvents="none" />
      {mode === 'cuero' && selected !== 'rabo' && !(filter && matches('rabo')) && (
        <path d={TAIL} fill="#6a311c" filter={`url(#${P}fur)`} pointerEvents="none" />
      )}

      {/* cabeza: tocarla elige la lengua */}
      <g className="head" onClick={() => onSelect('lengua')}>
        <path d={EAR} fill="#74361f" stroke="#2a160e" strokeWidth="2" />
        <path d={EAR_INNER} fill="#c98f7f" />
        <path d={HEAD} fill={`url(#${P}face)`} filter={`url(#${P}fur)`} stroke="#2a160e" strokeWidth="2.4" />
        <g clipPath={`url(#${P}headClip)`} pointerEvents="none">
          <ellipse cx="150" cy="166" rx="16" ry="11" fill="#7a3b22" opacity="0.85" />
          <path d="M205 140 C200 175 196 205 180 228 L215 228 L215 140 Z" fill="#74361f" opacity="0.9" />
          <rect x="70" y="125" width="150" height="140" fill={`url(#${P}shade)`} />
        </g>
        <path d={MUZZLE} fill="#e2bdb1" stroke="#8a5a4c" strokeWidth="1" />
        <ellipse cx="90" cy="232" rx="5" ry="7" fill="#3a2420" transform="rotate(-20 90 232)" />
        <path d={MOUTH} fill="none" stroke="#6b3f34" strokeWidth="1.6" strokeLinecap="round" />
        <ellipse cx="150" cy="166" rx="6.5" ry="5" fill="#1b100c" />
        <circle cx="148" cy="164" r="1.6" fill="#fff" opacity="0.85" />
        <path d="M141 160 C146 156 154 156 159 160" fill="none" stroke="#2a160e" strokeWidth="1.4" />
      </g>
      {renderCut('lengua')}

      {/* nombres */}
      {showLabels && Object.entries(LABELS).map(([id, [x, y, txt, fs]]) => {
        const lines = (txt || CUTS_BY_ID[id].name).split('\n')
        const dim = filter && !matches(id)
        return (
          <text
            key={id}
            className={'lbl' + (id === selected ? ' sel' : '') + (dim ? ' dim' : '')}
            x={x}
            y={y - (lines.length - 1) * 6.5}
            style={fs ? { fontSize: fs } : undefined}
          >
            {lines.map((ln, i) => <tspan key={i} x={x} dy={i ? 13 : 0}>{ln}</tspan>)}
          </text>
        )
      })}
    </svg>
  )
}
