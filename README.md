# Gestor de Menús Multi-Restaurante (MVP)

Frontend en React + Tailwind con autenticación por Email/Password (Firebase Auth) y base de datos en Firestore.

## Requisitos previos

- Node 18+
- Cuenta de Firebase y proyecto creado
- Firebase CLI (opcional para deploy de reglas/índices): `npm i -g firebase-tools`

## Variables de entorno

Crear un archivo `.env.local` en la raíz con los siguientes valores (prefijo `VITE_` requerido por Vite):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Podés usar `.env.local.example` como referencia.

## Setup

1) Instalar dependencias:

```
npm install
```

2) Habilitar en Firebase Console:

- Authentication > Sign-in method > Email/Password (Enabled)
- Firestore Database > Crear base en modo producción

3) Reglas e índices (opcional con Firebase CLI):

```
# Login en CLI y seleccionar proyecto
firebase login
firebase use <tu-proyecto>

# Deploy de reglas e índices
firebase deploy --only firestore:rules,firestore:indexes
```

Las reglas implementan:

- Lectura pública sólo si `restaurants.isPublic == true`.
- Escritura sólo para owners definidos en `restaurants.owners`.

## Correr en desarrollo

```
npm run dev
```

Abrir: http://localhost:5173

## Rutas principales

- `/auth/login` – Login + reset password
- `/auth/register` – Registro (sin crear demo automáticamente)
- `/r/:restaurantId` – Vista pública del menú (búsqueda y filtro “Sólo disponibles”)
- `/admin/:restaurantId` – Panel admin (privado): Categorías | Ítems | Settings
- `/admin/:restaurantId/settings` – Link público + botón “Copiar link”

## Creación de datos

El registro ya no crea datos de demo automáticamente. Podés crear tus restaurantes, menús, categorías e ítems desde el panel Admin.

## Validaciones y permisos

- Admin requiere sesión. Si no hay sesión, redirige a `/auth/login`.
- Guard de owner: si el usuario no es owner del restaurante, muestra “No tenés permisos”.
- Formularios con validaciones básicas (nombre requerido, precio ≥ 0).

## Deploy (opcional)

El proyecto incluye un script de deploy (requiere hosting y Firestore configurados en tu proyecto):

```
npm run build
firebase deploy
```

## Estructura relevante

- `src/firebase.js` – Inicialización de Firebase (Auth + Firestore)
- `src/contexts/AuthContext.jsx` – Contexto de autenticación
- `src/services/firestore.js` – CRUD y seeding en Firestore
- `src/components/ProtectedRoute.jsx` – Guard de sesión
- `src/components/OwnerGuard.jsx` – Verifica ownership del restaurante
- `src/pages/auth/*` – Páginas de Login y Registro
- `src/pages/public/PublicMenu.jsx` – Vista pública de menú
- `src/pages/admin/*` – Panel admin: layout, categorías, ítems, settings
- `firestore.rules` – Reglas de seguridad
- `firestore.indexes.json` – Índices compuestos

## Notas

- MVP sin branding/temas ni QR.
- UI minimalista y mobile-first con Tailwind.
