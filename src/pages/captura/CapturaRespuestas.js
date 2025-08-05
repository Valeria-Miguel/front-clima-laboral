// src/pages/captura/CapturaRespuestas.js
import React, { useState } from 'react';
import ApiConfig from '../../apiConfig';

export default function CapturaRespuestas() {
  const [form, setForm] = useState({
    participanteCodigo:'',
    cuestionarioId:'',
    metadata:{ adscripcion:'', area:'', puesto:'', antiguedad:'', tipoContrato:'', escolaridad:'' },
    respuestas:[ /* { reactivoId:'', valor:5 } */ ]
  });
  const handleMeta = e => {
    const { name, value } = e.target;
    setForm(f=>({ ...f, metadata:{...f.metadata, [name]:value} }));
  };

  // para simplificar, sólo posteamos sin mapear reactivos
  const registrar = async () => {
    const res = await fetch(`${ApiConfig.baseURL}/respuestas/registrar`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(form)
    });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <div>
      <h2>Captura de Respuestas</h2>
      <input placeholder="Código participante" value={form.participanteCodigo}
             onChange={e=>setForm(f=>({...f, participanteCodigo:e.target.value}))} />
      <input placeholder="ID Cuestionario" value={form.cuestionarioId}
             onChange={e=>setForm(f=>({...f, cuestionarioId:e.target.value}))} />

      {Object.keys(form.metadata).map(k=>(
        <div key={k}>
          <label>{k}</label>
          <input name={k} value={form.metadata[k]} onChange={handleMeta} />
        </div>
      ))}

      {/* Aquí necesitarás cargar reactivos y renderizar inputs por cada uno */}
      {/* Por simplicidad: */}
      <textarea
        placeholder='{"reactivoId":"...", "valor":5}, ...'
        value={JSON.stringify(form.respuestas)}
        onChange={e=>setForm(f=>({...f, respuestas: JSON.parse(e.target.value)}))}
      />

      <button onClick={registrar}>Guardar respuestas</button>
    </div>
  );
}
