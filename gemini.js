const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const ALLOWED_MODELS = ['gemini-3.8-flash', 'gemini-4-carbon'];
const ALLOWED_VOICES = ['Aoede', 'Kore', 'Puck', 'Charon', 'Fenrir', 'Leda', 'Orus', 'Zephyr'];
const VALID_TYPES = ['apertura', 'concepto', 'esquema', 'grafica', 'comparacion', 'proceso', 'ejemplo', 'sintesis'];
const VALID_ANIMATIONS = ['deslizar', 'maquina', 'escala', 'cascada', 'revelar'];
const VALID_VISUALS = ['mapa_mental', 'barras', 'linea_tiempo', 'comparativa', 'ciclo', 'piramide', 'ilustracion'];

function countWords(text) {
  return (text || '').trim().split(/\s+/).filter(Boolean).length;
}

function calcDurationSec(narration) {
  return Math.max(8, Math.ceil(countWords(narration) / 2.0) + 1);
}

function sanitizeVisualData(items) {
  if (!Array.isArray(items) || !items.length) {
    return [
      { etiqueta: 'Fundamento', valor: 85 },
      { etiqueta: 'Estructura', valor: 72 },
      { etiqueta: 'Aplicación', valor: 90 },
      { etiqueta: 'Síntesis', valor: 95 }
    ];
  }
  return items.slice(0, 5).map((it, idx) => ({
    etiqueta: String(it?.etiqueta || `Punto ${idx + 1}`).trim().slice(0, 26),
    valor: Math.max(10, Math.min(100, Number(it?.valor) || (55 + idx * 12)))
  }));
}

function sanitizeScene(scene, index) {
  const tipo = VALID_TYPES.includes(scene.tipo) ? scene.tipo : (index === 0 ? 'apertura' : 'concepto');
  const animacion = VALID_ANIMATIONS.includes(scene.animacion)
    ? scene.animacion
    : VALID_ANIMATIONS[index % VALID_ANIMATIONS.length];
  const visual = VALID_VISUALS.includes(scene.visual)
    ? scene.visual
    : VALID_VISUALS[index % VALID_VISUALS.length];
  const narracion = String(scene.narracion_es || 'En esta sección examinamos el concepto central paso a paso.').trim();
  const titulo = String(scene.titulo_grafico || `Sección ${index + 1}`)
    .trim()
    .split(/\s+/)
    .slice(0, 7)
    .join(' ');
  const puntos = Array.isArray(scene.puntos_clave)
    ? scene.puntos_clave.map((p) => String(p).trim()).filter(Boolean).slice(0, 3)
    : ['Idea central explicada con claridad', 'Conexión práctica con el tema'];

  return {
    tipo,
    animacion,
    visual,
    datos_visuales: sanitizeVisualData(scene.datos_visuales),
    duracion_seg: Math.max(8, Number(scene.duracion_seg) || calcDurationSec(narracion)),
    titulo_grafico: titulo,
    puntos_clave: puntos.length >= 2 ? puntos : [...puntos, 'Aplicación en el curso'].slice(0, 2),
    icono: String(scene.icono || '📘').trim().slice(0, 4),
    narracion_es: narracion
  };
}

