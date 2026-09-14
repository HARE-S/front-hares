# front-hares

Frontend de la aplicación HARE-S (Gestión y Catálogo de Pruebas de Lectura y Rendimiento Escolar), desarrollado con **Vue 3** y **Vite**.

## Requisitos previos

- **Node.js**: v18 o superior recomendado.
- **npm**: v9 o superior.
- Backend HARE-S (Flask) ejecutándose en `http://localhost:5000` (opcional para desarrollo offline, pero necesario para comunicación con la API).

## Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/HARE-S/front-hares.git
cd front-hares
npm install
```

## Scripts disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con recarga en caliente (HMR) en `http://localhost:5173`. Incluye proxy hacia el backend en el puerto `5000`. |
| `npm run build` | Compila y minifica el proyecto para producción en la carpeta `dist/`. |
| `npm run preview` | Previsualiza localmente la compilación de producción. |
| `npm test` | Ejecuta las pruebas unitarias y de integración de componentes con **Vitest**. |

## Estructura del proyecto

```text
front-hares/
├── src/
│   ├── assets/         # Estilos globales y recursos estáticos
│   ├── components/     # Componentes Vue (Formularios, Listados, etc.)
│   ├── services/       # Clientes HTTP y servicios de negocio
│   ├── tests/          # Pruebas unitarias de componentes y servicios (Vitest)
│   ├── App.vue         # Componente raíz
│   └── main.js         # Punto de entrada de la aplicación
├── index.html          # Plantilla HTML principal
├── package.json        # Dependencias y scripts
├── vite.config.js      # Configuración de Vite, proxy y Vitest
└── .gitignore          # Exclusiones de Git (node_modules, dist, logs, etc.)
```

## Tecnologías utilizadas

- [Vue 3](https://vuejs.org/) (Composition API)
- [Vite](https://vitejs.dev/)
- [Vitest](https://vitest.dev/) + [@vue/test-utils](https://test-utils.vuejs.org/)
- [Lucide Vue Next](https://lucide.dev/) (Iconografía)