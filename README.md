# Pochoclo

Red de reseñas de cine y series de todo el mundo, al estilo Letterboxd. Buscá cualquier película o serie, puntuala con medias estrellas, escribí tu reseña, leé las de los demás y armá tu diario y tu pasaporte de cine.

**TP2 · Desarrollo Frontend II · 2026**

- Aplicación publicada: `https://REEMPLAZAR.vercel.app`
- Repositorio: `https://github.com/REEMPLAZAR/pochoclo`

## Funciones

- **Catálogo mundial**: más de un millón de películas y series vía la API de TMDB, con búsqueda, tendencias y una sección *Vuelta al mundo* para explorar el cine de cada país.
- **Reseñas**: puntaje de ½ a 5 estrellas, texto, "me gustó", fecha en que la viste y aviso de spoilers. Se ven junto a las reseñas reales publicadas en TMDB.
- **Perfil público**: diario de reseñas por mes, grilla de pósters, pasaporte con un sello por país (títulos vistos / total del país) y lista privada *Quiero ver*.
- **Color = visto**: los pósters se ven en blanco y negro; los que reseñaste, en color.
- **Configuración**: datos de la cuenta, editar foto (subida y comprimida en el navegador), nombre y bio, descargar tus datos y eliminar la cuenta.
- **Ruleta** para cuando no sabés qué ver, transiciones entre páginas (View Transitions API) y diseño adaptable a celular.

## Tecnologías

- React 19 + Vite + React Router
- Firebase Authentication (Google) y Cloud Firestore
- API de TMDB a través de una función serverless de Vercel (`api/tmdb.js`), así el token nunca llega al navegador
- Vercel (despliegue)

## Dónde está cada cosa

```
api/
├── tmdb.js               ← función serverless: proxy a TMDB con el token del servidor
└── _lib/tmdb.js          ← lógica compartida del proxy (también la usa Vite en desarrollo)
src/
├── firebase.js           ← conexión con Firebase
├── services/
│   ├── resenas.js        ← CRUD de resenas/{uid}_{tipo}_{tmdbId}
│   ├── quieroVer.js      ← CRUD de usuarios/{uid}/quieroVer
│   ├── usuarios.js       ← perfil público usuarios/{uid}
│   └── cuenta.js         ← exportar datos y eliminar cuenta
├── context/              ← sesión (AuthContext) y avisos (ToastContext)
├── pages/                ← Inicio, Buscar, Detalle, Perfil, Mundo, País, Configuración
├── components/           ← Poster, Carrusel, Resena, ResenaForm, PortadaColor, Ruleta…
├── lib/                  ← cliente TMDB, formatos, países, compresión de imágenes
└── styles/index.css      ← sistema visual
firestore.rules           ← reglas de seguridad
```

## Datos en Firestore

| Colección | Contenido | Quién puede leer | Quién puede escribir |
| --- | --- | --- | --- |
| `usuarios/{uid}` | nombre, foto, bio | todos | solo su dueño/a |
| `usuarios/{uid}/quieroVer/{tipo}_{id}` | títulos guardados | solo su dueño/a | solo su dueño/a |
| `resenas/{uid}_{tipo}_{id}` | puntaje, texto, me gustó, spoiler, fecha, datos del título | todos | solo su autor/a |

Las reglas validan cada campo (tipos, rangos, largos y valores permitidos) y todo lo que no está permitido queda denegado.

## Ejecutar en local

Requiere Node.js 20 o superior.

```bash
git clone https://github.com/REEMPLAZAR/pochoclo.git
cd pochoclo
npm install
cp .env.example .env    # completar con los datos de Firebase y el token de TMDB
npm run dev
```

### Variables de entorno

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
TMDB_TOKEN=
```

- Las `VITE_FIREBASE_*` son la configuración **pública** de la app web de Firebase.
- `TMDB_TOKEN` es el *API Read Access Token* de TMDB. Es **secreto**: no lleva prefijo `VITE_`, solo lo lee el servidor.

## Configurar Firebase

1. Crear un proyecto y registrar una app web (`</>`).
2. **Authentication → Método de acceso → Google**: habilitar.
3. **Firestore Database**: crear (Standard, `southamerica-east1`, modo producción).
4. **Firestore → Reglas**: pegar [`firestore.rules`](firestore.rules) y publicar.
5. Al publicar en Vercel: **Authentication → Configuración → Dominios autorizados** → agregar el dominio `*.vercel.app` del proyecto.

## Publicar en Vercel

1. Importar el repositorio en Vercel (framework **Vite**, build `npm run build`, salida `dist`).
2. Cargar las 5 variables de entorno en *Settings → Environment Variables*.
3. Desplegar. Cada `git push` genera un despliegue nuevo.

`vercel.json` redirige todas las rutas a `index.html` (excepto `/api`) para que funcionen los enlaces directos.

---

Datos e imágenes de [TMDB](https://www.themoviedb.org/). Este producto usa la API de TMDB pero no está avalado ni certificado por TMDB.