function buildLocalEducationalScript({ lessonTitle, content, courseLabel, approach }) {
  const title = (lessonTitle || 'Lección del curso').trim();
  const course = (courseLabel || 'Curso explicativo').trim();
  const rawSentences = (content || '')
    .split(/[\n.!?;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);

  const blueprint = [
    { tipo: 'apertura', visual: 'ilustracion', animacion: 'revelar', icono: '🎓', label: `Introducción a ${title}` },
    { tipo: 'esquema', visual: 'mapa_mental', animacion: 'deslizar', icono: '🧭', label: 'Mapa general de la lección' },
    { tipo: 'concepto', visual: 'piramide', animacion: 'maquina', icono: '🧱', label: 'Fundamentos y conceptos base' },
    { tipo: 'proceso', visual: 'linea_tiempo', animacion: 'cascada', icono: '⏳', label: 'Desarrollo paso a paso' },
    { tipo: 'concepto', visual: 'ilustracion', animacion: 'escala', icono: '🔬', label: 'Mecanismos y relaciones clave' },
    { tipo: 'grafica', visual: 'barras', animacion: 'deslizar', icono: '📊', label: 'Distribución y peso conceptual' },
    { tipo: 'comparacion', visual: 'comparativa', animacion: 'revelar', icono: '⚖️', label: 'Contrastes y matices esenciales' },
    { tipo: 'proceso', visual: 'ciclo', animacion: 'cascada', icono: '🔄', label: 'Ciclo de aplicación práctica' },
    { tipo: 'ejemplo', visual: 'mapa_mental', animacion: 'escala', icono: '💡', label: 'Caso aplicado al aula' },
    { tipo: 'concepto', visual: 'piramide', animacion: 'maquina', icono: '🧩', label: 'Errores frecuentes que conviene evitar' },
    { tipo: 'ejemplo', visual: 'linea_tiempo', animacion: 'deslizar', icono: '📝', label: 'Ejercicio guiado de comprensión' },
    { tipo: 'sintesis', visual: 'barras', animacion: 'revelar', icono: '✅', label: 'Síntesis final y repaso clave' }
  ];

  const enfoque = approach || 'Explicación profunda';
  const escenas = blueprint.map((bp, idx) => {
    const srcA = rawSentences[idx % Math.max(1, rawSentences.length)] || `Este bloque profundiza en un eje fundamental de ${title}.`;
    const srcB = rawSentences[(idx + 1) % Math.max(1, rawSentences.length)] || `Comprender esta relación permite consolidar el aprendizaje dentro de ${course}.`;
    const narr = idx === 0
      ? `Bienvenidos a esta lección sobre ${title}, diseñada con un enfoque de ${enfoque.toLowerCase()}. A lo largo de los próximos cinco minutos recorreremos sus conceptos fundamentales, esquemas visuales, contrastes y ejemplos prácticos para que puedas dominar el tema con claridad.`
      : idx === blueprint.length - 1
        ? `Para concluir esta síntesis de ${title}, conviene retener tres ideas esenciales: la definición precisa de los conceptos, la secuencia lógica que los articula y su aplicación concreta en problemas reales. Repasa el esquema general y pon a prueba estas claves en tu próxima actividad del curso.`
        : `${srcA}. Además, conviene observar cómo ${srcB.charAt(0).toLowerCase() + srcB.slice(1)}. Al analizar este punto mediante un esquema visual, resulta mucho más sencillo identificar las causas, distinguir los matices importantes y recordar la lógica interna del tema sin memorización mecánica.`;

    const shortTitle = idx === 0 || idx === blueprint.length - 1
      ? bp.label
      : (rawSentences[idx] ? rawSentences[idx].split(/\s+/).slice(0, 6).join(' ').replace(/[,:;]+$/, '') : bp.label);

    return sanitizeScene({
      tipo: bp.tipo,
      animacion: bp.animacion,
      visual: bp.visual,
      datos_visuales: [
        { etiqueta: 'Base teórica', valor: 65 + ((idx * 7) % 30) },
        { etiqueta: 'Análisis', valor: 58 + ((idx * 11) % 35) },
        { etiqueta: 'Relación', valor: 70 + ((idx * 5) % 25) },
        { etiqueta: 'Aplicación', valor: 75 + ((idx * 9) % 22) }
      ],
      duracion_seg: calcDurationSec(narr),
      titulo_grafico: shortTitle || bp.label,
      puntos_clave: [
        srcA.length > 56 ? `${srcA.slice(0, 53)}…` : srcA,
        srcB.length > 56 ? `${srcB.slice(0, 53)}…` : srcB
      ],
      icono: bp.icono,
      narracion_es: narr
    }, idx);
  });

  return {
    titulo_leccion: title,
    curso: course,
    escenas,
    fallback: true
  };
}

async function fetchWithTimeout(url, options, timeoutMs = 30000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function generateLessonScriptWithGemini({ apiKey, lessonTitle, content, courseLabel, approach, model }) {
  if (!apiKey) {
    return buildLocalEducationalScript({ lessonTitle, content, courseLabel, approach });
  }

  const selectedModel = ALLOWED_MODELS.includes(model) ? model : 'gemini-3.8-flash';
  const systemPrompt = `Eres un diseñador instruccional y profesor universitario experto en crear guiones para vídeos educativos, explicativos y didácticos en español neutro natural.
NUNCA escribas con tono publicitario ni promocional: el propósito es enseñar, explicar y sintetizar una lección de un curso.
Reglas estrictas:
1. Diseña un vídeo didáctico de ALREDEDOR DE 5 MINUTOS (entre 12 y 15 escenas, con narraciones ricas de ~40 a 55 palabras por escena para sumar ~280 a 320 segundos en total).
2. Usa ortotipografía impecable en español: títulos con mayúscula solo en la primera palabra y nombres propios (estilo oración), comillas angulares «» y signos ¿ ¡.
3. Varía de forma original el campo "animacion" entre escenas ("deslizar", "maquina", "escala", "cascada", "revelar") y el campo "visual" ("mapa_mental", "barras", "linea_tiempo", "comparativa", "ciclo", "piramide", "ilustracion") para que cada diapositiva aporte un esquema, gráfica o ilustración útil para comprender la lección.
4. Incluye "datos_visuales": arreglo de 3 a 4 objetos {"etiqueta": "texto breve máx. 24 caracteres", "valor": número de 15 a 100} coherentes con la lección (se usan para dibujar gráficas de barras, nodos de mapas mentales, hitos de líneas de tiempo, niveles de pirámides, fases de ciclos y tablas comparativas).
5. Calcula "duracion_seg" a ~2,0 palabras por segundo + 1 segundo de pausa (mínimo 12 s por escena para lograr ritmo didáctico pausado).
6. "titulo_grafico": máximo 7 palabras. "puntos_clave": 2 a 3 ideas breves y claras.
7. "tipo" debe ser uno de: "apertura", "concepto", "esquema", "grafica", "comparacion", "proceso", "ejemplo", "sintesis".
8. Devuelve únicamente JSON estricto.`;

  const userPrompt = `Título de la lección: ${lessonTitle}
Curso o asignatura: ${courseLabel || 'Curso formativo'}
Enfoque pedagógico: ${approach || 'Explicación profunda'}
Contenido de la lección o apuntes:
${content}

Devuelve un JSON estricto con esta estructura:
{
  "titulo_leccion": "string",
  "curso": "string",
  "escenas": [
    {
      "tipo": "apertura | concepto | esquema | grafica | comparacion | proceso | ejemplo | sintesis",
      "animacion": "deslizar | maquina | escala | cascada | revelar",
      "visual": "mapa_mental | barras | linea_tiempo | comparativa | ciclo | piramide | ilustracion",
      "datos_visuales": [{"etiqueta": "Concepto A", "valor": 80}, {"etiqueta": "Concepto B", "valor": 65}],
      "duracion_seg": 22,
      "titulo_grafico": "Máximo 7 palabras en estilo oración",
      "puntos_clave": ["Idea clave 1", "Idea clave 2"],
      "icono": "📘",
      "narracion_es": "Explicación didáctica clara de 40 a 55 palabras en español neutro."
    }
  ]
}`;

  const url = `${GEMINI_API_BASE}/${selectedModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json'
      }
    })
  }, 45000);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini respondió con estado ${response.status}: ${errText.slice(0, 240)}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Gemini no devolvió contenido en la respuesta.');

  const parsed = JSON.parse(rawText);
  if (!Array.isArray(parsed.escenas) || parsed.escenas.length === 0) {
    throw new Error('El esquema educativo generado no contiene escenas válidas.');
  }

  return {
    titulo_leccion: String(parsed.titulo_leccion || lessonTitle).trim(),
    curso: String(parsed.curso || courseLabel || 'Curso explicativo').trim(),
    escenas: parsed.escenas.map(sanitizeScene),
    fallback: false,
    model: selectedModel
  };
}

function pcm16ToWavBase64(pcmBuffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]).toString('base64');
}

async function generateAudioWithGeminiTTS({ apiKey, text, voice }) {
  if (!apiKey) return { fallback: true, reason: 'Clave de Google Gemini no configurada.' };

  const voiceName = ALLOWED_VOICES.includes(voice) ? voice : 'Aoede';
  const ttsModel = 'gemini-3.8-flash-tts';
  const url = `${GEMINI_API_BASE}/${ttsModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  try {
    let response = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text
            }]
          }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName } }
            }
          }
        })
      }, 25000);

      if (response.ok) break;
      if (response.status === 429 || response.status >= 500) {
        await sleep(1400 * (attempt + 1));
        continue;
      }
      break;
    }

    if (!response || !response.ok) {
      const errText = response ? await response.text() : 'Sin respuesta';
      return { fallback: true, reason: `Gemini TTS (${response?.status || 'red'}): ${errText.slice(0, 180)}` };
    }

    const data = await response.json();
    const inlineData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!inlineData || !inlineData.data) {
      return { fallback: true, reason: 'Gemini TTS no incluyó pista de audio.' };
    }

    const mimeType = (inlineData.mimeType || 'audio/pcm;rate=24000').toLowerCase();
    if (mimeType.includes('pcm') || mimeType.includes('l16')) {
      const rateMatch = mimeType.match(/rate=(\d+)/i);
      const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
      const pcmBuf = Buffer.from(inlineData.data, 'base64');
      return {
        fallback: false,
        mimeType: 'audio/wav',
        audioBase64: pcm16ToWavBase64(pcmBuf, sampleRate, 1, 16),
        voice: voiceName
      };
    }

    return { fallback: false, mimeType, audioBase64: inlineData.data, voice: voiceName };
  } catch (err) {
    return { fallback: true, reason: `Error de red con Gemini TTS: ${err.message}` };
  }
}

async function testGeminiConnection({ apiKey, model }) {
  if (!apiKey) return { ok: false, message: 'No hay ninguna clave de Google Gemini guardada ni en GEMINI_API_KEY.' };
  const selectedModel = ALLOWED_MODELS.includes(model) ? model : 'gemini-3.8-flash';
  const url = `${GEMINI_API_BASE}/${selectedModel}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Responde únicamente con la palabra: CONECTADO' }] }]
    })
  }, 15000);

  if (!response.ok) {
    const errText = await response.text();
    return { ok: false, message: `Error ${response.status}: ${errText.slice(0, 200)}` };
  }

  const data = await response.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'OK';
  return { ok: true, model: selectedModel, message: `Conexión exitosa con ${selectedModel} (${reply}).` };
}

module.exports = {
  generateLessonScriptWithGemini,
  generateAudioWithGeminiTTS,
  testGeminiConnection,
  buildLocalEducationalScript,
  ALLOWED_MODELS,
  ALLOWED_VOICES
};
