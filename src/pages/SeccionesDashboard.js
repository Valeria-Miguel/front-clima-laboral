import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/ClientesDashboard.css';

const SeccionesDashboard = () => {
  const { cuestionarioId } = useParams();
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchSecciones = async () => {
    try {
      const response = await fetch('http://localhost:3005/api/secciones/por-cuestionario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuestionarioId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al cargar secciones');
      setSecciones(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setSecciones([]);
    } finally {
      setLoading(false);
    }
  };

  const eliminarSeccion = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta sección?')) return;
    try {
      const response = await fetch('http://localhost:3005/api/secciones/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar sección');
      }
      alert('Sección eliminada');
      fetchSecciones();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const editarSeccion = (seccion) => {
    navigate('/editar-seccion', { state: { seccion } });
  };

  useEffect(() => {
    fetchSecciones();
  }, [cuestionarioId]);

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Secciones del Cuestionario</h2>
          <button
            className="btn-primary"
            onClick={() => navigate('/registro-seccion', { state: { cuestionarioId } })}
          >
            Registrar Sección
          </button>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <table className="clientes-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Título</th>
                <th>Reactivos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {secciones.map(seccion => (
                <tr key={seccion._id}>
                  <td>{seccion.numero}</td>
                  <td>{seccion.titulo}</td>
                  <td>{seccion.reactivos.length}</td>
                  <td>
                    <button onClick={() => editarSeccion(seccion)}>Editar</button>
                    <button onClick={() => eliminarSeccion(seccion._id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SeccionesDashboard;
