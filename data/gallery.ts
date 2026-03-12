// Datos para la Horizontal Scroll Gallery

interface GalleryItemBase {
    id: number;
    size: "big" | "normal" | "small";
    orientation: "vertical" | "horizontal";
    scrollSpeed: number;
}

export interface GalleryImageItem extends GalleryItemBase {
    type: "image";
    src: string;
    alt: string;
}

export interface GalleryCardItem extends GalleryItemBase {
    type: "card";
    text: string;
    time: string;
    description: string;
    charColor?: string;
    textColor?: string;
}

export type GalleryItem = GalleryImageItem | GalleryCardItem;
import { EVENT_DATE } from "@/data/event";

const dayMonth = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  timeZone: "America/Mexico_City",
})
  .format(EVENT_DATE)
  .toUpperCase()
  .replace(".", ""); // quita el punto de "may."
// Resultado: "16 MAY"

export const galleryItems: GalleryItem[] = [
    /* { id: 1,  type: "image", src: "images/palm_tree.webp", alt: "Gallery 1",  size: "normal", orientation: "vertical",   scrollSpeed: 2 },
    { id: 2,  type: "image", src: "images/palm_tree.webp", alt: "Gallery 2",  size: "big",    orientation: "vertical",   scrollSpeed: 1 }, */
    { id: 3,  type: "card",  text: "HACK2DAWN",    time: dayMonth, description: "TEC de Monterrey, Edificio negiocios",                               charColor: "#1fffd2", size: "normal", orientation: "horizontal", scrollSpeed: 1 },
    { id: 4,  type: "card",  text: "BIENVENIDA",    time: "13:30", description: "TEC de Monterrey, Edificio negiocios",                               charColor: "#FF1F8C", size: "normal", orientation: "horizontal", scrollSpeed: 1 },
    { id: 5,  type: "card",  text: "REGISTRO",    time: "14:00", description: "No guardamos tus datos... o si?",               charColor: "#bf14ff", size: "normal", orientation: "horizontal", scrollSpeed: 1 },
    { id: 6,  type: "card",  text: "CTF",    time: "15:00", description: "Hora de hackear... eticamente",                       charColor: "#4ab9de", size: "normal", orientation: "horizontal", scrollSpeed: 1 },
    { id: 7,  type: "card",  text: "COMIDA",         time: "17:00", description: "Nuestros hackers necesitan energia",                                      charColor: "#f97316", size: "normal", orientation: "horizontal", scrollSpeed: 1 },
    { id: 8,  type: "card",  text: "PREMIACIÓN",        time: "19:00", description: "Quién ganara los premios???",                                  charColor: "#f838cb", size: "normal", orientation: "horizontal", scrollSpeed: 1 },
    { id: 9,  type: "card",  text: "CIERRE",     time: "19:30", description: "No es un adios, es un hasta luego...",                             charColor: "#facc15", size: "normal", orientation: "horizontal", scrollSpeed: 1 },
];
