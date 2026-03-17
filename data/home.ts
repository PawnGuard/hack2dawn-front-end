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
    description: "Crea tu cuenta en la plataforma y verifica tu correo institucional.",
    icon: "UserPlus",
  },
  {
    number: 2,
    title: "Unirse a equipo",
    description: "Forma un equipo con tus compañeros o únete a uno existente.",
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
    description: "Levanta el entorno con Docker y comienza a explorar las vulnerabilidades.",
    icon: "Terminal",
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
    name: "Docker",
    description: "Plataforma de contenedores para correr los laboratorios del CTF.",
    iconSlug: "docker",
    downloadUrl: "https://www.docker.com/get-started/",
    color: "#2496ED",
  },
  {
    name: "Kali Linux",
    description: "Distribución Linux con herramientas de pentesting preinstaladas.",
    iconSlug: "kalilinux",
    downloadUrl: "https://www.kali.org/get-kali/",
    color: "#557C94",
  },
  {
    name: "Burp Suite",
    description: "Proxy de interceptación para análisis de tráfico web.",
    iconSlug: "burpsuite",
    downloadUrl: "https://portswigger.net/burp/communitydownload",
    color: "#FF6633",
  },
  {
    name: "Wireshark",
    description: "Analizador de protocolos de red para inspeccionar paquetes.",
    iconSlug: "wireshark",
    downloadUrl: "https://www.wireshark.org/download.html",
    color: "#1679A7",
  },
  {
    name: "CyberChef",
    description: "Herramienta web para decodificar, cifrar y analizar datos.",
    iconSlug: "cyberchef",
    downloadUrl: "https://gchq.github.io/CyberChef/",
    color: "#00B4D8",
  },
  {
    name: "Ghidra",
    description: "Framework de ingeniería inversa de la NSA para análisis de binarios.",
    iconSlug: "ghidra",
    downloadUrl: "https://ghidra-sre.org/",
    color: "#E4002B",
  },
];

export interface ImportantNote {
  title: string;
  content: string;
  icon: string;
  accentColor: string;
}

export const importantNotes: ImportantNote[] = [
  {
    title: "Formato de flag",
    content: "Todas las flags siguen el formato H2D{texto_aqui}. Asegúrate de incluir el prefijo completo.",
    icon: "Flag",
    accentColor: "#EF01BA",
  },
  {
    title: "Límite de equipo",
    content: "Máximo 4 integrantes por equipo. No se permite cambiar de equipo una vez iniciado el CTF.",
    icon: "Users",
    accentColor: "#F77200",
  },
  {
    title: "Infraestructura",
    content: "Queda prohibido atacar la infraestructura del Tec o la plataforma del CTF. Solo ataca los labs.",
    icon: "ShieldAlert",
    accentColor: "#FEF759",
  },
  {
    title: "Canal de Discord",
    content: "Usa el canal #soporte en Discord para dudas técnicas. No compartas flags ni soluciones.",
    icon: "MessageCircle",
    accentColor: "#940992",
  },
];
