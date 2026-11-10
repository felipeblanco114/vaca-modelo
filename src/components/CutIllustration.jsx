// Ilustraciones realistas de cada corte, tal como se ven en la carnicería.
// Todas dibujan en un viewBox de 300 × 190 sobre la tabla de CutPreview.
// Piezas reutilizables: Meat (carne con vetas), Fat (grasa), Seam (veta de grasa entre músculos),
// Fib (dirección de la fibra), Silver (membrana), Bone (hueso con médula), Sheen (brillo húmedo).

import MeatDefs from './MeatDefs.jsx'

export const P = 'pv-'
const u = (id) => `url(#${P}${id})`

const FIBER_ANGLES = { 0: 0, 25: 25, m25: -25, 60: 60, m60: -60, 90: 90 }

export function IllustrationDefs() {
  return (
    <>
      <MeatDefs p={P} />
      <linearGradient id={`${P}outer`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#a52b22" />
        <stop offset="1" stopColor="#6a1512" />
      </linearGradient>
      <linearGradient id={`${P}fatG`} x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stopColor="#fbf4e8" />
        <stop offset="1" stopColor="#e6d2b2" />
      </linearGradient>
      <radialGradient id={`${P}boneG`} cx="0.4" cy="0.35" r="0.8">
        <stop offset="0" stopColor="#fbf6ec" />
        <stop offset="1" stopColor="#d6c29e" />
      </radialGradient>
      <radialGradient id={`${P}marrowG`} cx="0.45" cy="0.4" r="0.7">
        <stop offset="0" stopColor="#da9479" />
        <stop offset="1" stopColor="#9c4636" />
      </radialGradient>
      <linearGradient id={`${P}sheen`} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
        <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${P}tongueG`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e2aaa6" />
        <stop offset="1" stopColor="#ad6466" />
      </linearGradient>
      <linearGradient id={`${P}mollejaG`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f6dfd0" />
        <stop offset="1" stopColor="#dcac97" />
      </linearGradient>
      <linearGradient id={`${P}kidneyG`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#93362c" />
        <stop offset="1" stopColor="#5a1914" />
      </linearGradient>
      <linearGradient id={`${P}tripeG`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f0d7b4" />
        <stop offset="1" stopColor="#c99f70" />
      </linearGradient>

      {Object.entries(FIBER_ANGLES).map(([k, a]) => (
        <pattern key={k} id={`${P}fib${k}`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform={`rotate(${a})`}>
          <path d="M0 2.5 H5" stroke="#3a0907" strokeWidth="1" />
        </pattern>
      ))}

      {/* grasa: leve textura amarillenta */}
      <filter id={`${P}fatTex`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" seed="11" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.86  0 0 0 0 0.74  0 0 0 0 0.52  1.4 0 0 0 -0.62" result="t" />
        <feComposite in="t" in2="SourceGraphic" operator="in" result="tIn" />
        <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="tIn" /></feMerge>
      </filter>
      {/* membrana plateada: solo deja las vetas blancas */}
      <filter id={`${P}silver`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.015 0.25" numOctaves="2" seed="5" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.97  0 0 0 0 0.95  0 0 0 0 0.93  2.6 0 0 0 -1.05" result="s" />
        <feComposite in="s" in2="SourceGraphic" operator="in" />
      </filter>
      {/* hueso poroso */}
      <filter id={`${P}porous`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="1" seed="9" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.42  0 0 0 0 0.3  3 0 0 0 -1.85" result="d" />
        <feComposite in="d" in2="SourceGraphic" operator="in" result="dIn" />
        <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="dIn" /></feMerge>
      </filter>
      {/* relieve (mollejas, riñón, lengua, chinchulines) */}
      {[['bumps', 0.07, 3.5], ['papillae', 0.55, 1.4]].map(([id, freq, scale]) => (
        <filter key={id} id={`${P}${id}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves="3" seed="2" result="n" />
          <feDiffuseLighting in="n" surfaceScale={scale} diffuseConstant="1.25" lightingColor="#fff" result="light">
            <feDistantLight azimuth="235" elevation="55" />
          </feDiffuseLighting>
          <feComposite in="SourceGraphic" in2="light" operator="arithmetic" k1="1.15" k2="0" k3="0" k4="0" result="lit" />
          <feComposite in="lit" in2="SourceAlpha" operator="in" />
        </filter>
      ))}
      <filter id={`${P}drop`} x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#3b2414" floodOpacity="0.45" />
      </filter>
    </>
  )
}

