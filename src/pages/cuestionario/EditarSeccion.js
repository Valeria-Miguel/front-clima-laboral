import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/RegistroEmpresa.css';

/** Utils */
const cleanOid = (s) => (String(s || '').match(/[0-9a-fA-F]{24}/)?.[0] || '');
const romanToNum = (v) => ({ I: '1', II: '2', III: '3', IV: '4' }[v] || String(v || ''));

const API_SECC_BASES = [
  'http://localhost:3001/api', // gateway
  'http://localhost:3005',     // micro cuestionarios (fallback)
];

const getJsonSafe = async (res) => {
  const ct = (res.headers.get('content-type') || '').toLowerCase();
  const text = await res.text();
  if (!ct.includes('application/json')) {
    const msg = text?.slice(0, 200) || 'Respuesta no JSON';
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${msg}`);
  }
  try { return JSON.parse(text || '{}'); }
  catch { throw new Error(`No se pudo parsear JSON (HTTP ${res.status}).`); }
};

const postJsonSafe = async (url, body) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await getJsonSafe(res);
  if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  return data;
};

const EditarSeccion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { seccion } = location.state || {};

  // --- estado principal ---
  const [titulo, setTitulo] = useState(seccion?.titulo || '');
  const [numero, setNumero] = useState(romanToNum(seccion?.numero) || '');
  const [reactivos, setReactivos] = useState([]); // catálogo CLIMA para checkboxes
  const [reactivosSeleccionados, setReactivosSeleccionados] = useState([]);
  const [expandedDims, setExpandedDims] = useState({});
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  // id limpio del cuestionario (de la seccion o de la ruta)
  const cuestionarioId = useMemo(() => (
    cleanOid(seccion?.cuestionarioId || params?.cuestionarioId)
  ), [seccion, params]);

  // ids preseleccionados (solo CLIMA si hay NOM035 no están en la lista, pero los preservamos al guardar)
  useEffect(() => {
    const ids = (seccion?.reactivos || [])
      .map(r => cleanOid(r?.reactivoId || r?._id || r));
    setReactivosSeleccionados(ids.filter(Boolean));
  }, [seccion]);

  // Cargar catálogo de reactivos CLIMA para pintar checkboxes
  useEffect(() => {
    if (!seccion) {
      navigate('/cuestionarios');
      return;
    }
    (async () => {
      try {
        const res = await fetch('http://localhost:3001/api/reactivos', { headers: { Accept: 'application/json' } });
        const data = await getJsonSafe(res);
        setReactivos(Array.isArray(data) ? data : []);
      } catch (err) {
        setModalMessage('Error al cargar reactivos');
        setShowModal(true);
      }
    })();
  }, [navigate, seccion]);

  // Agrupar por dimensión (solo CLIMA)
  const dimensionesMap = (reactivos || []).reduce((acc, r) => {
    const dimId = r.dimension?._id || 'sin-dimension';
    if (!acc[dimId]) acc[dimId] = { dimension: r.dimension, reactivos: [] };
    acc[dimId].reactivos.push(r);
    return acc;
  }, {});

  const toggleReactivo = (id) => {
    setReactivosSeleccionados(prev =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };
  const toggleDimension = (dimId) => setExpandedDims(prev => ({ ...prev, [dimId]: !prev[dimId] }));

  /** Guardar: POST /secciones (fallback a micro). Mantiene NOM035 previos. */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo || !numero || !cuestionarioId) {
      setModalMessage('Todos los campos son obligatorios.');
      setShowModal(true);
      return;
    }

    try {
      // 1) CLIMA seleccionados desde UI
      const reactivosClima = reactivosSeleccionados
        .map((id) => cleanOid(id))
        .filter(Boolean)
        .map((oid) => ({ reactivoId: oid, catalogo: 'CLIMA' }));

      // 2) Preservar NOM035 (u otros) previos que ya tuviera la sección
      const prevNoClima = (seccion?.reactivos || [])
        .filter((r) => (r?.catalogo || 'CLIMA').toUpperCase() !== 'CLIMA')
        .map((r) => ({
          reactivoId: cleanOid(r?.reactivoId || r?._id || r?.id),
          catalogo: (r?.catalogo || 'NOM035').toUpperCase(),
        }))
        .filter((x) => x.reactivoId);

      // 3) Unir y asignar orden
      const union = [...prevNoClima, ...reactivosClima]
        .filter((x, i, arr) => x.reactivoId && arr.findIndex(y => y.reactivoId === x.reactivoId) === i)
        .map((x, i) => ({ ...x, orden: i + 1 }));

      const payload = {
        cuestionarioId,
        numero: Number(numero),
        titulo: String(titulo || '').trim(),
        reactivos: union,
      };

      // 4) Intentar por gateway y luego por micro
      let ok = false, lastErr = null;
      for (const base of API_SECC_BASES) {
        try {
          await postJsonSafe(`${base}/secciones`, payload);
          ok = true; break;
        } catch (e) { lastErr = e; }
      }
      if (!ok) throw lastErr || new Error('No fue posible guardar');

      setModalMessage('✅ Sección actualizada correctamente');
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        navigate(`/secciones/${cuestionarioId}`);
      }, 1000);
    } catch (err) {
      setModalMessage(err.message);
      setShowModal(true);
    }
  };

  return (
    <>
      <Header />
      <div className="registro-container">
        <div className="registro-form-wrapper">
          <h2 className="text-center mb-4">Editar Sección</h2>
          <form className="registro-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="numero">Número de Sección:</label>
              <select
                id="numero"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="registro-input"
                required
              >
                <option value="">Selecciona una opción</option>
                {[1, 2, 3, 4].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="titulo">Título:</label>
              <input
                type="text"
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="registro-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Selecciona Reactivos (preguntas CLIMA):</label>
              <div className="dimensiones-accordion">
                {Object.entries(dimensionesMap).map(([dimId, { dimension, reactivos }]) => (
                  <div key={dimId} className="dimension-panel">
                    <div
                      className="dimension-header"
                      onClick={() => toggleDimension(dimId)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') toggleDimension(dimId); }}
                    >
                      <strong>{dimension?.nombre || 'Sin dimensión'}</strong>
                      <span>{expandedDims[dimId] ? '▲' : '▼'}</span>
                    </div>
                    {expandedDims[dimId] && (
                      <div className="dimension-content">
                        {reactivos.map(r => {
                          const rid = cleanOid(r?._id);
                          const checked = reactivosSeleccionados.includes(rid);
                          return (
                            <label key={rid} className={`reactivo-label ${r.esAbierta ? 'reactivo-abierta' : ''}`}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setReactivosSeleccionados(prev =>
                                    checked ? prev.filter(x => x !== rid) : [...prev, rid]
                                  )
                                }
                              />
                              {r.texto} {r.esAbierta && <em>(Respuesta abierta)</em>}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <small style={{ display: 'block', marginTop: 8 }}>
                * Los reactivos NOM035 previamente guardados se conservan al actualizar.
              </small>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Actualizar</button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate(`/secciones/${cuestionarioId}`)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-message">
            <p>{modalMessage}</p>
            <button onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default EditarSeccion;
