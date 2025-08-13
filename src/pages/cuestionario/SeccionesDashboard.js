import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/ClientesDashboard.css';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import ApiConfig from '../../apiConfig';

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 20, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, marginBottom: 10, fontWeight: 'bold' },
  question: { fontSize: 12, marginBottom: 5 }
});

const MyDocument = ({ secciones }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Cuestionario - Todas las Secciones</Text>
      {secciones.map((seccion) => (
        <View key={seccion._id} wrap={false}>
          <Text style={styles.sectionTitle}>
            Sección {seccion.numero}: {seccion.titulo}
          </Text>
          {seccion.reactivos.map((r, idx) => {
            const texto =
              r.texto ||
              r.reactivo?.texto ||
              r.reactivoId?.texto ||
              ''; // por si viene populate distinto
            return (
              <Text key={`${r.reactivoId?._id || r.reactivoId || idx}`} style={styles.question}>
                {idx + 1}. {texto}
              </Text>
            );
          })}
        </View>
      ))}
    </Page>
  </Document>
);

const SeccionesDashboard = () => {
  const { cuestionarioId } = useParams();
  const [secciones, setSecciones] = useState([]);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState('1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchSecciones = async () => {
  try {
    const url = `${ApiConfig.baseURL}/api/cuestionarios/${cuestionarioId}/secciones?populate=true`;
    const response = await fetch(url);

    // evita el "Unexpected token '<'..." si llega HTML de un 404
    const ct = response.headers.get('content-type') || '';
    let data = ct.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const msg = typeof data === 'string' ? `HTTP ${response.status}: ${data.slice(0,120)}` 
                                           : (data.message || data.error || 'Error al cargar secciones');
      throw new Error(msg);
    }

    setSecciones(Array.isArray(data) ? data : []);
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
      const response = await fetch(`${ApiConfig.baseURL}/api/secciones/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al eliminar sección');
      await fetchSecciones();
      alert('Sección eliminada');
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const editarSeccion = (seccion) => {
    navigate('/editar-seccion', { state: { seccion } });
  };

  useEffect(() => {
  if (cuestionarioId) fetchSecciones();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [cuestionarioId]);
  const seccionActiva = secciones.find(sec => String(sec.numero) === String(seccionSeleccionada));

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Cuestionario: Secciones</h2>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <button
              className="btn-primary"
              onClick={() => navigate('/registro-seccion', { state: { cuestionarioId } })}
            >
              Registrar Sección
            </button>

            {secciones.length > 0 && (
              <PDFDownloadLink
                document={<MyDocument secciones={secciones} />}
                fileName={`cuestionario_${cuestionarioId}.pdf`}
                className="btn-primary"
                style={{ textDecoration: 'none' }}
              >
                {({ loading }) => (loading ? 'Preparando PDF...' : 'Exportar a PDF')}
              </PDFDownloadLink>
            )}
          </div>
        </div>

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

            {seccionActiva.reactivos.map((reactivo, index) => {
              const key = `${reactivo.reactivoId?._id || reactivo.reactivoId || index}-${index}`;
              const texto =
                reactivo.texto ||
                reactivo.reactivo?.texto ||
                reactivo.reactivoId?.texto ||
                '';
              return (
                <div key={key} className="reactivo-card">
                  <p>
                    <strong>{index + 1}.</strong> {texto}{' '}
                    {reactivo.catalogo && <small>({reactivo.catalogo})</small>}
                  </p>
                </div>
              );
            })}

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
