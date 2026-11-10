import CutPreview from './CutPreview.jsx'
import { METHODS } from '../data/cuts.js'

const Dots = ({ n }) => (
  <div className="dots">{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= n ? 'f' : ''} />)}</div>
)

const Price = ({ n }) => (
  <div className="price">{'$'.repeat(n)}<span>{'$'.repeat(4 - n)}</span></div>
)

export default function CutDetail({ cut }) {
  return (
    <article className="card detail" id="detail" aria-live="polite">
      {/* key: reinicia el estado de la foto al cambiar de corte */}
      <CutPreview key={cut.id} cut={cut} />
      <span className="zone">{cut.zone}</span>
      <h2>{cut.name}</h2>
      <p className="aka">{cut.aka ? `También: ${cut.aka}` : ' '}</p>
      <p className="desc">{cut.desc}</p>

      <div className="meters">
        <div className="meter"><b>Terneza</b><Dots n={cut.tern} /></div>
        <div className="meter"><b>Grasa</b><Dots n={cut.fat} /></div>
        <div className="meter"><b>Precio</b><Price n={cut.price} /></div>
      </div>

      <div className="methods">
        {cut.methods.map((m) => <span key={m} className="m">{METHODS[m]}</span>)}
      </div>

      <div className="block"><h3>Cómo se cocina</h3><p>{cut.cook}</p></div>
      <div className="block"><h3>Punto y tiempo</h3><p>{cut.time}</p></div>
      <div className="block">
        <h3>Platos típicos</h3>
        <ul className="dishes">{cut.dishes.map((d) => <li key={d}>{d}</li>)}</ul>
      </div>
      <div className="block">
        <h3>Cómo se llama en otros países</h3>
        <table className="eq">
          <tbody>
            <tr><td>Uruguay</td><td>{cut.eq.uy}</td></tr>
            <tr><td>España</td><td>{cut.eq.es}</td></tr>
            <tr><td>EE.UU.</td><td>{cut.eq.us}</td></tr>
          </tbody>
        </table>
        <div className="note">Las equivalencias son aproximadas: cada país despieza distinto.</div>
      </div>
    </article>
  )
}
