# 🎸 GoodChord - Cancionero & Inteligencia de Acordes

GoodChord es una aplicación web moderna, inteligente e intuitiva para músicos, guitarristas y cancioneros. Incluye transposición de tonos en tiempo real, diapasón interactivo con acordes complejos (Jazz, Bossa, novenas, semidisminuidos, slash chords), metrónomo sintético con Web Audio API, setlists personalizadas, recomendador por ritmo estilo CifraClub, tendencias en español, exportación a PDF y sincronización en la nube con Supabase.

---

## 🛠️ 1. Cómo Abrir en VS Code y Ejecutar Localmente

1. Abre **Visual Studio Code**.
2. Ve a **File > Open Folder...** (Archivo > Abrir Carpeta...) y selecciona la carpeta del proyecto:
   `C:\Users\Pc\.gemini\antigravity\scratch\goodchord`
3. Puedes abrir y probar la aplicación de dos formas:
   - **Opción A (Directa)**: Haz doble clic o abre el archivo `index.html` en tu navegador (Chrome, Edge, Firefox).
   - **Opción B (Live Server)**: Instala la extensión **Live Server** en VS Code, haz clic derecho sobre `index.html` y selecciona **"Open with Live Server"**.

---

## 🐙 2. Cómo Subir el Proyecto a GitHub desde VS Code

### Paso A: Crear el Repositorio en GitHub
1. Ingresa a [github.com/new](https://github.com/new) e inicia sesión.
2. En **Repository name**, escribe: `goodchord` (puedes dejarlo como Público o Privado).
3. Haz clic en **Create repository** (No marques las casillas de README o .gitignore ya que ya están creados).

### Paso B: Subir los Archivos desde VS Code (Terminal)
1. En VS Code, abre la terminal presionando `Ctrl + ~` (o en el menú superior: **Terminal > New Terminal**).
2. Ejecuta los siguientes comandos uno por uno:

```bash
git init
git add .
git commit -m "Initial commit - GoodChord v1.0"
git branch -M main
git remote add origin https://github.com/TU_USUARIO_GITHUB/goodchord.git
git push -u origin main
```
*(Recuerda reemplazar `TU_USUARIO_GITHUB` por tu nombre de usuario en GitHub).*

---

## ⚡ 3. Cómo Vincular Supabase (Base de Datos en la Nube)

1. Ingresa a tu panel en [supabase.com](https://supabase.com) y crea un **Nuevo Proyecto** llamado `GoodChord`.
2. Una vez creado el proyecto, ve al **SQL Editor** (icono de código `</>` en la barra izquierda).
3. Abre el archivo `supabase_schema.sql` de tu proyecto, copia todo su contenido y pégalo en el SQL Editor de Supabase. Luego haz clic en **RUN**.
4. Ahora ve a **Project Settings > API** en Supabase y copia:
   - **Project URL** (ej: `https://xyz.supabase.co`)
   - **anon / public Key** (ej: `eyJhbGciOiJIUzI1...`)
5. Abre **GoodChord** en tu navegador, haz clic en el botón **⚡ Supabase** en el menú superior, pega tu URL y tu Key, y haz clic en **⚡ Conectar y Sincronizar**. ¡Listo! Todas tus canciones y setlists se guardarán en la nube.

---

## 🚀 4. Cómo Desplegar en Vercel (Sitio Web Público Funcional)

1. Ingresa a [vercel.com](https://vercel.com) e inicia sesión (puedes entrar directamente con tu cuenta de GitHub).
2. En el panel principal, haz clic en **Add New... > Project**.
3. Selecciona tu repositorio de GitHub `goodchord` y haz clic en **Import**.
4. En la pantalla de configuración:
   - **Framework Preset**: Selecciona `Other` (sitio estático).
   - **Root Directory**: `./`
5. Haz clic en **Deploy**.
6. ¡En menos de 1 minuto Vercel te dará una URL pública gratuita (ej: `https://goodchord.vercel.app`) donde tu cancionero estará 100% en vivo y funcional para usar en tu celular, tablet o computadora!
