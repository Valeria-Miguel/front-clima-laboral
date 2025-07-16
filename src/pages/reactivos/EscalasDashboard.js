import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/ClientesDashboard.css';

const EscalasDashboard = () => {
  const [escalas, setEscalas] = useState([]);
  const [todasEscalas, setTodasEscalas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchEscalas = async () => {
    try {
      const response = await fetch('http://localhost:3005/api/escalas');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al cargar escalas');
      setEscalas(data);
      setTodasEscalas(data);
    } catch (err) {
      setError(err.message);
      setEscalas([]);
    } finally {
      setLoading(false);
    }
  };

  const buscarEscalas = (valor = busqueda) => {
    const filtro = valor.toLowerCase().trim();
    if (!filtro) {
      setEscalas(todasEscalas);
      return;
    }

    const resultados = todasEscalas.filter(escala =>
      escala.nombre.toLowerCase().includes(filtro)
    );

    setEscalas(resultados);
  };

  const eliminarEscala = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta escala?')) return;
    try {
      const response = await fetch(`http://localhost:3005/api/escalas/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar escala');
      }
      alert('Escala eliminada');
      fetchEscalas();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const editarEscala = (escala) => {
    navigate('/editar-escala', {
      state: {
        escalaData: escala
      }
    });
  };

  useEffect(() => {
    fetchEscalas();
  }, []);

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Escalas Registradas</h2>
          <button className="btn-primary" onClick={() => navigate('/registro-escala')}>
            ➕ Agregar Escala
          </button>
        </div>

        <div className="dashboard-search">
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              buscarEscalas(e.target.value);
            }}
          />
          <button onClick={() => buscarEscalas()}>Buscar</button>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <table className="clientes-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Valores</th>
                <th>Puntos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {escalas.map(escala => (
                <tr key={escala._id}>
                  <td>{escala.nombre}</td>
                  <td>{escala.valores.join(', ')}</td>
                  <td>{escala.puntos.join(', ')}</td>
                  <td>
                    <button onClick={() => editarEscala(escala)}>Editar</button>
                    <button onClick={() => eliminarEscala(escala._id)}>Eliminar</button>
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

export default EscalasDashboard;
