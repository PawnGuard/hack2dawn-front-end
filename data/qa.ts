// Datos para la sección de Preguntas Frecuentes (QA)

export interface QAItem {
    id: number;
    question: string;
    answer: string;
    isOpen?: boolean;
}

export const qaData: QAItem[] = [
    {
        id: 1,
        question: "¿Qué es Hack2Dawn y cuándo se llevará a cabo?",
        answer: "Hack2Dawn es un evento de ciberseguridad estilo CTF (Capture The Flag) donde los participantes resuelven desafíos y retos de hacking ético. El evento se realizará el 26 de febrero de 2026.",
        isOpen: true
    },
    {
        id: 2,
        question: "¿Necesito experiencia previa para participar?",
        answer: "¡No necesariamente! Tenemos desafíos para todos los niveles, desde principiantes hasta expertos. Si eres nuevo en CTFs, esta es una excelente oportunidad para aprender y mejorar tus habilidades en ciberseguridad.",
    },
    {
        id: 3,
        question: "¿Cuál es el tamaño máximo de un equipo?",
        answer: "Los equipos pueden tener un máximo de 4 participantes. También puedes participar de forma individual si lo prefieres. Recuerda que el trabajo en equipo puede ser una ventaja para resolver desafíos complejos.",
    },
    {
        id: 4,
        question: "¿Qué categorías de desafíos puedo esperar?",
        answer: "Los desafíos incluyen diversas categorías como Web Exploitation, Criptografía, Forense Digital, Ingeniería Inversa, PWN/Binary Exploitation, OSINT, y más. Habrá retos de diferentes niveles de dificultad en cada categoría.",
    },
    {
        id: 5,
        question: "¿Hay premios para los ganadores?",
        answer: "¡Sí! Tendremos premios para los equipos que ocupen los primeros lugares en el scoreboard. Los premios se anunciarán más cerca de la fecha del evento. Además, todos los participantes recibirán reconocimiento por su participación.",
    },
    {
        id: 6,
        question: "¿Cómo puedo contactar al equipo de soporte durante el evento?",
        answer: "Durante el evento tendremos un canal de Discord dedicado para soporte técnico y preguntas. También puedes contactarnos por correo electrónico o a través de nuestras redes sociales. El equipo de organización estará disponible para ayudarte.",
    }
];