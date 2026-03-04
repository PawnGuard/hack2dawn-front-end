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
    { id: 1,  src: "https://picsum.photos/id/1005/300/400", alt: "Gallery 1",  size: "normal", orientation: "vertical",   scrollSpeed: 2 },
    { id: 2,  src: "https://picsum.photos/id/1019/600/800", alt: "Gallery 2",  size: "big",    orientation: "vertical",   scrollSpeed: 1 },
    { id: 3,  src: "https://picsum.photos/id/1027/400/300", alt: "Gallery 3",  size: "small",  orientation: "horizontal", scrollSpeed: 4 },
    { id: 4,  src: "https://picsum.photos/id/1028/300/400", alt: "Gallery 4",  size: "normal", orientation: "vertical",   scrollSpeed: 3 },
    { id: 5,  src: "https://picsum.photos/id/1041/400/300", alt: "Gallery 5",  size: "normal", orientation: "horizontal", scrollSpeed: 2 },
    { id: 6,  src: "https://picsum.photos/id/1042/800/600", alt: "Gallery 6",  size: "big",    orientation: "horizontal", scrollSpeed: 4 },
    { id: 7,  src: "https://picsum.photos/id/1049/300/400", alt: "Gallery 7",  size: "small",  orientation: "vertical",   scrollSpeed: 2 },
    { id: 8,  src: "https://picsum.photos/id/1056/300/400", alt: "Gallery 8",  size: "normal", orientation: "horizontal", scrollSpeed: 1 },
    { id: 9,  src: "https://picsum.photos/id/1062/400/300", alt: "Gallery 9",  size: "small",  orientation: "horizontal", scrollSpeed: 3 },
    { id: 10, src: "https://picsum.photos/id/1068/600/800", alt: "Gallery 10", size: "big",    orientation: "vertical",   scrollSpeed: 1 },
    { id: 11, src: "https://picsum.photos/id/1069/400/300", alt: "Gallery 11", size: "normal", orientation: "horizontal", scrollSpeed: 2 },
    { id: 12, src: "https://picsum.photos/id/1072/300/400", alt: "Gallery 12", size: "normal", orientation: "horizontal", scrollSpeed: 1 },
    { id: 13, src: "https://picsum.photos/id/1075/400/300", alt: "Gallery 13", size: "small",  orientation: "horizontal", scrollSpeed: 4 },
    { id: 14, src: "https://picsum.photos/id/1081/600/800", alt: "Gallery 14", size: "big",    orientation: "vertical",   scrollSpeed: 3 },
    { id: 15, src: "https://picsum.photos/id/111/400/300",  alt: "Gallery 15", size: "normal", orientation: "horizontal", scrollSpeed: 2 },
    { id: 16, src: "https://picsum.photos/id/129/400/300",  alt: "Gallery 16", size: "small",  orientation: "horizontal", scrollSpeed: 4 },
    { id: 17, src: "https://picsum.photos/id/137/600/800",  alt: "Gallery 17", size: "big",    orientation: "vertical",   scrollSpeed: 2 },
    { id: 18, src: "https://picsum.photos/id/141/300/400",  alt: "Gallery 18", size: "normal", orientation: "horizontal", scrollSpeed: 1 },
    { id: 19, src: "https://picsum.photos/id/145/400/300",  alt: "Gallery 19", size: "small",  orientation: "horizontal", scrollSpeed: 3 },
    { id: 20, src: "https://picsum.photos/id/147/300/400",  alt: "Gallery 20", size: "normal", orientation: "vertical",   scrollSpeed: 1 },
];
