# Equilibria - Gestor de Tareas y Estrés Universitario

Equilibria es una aplicación web diseñada para ayudar a los estudiantes universitarios a gestionar su carga académica, organizar sus tareas y eventos, y monitorear sus niveles de estrés para mantener un equilibrio saludable entre la vida académica y el bienestar personal.

## ✨ Características Principales

- **Dashboard Intuitivo:** Visualiza tu semana de un vistazo, accede a tus tareas pendientes y conoce tu nivel de estrés actual.
- **Gestión de Tareas y Eventos:** Añade, edita y organiza tus tareas y eventos académicos en un calendario interactivo.
- **Indicador de Estrés:** Un sistema inteligente que calcula tu nivel de estrés basándose en la densidad de tu horario y la prioridad de tus tareas.
- **Reportes de Bienestar:** Gráficos y estadísticas que te permiten seguir tu progreso de productividad y tus patrones de estrés a lo largo del tiempo.
- **Alta Personalización:** Configura la apariencia de la aplicación, los colores de los indicadores y las alertas de estrés según tus preferencias.
- **Autenticación Segura:** Sistema completo de registro, inicio de sesión y recuperación de contraseña.

## 🚀 Stack Tecnológico

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Backend y Base de Datos:** [Supabase](https://supabase.io/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/)

## 🏁 Cómo Empezar

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Prerrequisitos

- [Node.js](https://nodejs.org/en/) (versión 18 o superior)
- [pnpm](https://pnpm.io/installation) (o puedes usar `npm` o `yarn`)
- Una cuenta en [Supabase](https://supabase.io/) para crear tu proyecto de backend.

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/equilibria.git
    cd equilibria
    ```

2.  **Instala las dependencias:**
    ```bash
    pnpm install
    ```

### Configuración del Entorno

1.  **Crea tu proyecto en Supabase:**
    - Ve a tu dashboard de Supabase y crea un nuevo proyecto.
    - En la configuración de tu proyecto (`Project Settings` > `API`), encontrarás tu **URL del proyecto** y tu **clave `anon` (pública)**.

2.  **Configura las variables de entorno:**
    - Crea un archivo `.env.local` en la raíz del proyecto.
    - Añade tus claves de Supabase al archivo:
      ```env
      NEXT_PUBLIC_SUPABASE_URL=TU_URL_DE_SUPABASE
      NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANON_DE_SUPABASE
      ```

3.  **Configura la base de datos:**
    - En el editor SQL de tu proyecto de Supabase, ejecuta los scripts que se encuentran en la carpeta `/scripts` en orden numérico (`01_...`, `02_...`, etc.) para crear las tablas y configurar la base de datos.

### Ejecutar la Aplicación

Una vez completada la configuración, puedes iniciar el servidor de desarrollo:

```bash
pnpm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación en funcionamiento.

## 📖 Uso

- **Regístrate o Inicia Sesión:** Crea una cuenta para empezar a gestionar tus actividades.
- **Añade Tareas y Eventos:** Desde el dashboard, puedes añadir nuevas tareas y eventos a tu calendario.
- **Monitorea tu Estrés:** El indicador de estrés en el dashboard te dará una idea de cuán ocupada está tu semana.
- **Revisa tus Reportes:** Ve a la sección de reportes para analizar tus tendencias de productividad y estrés.
- **Personaliza tu Experiencia:** En la página de configuración, puedes cambiar el tema, los colores y otras preferencias.
