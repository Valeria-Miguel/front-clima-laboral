// src/pages/captura/CapturaRespuestas.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ApiConfig from '../../apiConfig';
import '../../styles/CapturaRespuestas.css';

export default function CapturaRespuestas() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const prevState = location.state || {};

  // Wizard
  const [step, setStep] = useState(1);

  // Catálogos y estado
  const [cuestionarios, setCuestionarios] = useState([]);
  const [secciones, setSecciones]         = useState([]);  // [{numero,titulo,reactivos:[...] }]
  const [items, setItems]                 = useState([]);  // flatten de secciones.reactivos con {seccionNumero,...}
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [lookupInfo, setLookupInfo]       = useState(null); // {nombre, tipo}

  // Form
  const [form, setForm] = useState({
    participanteCodigo: (prevState.codigo || '').toUpperCase(),
    cuestionarioId:     prevState.cuestionarioId || '',
    metadata: {
      sexo: '',
      edad: '',
      estadoCivil: '',
      nivelEstudios: '',
      adscripcion: '',
      area: '',
      puestoNivel: '',
      tipoPuesto: '',
      tipoContrato: '',
      tipoPersonal: '',
      jornada: '',
      rotacion: '',
      experiencia: '',
      tiempoPuesto: '',
      instruccionAbierta: ''
    },
    respuestas: [] // [{ reactivoId, valor }]
  });

  // ============ Utilidades UI/normalización ============
  const trimDim = (dim) => {
    if (!dim) return dim;
    if (typeof dim === 'string') return dim.trim();
    if (dim?.nombre) return { ...dim, nombre: (dim.nombre || '').trim() };
    return dim;
  };

  // Opciones por tipo/escala
  const opcionesNOMPorSeccion = (seccionNumero) => {
    // NOM-035 (guias):
    // 1 -> Sí/No
    // 2 -> Nunca..Siempre
    // 3 -> Totalmente en desacuerdo..Totalmente de acuerdo
    const s = Number(seccionNumero);
    if (s === 1) return ['No', 'Sí'];
    if (s === 2)
      return ['Nunca','Casi Nunca','Algunas Veces','Casi Siempre','Siempre'];
    if (s === 3)
      return ['Totalmente en desacuerdo','En desacuerdo','De acuerdo','Totalmente de acuerdo'];
    // fallback NOM
    return ['Nunca','Casi Nunca','Algunas Veces','Casi Siempre','Siempre'];
  };

  const opcionesCLIMA = (escala) => {
    // Si la escala viene embebida, úsala; si no, 1..10 por defecto
    if (!escala) return Array.from({length: 10}, (_,i)=>i+1);
    // Si trae un arreglo de valores explícitos:
    if (Array.isArray(escala.valores) && escala.valores.length) return escala.valores;
    // Si trae rango:
    if (typeof escala.min === 'number' && typeof escala.max === 'number' && escala.max >= escala.min) {
      const out = [];
      for (let v = escala.min; v <= escala.max; v++) out.push(v);
      return out;
    }
    // Default
    return Array.from({length: 10}, (_,i)=>i+1);
  };

  const getOpcionesParaItem = (item) => {
    if (item.esAbierta) return null;
    if (item.catalogo === 'NOM035') return opcionesNOMPorSeccion(item.seccionNumero);
    // CLIMA
    return opcionesCLIMA(item.escala);
  };

  // ============ Cargar cuestionarios (fallback) ============
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${ApiConfig.baseURL}/cuestionarios`);
        if (!res.ok) throw new Error('Error al cargar cuestionarios');
        const data = await res.json();
        setCuestionarios(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  // Si ya venías con código, intenta resolver
  useEffect(() => {
    if (form.participanteCodigo) lookupByCode(form.participanteCodigo, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Al seleccionar/resolver cuestionario: cargar SECCIONES con populate
  useEffect(() => {
    if (!form.cuestionarioId) return;
    (async () => {
      try {
        setError('');
        setSuccess('');
        // Carga combinada CLIMA+NOM035
        const res = await fetch(`${ApiConfig.baseURL}/cuestionarios/${form.cuestionarioId}/api/secciones?populate=true`);
        if (!res.ok) throw new Error('No se pudieron cargar las secciones del cuestionario');
        const secs = await res.json();
        const normalized = (Array.isArray(secs) ? secs : []).map(s => ({
          ...s,
          reactivos: (s.reactivos || []).map(r => ({
            ...r,
            // Agregamos número/título de sección para uso en render y payload
            seccionNumero: s.numero,
            seccionTitulo: s.titulo,
            // Limpieza de dimension si es string u objeto
            dimension: trimDim(r.dimension)
          }))
        }));
        setSecciones(normalized);

        // Flatten a "items" para el render lineal
        const flat = [];
        normalized.forEach(sec => {
          (sec.reactivos || []).forEach(r => flat.push(r));
        });
        setItems(flat);
        setForm(f => ({ ...f, respuestas: [] })); // reset respuestas al cambiar el cuestionario
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [form.cuestionarioId]);

  // ============ Helpers ============
  const handleMeta = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, metadata: { ...f.metadata, [name]: value } }));
  };

  const handleResp = (reactivoId, valor, catalogo) => {
    // Para CLIMA intentamos guardar numérico si aplica
    let v = valor;
    if (catalogo === 'CLIMA' && !isNaN(Number(valor))) v = Number(valor);

    setForm(f => {
      const others = f.respuestas.filter(r => r.reactivoId !== reactivoId);
      return { ...f, respuestas: [...others, { reactivoId, valor: v }] };
    });
  };

  const lookupByCode = async (codeParam, silent = false) => {
    const code = String(codeParam ?? form.participanteCodigo).trim().toUpperCase();
    if (!code) {
      if (!silent) setError('Captura tu código.');
      return false;
    }
    try {
      const res = await fetch(`${ApiConfig.baseURL}/participantes/lookup/${code}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Código no encontrado');

      setForm(f => ({ ...f, participanteCodigo: code, cuestionarioId: data.cuestionarioId }));
      setLookupInfo({ nombre: data.cuestionario?.nombre, tipo: data.cuestionario?.tipo }); // CLIMA | NOM035 | MIXTO
      if (!silent) setSuccess('Código válido. Cuestionario seleccionado automáticamente.');
      setError('');
      return true;
    } catch (err) {
      setLookupInfo(null);
      if (!silent) setError(err.message);
      return false;
    }
  };

  const precheck = async () => {
    setError(''); setSuccess('');
    if (!form.cuestionarioId) { setError('Selecciona un cuestionario'); return false; }
    try {
      const res = await fetch(`${ApiConfig.baseURL}/participantes/precheck`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ cuestionarioId: form.cuestionarioId })
      });
      if (res.status === 409) {
        const data = await res.json();
        setError(data.message || 'Se alcanzó el límite de respuestas.');
        return false;
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'No fue posible validar el cupo.');
      }
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Construir payload para /respuestas/capturar con formato esperado en "answers"
  const buildPayload = () => {
    const { participanteCodigo, cuestionarioId, metadata } = form;
    const tipoQ = lookupInfo?.tipo || 'NOM035'; // CLIMA | NOM035 | MIXTO

    // Pre-index de items para recuperar metadatos en O(1)
    const idx = new Map(items.map(it => [it._id, it]));

    // Separadores
    const guiaI = [], guiaII = [], guiaIII = [];
    const seccionI = [], seccionII = [], seccionIII = [], seccionIV = [];

    form.respuestas.forEach(r => {
      const meta = idx.get(r.reactivoId);
      if (!meta) return;

      const baseItem = {
        idPregunta: r.reactivoId,
        valor: r.valor
      };

      // Enriquecer con datos útiles que tu colección answers muestra (si están disponibles)
      if (meta.texto)     baseItem.pregunta  = meta.texto;
      if (meta.dimension) baseItem.dimension = (typeof meta.dimension === 'string')
        ? meta.dimension.trim()
        : (meta.dimension?.nombre || '').trim();

      if (meta.catalogo === 'NOM035') {
        // NOM: por sección 1/2/3
        const s = Number(meta.seccionNumero);
        // Agregamos "escala" como texto para trazabilidad (según sección)
        if (s === 1) baseItem.escala = 'Sí/No';
        else if (s === 2) baseItem.escala = 'Siempre=4,Casi Siempre=3,Algunas Veces=2,Casi Nunca=1,Nunca=0';
        else if (s === 3) baseItem.escala = 'Totalmente de acuerdo / En desacuerdo (mapa 0-3)';

        if (s === 1)      guiaI.push(baseItem);
        else if (s === 2) guiaII.push(baseItem);
        else if (s === 3) guiaIII.push(baseItem);
        else              guiaII.push(baseItem); // fallback
      } else {
        // CLIMA: por sección 1..4
        const s = Number(meta.seccionNumero);
        // Si hay escala embebida, también la registramos para traza
        if (meta.escala && Array.isArray(meta.escala.valores)) {
          baseItem.escala = `Valores: ${meta.escala.valores.join(',')}`;
        } else if (meta.escala && typeof meta.escala.min === 'number' && typeof meta.escala.max === 'number') {
          baseItem.escala = `Rango: ${meta.escala.min}-${meta.escala.max}`;
        }

        if (s === 1)      seccionI.push(baseItem);
        else if (s === 2) seccionII.push(baseItem);
        else if (s === 3) seccionIII.push(baseItem);
        else if (s === 4) seccionIV.push(baseItem);
        else              seccionIII.push(baseItem); // fallback
      }
    });

    // Si el cuestionario es MIXTO, el mismo participante responde todo en una sola pasada;
    // Por lo tanto, enviamos ambos bloques si hay contenido de ambos.
    const payload = {
      participanteCodigo,
      cuestionarioId,
      guiaV: metadata
    };

    if (guiaI.length || guiaII.length || guiaIII.length) {
      payload.guiaI = guiaI; payload.guiaII = guiaII; payload.guiaIII = guiaIII;
    }
    if (seccionI.length || seccionII.length || seccionIII.length || seccionIV.length) {
      payload.climaLaboral = { seccionI, seccionII, seccionIII, seccionIV };
    }

    return payload;
  };

  // ============ Pasos UI ============
  const Step1 = () => (
    <>
      <div className="form-group">
        <label>Código de Participante:</label>
        <div className="inline">
          <input
            value={form.participanteCodigo}
            onChange={e => setForm(f => ({ ...f, participanteCodigo: e.target.value.toUpperCase() }))}
            onBlur={() => lookupByCode()}
            className="registro-input"
            placeholder="Ej. 417453FE"
          />
          <button type="button" className="btn-secondary" onClick={() => lookupByCode()}>
            Buscar
          </button>
        </div>
        {lookupInfo && (
          <small className="hint">
            Código vinculado a: <b>{lookupInfo.nombre}</b> ({lookupInfo.tipo})
          </small>
        )}
      </div>

      <div className="form-group">
        <label>Cuestionario:</label>
        <select
          value={form.cuestionarioId}
          onChange={e => setForm(f => ({ ...f, cuestionarioId: e.target.value }))}
          className="registro-input"
          disabled={!!lookupInfo}  // bloqueado si viene del código
        >
          <option value="">-- Selecciona uno --</option>
          {cuestionarios.map(c => (
            <option key={c._id} value={c._id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      <div className="wizard-buttons">
        <button
          className="btn-primary"
          onClick={async () => {
            if (!form.participanteCodigo) {
              setError('Captura tu código de participante.');
              return;
            }
            if (!form.cuestionarioId) {
              const okResolve = await lookupByCode();
              if (!okResolve) return;
            }
            const ok = await precheck();
            if (ok) setStep(2);
          }}
        >
          Siguiente
        </button>
      </div>
    </>
  );

  const Step2 = () => (
    <>
      <h3>Metadatos (Guía V)</h3>
      {/* Sexo */}
      <div className="form-group">
        <label>Sexo:</label>
        <select name="sexo" value={form.metadata.sexo} onChange={handleMeta} className="registro-input">
          <option value="">-- Selecciona --</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
        </select>
      </div>

      {/* Edad */}
      <div className="form-group">
        <label>Edad en años:</label>
        <select name="edad" value={form.metadata.edad} onChange={handleMeta} className="registro-input">
          <option value="">-- Selecciona rango --</option>
          {['15-19','20-24','25-29','30-34','35-39','40-44','45-49','50-54','55-59','60-64','65-69','70 o más'].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Estado Civil */}
      <div className="form-group">
        <label>Estado Civil:</label>
        <select name="estadoCivil" value={form.metadata.estadoCivil} onChange={handleMeta} className="registro-input">
          <option value="">-- Selecciona --</option>
          <option value="Casado">Casado</option>
          <option value="Soltero">Soltero</option>
          <option value="Unión libre">Unión libre</option>
          <option value="Divorciado">Divorciado</option>
          <option value="Viudo">Viudo</option>
        </select>
      </div>

      {/* Nivel de Estudios */}
      <div className="form-group">
        <label>Nivel de Estudios:</label>
        <select name="nivelEstudios" value={form.metadata.nivelEstudios} onChange={handleMeta} className="registro-input">
          <option value="">-- Selecciona --</option>
          {[
            'Sin formación','Primaria terminada','Primaria incompleta',
            'Secundaria terminada','Secundaria incompleta',
            'Preparatoria terminada','Preparatoria incompleta',
            'Técnico Superior terminada','Técnico Superior incompleta',
            'Licenciatura terminada','Licenciatura incompleta',
            'Maestría terminada','Maestría incompleta',
            'Doctorado terminada','Doctorado incompleta'
          ].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {/* Adscripción */}
      <div className="form-group">
        <label>Matriz / Sucursal:</label>
        <select name="adscripcion" value={form.metadata.adscripcion} onChange={handleMeta} className="registro-input">
          <option value="">-- Selecciona --</option>
          <option value="Norte">Norte</option>
          <option value="Sur">Sur</option>
          <option value="Noreste">Noreste</option>
          <option value="Noroeste">Noroeste</option>
          <option value="Otras">Otras</option>
        </select>
      </div>

      {/* Área */}
      <div className="form-group">
        <label>Departamento / Área:</label>
        <select name="area" value={form.metadata.area} onChange={handleMeta} className="registro-input">
          <option value="">-- Selecciona --</option>
          {[
            'Administración','Producción','Logística','Compras','Ventas',
            'Mercadotecnia','Finanzas','Recursos Humanos','Mantenimiento'
          ].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Puesto / Nivel */}
      <div className="form-group">
        <label>Puesto / Nivel:</label>
        <select name="puestoNivel" value={form.metadata.puestoNivel} onChange={handleMeta} className="registro-input">
          <option value="">-- Selecciona --</option>
          {[
            'Ayudante general','Operador de producción','Mecánico',
            'Supervisor de producción','Jefatura','Líder','Gerencia','Dirección'
          ].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Tipo de puesto */}
      <div className="form-group">
        <label>Tipo de puesto:</label>
        <select name="tipoPuesto" value={form.metadata.tipoPuesto} onChange={handleMeta} className="registro-input">
          <option value="">-- Selecciona --</option>
          {['Operativo','Supervisor','Profesional técnico','Gerente'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Tipo de contratación */}
      <div className="form-group">
        <label>Tipo de contratación:</label>
        <select name="tipoContrato" value={form.metadata.tipoContrato} onChange={handleMeta} className="registro-input">
          <option value="">-- Selecciona --</option>
          {['Por obra o proyecto','Por tiempo determinado','Tiempo indeterminado','Honorarios'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Tipo de personal */}
      <div className="form-group">
        <label>Tipo de personal:</label>
        <select name="tipoPersonal" value={form.metadata.tipoPersonal} onChange={handleMeta} className="registro-input">
          <option value="">-- Selecciona --</option>
          {['Sindicalizado','Confianza','Ninguno'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Jornada */}
      <div className="form-group">
        <label>Tipo de jornada de trabajo:</label>
        <select name="jornada" value={form.metadata.jornada} onChange={handleMeta} className="registro-input">
          <option value="">-- Selecciona --</option>
          {['Fijo nocturno (20:00-6:00)','Fijo diurno (6:00-20:00)','Fijo mixto'].map(j => <option key={j} value={j}>{j}</option>)}
        </select>
      </div>

      {/* Rotación */}
      <div className="form-group">
        <label>Realiza rotación de turnos:</label>
        <select name="rotacion" value={form.metadata.rotacion} onChange={handleMeta} className="registro-input">
          <option value="">-- Selecciona --</option>
          <option value="Si">Si</option>
          <option value="No">No</option>
        </select>
      </div>

      {/* Experiencia */}
      <div className="form-group">
        <label>Tiempo de experiencia laboral:</label>
        <select name="experiencia" value={form.metadata.experiencia} onChange={handleMeta} className="registro-input">
          <option value="">-- Selecciona --</option>
          {['Menos de 6 meses','6 meses a 1 año','1 a 4 años','5 a 9 años','10 a 14 años','15 a 19 años','20 a 24 años','25 años o más'].map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Tiempo en el puesto */}
      <div className="form-group">
        <label>Tiempo en el puesto actual:</label>
        <select name="tiempoPuesto" value={form.metadata.tiempoPuesto} onChange={handleMeta} className="registro-input">
          <option value="">-- Selecciona --</option>
          {['Menos de 6 meses','6 meses a 1 año','1 a 4 años','5 a 9 años','10 a 14 años','15 a 19 años','20 a 24 años','25 años o más'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Instrucción abierta */}
      <div className="form-group">
        <label>Instrucción abierta:</label>
        <textarea name="instruccionAbierta" value={form.metadata.instruccionAbierta} onChange={handleMeta} className="registro-input" />
      </div>

      <div className="wizard-buttons">
        <button onClick={() => setStep(1)} className="btn-secondary">Atrás</button>
        <button onClick={() => setStep(3)} className="btn-primary">Siguiente</button>
      </div>
    </>
  );

  const Step3 = () => {
    const registrar = async () => {
      setError(''); setSuccess('');
      const { participanteCodigo, cuestionarioId } = form;

      if (!participanteCodigo || !cuestionarioId) {
        setError('Código y cuestionario obligatorios'); setStep(1); return;
      }
      // Validación simple: cada item cerrado debe tener respuesta
      const cerrados = items.filter(it => !it.esAbierta);
      const respondidos = form.respuestas.filter(r => cerrados.find(c => c._id === r.reactivoId));
      if (cerrados.length !== respondidos.length) {
        setError('Debes responder todas las preguntas cerradas');
        return;
      }

      try {
        const payload = buildPayload();
        const res = await fetch(`${ApiConfig.baseURL}/respuestas/capturar`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al guardar respuestas');

        await fetch(`${ApiConfig.baseURL}/participantes/completado`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ participanteCodigo, cuestionarioId })
        });

        setSuccess('Respuestas guardadas correctamente');
        setTimeout(() => navigate('/captura/generar'), 1200);
      } catch (err) {
        setError(err.message);
      }
    };

    return (
      <>
        <h3>Respuestas</h3>

        {/* Render reutilizando la estructura de secciones */}
        {secciones.map(sec => (
          <div key={`sec_${sec.numero}`} className="seccion-block">
            <h4>{`Sección ${sec.numero}: ${sec.titulo || ''}`}</h4>

            {(sec.reactivos || []).map(r => {
              const current = form.respuestas.find(x => x.reactivoId === r._id);
              const opciones = getOpcionesParaItem(r);

              return (
                <div key={r._id} className="reactivo-item">
                  <div className="reactivo-texto">
                    <span>{r.texto}</span>
                    {r.dimension?.nombre && (
                      <small className="hint">Dimensión: {r.dimension.nombre}</small>
                    )}
                    {r.catalogo === 'CLIMA' && r.escala && r.escala.valores && (
                      <small className="hint">Escala: {r.escala.valores.join(' / ')}</small>
                    )}
                  </div>

                  {/* Cerrada vs Abierta */}
                  {!r.esAbierta ? (
                    <select
                      value={current?.valor ?? ''}
                      onChange={e => handleResp(r._id, e.target.value, r.catalogo)}
                      className="registro-input"
                    >
                      <option value="">--</option>
                      {opciones.map((v,i) => (
                        <option key={i} value={v}>{v}</option>
                      ))}
                    </select>
                  ) : (
                    <textarea
                      value={current?.valor ?? ''}
                      onChange={e => handleResp(r._id, e.target.value, r.catalogo)}
                      className="registro-input"
                      rows={3}
                      placeholder="Escribe tu respuesta..."
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}

        <div className="wizard-buttons">
          <button onClick={() => setStep(2)} className="btn-secondary">Atrás</button>
          <button onClick={registrar} className="btn-primary">Guardar</button>
        </div>
      </>
    );
  };

  return (
    <div className="captura-page">
      <h2>Captura de Respuestas</h2>
      {error   && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
    </div>
  );
}
