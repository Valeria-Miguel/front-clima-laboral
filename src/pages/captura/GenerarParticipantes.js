// src/pages/captura/GenerarParticipantes.js
import React, { useState } from 'react';
import ApiConfig from '../../apiConfig';

export default function GenerarParticipantes() {
  const [cuestId, setCuestId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [codigos, setCodigos] = useState([]);

  const generar = async () => {
    const res = await fetch(`${ApiConfig.baseURL}/respuestas/participantes/generar`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ cuestionarioId:cuestId, cantidad })
    });
    const data = await res.json();
    if (res.ok) setCodigos(data.codigos);
    else alert(data.message);
  };

  return (
    <div>
      <h2>Generar Participantes</h2>
      <input placeholder="ID Cuestionario" value={cuestId} onChange={e=>setCuestId(e.target.value)} />
      <input type="number" min="1" value={cantidad} onChange={e=>setCantidad(+e.target.value)} />
      <button onClick={generar}>Generar</button>
      {codigos.length>0 && <ul>{codigos.map(c => <li key={c}>{c}</li>)}</ul>}
    </div>
  );
}
