import { useState } from 'react'

const fmt = (n) => n.toLocaleString('es-AR', { maximumFractionDigits: 1 })

// Regla práctica: 500 g por adulto, 250 g por chico. "Comen mucho" suma 20%.
const SPLIT = [
  { id: 'asado', name: 'Asado', share: 0.45, hint: 'Con hueso: la base del asado' },
  { id: 'vacio', name: 'Vacío', share: 0.35, hint: 'Rinde y gusta a todos' },
  { id: 'entrana', name: 'Entraña', share: 0.2, hint: 'Para picar mientras se hace lo demás' },
]

function Stepper({ label, value, min, onChange }) {
  return (
    <div className="row">
      <label>{label}</label>
      <div className="step">
        <button onClick={() => onChange(Math.max(min, value - 1))} aria-label={`Menos ${label.toLowerCase()}`}>−</button>
        <output>{value}</output>
        <button onClick={() => onChange(Math.min(60, value + 1))} aria-label={`Más ${label.toLowerCase()}`}>+</button>
      </div>
    </div>
  )
}

export default function AsadoCalculator({ onPickCut }) {
  const [adults, setAdults] = useState(6)
  const [kids, setKids] = useState(2)
  const [hungry, setHungry] = useState(false)

  const kg = (adults * 0.5 + kids * 0.25) * (hungry ? 1.2 : 1)
  const chorizos = adults + Math.ceil(kids / 2)
  const morcillas = Math.ceil(adults / 2)

  return (
    <div className="card calc">
      <h2>¿Cuánta carne compro?</h2>
      <p className="sub left">Regla práctica de parrilla: medio kilo por adulto y la mitad por chico.</p>
      <Stepper label="Adultos" value={adults} min={1} onChange={setAdults} />
      <Stepper label="Chicos" value={kids} min={0} onChange={setKids} />
      <div className="row">
        <label htmlFor="hungry">Comen mucho<small>Suma un 20%</small></label>
        <input id="hungry" type="checkbox" checked={hungry} onChange={(e) => setHungry(e.target.checked)} />
      </div>

      <div className="total">
        <div className="big">{fmt(kg)} kg</div>
        <small>de carne en total</small>
      </div>

      <div className="split">
        {SPLIT.map((s) => (
          <button key={s.id} onClick={() => onPickCut(s.id)}>
            <span>{s.name}<small>{s.hint}</small></span>
            <b>{fmt(kg * s.share)} kg</b>
          </button>
        ))}
        <div className="split-item">
          <span>Chorizos y morcillas<small>Para la entrada</small></span>
          <b>{chorizos} + {morcillas}</b>
        </div>
      </div>
      <p className="note">Tocá un corte para ver cómo se hace.</p>
    </div>
  )
}
