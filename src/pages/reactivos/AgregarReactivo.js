import Header from '../../components/Header';
import Footer from '../../components/Footer';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/RegistroEmpresa.css';

const RegistroReactivo = () => {
  const [form, setForm] = useState({
    texto: '',
    dimensionId: '',
    escalaId: '',
  });

  const [esAbierta, setEsAbierta] = useState(null);
  const [dimensiones, setDimensiones] = useState([]);
  const [escalas, setEscalas] = useState([]);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dimsRes, escalasRes] = await Promise.all([
          fetch('http://localhost:3005/api/dimensiones'),
          fetch('http://localhost:3005/api/escalas'),
        ]);

        const dimensiones = await dimsRes.json();
        const escalas = await escalasRes.json();

        setDimensiones(dimensiones);
        setEscalas(escalas);
      } catch (err) {
        setModalMessage('Error al cargar dimensiones o escalas');
        setShowModal(true);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.texto || !form.dimensionId || esAbierta === null) {
      setModalMessage('Por favor, completa todos los campos.');
      setShowModal(true);
      return;
    }

    if (!esAbierta && !form.escalaId) {
      setModalMessage('Por favor, selecciona una escala.');
      setShowModal(true);
      return;
    }

    const body = {
      texto: form.texto,
      dimensionId: form.dimensionId,
      esAbierta: esAbierta,
      ...(esAbierta ? {} : { escalaId: form.escalaId })
    };

    try {
      const response = await fetch('http://localhost:3005/api/reactivos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al registrar el reactivo');

      setModalMessage('✅ Reactivo registrado correctamente.');
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        navigate('/preguntas');
      }, 2500);
    } catch (err) {
      setModalMessage(err.message || 'Error desconocido');
      setShowModal(true);
    }
  };

  return (
    <>
      <Header />
      <div className="registro-container">
        <div className="registro-form-wrapper">
          <h2 className="text-center mb-4">Registro de Reactivo</h2>
          <form className="registro-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="texto">Texto del Reactivo:</label>
              <textarea
                id="texto"
                name="texto"
                className="registro-input"
                value={form.texto}
                onChange={handleChange}
                required
                maxLength={500}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dimensionId">Dimensión:</label>
              <select
                id="dimensionId"
                name="dimensionId"
                className="registro-input"
                value={form.dimensionId}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione una dimensión</option>
                {dimensiones.map(dim => (
                  <option key={dim._id} value={dim._id}>
                    {dim.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tipo de Respuesta:</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label>
                  <input
                    type="radio"
                    name="esAbierta"
                    value="true"
                    checked={esAbierta === true}
                    onChange={() => setEsAbierta(true)}
                  />
                  Abierta
                </label>
                <label>
                  <input
                    type="radio"
                    name="esAbierta"
                    value="false"
                    checked={esAbierta === false}
                    onChange={() => setEsAbierta(false)}
                  />
                  Cerrada
                </label>
              </div>
            </div>

            {esAbierta === false && (
              <div className="form-group">
                <label htmlFor="escalaId">Escala:</label>
                <select
                  id="escalaId"
                  name="escalaId"
                  className="registro-input"
                  value={form.escalaId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una escala</option>
                  {escalas.map(escala => (
                    <option key={escala._id} value={escala._id}>
                      {`${escala.nombre} (${escala.valores.join(', ')})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Registrar</button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/preguntas')}>Cancelar</button>

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

export default RegistroReactivo;
