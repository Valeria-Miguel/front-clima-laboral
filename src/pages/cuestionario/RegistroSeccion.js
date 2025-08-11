import React, { useState, useEffect } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/RegistroEmpresa.css';

const RegistroSeccion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const idCuestionario = location.state?.cuestionarioId || '';

  const [titulo, setTitulo] = useState('');
  const [numero, setNumero] = useState('');
  const [reactivos, setReactivos] = useState([]);
  const [reactivosSeleccionados, setReactivosSeleccionados] = useState([]);
  const [expandedDims, setExpandedDims] = useState({});
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
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
  }, []);

  // Agrupar reactivos por dimensión
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

  // Expandir/contraer dimensión
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
      const res = await fetch('http://localhost:3005/api/secciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cuestionarioId: idCuestionario,
          numero,
          titulo,
          reactivos: reactivosSeleccionados,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al registrar la sección');

      setModalMessage('✅ Sección registrada correctamente');
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        navigate(`/secciones/${idCuestionario}`);
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
          <h2 className="text-center mb-4">Registrar Sección</h2>
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
                {[1,2,3,4].map(n => (
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
                {Object.entries(dimensionesMap).map(([dimId, {dimension, reactivos}]) => (
                  <div key={dimId} className="dimension-panel">
                    <div
                      className="dimension-header"
                      onClick={() => toggleDimension(dimId)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if(e.key === 'Enter') toggleDimension(dimId)}}
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
              <button type="submit" className="btn-primary">Registrar</button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate(`/secciones/${idCuestionario}`)}
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

export default RegistroSeccion;
