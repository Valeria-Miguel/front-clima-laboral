/* // src/pages/captura/GenerarParticipantes.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiConfig from '../../apiConfig';
import '../../styles/CapturaRespuestas.css';

export default function GenerarParticipantes() {
  const [cuestionarios, setCuestionarios] = useState([]);
  const [cuestId, setCuestId]             = useState('');
  const [cantidad, setCantidad]           = useState(1);
  const [codigos, setCodigos]             = useState([]);
  const [error, setError]                 = useState('');
  const navigate                          = useNavigate();

  // 1) Carga los cuestionarios disponibles
  useEffect(() => {
    fetch(`${ApiConfig.baseURL}/cuestionarios`)
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar cuestionarios');
        return res.json();
      })
      .then(data => setCuestionarios(data))
      .catch(err => setError(err.message));
  }, []);

  // 2) Genera N códigos de participante
  const generar = async () => {
    setError('');
    setCodigos([]);
    if (!cuestId || cantidad < 1) {
      setError('Selecciona un cuestionario y una cantidad válida');
      return;
    }
    try {
      const res = await fetch(
        `${ApiConfig.baseURL}/participantes/generar`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cuestionarioId: cuestId, cantidad }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      setCodigos(data.codigos);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="captura-page">
      <h2>Generar Códigos de Participantes</h2>

      <div className="form-group">
        <label>Cuestionario:</label>
        <select
          value={cuestId}
          onChange={e => setCuestId(e.target.value)}
          className="registro-input"
        >
          <option value="">-- Selecciona uno --</option>
          {cuestionarios.map(c => (
            <option key={c._id} value={c._id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>¿Cuántos cuestionarios aplicarás?</label>
        <input
          type="number"
          min="1"
          value={cantidad}
          onChange={e => setCantidad(+e.target.value)}
          className="registro-input"
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <button onClick={generar} className="btn-primary">
        Generar
      </button>

      {codigos.length > 0 && (
        <>
          <ul className="codigo-list">
            {codigos.map(codigo => (
              <li key={codigo}>{codigo}</li>
            ))}
          </ul>
          <button
            onClick={() =>
              navigate('/captura/respuestas', {
                state: { cuestionarioId: cuestId, codigo: codigos[0] }
              })
            }
            className="btn-secondary"
          >
            Ir a Captura de Respuestas
          </button>
        </>
      )}
    </div>
  );
}
 */