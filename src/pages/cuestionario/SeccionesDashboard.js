import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/ClientesDashboard.css';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  question: {
    fontSize: 12,
    marginBottom: 5,
  },
  answer: {
    fontSize: 10,
    marginLeft: 10,
    marginBottom: 10,
    color: '#555',
  },
});

const MyDocument = ({ secciones }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Cuestionario - Todas las Secciones</Text>
      {secciones.map((seccion) => (
        <View key={seccion._id} break>
          <Text style={styles.sectionTitle}>Sección {seccion.numero}: {seccion.titulo}</Text>
          {seccion.reactivos.map((reactivo, index) => (
            <View key={reactivo._id}>
              <Text style={styles.question}>{index + 1}. {reactivo.texto}</Text>
              {reactivo.esAbierta ? (
                <Text style={styles.answer}>[Respuesta abierta]</Text>
              ) : (
                reactivo.escala?.valores?.map((valor, i) => (
                  <Text key={i} style={styles.answer}>○ {valor}</Text>
                ))
              )}
            </View>
          ))}
        </View>
      ))}
    </Page>
  </Document>
);

const SeccionesDashboard = () => {
  const { cuestionarioId } = useParams();
  const [secciones, setSecciones] = useState([]);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState("1");
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

      // Normalizamos número (por si viene como "I")
      const normalizado = data.map(sec => ({
        ...sec,
        numero: sec.numero === 'I' ? '1' : sec.numero,
      }));

      setSecciones(normalizado);
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

  const seccionActiva = secciones.find(sec => sec.numero === seccionSeleccionada);

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Cuestionario: Secciones</h2>
          <button
            className="btn-primary"
            onClick={() => navigate('/registro-seccion', { state: { cuestionarioId } })}
          >
            Registrar Sección
          </button>
        </div>
         {secciones.length > 0 && (
              <PDFDownloadLink 
                document={<MyDocument secciones={secciones} />} 
                fileName={`cuestionario_${cuestionarioId}.pdf`}
                className="btn-primary"
                style={{ marginLeft: '10px', textDecoration: 'none' }}
              >
                {({ loading }) => (loading ? 'Preparando PDF...' : 'Exportar a PDF')}
              </PDFDownloadLink>
            )}
            

        {/* Botones para seleccionar sección */}
        <div className="seccion-tabs">
          {[1, 2, 3, 4].map(num => (
            <button
              key={num}
              className={`tab-button ${seccionSeleccionada === String(num) ? 'active' : ''}`}
              onClick={() => setSeccionSeleccionada(String(num))}
            >
              Sección {num}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : !seccionActiva ? (
          <p>No hay reactivos en esta sección.</p>
        ) : (
          <div className="cuestionario-container">
            <h3>{seccionActiva.titulo}</h3>
            {seccionActiva.reactivos.map((reactivo, index) => (
              <div key={reactivo._id} className="reactivo-card">
                <p><strong>{index + 1}.</strong> {reactivo.texto}</p>

                {/* Si es reactivo abierto */}
                {reactivo.esAbierta ? (
                  <textarea
                    rows={3}
                    disabled
                    placeholder="Respuesta abierta"
                    className="reactivo-textarea-disabled"
                  />
                ) : (
                  reactivo.escala?.valores?.map((valor, i) => (
                    <div key={i} className="opcion-escala">
                      <input type="radio" name={`pregunta-${reactivo._id}`} disabled />
                      <label>{valor}</label>
                    </div>
                  ))
                )}
              </div>
            ))}

            <div className="seccion-acciones">
              <button className="btn btn-edit" onClick={() => editarSeccion(seccionActiva)}>Editar Sección</button>
              <button className="btn btn-delete" onClick={() => eliminarSeccion(seccionActiva._id)}>Eliminar Sección</button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SeccionesDashboard;
