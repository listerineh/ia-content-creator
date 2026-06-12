import type { TourStep } from './use-tour';

export const CLIP_GENERATOR_TOUR: TourStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido al Generador de Clips! 🎬',
    text: 'Te guiaremos paso a paso para crear clips increíbles de tus videos. Este proceso es muy sencillo.',
  },
  {
    id: 'video-url',
    title: 'Paso 1: Pega tu video',
    text: 'Primero, pega el enlace de Google Drive de tu video. Asegúrate de que el video sea público o tenga permisos de acceso.',
    attachTo: {
      element: '[data-tour="video-input"]',
      on: 'bottom',
    },
  },
  {
    id: 'intents',
    title: 'Paso 2: Elige tus intenciones',
    text: 'Selecciona qué tipo de contenido quieres crear: clips virales, mejores momentos, momentos divertidos, etc.',
    attachTo: {
      element: '[data-tour="intent-selector"]',
      on: 'bottom',
    },
  },
  {
    id: 'moments',
    title: 'Paso 3: Momentos detectados',
    text: 'Analizaremos el audio de tu video y te sugeriremos los mejores momentos. Puedes escuchar una preview y seleccionar los que más te gusten.',
    attachTo: {
      element: '[data-tour="moments-section"]',
      on: 'top',
    },
  },
  {
    id: 'formats',
    title: 'Paso 4: Formatos de salida',
    text: 'Elige los formatos en los que quieres exportar tus clips: vertical para TikTok/Reels, cuadrado para Instagram, etc.',
    attachTo: {
      element: '[data-tour="format-selector"]',
      on: 'bottom',
    },
  },
  {
    id: 'generate',
    title: '¡Listo para generar!',
    text: 'Una vez configurado todo, haz clic en "Generar clips" y nosotros nos encargamos del resto. ¡Así de fácil!',
  },
];

export const DASHBOARD_TOUR: TourStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a OpenStage! 🎸',
    text: 'Este es tu centro de control. Desde aquí puedes acceder a todas las herramientas para crear contenido increíble para tu banda.',
  },
  {
    id: 'tools',
    title: 'Herramientas',
    text: 'Aquí encontrarás todas las herramientas disponibles: generador de clips, editor de subtítulos, y más por venir.',
    attachTo: {
      element: '[data-tour="tools-section"]',
      on: 'bottom',
    },
  },
  {
    id: 'band-switcher',
    title: 'Cambiar de banda',
    text: 'Si gestionas varias bandas, puedes cambiar entre ellas fácilmente desde el menú lateral.',
    attachTo: {
      element: '[data-tour="band-switcher"]',
      on: 'right',
    },
  },
];

export const BANDS_TOUR: TourStep[] = [
  {
    id: 'welcome',
    title: 'Gestión de Bandas 🎵',
    text: 'Aquí puedes ver todas las bandas a las que perteneces y gestionar sus configuraciones.',
  },
  {
    id: 'create-band',
    title: 'Crear nueva banda',
    text: 'Haz clic aquí para crear una nueva banda. Podrás invitar a otros miembros después.',
    attachTo: {
      element: '[data-tour="create-band-button"]',
      on: 'bottom',
    },
  },
  {
    id: 'switch-band',
    title: 'Cambiar banda activa',
    text: 'Haz clic en "Activar" para cambiar a otra banda. La banda activa se muestra con un borde violeta.',
    attachTo: {
      element: '[data-tour="band-card"]',
      on: 'bottom',
    },
  },
];
