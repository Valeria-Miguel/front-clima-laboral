import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/ClientesDashboard.css';

const PreguntasDashboard = () => {
  const [preguntas, setPreguntas] = useState([]);
  const [todasPreguntas, setTodasPreguntas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [tipoBusqueda, setTipoBusqueda] = useState('texto');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPreguntas = async () => {
    try {
      const response = await fetch('http://localhost:3005/api/reactivos');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al cargar preguntas');
      setPreguntas(data);
      setTodasPreguntas(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setPreguntas([]);
    } finally {
      setLoading(false);
    }
  };

  const buscarPreguntas = (valor = busqueda) => {
    const filtro = valor.toLowerCase().trim();
    if (!filtro) {
      setPreguntas(todasPreguntas);
      return;
    }

    const resultados = todasPreguntas.filter(pregunta => {
      if (tipoBusqueda === 'texto') {
        return pregunta.texto.toLowerCase().includes(filtro);
      }
      if (tipoBusqueda === 'dimension') {
        return pregunta.dimension?.nombre?.toLowerCase().includes(filtro);
      }
      if (tipoBusqueda === 'escala') {
        return pregunta.escala?.nombre?.toLowerCase().includes(filtro);
      }
      return false;
    });

    setPreguntas(resultados);
  };

  const eliminarPregunta = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta pregunta?')) return;
    try {
      const response = await fetch(`http://localhost:3005/api/reactivos/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar pregunta');
      }
      alert('Pregunta eliminada');
      fetchPreguntas();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const editarPregunta = (reactivo) => {
    navigate('/EditarReactivo', {
      state: {
        reactivoData: reactivo
      }
    });
  };

  useEffect(() => {
    fetchPreguntas();
  }, []);

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Preguntas Registradas</h2>
          <button className="btn-primary" onClick={() => navigate('/agregarreactivo')}>
            Registrar nueva pregunta
          </button>
            <button type="button" className="btn-primary" onClick={() => navigate('/dimensiones')}>
            ➕ Agregar Dimensión
          </button>
          <button type="button" className="btn-primary ml-2" onClick={() => navigate('/escalas')}>
            ➕ Agregar Escala
          </button>
        </div>

        <div className="dashboard-search">
          <select onChange={(e) => setTipoBusqueda(e.target.value)} value={tipoBusqueda}>
            <option value="texto">Texto</option>
            <option value="dimension">Dimensión</option>
            <option value="escala">Escala</option>
          </select>
          <input
            type="text"
            placeholder={`Buscar por ${tipoBusqueda}`}
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              buscarPreguntas(e.target.value);
            }}
          />
          <button onClick={() => buscarPreguntas()}>Buscar</button>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <table className="clientes-table">
            <thead>
              <tr>
                <th>Texto</th>
                <th>Dimensión</th>
                <th>Escala</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {preguntas.map(pregunta => (
                <tr key={pregunta._id}>
                  <td>{pregunta.texto}</td>
                  <td>{pregunta.dimension?.nombre || '—'}</td>
                  <td>{pregunta.escala?.nombre || '—'}</td>
                  <td>
                    <button onClick={() => editarPregunta(pregunta)}>Editar</button>
                    <button onClick={() => eliminarPregunta(pregunta._id)}>Eliminar</button>
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

export default PreguntasDashboard;