import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/RegistroEmpresa.css';

const EditarReactivo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reactivoData } = location.state || {};
  
  const [form, setForm] = useState(null);
  const [dimensiones, setDimensiones] = useState([]);
  const [escalas, setEscalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!reactivoData?._id) {
          throw new Error('No se proporcionaron datos del reactivo');
        }

        // Cargar datos del reactivo
        const responseReactivo = await fetch(`http://localhost:3005/api/reactivos/get`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: reactivoData._id })
        });

        const reactivo = await responseReactivo.json();
        if (!responseReactivo.ok) throw new Error(reactivo.error || 'No se pudo cargar el reactivo');

        setForm({
          texto: reactivo.texto,
          dimensionId: reactivo.dimension._id,
          escalaId: reactivo.escala._id
        });

        // Cargar dimensiones
        const resDim = await fetch(`http://localhost:3005/api/dimensiones`);
        const dataDim = await resDim.json();
        setDimensiones(dataDim);

        // Cargar escalas
        const resEsc = await fetch(`http://localhost:3005/api/escalas`);
        const dataEsc = await resEsc.json();
        setEscalas(dataEsc);

      } catch (err) {
        setModalMessage(err.message);
        setShowModal(true);
        setTimeout(() => navigate('/preguntas'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reactivoData, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3005/api/reactivos/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reactivoData._id, ...form })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al actualizar el reactivo');

      setModalMessage('✅ Reactivo actualizado correctamente');
      setShowModal(true);
      setTimeout(() => navigate('/preguntas'), 2000);
    } catch (err) {
      setModalMessage(`❌ Error: ${err.message}`);
      setShowModal(true);
    }
  };

  if (loading || !form) return <p className="text-center">Cargando reactivo...</p>;

  return (
    <>
      <Header />
      <div className="registro-container">
        <div className="registro-form-wrapper">
          <h2 className="text-center mb-4">Editar Reactivo</h2>
          <form className="registro-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="texto">Texto del reactivo:</label>
                <textarea
                  id="texto"
                  name="texto"
                  className="registro-input"
                  value={form.texto}
                  onChange={handleChange}
                  required
                  rows={3}
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
                  {dimensiones.map((dim) => (
                    <option key={dim._id} value={dim._id}>
                      {dim.nombre}
                    </option>
                  ))}
                </select>
              </div>

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
                  {escalas.map((esc) => (
                    <option key={esc._id} value={esc._id}>
                      {esc.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Guardar cambios</button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/preguntas')}
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
            <button onClick={() => {
              setShowModal(false);
              if (modalMessage.includes('✅')) {
                navigate('/preguntas');
              }
            }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default EditarReactivo;
