import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/ClientesDashboard.css';

const CuestionariosDashboard = () => {
  const [cuestionarios, setCuestionarios] = useState([]);
  const [todosCuestionarios, setTodosCuestionarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [tipoBusqueda, setTipoBusqueda] = useState('titulo');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCuestionarios = async () => {
    try {
      const response = await fetch('http://localhost:3005/api/cuestionarios/list');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al cargar cuestionarios');
      setCuestionarios(data);
      setTodosCuestionarios(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setCuestionarios([]);
    } finally {
      setLoading(false);
    }
  };

  const buscarCuestionarios = (valor = busqueda) => {
    const filtro = valor.toLowerCase();
    if (!filtro.trim()) {
      setCuestionarios(todosCuestionarios);
      return;
    }

    const resultados = todosCuestionarios.filter(c => {
      if (tipoBusqueda === 'titulo') {
        return c.titulo.toLowerCase().includes(filtro);
      }
      if (tipoBusqueda === 'descripcion') {
        return c.descripcion.toLowerCase().includes(filtro);
      }
      return false;
    });

    setCuestionarios(resultados);
  };

  const eliminarCuestionario = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cuestionario?')) return;
    try {
      const response = await fetch(`http://localhost:3005/api/cuestionarios/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar cuestionario');
      }
      alert('Cuestionario eliminado');
      fetchCuestionarios();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const editarCuestionario = (cuestionario) => {
    navigate('/editarcuestionario', {
      state: {
        cuestionarioData: cuestionario,
      },
    });
  };

  useEffect(() => {
    fetchCuestionarios();
  }, []);

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Cuestionarios Registrados</h2>
          <button className="btn-primary" onClick={() => navigate('/agregarcuestionario')}>Nuevo Cuestionario</button>
        </div>

        <div className="dashboard-search">
          <select onChange={(e) => setTipoBusqueda(e.target.value)} value={tipoBusqueda}>
            <option value="titulo">Título</option>
            <option value="descripcion">Descripción</option>
          </select>
          <input
            type="text"
            placeholder={`Buscar por ${tipoBusqueda}`}
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              buscarCuestionarios(e.target.value);
            }}
          />
          <button onClick={() => buscarCuestionarios()}>Buscar</button>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <table className="clientes-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Descripción</th>
                <th>Fecha de creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cuestionarios.map(c => (
                <tr key={c._id}>
                  <td>{c.titulo}</td>
                  <td>{c.descripcion}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => editarCuestionario(c)}>Editar</button>
                    <button onClick={() => eliminarCuestionario(c._id)}>Eliminar</button>
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

export default CuestionariosDashboard;
