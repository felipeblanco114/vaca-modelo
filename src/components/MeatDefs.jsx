// Gradientes y filtros SVG que dan el aspecto de carne real:
// - marble1..5: vetas de grasa generadas con ruido (más grasa = más vetas)
// - meat / meatSel: color de carne cruda (normal y seleccionada)
// Se usa con un prefijo para no repetir ids entre la vaca y la vista previa.

// umbral de vetas: con más grasa, más hilos blancos
export function marbleThreshold(fat) {
  return 0.012 + fat * 0.02
}

export default function MeatDefs({ p }) {
  return (
    <>
      <linearGradient id={`${p}meat`} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stopColor="#c43c2f" />
        <stop offset="0.55" stopColor="#a82a22" />
        <stop offset="1" stopColor="#831b18" />
      </linearGradient>
      <linearGradient id={`${p}meatSel`} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stopColor="#e2503f" />
        <stop offset="0.55" stopColor="#c8352a" />
        <stop offset="1" stopColor="#9d231c" />
      </linearGradient>
      {[1, 2, 3, 4, 5].map((f) => {
        const t = marbleThreshold(f)
        return (
          <filter key={f} id={`${p}marble${f}`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="turbulence" baseFrequency="0.028 0.055" numOctaves="3" seed="7" result="n" />
            <feColorMatrix
              in="n"
              type="matrix"
              values={`0 0 0 0 0.97  0 0 0 0 0.91  0 0 0 0 0.84  -14 0 0 0 ${(14 * t).toFixed(3)}`}
              result="fatRaw"
            />
            <feGaussianBlur in="fatRaw" stdDeviation="0.6" result="fat" />
            <feComposite in="fat" in2="SourceGraphic" operator="in" result="fatIn" />
            {/* brillo húmedo muy suave */}
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="3" result="g" />
            <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.03  0 0 0 0 0.03  0 0 0 0.25 0" result="grain" />
            <feComposite in="grain" in2="SourceGraphic" operator="in" result="grainIn" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="grainIn" />
              <feMergeNode in="fatIn" />
            </feMerge>
          </filter>
        )
      })}
    </>
  )
}
