/* import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/RegistroEmpresa.css';
import { useLocation } from 'react-router-dom'; 

const RegistroSeccion = () => {
  const navigate = useNavigate();
   const location = useLocation();
  const idCuestionario = location.state?.cuestionarioId || '';

  console.log('Cuestionario ID recibido:', idCuestionario);
  const [titulo, setTitulo] = useState('');
  const [numero, setNumero] = useState('');
  const [reactivos, setReactivos] = useState([]);
  const [reactivosSeleccionados, setReactivosSeleccionados] = useState([]);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  
  console.log('Cuestionario ID recibido:', idCuestionario);
  // Cargar reactivos desde API al montar el componente
  useEffect(() => {
    const fetchReactivos = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/reactivos');
        const data = await res.json();
        setReactivos(data);
      } catch (error) {
        setModalMessage('Error al cargar reactivos');
        setShowModal(true);
      }
    };
    fetchReactivos();
  }, []);

  // Manejar selección/desselección de reactivos
  const toggleReactivo = (id) => {
    setReactivosSeleccionados(prev => {
      if (prev.includes(id)) {
        return prev.filter(rid => rid !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo || !numero || reactivosSeleccionados.length === 0) {
      setModalMessage('Todos los campos son obligatorios y debes seleccionar al menos un reactivo');
      setShowModal(true);
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/secciones', {
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
              <input
                type="text"
                id="numero"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="registro-input"
                required
              />
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
              <label>Selecciona Reactivos:</label>
              <div className="reactivos-list" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '8px' }}>
                {reactivos.length === 0 && <p>Cargando reactivos...</p>}
                {reactivos.map(reactivo => (
                  <div key={reactivo._id} style={{ marginBottom: '6px' }}>
                    <label>
                      <input
                        type="checkbox"
                        value={reactivo._id}
                        checked={reactivosSeleccionados.includes(reactivo._id)}
                        onChange={() => toggleReactivo(reactivo._id)}
                      />{' '}
                      {reactivo.texto}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Registrar</button>
              <button type="button" className="btn-secondary" onClick={() => navigate(`/secciones/${idCuestionario}`)}>
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
 */