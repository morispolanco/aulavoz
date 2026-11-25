# AulaVoz — Estudio de vídeos educativos (~5 min, 720p)

Aplicación web full-stack para convertir lecciones y apuntes de un curso en **vídeos explicativos y didácticos de alrededor de 5 minutos en resolución HD 720p (1280 × 720)**, con **8 estilos visuales**, **5 movimientos de texto**, **7 tipos de esquemas, gráficas e ilustraciones vectoriales** (mapas mentales, barras, líneas de tiempo, comparativas, ciclos, pirámides e ilustraciones), narración en español con **Google Gemini** (`gemini-3.8-flash` y `gemini-3.8-flash-tts`) y persistencia en **PostgreSQL en Neon**.

## Despliegue en GitHub y Vercel

1. Sube el contenido de `aulavoz-vercel.zip` a un repositorio nuevo de GitHub.
2. Impórtalo en [vercel.com/new](https://vercel.com/new) (framework **Other**).
3. Agrega en *Settings → Environment Variables*:
   - `DATABASE_URL`: cadena pooled de PostgreSQL en Neon (`postgresql://...?sslmode=require`).
   - `GEMINI_API_KEY`: clave `AIzaSy…` de Google AI Studio.
   - `SESSION_SECRET`: cadena aleatoria larga.
4. Despliega y comprueba `https://tu-proyecto.vercel.app/api/health`.
5. Entra al panel administrativo con `Ctrl + Shift + A`, 5 clics en el logotipo «AulaVoz» o desde «Administración» en el pie de página (clave inicial: `admin123`).