/* ---------- piezas ---------- */
const Meat = ({ d, fat = 3, fill = 'meat' }) => (
  <path d={d} fill={u(fill)} filter={u(`marble${fat}`)} stroke="#5a110f" strokeOpacity="0.55" strokeWidth="1" />
)
const Fat = ({ d }) => <path d={d} fill={u('fatG')} filter={u('fatTex')} stroke="#cbb48e" strokeWidth="0.8" />
const Seam = ({ d, w = 3, o = 0.92 }) => (
  <path d={d} fill="none" stroke="#f2e3ca" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={o} />
)
const Fib = ({ d, a = '0', o = 0.13 }) => <path d={d} fill={u(`fib${a}`)} opacity={o} />
const Silver = ({ d, o = 0.75 }) => <path d={d} fill="#fff" opacity={o} filter={u('silver')} />
const Sheen = ({ d }) => <path d={d} fill={u('sheen')} />
const Bone = ({ cx, cy, rx, ry, rot = 0, m = 0.45 }) => (
  <g transform={`rotate(${rot} ${cx} ${cy})`}>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={u('boneG')} filter={u('porous')} stroke="#c2ab84" strokeWidth="1.6" />
    {m > 0 && <ellipse cx={cx} cy={cy} rx={rx * m} ry={ry * m} fill={u('marrowG')} />}
  </g>
)
const ring = (cx, cy, r) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0 Z`

/* ---------- cortes ---------- */
const ILLUSTRATIONS = {
  // Ojo de bife: el ojo central, la tapa (spinalis) bien marmoleada y la veta de grasa entre ambos
  bife_ancho: () => {
    const outer = 'M48 100 C44 60 86 34 140 32 C196 30 250 50 258 92 C264 128 236 156 182 160 C124 164 54 146 48 100 Z'
    const inner = 'M57 100 C55 67 92 43 140 41 C191 39 241 57 248 92 C253 123 228 148 180 151 C127 155 63 139 57 100 Z'
    const eye = 'M92 108 C90 82 118 66 152 66 C190 66 214 84 214 108 C214 132 190 146 154 146 C118 146 94 132 92 108 Z'
    return (<>
      <Fat d={outer} />
      <Meat d={inner} fat={5} fill="outer" />
      <Meat d={eye} fat={3} />
      <Seam d={eye} w={3.5} />
      <ellipse cx="118" cy="92" rx="11" ry="7" fill={u('fatG')} filter={u('fatTex')} />
      <Fib d={eye} />
      <Sheen d={inner} />
    </>)
  },

  // Bife de chorizo: rectangular, con el cordón de grasa en un lado y una veta de nervio en la punta
  bife_angosto: () => {
    const meat = 'M40 72 C40 60 52 54 70 54 L232 52 C252 52 262 64 262 86 L262 124 C262 142 250 150 230 150 L72 152 C52 152 40 144 40 128 Z'
    return (<>
      <Meat d={meat} fat={3} />
      <Fat d="M36 74 C36 52 54 42 74 42 L232 40 C256 40 268 54 268 76 L268 86 C236 78 120 76 36 86 Z" />
      <Seam d="M222 92 C230 110 228 128 218 142" w={2.6} o={0.8} />
      <Fib d={meat} />
      <Sheen d={meat} />
    </>)
  },

  // Aguja: trozo con varios músculos separados por grasa y cortes de costilla
  aguja: () => {
    const meat = 'M34 62 C60 46 120 44 180 48 C230 50 262 60 266 82 C270 110 262 140 236 152 C190 164 110 162 64 152 C40 146 30 126 30 104 C30 86 30 72 34 62 Z'
    return (<>
      <Meat d={meat} fat={3} />
      <Fib d={meat} a="25" />
      <Seam d="M112 50 C104 90 114 122 100 158" />
      <Seam d="M180 50 C190 82 176 112 194 158" />
      <Seam d="M32 112 C70 104 90 114 108 108" w={2.5} />
      <Seam d="M188 104 C210 98 240 106 266 100" w={2.5} />
      <Fat d="M34 62 C60 46 120 44 180 48 L180 60 C120 58 66 60 36 74 Z" />
      <Bone cx={70} cy={92} rx={13} ry={19} rot={-12} />
      <Bone cx={236} cy={124} rx={11} ry={16} rot={10} />
      <Sheen d={meat} />
    </>)
  },

  // Cuadril con su tapa de grasa (picaña) bien gruesa
  cuadril: () => {
    const meat = 'M30 140 C40 104 80 70 140 60 C200 52 250 62 270 84 C276 112 262 140 236 150 C170 162 90 160 30 140 Z'
    return (<>
      <Meat d={meat} fat={2} />
      <Fib d={meat} a="m25" />
      <Seam d="M40 132 C80 104 160 92 266 104" w={3} />
      <Fat d="M24 140 C32 96 78 58 140 48 C204 38 258 50 278 80 L271 92 C248 70 200 62 142 70 C84 80 44 110 37 142 Z" />
      <Sheen d={meat} />
    </>)
  },

  // Nalga: fetas finas y magras, como para milanesa
  nalga: () => {
    const slice = 'M60 60 C110 40 200 40 248 64 C270 80 262 118 230 134 C180 154 100 150 64 130 C36 114 36 76 60 60 Z'
    return (<>
      {[[18, -14], [-14, 18]].map(([dx, dy], i) => (
        <g key={i} transform={`translate(${dx} ${dy})`}>
          <Meat d={slice} fat={1} />
          <Fib d={slice} />
          <Seam d="M92 82 C140 76 200 82 236 102" w={1.6} o={0.6} />
          <path d={slice} fill="none" stroke="#e5786a" strokeOpacity="0.5" strokeWidth="2.5" />
          <Sheen d={slice} />
        </g>
      ))}
    </>)
  },

  // Centro de paleta: el nervio que la cruza por el medio
  paleta: () => {
    const meat = 'M36 66 C80 50 200 48 252 60 C272 70 272 120 258 140 C210 156 90 158 48 146 C30 136 28 84 36 66 Z'
    return (<>
      <Meat d={meat} fat={2} />
      <Fib d={meat} a="60" o={0.1} />
      <Seam d="M48 104 C110 96 180 112 258 100" w={7} />
      <path d="M48 104 C110 96 180 112 258 100" fill="none" stroke="#d6cbbb" strokeWidth="2" />
      <Seam d="M120 60 C126 80 118 92 124 100" w={2} o={0.7} />
      <Silver d={meat} o={0.5} />
      <Sheen d={meat} />
    </>)
  },

  // Pecho: capas de carne y grasa, con la tapa de grasa abajo
  pecho: () => {
    const meat = 'M24 76 C60 60 160 58 230 62 C262 64 276 80 274 104 C272 128 256 142 226 146 C150 150 70 148 32 138 C18 126 18 92 24 76 Z'
    return (<>
      <Meat d={meat} fat={4} />
      <Fib d={meat} o={0.15} />
      <Seam d="M30 104 C90 96 170 106 270 98" w={8} />
      <Fat d="M26 134 C70 146 160 150 226 146 C254 142 270 130 274 112 L276 130 C270 148 252 158 224 160 C150 164 64 160 24 148 Z" />
      <Sheen d={meat} />
    </>)
  },

  // Tapa de asado: lámina con las marcas de las costillas y grasa de un lado
  tapa_asado: () => {
    const meat = 'M30 58 C90 50 200 48 262 56 C272 60 274 132 264 140 C200 150 92 150 34 142 C24 136 22 66 30 58 Z'
    return (<>
      <Meat d={meat} fat={3} />
      <Fib d={meat} a="90" />
      {[84, 134, 184, 232].map((x) => (
        <path key={x} d={`M${x} 70 C${x - 4} 100 ${x + 4} 120 ${x} 142`} fill="none" stroke="#4a0c0a" strokeOpacity="0.35" strokeWidth="7" strokeLinecap="round" />
      ))}
      <Fat d="M28 58 C90 48 200 46 264 54 L264 72 C200 66 90 68 28 76 Z" />
      <Silver d="M180 80 L262 76 L264 138 L180 146 Z" o={0.6} />
      <Sheen d={meat} />
    </>)
  },

  // Lomo entero: la cabeza gruesa, la punta fina, el cordón a un costado y la membrana plateada
  lomo: () => {
    const meat = 'M22 96 C22 66 48 52 82 54 C140 58 200 72 246 82 C268 88 280 96 278 104 C276 114 260 118 240 120 C190 126 140 138 84 142 C46 144 22 126 22 96 Z'
    return (<>
      <Meat d="M58 136 C110 134 170 124 230 116 L236 126 C176 138 112 150 62 150 Z" fat={3} fill="outer" />
      <Meat d={meat} fat={1} />
      <Fib d={meat} a="m25" o={0.08} />
      <Silver d="M86 64 C140 66 196 78 236 88 C196 96 140 88 90 82 Z" o={0.9} />
      <Silver d="M40 110 C60 118 90 124 120 122 C90 132 60 130 42 122 Z" o={0.7} />
      <Sheen d={meat} />
    </>)
  },

  // Colita de cuadril: triangular, magra, con un poco de grasa en el borde
  colita: () => {
    const meat = 'M30 120 C60 80 120 50 190 44 C240 40 272 56 270 78 C266 100 236 112 200 122 C150 136 90 150 46 148 C28 146 22 132 30 120 Z'
    return (<>
      <Meat d={meat} fat={1} />
      <Fib d={meat} a="25" />
      <Fat d="M44 146 C90 150 150 138 200 124 L206 134 C150 150 90 162 46 158 Z" />
      <Silver d="M130 60 C170 52 220 50 254 60 C220 66 170 70 132 76 Z" o={0.6} />
      <Sheen d={meat} />
    </>)
  },

  // Peceto: cilindro largo y parejo, con la cara del corte redonda
  peceto: () => {
    const body = 'M28 74 C28 62 40 58 58 58 L226 60 C240 60 246 74 246 96 C246 118 240 132 226 132 L58 134 C40 134 28 128 28 116 Z'
    return (<>
      <Meat d={body} fat={1} fill="outer" />
      <Fib d={body} o={0.14} />
      <Silver d="M50 66 L200 66 L200 80 L50 82 Z" o={0.7} />
      <ellipse cx="232" cy="96" rx="27" ry="37" fill={u('meat')} filter={u('marble1')} stroke="#5a110f" strokeOpacity="0.55" />
      <ellipse cx="232" cy="96" rx="27" ry="37" fill="none" stroke="#f0e0c8" strokeWidth="2.5" opacity="0.7" />
      <Sheen d={body} />
    </>)
  },

  // Cuadrada: bloque magro con una sola veta que lo cruza
  cuadrada: () => {
    const meat = 'M38 60 C80 52 210 50 254 58 C264 70 266 130 256 142 C210 150 82 152 40 144 C30 130 28 72 38 60 Z'
    return (<>
      <Meat d={meat} fat={1} />
      <Fib d={meat} a="m25" />
      <Seam d="M60 140 C120 110 180 90 250 64" w={2.6} o={0.8} />
      <Fat d="M38 60 C80 52 210 50 254 58 L254 66 C210 60 80 62 38 68 Z" />
      <Sheen d={meat} />
    </>)
  },

  // Bola de lomo: pieza redonda formada por varios músculos
  bola_lomo: () => {
    const meat = 'M150 28 C204 28 244 58 244 96 C244 136 204 162 150 162 C96 162 56 136 56 96 C56 58 96 28 150 28 Z'
    return (<>
      <Meat d={meat} fat={1} />
      <Fib d={meat} a="25" o={0.1} />
      <Seam d="M150 30 C140 70 156 110 150 160" />
      <Seam d="M58 92 C100 96 120 88 148 96" w={2.5} />
      <Seam d="M152 98 C180 92 210 108 242 100" w={2.5} />
      <Silver d="M70 60 C100 36 140 30 170 32 C130 44 100 56 78 76 Z" o={0.7} />
      <Sheen d={meat} />
    </>)
  },

  // Tira de asado: los huesos de costilla cortados de través, con grasa arriba y membrana abajo
  asado: () => {
    const meat = 'M22 60 C80 54 220 54 278 60 L278 138 C220 144 80 144 22 138 Z'
    return (<>
      <Meat d={meat} fat={4} />
      <Fib d={meat} a="90" o={0.1} />
      {[108, 192].map((x) => <Seam key={x} d={`M${x} 68 C${x - 4} 100 ${x + 4} 120 ${x} 136`} w={3} o={0.75} />)}
      <Seam d="M24 122 C90 118 210 118 276 124" w={3} o={0.8} />
      <Fat d="M20 52 C80 46 220 46 280 52 L280 68 C220 64 80 64 20 70 Z" />
      {[66, 150, 234].map((x) => <Bone key={x} cx={x} cy={98} rx={17} ry={24} m={0.48} />)}
      <Silver d="M22 130 L278 130 L278 140 L22 140 Z" o={0.8} />
      <Sheen d={meat} />
    </>)
  },

  // Vacío: pieza grande y plana, con su capa de grasa y la membrana
  vacio: () => {
    const meat = 'M20 92 C30 58 90 42 160 46 C220 48 268 62 280 90 C290 120 262 148 210 154 C150 160 70 162 34 142 C18 130 14 110 20 92 Z'
    return (<>
      <Meat d={meat} fat={3} />
      <Fib d={meat} a="m60" o={0.14} />
      <Silver d="M40 120 C90 112 180 114 270 110 C262 140 220 150 160 154 C100 156 54 152 38 138 Z" o={0.85} />
      <Fat d="M22 86 C36 52 92 36 160 40 C222 42 266 56 280 84 L276 98 C260 74 214 62 160 60 C96 58 48 72 26 102 Z" />
      <Sheen d={meat} />
    </>)
  },

  // Falda: costillas más anchas, mucha grasa entre capas
  falda: () => {
    const meat = 'M30 54 C90 48 210 48 270 56 L272 142 C210 150 90 150 28 142 Z'
    return (<>
      <Meat d={meat} fat={4} />
      <Fib d={meat} a="90" o={0.1} />
      <Seam d="M30 124 C100 118 200 120 272 126" w={6} />
      <Seam d="M150 60 C146 92 154 118 150 144" w={4} />
      <Fat d="M28 46 C90 40 210 40 272 48 L272 68 C210 62 90 62 28 68 Z" />
      <Bone cx={92} cy={96} rx={22} ry={30} m={0.5} />
      <Bone cx={210} cy={96} rx={22} ry={30} m={0.5} />
      <Sheen d={meat} />
    </>)
  },

  // Matambre: lámina fina con la fibra bien marcada, enrollado en una punta
  matambre: () => {
    const sheet = 'M22 72 C60 52 150 54 204 58 L212 140 C150 146 70 150 30 138 C14 122 12 88 22 72 Z'
    return (<>
      <Meat d={sheet} fat={2} />
      <Fib d={sheet} o={0.22} />
      <Silver d="M30 80 C80 66 150 66 200 70 L202 90 C150 86 80 88 32 100 Z" o={0.5} />
      <circle cx="232" cy="99" r="46" fill={u('outer')} stroke="#5a110f" strokeOpacity="0.6" />
      <path
        d="M232 99 m-5 0 a5 5 0 1 1 10 0 a11 11 0 1 1 -22 0 a17 17 0 1 1 34 0 a23 23 0 1 1 -46 0 a29 29 0 1 1 58 0 a35 35 0 1 1 -70 0 a41 41 0 1 1 82 0"
        fill="none" stroke="#efdcc2" strokeWidth="3.2" opacity="0.9"
      />
      <circle cx="232" cy="99" r="46" fill={u('sheen')} />
      <Sheen d={sheet} />
    </>)
  },

  // Osobuco: rodaja con el hueso y la médula al centro y los músculos separados por tejido
  osobuco: () => {
    const c = ring(150, 96, 72)
    return (<>
      <Meat d={c} fat={2} />
      {['M150 70 C140 50 130 36 118 28', 'M174 82 C196 70 210 50 214 40', 'M176 108 C200 118 216 134 220 148',
        'M140 120 C130 140 120 156 112 166', 'M124 92 C104 92 90 88 80 74'].map((d) => <Seam key={d} d={d} w={2.6} o={0.85} />)}
      <Silver d={c} o={0.45} />
      <circle cx="150" cy="96" r="70" fill="none" stroke="#f3e6d2" strokeWidth="5" />
      <Bone cx={150} cy={96} rx={25} ry={23} m={0.58} />
      <Sheen d={c} />
    </>)
  },

  // Tortuguita: músculo abombado, con tendones que le dan el dibujo de caparazón
  tortuguita: () => {
    const meat = 'M40 100 C40 62 92 42 150 42 C210 42 260 62 260 100 C260 136 212 154 150 154 C88 154 40 136 40 100 Z'
    return (<>
      <Meat d={meat} fat={1} />
      <Fib d={meat} a="m25" o={0.1} />
      {['M80 60 C100 80 100 120 82 142', 'M150 44 C140 74 160 120 150 152', 'M220 60 C200 80 200 120 218 142',
        'M44 98 C90 94 210 106 256 98'].map((d) => <Seam key={d} d={d} w={3} o={0.9} />)}
      <Silver d={meat} o={0.7} />
      <Sheen d={meat} />
    </>)
  },

  // Lengua: entera, con su textura de papilas y la base más gruesa
  lengua: () => {
    const t = 'M24 100 C24 84 40 76 64 74 C120 68 190 56 250 60 C276 62 286 84 284 104 C282 126 268 140 246 142 C190 146 120 132 64 126 C40 124 24 116 24 100 Z'
    return (<>
      <path d={t} fill={u('tongueG')} filter={u('papillae')} stroke="#8a4a4c" strokeWidth="1.2" />
      <path d="M40 100 C90 96 160 92 240 96" fill="none" stroke="#9a5355" strokeOpacity="0.55" strokeWidth="2.2" />
      <path d="M228 62 C262 62 284 82 284 104 C282 126 266 140 240 142 C232 120 230 84 228 62 Z" fill="#8f6a6a" opacity="0.35" />
      <Sheen d={t} />
    </>)
  },

  // Rabo: rodajas cada vez más chicas, con la vértebra en el centro
  rabo: () => (<>
    {[[64, 100, 44], [144, 96, 37], [212, 100, 30], [262, 104, 22]].map(([x, y, r]) => (
      <g key={x}>
        <Fat d={ring(x, y, r)} />
        <Meat d={ring(x, y, r - 5)} fat={3} />
        <Seam d={`M${x - r + 8} ${y} C${x - r / 2} ${y - 6} ${x - r / 3} ${y + 4} ${x - r * 0.3} ${y}`} w={2} o={0.7} />
        <ellipse cx={x - r * 0.42} cy={y} rx={r * 0.16} ry={r * 0.09} fill={u('boneG')} stroke="#c2ab84" />
        <ellipse cx={x + r * 0.42} cy={y} rx={r * 0.16} ry={r * 0.09} fill={u('boneG')} stroke="#c2ab84" />
        <Bone cx={x} cy={y} rx={r * 0.32} ry={r * 0.3} m={0.4} />
        <Sheen d={ring(x, y, r)} />
      </g>
    ))}
  </>),

  // Entraña: tira larga y fina, con la fibra diagonal muy marcada y la membrana
  entrana: () => {
    const meat = 'M16 112 C40 80 100 68 160 66 C220 64 268 72 288 90 L284 110 C262 96 220 92 162 96 C104 100 52 114 28 138 Z'
    return (<>
      <Meat d={meat} fat={3} />
      <Fib d={meat} a="60" o={0.32} />
      <Silver d="M20 110 C44 82 100 70 160 68 C220 66 266 74 286 92 L284 98 C262 84 220 80 160 82 C104 84 54 96 26 122 Z" o={0.9} />
      <Sheen d={meat} />
    </>)
  },

  // Mollejas: lóbulos claros con relieve
  mollejas: () => (<>
    {[[104, 94, 46, 36], [168, 82, 40, 32], [206, 118, 40, 28], [132, 128, 36, 24], [236, 78, 26, 21]].map(([x, y, rx, ry], i) => (
      <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={u('mollejaG')} filter={u('bumps')} stroke="#c5967f" strokeWidth="1.4" />
    ))}
    <path d="M80 80 C100 90 120 86 140 96 M150 70 C170 80 190 76 204 86" fill="none" stroke="#c98d86" strokeOpacity="0.6" strokeWidth="1.4" />
  </>),

  // Chinchulines: tripa enrulada, con relieve
  chinchulines: () => {
    const d = 'M48 112 C48 62 118 52 140 84 C160 114 200 114 212 84 C224 52 270 64 258 104 C246 144 180 152 150 130 C122 110 82 146 60 126'
    return (
      <g fill="none" strokeLinecap="round">
        <path d={d} stroke="#9a6d4c" strokeWidth="30" />
        <path d={d} stroke={u('tripeG')} strokeWidth="24" filter={u('bumps')} />
        <path d={d} stroke="#fff3df" strokeWidth="4" strokeOpacity="0.55" transform="translate(-2 -5)" />
      </g>
    )
  },

  // Riñón vacuno: muchos lóbulos oscuros y la grasa en el centro
  rinon: () => (<>
    <path d="M70 60 C110 34 200 34 236 62 C262 84 262 124 236 146 C204 170 110 168 74 144 C58 132 72 118 92 112 C110 106 110 90 92 86 C70 82 56 72 70 60 Z" fill="#4c1511" />
    {[[100, 62], [132, 52], [166, 52], [200, 58], [228, 80], [236, 112], [218, 140], [186, 152], [152, 154], [118, 148], [88, 134],
      [124, 82], [158, 80], [192, 86], [208, 112], [180, 126], [146, 128], [116, 118]].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx="20" ry="16" fill={u('kidneyG')} filter={u('bumps')} stroke="#3a0f0c" strokeWidth="1.2" />
    ))}
    <path d="M92 100 C120 96 140 104 150 102 C140 110 118 112 92 108 Z" fill={u('fatG')} filter={u('fatTex')} />
  </>),
}

export default function CutIllustration({ cut }) {
  const Draw = ILLUSTRATIONS[cut.id]
  if (!Draw) return null
  return <g filter={u('drop')}><Draw /></g>
}
