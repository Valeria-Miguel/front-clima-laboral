// src/pages/cuestionario/SeccionesDashboard.js

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ApiConfig from '../../apiConfig';
import '../../styles/RegistroEmpresa.css';

export default function SeccionesDashboard() {
  const { cuestionarioId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [cuestionario, setCuestionario] = useState(null);
  const [secciones, setSecciones] = useState([]);
  const [tab, setTab] = useState(1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        // 1) Traer datos del cuestionario (para título/tipo)
        const cq = await fetch(`${ApiConfig.baseURL}/cuestionarios/${cuestionarioId}`);
        if (!cq.ok) throw new Error('No se pudo cargar el cuestionario');
        const cqd = await cq.json();
        setCuestionario(cqd);

        // 2) Traer secciones ya “populadas”
        const res = await fetch(`${ApiConfig.baseURL}/cuestionarios/${cuestionarioId}/api/secciones?populate=true`);
        if (!res.ok) throw new Error('No se pudieron cargar las secciones');
        const data = await res.json();

        // normaliza: asegúrate de que vengan 1..4 aunque estén vacías
        const porNumero = new Map();
        (Array.isArray(data) ? data : []).forEach(s => porNumero.set(Number(s.numero), s));
        const norm = [1,2,3,4].map(n => porNumero.get(n) || { numero:n, titulo:'', reactivos: [] });

        setSecciones(norm);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    })();
  }, [cuestionarioId]);

  if (loading) return <div className="container"><p>Cargando…</p></div>;
  if (error)   return <div className="container"><p className="error-text">{error}</p></div>;

  const current = secciones.find(s => Number(s.numero) === Number(tab)) || { reactivos: [] };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Cuestionario: Secciones</h2>

        <div>
          <Link to={`/registro-seccion?cuestionarioId=${cuestionarioId}`} className="btn btn-primary">
            Registrar Sección
          </Link>
          <button
            className="btn btn-secondary ms-2"
            onClick={() => window.print()}
          >
            Exportar a PDF
          </button>
        </div>
      </div>

      {cuestionario && (
        <div className="mb-3">
          <b>{cuestionario.nombre}</b> &nbsp; 
          <span className="badge bg-secondary">{cuestionario.tipo}</span>
        </div>
      )}

      {/* Tabs 1..4 */}
      <div className="mb-3">
        {[1,2,3,4].map(n => (
          <button
            key={n}
            className={`btn ${tab===n ? 'btn-primary' : 'btn-light'} me-2`}
            onClick={() => setTab(n)}
          >
            Sección {n}
          </button>
        ))}
      </div>

      <div className="card p-4">
        <h3 className="text-center">
          {current.titulo?.trim() || `Sección ${current.numero}`}
        </h3>

        {(!current.reactivos || current.reactivos.length === 0) && (
          <p className="text-muted text-center my-5">
            No hay reactivos en esta sección.
          </p>
        )}

        {/* Lista numerada con el texto “ya populado” */}
        <ol className="mt-4">
          {current.reactivos?.map((r, idx) => (
            <li key={r._id || `${r.reactivoId}-${idx}`} className="mb-4">
              <div className="d-flex align-items-start">
                <div style={{flex: 1}}>
                  <div className="fw-semibold">
                    {r.texto || r.pregunta || '(sin texto)'}
                  </div>
                  <small className="text-muted">
                    {r.catalogo === 'NOM035'
                      ? `NOM-035${r.dominio ? ` · ${r.dominio}` : ''}`
                      : 'CLIMA'}
                    {typeof r.orden === 'number' ? ` · Orden ${r.orden}` : ''}
                  </small>
                </div>
                {/* Preview simple de opciones; sólo vista, no editable */}
                <div className="ms-3">
                  <div className="d-flex gap-2">
                    {[0,1,2,3,4].map(v => (
                      <span key={v} className="badge bg-light text-dark">{v}</span>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
