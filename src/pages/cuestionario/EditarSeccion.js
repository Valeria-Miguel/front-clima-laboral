import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/RegistroEmpresa.css';

const EditarSeccion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { seccion } = location.state || {};

  const [titulo, setTitulo] = useState(seccion?.titulo || '');
  const [numero, setNumero] = useState(seccion?.numero || '');
  const [reactivos, setReactivos] = useState([]);
  const [reactivosSeleccionados, setReactivosSeleccionados] = useState(seccion?.reactivos?.map(r => r._id || r) || []);
  const [expandedDims, setExpandedDims] = useState({});
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!seccion) return navigate('/cuestionarios');

    const fetchReactivos = async () => {
      try {
        const res = await fetch('http://localhost:3005/api/reactivos');
        const data = await res.json();
        setReactivos(data);
      } catch (error) {
        setModalMessage('Error al cargar reactivos');
        setShowModal(true);
      }
    };
    fetchReactivos();
  }, [navigate, seccion]);

  const dimensionesMap = reactivos.reduce((acc, reactivo) => {
    const dimId = reactivo.dimension?._id || 'sin-dimension';
    if (!acc[dimId]) {
      acc[dimId] = {
        dimension: reactivo.dimension,
        reactivos: [],
      };
    }
    acc[dimId].reactivos.push(reactivo);
    return acc;
  }, {});

  const toggleReactivo = (id) => {
    setReactivosSeleccionados(prev =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const toggleDimension = (dimId) => {
    setExpandedDims(prev => ({
      ...prev,
      [dimId]: !prev[dimId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo || !numero || reactivosSeleccionados.length === 0) {
      setModalMessage('Todos los campos son obligatorios y debes seleccionar al menos un reactivo');
      setShowModal(true);
      return;
    }

    try {
      const res = await fetch('http://localhost:3005/api/secciones/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: seccion._id,
          titulo,
          numero,
          reactivos: reactivosSeleccionados,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar la sección');

      setModalMessage('✅ Sección actualizada correctamente');
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        navigate(`/secciones/${seccion.cuestionarioId}`);
      }, 2000);
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
              <label>Selecciona Reactivos (preguntas):</label>
              <div className="dimensiones-accordion">
                {Object.entries(dimensionesMap).map(([dimId, { dimension, reactivos }]) => (
                  <div key={dimId} className="dimension-panel">
                    <div
                      className="dimension-header"
                      onClick={() => toggleDimension(dimId)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') toggleDimension(dimId) }}
                    >
                      <strong>{dimension?.nombre || 'Sin dimensión'}</strong>
                      <span>{expandedDims[dimId] ? '▲' : '▼'}</span>
                    </div>
                    {expandedDims[dimId] && (
                      <div className="dimension-content">
                        {reactivos.map(r => (
                          <label
                            key={r._id}
                            className={`reactivo-label ${r.esAbierta ? 'reactivo-abierta' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={reactivosSeleccionados.includes(r._id)}
                              onChange={() => toggleReactivo(r._id)}
                            />
                            {r.texto} {r.esAbierta && <em>(Respuesta abierta)</em>}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Actualizar</button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate(`/secciones/${seccion.cuestionarioId}`)}
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
