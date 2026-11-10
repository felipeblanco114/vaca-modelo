import { useState } from 'react'
import CowMap from './components/CowMap.jsx'
import Cow3D from './components/Cow3D.jsx'
import CutDetail from './components/CutDetail.jsx'
import AsadoCalculator from './components/AsadoCalculator.jsx'
import { CUTS, ACHURAS, METHODS, CUTS_BY_ID } from './data/cuts.js'

function Chips({ items, selected, filter, onSelect }) {
  return (
    <div className="chips">
      {items.map((c) => {
        const dim = filter && !c.methods.includes(filter)
        return (
          <button
            key={c.id}
            className={'chip' + (c.id === selected ? ' on' : '') + (dim ? ' dim' : '')}
            onClick={() => onSelect(c.id)}
          >
            {c.name}
          </button>
        )
      })}
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('mapa')
  const [selected, setSelected] = useState('asado')
  const [filter, setFilter] = useState(null)
  const [view, setView] = useState('3d') // 3d | 2d
  const [mode, setMode] = useState('cuero')
  const [showLabels, setShowLabels] = useState(() => window.innerWidth >= 560)

  const scrollToDetail = () =>
    document.getElementById('detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const pickFromCalculator = (id) => {
    setSelected(id)
    setTab('mapa')
    setTimeout(scrollToDetail, 50)
  }

  return (
    <div className="wrap">
      <header>
        <div className="kicker">Carnicería · Guía de cortes</div>
        <h1>LA VACA</h1>
        <p className="sub">Tocá un corte: cómo se llama, cómo se cocina y qué platos lleva.</p>
      </header>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'mapa'} onClick={() => setTab('mapa')}>Cortes</button>
        <button role="tab" aria-selected={tab === 'calc'} onClick={() => setTab('calc')}>Calculadora de asado</button>
      </div>

      {tab === 'mapa' ? (
        <div className="grid">
          <div>
            <div className="card mapcard">
              <div className="filters">
                {[[null, 'Todos'], ...Object.entries(METHODS)].map(([k, v]) => (
                  <button key={v} className={'chip' + (filter === k ? ' on' : '')} onClick={() => setFilter(k)}>{v}</button>
                ))}
              </div>

              {view === '3d' ? (
                <Cow3D selected={selected} onSelect={setSelected} filter={filter} />
              ) : (
                <CowMap selected={selected} onSelect={setSelected} filter={filter} mode={mode} showLabels={showLabels} />
              )}

              <div className="maprow">
                <div className="now"><small>Corte seleccionado</small>{CUTS_BY_ID[selected].name}</div>
                <div className="controls">
                  <div className="seg" role="group" aria-label="Vista">
                    <button className={view === '3d' ? 'on' : ''} onClick={() => setView('3d')}>3D</button>
                    <button className={view === '2d' ? 'on' : ''} onClick={() => setView('2d')}>Póster</button>
                  </div>
                  {view === '2d' && (
                    <>
                      <div className="seg" role="group" aria-label="Cuero">
                        <button className={mode === 'cuero' ? 'on' : ''} onClick={() => setMode('cuero')}>Con cuero</button>
                        <button className={mode === 'carne' ? 'on' : ''} onClick={() => setMode('carne')}>Ver carne</button>
                      </div>
                      <label className="toggle">
                        <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} /> Nombres
                      </label>
                    </>
                  )}
                  <button className="gotodetail" onClick={scrollToDetail}>Ver ficha ↓</button>
                </div>
              </div>
            </div>

            <div className="sec-title">Todos los cortes</div>
            <Chips items={CUTS} selected={selected} filter={filter} onSelect={setSelected} />
            <div className="sec-title">Achuras y cortes internos</div>
            <Chips items={ACHURAS} selected={selected} filter={filter} onSelect={setSelected} />
          </div>

          <CutDetail cut={CUTS_BY_ID[selected]} />
        </div>
      ) : (
        <AsadoCalculator onPickCut={pickFromCalculator} />
      )}

      <footer>Tiempos y equivalencias orientativos</footer>
    </div>
  )
}
