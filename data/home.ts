export interface Step {
  number: number;
  title: string;
  description: string;
  icon: string;
}

export const howItWorksSteps: Step[] = [
  {
    number: 1,
    title: "Registrarse",
    description: "Crea tu cuenta en la plataforma e incia sesión.",
    icon: "UserPlus",
  },
  {
    number: 2,
    title: "Unirse a equipo",
    description: "Forma un equipo y comparte el token con tus compañeros o unete a uno.",
    icon: "Users",
  },
  {
    number: 3,
    title: "Descargar imagen Docker",
    description: "Descarga la imagen del laboratorio con los retos del CTF.",
    icon: "Download",
  },
  {
    number: 4,
    title: "Correr lab",
    description: "Levanta el entorno con Docker y comienza a explorar las vulnerabilidades. Ve a /challenges para revisar como correr los labs localmente.",
    icon: "Run",
  },
  {
    number: 5,
    title: "Capturar flags",
    description: "Resuelve los retos, encuentra las flags ocultas en cada desafío.",
    icon: "Flag",
  },
  {
    number: 6,
    title: "Enviar en plataforma",
    description: "Ingresa cada flag en la plataforma para sumar puntos a tu equipo.",
    icon: "Send",
  },
];

export interface Tool {
  name: string;
  description: string;
  iconSlug: string;
  downloadUrl: string;
  color: string;
}

export const recommendedTools: Tool[] = [
  {
    name: "Kali Linux",
    description: "Distribución Linux con herramientas de pentesting preinstaladas. O cualquier distro de tu preferencia.",
    iconSlug: "Download",
    downloadUrl: "https://www.kali.org/get-kali/",
    color: "#557C94",
  },
  {
    name: "Docker",
    description: "Plataforma de contenedores para correr los laboratorios del CTF.",
    iconSlug: "Download",
    downloadUrl: "https://www.docker.com/get-started/",
    color: "#2496ED",
  },
  {
    name: "Burp Suite",
    description: "Proxy de interceptación para análisis de tráfico web.",
    iconSlug: "Download",
    downloadUrl: "https://portswigger.net/burp/communitydownload",
    color: "#FF6633",
  }
];

export interface ImportantNote {
  title: string;
  content: string;
  icon: string;
  accentColor: string;
}

export const importantNotes: ImportantNote[] = [
  {
    title: "Infraestructura TEC y H2D",
    content: "Queda prohibido atacar la infraestructura del Tec o la plataforma del CTF. Todo movimineto en la red esta siendo monitoreado y cualquier actividad sospechosa será sancionada con la descalificación inmediata y reporte al TEC.",
    icon: "ShieldAlert",
    accentColor: "#FEF759",
  },
  {
    title: "Formato de flag",
    content: "Todas las flags siguen el formato H2D{texto_aqui}. Asegúrate de incluir el prefijo completo.",
    icon: "Flag",
    accentColor: "#EF01BA",
  },
  {
    title: "Límite de equipo",
    content: "Máximo 4 integrantes por equipo. No se permiten equipos con más miembros, ni compartir cuentas entre equipos.",
    icon: "Users",
    accentColor: "#F77200",
  },
  {
    title: "Canal de Discord",
    content: "Usa el canal #soporte en Discord para dudas técnicas. No compartas flags ni soluciones.",
    icon: "MessageCircle",
    accentColor: "#940992",
  },
];
