// Datos para la Horizontal Scroll Gallery

export interface GalleryItem {
    id: number;
    src: string;
    alt: string;
    size: "big" | "normal" | "small";
    orientation: "vertical" | "horizontal";
    scrollSpeed: number;
}

export const galleryItems: GalleryItem[] = [
    /* { id: 1,  src: "images/palm_tree.webp", alt: "Gallery 1",  size: "normal", orientation: "vertical",   scrollSpeed: 2},
    { id: 2,  src: "images/palm_tree.webp", alt: "Gallery 2",  size: "big",    orientation: "vertical",   scrollSpeed: 1 },
    { id: 3,  src: "images/palm_tree.webp", alt: "Gallery 3",  size: "small",  orientation: "horizontal", scrollSpeed: 4 },
    { id: 4,  src: "images/palm_tree.webp", alt: "Gallery 4",  size: "normal", orientation: "vertical",   scrollSpeed: 3 },
    { id: 5,  src: "images/palm_tree.webp", alt: "Gallery 5",  size: "normal", orientation: "horizontal", scrollSpeed: 2 },
    { id: 6,  src: "images/palm_tree.webp", alt: "Gallery 6",  size: "big",    orientation: "horizontal", scrollSpeed: 4 },
    { id: 7,  src: "images/palm_tree.webp", alt: "Gallery 7",  size: "small",  orientation: "vertical",   scrollSpeed: 2 },
    { id: 8,  src: "images/palm_tree.webp", alt: "Gallery 8",  size: "normal", orientation: "horizontal", scrollSpeed: 1 },
    { id: 9,  src: "images/palm_tree.webp", alt: "Gallery 9",  size: "small",  orientation: "horizontal", scrollSpeed: 3 },
    { id: 10, src: "images/palm_tree.webp", alt: "Gallery 10", size: "big",    orientation: "vertical",   scrollSpeed: 1 },
    { id: 11, src: "images/palm_tree.webp", alt: "Gallery 11", size: "normal", orientation: "horizontal", scrollSpeed: 2 },
    { id: 12, src: "images/palm_tree.webp", alt: "Gallery 12", size: "normal", orientation: "horizontal", scrollSpeed: 1 },
    { id: 13, src: "images/palm_tree.webp", alt: "Gallery 13", size: "small",  orientation: "horizontal", scrollSpeed: 4 },
    { id: 14, src: "images/palm_tree.webp", alt: "Gallery 14", size: "big",    orientation: "vertical",   scrollSpeed: 3 },
    { id: 15, src: "images/palm_tree.webp",  alt: "Gallery 15", size: "normal", orientation: "horizontal", scrollSpeed: 2 },
    { id: 16, src: "images/palm_tree.webp",  alt: "Gallery 16", size: "small",  orientation: "horizontal", scrollSpeed: 4 },
    { id: 18, src: "images/palm_tree.webp",  alt: "Gallery 18", size: "normal", orientation: "horizontal", scrollSpeed: 1 },
    { id: 19, src: "images/palm_tree.webp",  alt: "Gallery 19", size: "small",  orientation: "horizontal", scrollSpeed: 3 },
    { id: 20, src: "images/palm_tree.webp",  alt: "Gallery 20", size: "normal", orientation: "vertical",   scrollSpeed: 1 }, */
];
