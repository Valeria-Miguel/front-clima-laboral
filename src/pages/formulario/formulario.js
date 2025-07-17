import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
// CSS puede activarse después:
// import '../../styles/Formulario.css';

const fases = ['Fase 1', 'Fase 2', 'Fase 3', 'Fase 4'];

const Formulario = () => {
  const [faseActual, setFaseActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});

  const handleChange = (preguntaId, valor) => {
    setRespuestas({
      ...respuestas,
      [preguntaId]: valor,
    });
  };

  const avanzarFase = () => {
    if (faseActual < fases.length - 1) {
      setFaseActual(faseActual + 1);
    } else {
      console.log('Formulario completado:', respuestas);
      alert('¡Gracias por completar el formulario!');
    }
  };

  return (
    <>
      <Header />
      <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Barra de fases */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          {fases.map((fase, idx) => (
            <div
              key={fase}
              style={{
                flex: 1,
                padding: '10px',
                textAlign: 'center',
                borderBottom: idx === faseActual ? '4px solid #007bff' : '2px solid #ccc',
                fontWeight: idx === faseActual ? 'bold' : 'normal',
              }}
            >
              {fase}
            </div>
          ))}
        </div>

        {/* Preguntas (puedes condicionar por faseActual si deseas mostrar diferentes preguntas por fase) */}
        <div>
          {/* Pregunta opción múltiple */}
          <div style={{ marginBottom: '20px' }}>
            <p>1. ¿Cuál es tu nivel de satisfacción con tu entorno laboral?</p>
            <label><input type="radio" name="p1" value="Alta" onChange={() => handleChange('p1', 'Alta')} /> Alta</label><br />
            <label><input type="radio" name="p1" value="Media" onChange={() => handleChange('p1', 'Media')} /> Media</label><br />
            <label><input type="radio" name="p1" value="Baja" onChange={() => handleChange('p1', 'Baja')} /> Baja</label>
          </div>

          {/* Pregunta tipo Likert */}
          <div style={{ marginBottom: '20px' }}>
            <p>2. Estoy satisfecho con mi balance entre trabajo y vida personal.</p>
            {['Muy en desacuerdo', 'En desacuerdo', 'Neutral', 'De acuerdo', 'Muy de acuerdo'].map((opcion, i) => (
              <label key={i} style={{ marginRight: '10px' }}>
                <input
                  type="radio"
                  name="p2"
                  value={opcion}
                  onChange={() => handleChange('p2', opcion)}
                />{' '}
                {opcion}
              </label>
            ))}
          </div>

          {/* Pregunta abierta */}
          <div style={{ marginBottom: '20px' }}>
            <p>3. ¿Qué sugerencias tienes para mejorar el ambiente laboral?</p>
            <textarea
              rows="4"
              style={{ width: '100%', padding: '10px' }}
              onChange={(e) => handleChange('p3', e.target.value)}
            />
          </div>

          {/* Botón para siguiente fase */}
          <button
            onClick={avanzarFase}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {faseActual < fases.length - 1 ? 'Siguiente fase' : 'Enviar respuestas'}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Formulario;
