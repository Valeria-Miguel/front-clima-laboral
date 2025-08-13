// src/pages/cuestionario/RegistroSeccion.js
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/RegistroEmpresa.css';

import axios from 'axios';
import ApiConfig from '../../apiConfig';

// Base segura, sin barras finales
const BASE =
  (typeof ApiConfig === 'string' ? ApiConfig : ApiConfig.baseURL).replace(/\/+$/, '');

export default function RegistroSeccion() {
  const navigate = useNavigate();
  const location = useLocation();

  const stateId = location.state?.cuestionarioId || '';
  const q = new URLSearchParams(location.search);
  const cuestionarioId = stateId || q.get('cuestionarioId') || '';

  const [titulo, setTitulo] = useState('');
  const [numero, setNumero] = useState('');
  const [loading, setLoading] = useState(false);

  const [reactivos, setReactivos] = useState([]); // [{ _id, texto, catalogo, grupo }]
  const [seleccionados, setSeleccionados] = useState(new Map());
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState({ show: false, text: '' });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        // Carga CLIMA y NOM035 (por el gateway)
        const [climaRes, nomRes] = await Promise.all([
          axios.get(`${BASE}/api/reactivos`, { headers: { Accept: 'application/json' } }),
          axios.get(`${BASE}/api/nom035-reactivos`, { headers: { Accept: 'application/json' } }),
        ]);

        const clima = climaRes.data;
        const nom = nomRes.data;

        const flatClima = (clima?.items || clima || []).map(r => ({
          _id: r._id,
          texto: r.texto || r.pregunta || r.enunciado,
          catalogo: 'CLIMA',
          grupo: r.dimension?.nombre || r.dimension || r.grupo || 'General',
        }));

        const flatNom = (nom?.items || nom || []).map(r => ({
          _id: r._id,
          texto: r.texto || r.pregunta || r.enunciado,
          catalogo: 'NOM035',
          grupo: r.dominio || r.categoria || 'NOM-035',
        }));

        if (mounted) setReactivos([...flatClima, ...flatNom]);
      } catch (e) {
        console.error(e?.response?.data || e.message);
        setModal({ show: true, text: 'Error al cargar reactivos' });
      } finally {
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const grupos = useMemo(() => {
    const m = new Map();
    for (const r of reactivos) {
      const key = `${r.catalogo} — ${r.grupo}`;
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(r);
    }
    return Array.from(m.entries()); // [[grupo, items], ...]
  }, [reactivos]);

  const toggleReactivo = (r) => {
    setSeleccionados(prev => {
      const next = new Map(prev);
      if (next.has(r._id)) next.delete(r._id);
      else next.set(r._id, r);
      return next;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!cuestionarioId) return setModal({ show: true, text: 'Falta el Id del cuestionario.' });
    if (!numero) return setModal({ show: true, text: 'Selecciona el número de sección.' });
    if (seleccionados.size === 0) return setModal({ show: true, text: 'Selecciona al menos un reactivo.' });

    const payload = {
      cuestionarioId,
      numero: String(numero),
      titulo: (titulo || '').trim(),
      tipoSeccion: 'cerrada',
      reactivos: Array.from(seleccionados.values()).map((r, idx) => ({
        reactivoId: r._id,
        catalogo: r.catalogo, // 'CLIMA' o 'NOM035'
        orden: idx + 1,
      })),
    };

    try {
      setLoading(true);

      // Primero intentamos vía gateway con /api...
      let res = await axios.post(`${BASE}/api/secciones`, payload, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        validateStatus: () => true,
      });

      // Si el gateway no tiene mapeada /api/secciones (404 con HTML), probamos sin /api.
      if (res.status === 404 && typeof res.data === 'string' && /Cannot GET/i.test(res.data)) {
        res = await axios.post(`${BASE}/secciones`, payload, {
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          validateStatus: () => true,
        });
      }

      if (res.status < 200 || res.status >= 300) {
        throw new Error(res.data?.message || res.data?.error || `HTTP ${res.status}`);
      }

      setModal({ show: true, text: '✅ Sección registrada correctamente' });
      setTimeout(() => {
        setModal({ show: false, text: '' });
        navigate(`/secciones/${cuestionarioId}`);
      }, 900);
    } catch (err) {
      console.error(err?.response?.data || err.message);
      setModal({ show: true, text: err?.response?.data?.error || 'Error al registrar la sección' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="registro-container">
        <div className="registro-form-wrapper">
          <h2 className="text-center mb-4">Registrar Sección</h2>

          <form className="registro-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label>Número de Sección:</label>
              <select
                className="registro-input"
                value={numero}
                onChange={e => setNumero(e.target.value)}
                required
              >
                <option value="">Selecciona una opción</option>
                <option value="1">Sección 1</option>
                <option value="2">Sección 2</option>
                <option value="3">Sección 3</option>
                <option value="4">Sección 4</option>
              </select>
            </div>

            <div className="form-group">
              <label>Título:</label>
              <input
                className="registro-input"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ej. Condiciones de trabajo"
                required
              />
            </div>

            <div className="form-group">
              <label>Selecciona Reactivos (preguntas):</label>

              {loading && <div className="mt-2">Cargando…</div>}

              {!loading && grupos.map(([grupo, items]) => (
                <div key={grupo} className="dimension-panel">
                  <div
                    className="dimension-header"
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpanded(prev => ({ ...prev, [grupo]: !prev[grupo] }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') setExpanded(prev => ({ ...prev, [grupo]: !prev[grupo] })); }}
                  >
                    <strong>{grupo}</strong>
                    <span>{expanded[grupo] ? '▲' : '▼'}</span>
                  </div>

                  {expanded[grupo] && (
                    <div className="dimension-content">
                      {items.map(r => (
                        <label key={r._id} className="reactivo-label">
                          <input
                            type="checkbox"
                            checked={seleccionados.has(r._id)}
                            onChange={() => toggleReactivo(r)}
                          />
                          {r.texto}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Guardando…' : 'Registrar'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate(`/secciones/${cuestionarioId}`)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      {modal.show && (
        <div className="modal-overlay">
          <div className="modal-message">
            <p>{modal.text}</p>
            <button onClick={() => setModal({ show: false, text: '' })}>Cerrar</button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
