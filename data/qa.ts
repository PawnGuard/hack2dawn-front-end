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
        question: "¿Qué es un CTF?",
        answer: 'Un CTF (Capture The Flag) es una competencia de ciberseguridad donde resuelves retos técnicos para encontrar "banderas" ocultas. Básicamente un escape room virtual donde pones a prueba tu ingenio de forma legal y divertida.',
        color: colors[2]
    },
    {
        question: "¿Para quién está dirigido?",
        answer: '¡Para cualquier estudiante que quiera vivir su primer CTF! No habrá temas imposibles, pero darle un repaso al tema antes del evento tampoco te caería nada mal.',
        color: colors[3]
    },
    {
        question: "¿Es presencial o en línea?",
        answer: 'El evento es híbrido, pero los premios son exclusivamente para asistentes presenciales. Si ganas y no estás ahí, el premio pasa directo al siguiente. ¡No te lo pierdas!',
        color: colors[1]
    },
    {
        question: "¿Habrá premios?",
        answer: '¡Obvio! Nuestros sponsors tienen premios especiales para los ganadores. Más razón para ir en persona y vivir la experiencia completa.',
        color: colors[2]
    },
    {
        question: "¿Qué es Pawnguard?",
        answer: 'Somos un grupo estudiantil del Tec de Monterrey Campus Guadalajara enfocado en ciberseguridad. Enseñamos hacking ético, redes y Linux para forjar a la próxima generación de hackers éticos.',
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