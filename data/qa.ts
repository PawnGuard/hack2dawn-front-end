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
        answer: "Hack2Dawn es un evento de ciberseguridad estilo CTF (Capture The Flag) donde los participantes resuelven desafíos y retos de hacking ético. El evento se realizará el 26 de febrero de 2026 presencialmente en Tecnologico de Monterrey Campus Guadalajara.",
        isOpen: true
    },
    {
        id: 2,
        question: "¿Cuáles son los requisitos para participar?",
        answer: "Para participar en Hack2Dawn, se requiere tener conocimientos básicos de ciberseguridad y habilidades de hacking ético. No se requiere experiencia previa en CTFs.",
        isOpen: false
    },
    {
        id: 3,
        question: "¿Qué es Hack2Dawn y cuándo se llevará a cabo?",
        answer: "Hack2Dan es un evento de ciberseguridad estilo CTF (Capture The Flag) donde los participantes resuelven desafíos y retos de hacking ético. El evento se realizará el 26 de febrero de 2026 presencialmente en Tecnologico de Monterrey Campus Guadalajara.",
        isOpen: false
    },
    {
        id: 4,
        question: "¿Qué es Hack2Dawn y cuándo se llevará a cabo?",
        answer: "Hack2Dawn es un evento de ciberseguridad estilo CTF (Capture The Flag) donde los participantes resuelven desafíos y retos de hacking ético. El evento se realizará el 26 de febrero de 2026 presencialmente en Tecnologico de Monterrey Campus Guadalajara.",
        isOpen: false
    }
];