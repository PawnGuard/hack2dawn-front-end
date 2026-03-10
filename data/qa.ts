// Datos para la sección de Preguntas Frecuentes (QA)
// 36 tarjetas (6x6) - solo 5 tarjetas específicas tienen preguntas

export interface QAItem {
    id: number;
    question: string;
    answer: string;
    color: string;
    image?: string;
}

// Paleta de colores especificada
const colors = [
    "#940992", // dark_magenta
    "#EF01BA", // shocking_pink
    "#F77200", // harvest_orange
    "#FEF759", // canary_yellow
    "#430464", // indigo
    "#1E0513", // coffee_bean
    "#F4EDF2"  // lavender_mist
];

// 5 preguntas para las tarjetas específicas (cards 10, 11, 16, 17, 21)
const questions: Omit<QAItem, 'id'>[] = [
    {
        question: "¿Cuáles son los requisitos para participar?",
        answer: "Para participar en Hack2Dawn, se requiere tener conocimientos básicos de ciberseguridad y habilidades de hacking ético. No se requiere experiencia previa en CTFs.",
        color: colors[2]
    },
    {
        question: "¿Cómo puedo registrarme en el evento?",
        answer: "El registro se realiza a través de nuestra plataforma web. Solo necesitas crear una cuenta, formar o unirte a un equipo, y completar tu perfil. El proceso es rápido y sencillo.",
        color: colors[3]
    },
    {
        question: "¿Habrá soporte técnico durante el evento?",
        answer: "Absolutamente. Contaremos con un equipo de soporte técnico disponible durante todo el evento para ayudarte con cualquier problema de plataforma o conectividad.",
        color: colors[1]
    },
    {
        question: "¿Qué categorías de desafíos habrá?",
        answer: "El evento incluye desafíos de Web Exploitation, Cryptography, Reverse Engineering, Forensics, Binary Exploitation y más. Cada categoría pondrá a prueba diferentes habilidades de ciberseguridad.",
        color: colors[2]
    },
    {
        question: "¿Necesito llevar mi propia computadora?",
        answer: "Sí, cada participante debe traer su propia laptop con las herramientas que desee utilizar. Asegúrate de tener tu equipo cargado y listo para el evento.",
        color: colors[0]
    }
];

// Imágenes para las tarjetas decorativas blancas
const beachImages = [
    "/images/beach.jpeg",
    "/images/beach2.jpeg",
    "/images/beach3.jpeg",
    "/images/beach4.jpeg",
    "/images/beach5.jpeg",
    "/images/beach6.jpeg",
    "/images/beach7.jpeg",
    "/images/beach8.jpeg"
];

// Generar 36 tarjetas (6x6) - solo cards 10, 11, 16, 17, 21 tienen preguntas
export const qaData: QAItem[] = Array.from({ length: 36 }, (_, i) => {
    const colorIndex = i % colors.length;
    
    // Cards con preguntas: 10, 11, 16, 17, 21 (índices 9, 10, 15, 16, 20)
    const questionPositions = [9, 10, 15, 16, 21];
    const positionIndex = questionPositions.indexOf(i);
    
    if (positionIndex !== -1) {
        return {
            id: i + 1,
            ...questions[positionIndex]
            // No se incluye 'image' para que el color de fondo sea sólido
        };
    }
    
    // Tarjetas decorativas con imágenes de beach
    const imageIndex = i % beachImages.length;
    return {
        id: i + 1,
        question: "",
        answer: "",
        color: colors[colorIndex],
        image: beachImages[imageIndex]
    };
});