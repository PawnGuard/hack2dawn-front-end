"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import createGlobe from "cobe";

const normalizeAngle = (angle: number) => {
  const twoPi = Math.PI * 2;
  let normalized = angle % twoPi;
  if (normalized > Math.PI) normalized -= twoPi;
  if (normalized < -Math.PI) normalized += twoPi;
  return normalized;
};

interface GlobeMarker {
  location: [number, number];
  size: number;
  color?: [number, number, number];
}

interface GlobeHotspot {
  id: string;
  location: [number, number];
}

const CONTINENT_CONTOURS: Record<GlobeContinent, Array<[number, number]>> = {
  "Antartida Sur": [
    [-66, -30], [-68, -10], [-70, 10], [-69, 28], [-67, 42], [-65, 20], [-65, -4], [-66, -30],
  ],
  "North America": [
    [14, -84], [22, -96], [30, -108], [38, -120], [48, -128], [58, -136], [68, -146], [70, -132], [63, -114], [54, -96], [44, -80], [34, -69], [23, -72], [16, -80], [14, -84],
  ],
  "South America": [
    [11, -76], [4, -80], [-6, -79], [-16, -74], [-27, -69], [-38, -66], [-52, -69], [-50, -57], [-38, -50], [-25, -46], [-10, -45], [2, -52], [10, -63], [11, -76],
  ],
  Europe: [
    [36, -10], [44, -8], [53, -2], [60, 8], [66, 22], [67, 38], [58, 34], [50, 24], [44, 12], [38, 2], [36, -10],
  ],
  Africa: [
    [35, -16], [28, -8], [20, 2], [12, 12], [4, 23], [-6, 32], [-16, 34], [-25, 29], [-33, 18], [-30, 7], [-22, -1], [-12, -7], [0, -11], [14, -13], [26, -15], [35, -16],
  ],
  Asia: [
    [8, 44], [18, 56], [28, 70], [38, 84], [48, 98], [58, 114], [66, 132], [62, 154], [50, 167], [38, 148], [28, 126], [19, 106], [12, 86], [9, 64], [8, 44],
  ],
  Oceania: [
    [-11, 113], [-18, 122], [-26, 132], [-34, 142], [-41, 153], [-42, 144], [-36, 134], [-28, 124], [-20, 116], [-11, 113],
  ],
};

const buildPolylineMarkers = (
  polyline: Array<[number, number]>,
  color: [number, number, number],
  size: number,
  step = 3
) => {
  const output: GlobeMarker[] = [];

  for (let i = 0; i < polyline.length - 1; i += 1) {
    const [lat1, lon1] = polyline[i];
    const [lat2, lon2] = polyline[i + 1];
    const distance = Math.max(Math.abs(lat2 - lat1), Math.abs(lon2 - lon1));
    const total = Math.max(1, Math.ceil(distance / step));

    for (let j = 0; j <= total; j += 1) {
      const t = j / total;
      output.push({
        location: [lat1 + (lat2 - lat1) * t, lon1 + (lon2 - lon1) * t],
        color,
        size,
      });
    }
  }

  return output;
};

export type GlobeContinent =
  | "Antartida Sur"
  | "North America"
  | "South America"
  | "Europe"
  | "Africa"
  | "Asia"
  | "Oceania";

interface ChallengesGlobeProps {
  activeLocation?: [number, number];
  hotspots?: GlobeHotspot[];
  highlightedContinent?: GlobeContinent | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  onContinentSelect?: (continent: GlobeContinent) => void;
  onHotspotHover?: (hotspotId: string | null) => void;
  onHotspotSelect?: (hotspotId: string) => void;
}

export default function ChallengesGlobe({
  activeLocation,
  hotspots = [],
  highlightedContinent = null,
  size = "md",
  className,
  onContinentSelect,
  onHotspotHover,
  onHotspotSelect,
}: ChallengesGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    phi: 0,
    theta: 0.26,
    dragging: false,
    moved: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    pointerId: -1,
  });

  const normalizedHotspots = useMemo(
    () => hotspots.map((hotspot) => ({ ...hotspot })),
    [hotspots]
  );

  const baseContourMarkers = useMemo(() => {
    return (Object.keys(CONTINENT_CONTOURS) as GlobeContinent[])
      .map((continent) => buildPolylineMarkers(CONTINENT_CONTOURS[continent], [0.22, 0.22, 0.24], 0.0038, 3.4))
      .flat();
  }, []);

  const continentOutlineMarkers = useMemo(() => {
    if (!highlightedContinent) return [] as GlobeMarker[];

    if (highlightedContinent === "Antartida Sur") {
      const polarMarkers: GlobeMarker[] = [];
      const latStep = 3;
      const lonStep = 4;

      for (let lat = -86; lat <= -60; lat += latStep) {
        for (let lon = -180; lon <= 180; lon += lonStep) {
          const edgeBoost = lat > -68 ? 0.0012 : 0;
          polarMarkers.push({
            location: [lat, lon],
            size: 0.0062 + edgeBoost,
            color: [1, 0.965, 0.35],
          });
        }
      }

      return polarMarkers;
    }

    const boundsByContinent: Record<GlobeContinent, { minLat: number; maxLat: number; minLon: number; maxLon: number }> = {
      "Antartida Sur": { minLat: -86, maxLat: -60, minLon: -180, maxLon: 180 },
      "North America": { minLat: 8, maxLat: 72, minLon: -168, maxLon: -50 },
      "South America": { minLat: -58, maxLat: 12, minLon: -84, maxLon: -33 },
      Europe: { minLat: 35, maxLat: 72, minLon: -12, maxLon: 42 },
      Africa: { minLat: -36, maxLat: 37, minLon: -20, maxLon: 42 },
      Asia: { minLat: 1, maxLat: 77, minLon: 42, maxLon: 180 },
      Oceania: { minLat: -52, maxLat: -8, minLon: 110, maxLon: 180 },
    };

    const bounds = boundsByContinent[highlightedContinent];
    const highlightMarkers: GlobeMarker[] = [];
    const step = 2.5;

    for (let lon = bounds.minLon; lon <= bounds.maxLon; lon += step) {
      highlightMarkers.push({ location: [bounds.maxLat, lon], size: 0.0074, color: [1, 0.965, 0.35] });
      highlightMarkers.push({ location: [bounds.minLat, lon], size: 0.0074, color: [1, 0.965, 0.35] });
    }

    for (let lat = bounds.minLat; lat <= bounds.maxLat; lat += step) {
      highlightMarkers.push({ location: [lat, bounds.minLon], size: 0.0074, color: [1, 0.965, 0.35] });
      highlightMarkers.push({ location: [lat, bounds.maxLon], size: 0.0074, color: [1, 0.965, 0.35] });
    }

    return highlightMarkers;
  }, [highlightedContinent]);

  const classifyContinent = (lat: number, lon: number): GlobeContinent | null => {
    if (lat >= -86 && lat <= -60 && lon >= -180 && lon <= 180) return "Antartida Sur";
    if (lat > 8 && lat < 72 && lon >= -168 && lon <= -50) return "North America";
    if (lat >= -58 && lat <= 12 && lon >= -84 && lon <= -33) return "South America";
    if (lat >= 35 && lat <= 72 && lon >= -12 && lon <= 42) return "Europe";
    if (lat >= -36 && lat <= 37 && lon >= -20 && lon < 42) return "Africa";
    if (lat >= 1 && lat <= 77 && lon >= 42 && lon <= 180) return "Asia";
    if (lat >= -52 && lat <= -8 && lon >= 110 && lon <= 180) return "Oceania";
    return null;
  };

  const pickLatLon = (
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number,
    phi: number,
    theta: number
  ): [number, number] | null => {
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((clientY - rect.top) / rect.height) * 2 - 1);

    const rr = x * x + y * y;
    if (rr > 1) return null;

    const z = Math.sqrt(1 - rr);
    const cx = x;
    const cy = y;
    const cz = z;

    const cosT = Math.cos(-theta);
    const sinT = Math.sin(-theta);
    const y1 = cy * cosT - cz * sinT;
    const z1 = cy * sinT + cz * cosT;

    const cosP = Math.cos(-phi);
    const sinP = Math.sin(-phi);
    const x2 = cx * cosP + z1 * sinP;
    const z2 = -cx * sinP + z1 * cosP;

    const lat = (Math.asin(Math.max(-1, Math.min(1, y1))) * 180) / Math.PI;
    // Cobe uses x = cos(lat)cos(lon), z = -cos(lat)sin(lon), so we invert with atan2(-z, x).
    const lon = (Math.atan2(-z2, x2) * 180) / Math.PI;

    return [lat, lon];
  };

  const angularDistanceDegrees = useCallback((a: [number, number], b: [number, number]) => {
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const lat1 = toRadians(a[0]);
    const lon1 = toRadians(a[1]);
    const lat2 = toRadians(b[0]);
    const lon2 = toRadians(b[1]);
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    return (2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h))) * 180) / Math.PI;
  }, []);

  const findClosestHotspot = useCallback((
    picked: [number, number],
    maxDistanceDegrees = 8
  ): GlobeHotspot | null => {
    let closest: GlobeHotspot | null = null;
    let minDistance = Number.POSITIVE_INFINITY;

    for (const hotspot of normalizedHotspots) {
      const distance = angularDistanceDegrees(picked, hotspot.location);
      if (distance < minDistance) {
        minDistance = distance;
        closest = hotspot;
      }
    }

    if (!closest || minDistance > maxDistanceDegrees) {
      return null;
    }

    return closest;
  }, [angularDistanceDegrees, normalizedHotspots]);

  const pixelSize = useMemo(() => {
    if (size === "sm") return 400;
    if (size === "lg") return 620;
    return 520;
  }, [size]);

  const wrapperSizeClass = useMemo(() => {
    if (size === "sm") return "max-w-[400px]";
    if (size === "lg") return "max-w-[620px]";
    return "max-w-[520px]";
  }, [size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(window.devicePixelRatio, 1);
    canvas.width = pixelSize * dpr;
    canvas.height = pixelSize * dpr;

    let phi = stateRef.current.phi;
    let theta = stateRef.current.theta;
    let animationFrame: number | null = null;

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: pixelSize * dpr,
      height: pixelSize * dpr,
      phi,
      theta,
      dark: 1,
      diffuse: 1.25,
      mapSamples: 12000,
      mapBrightness: 7,
      baseColor: [0.08, 0.07, 0.09],
      markerColor: [1, 1, 1],
      glowColor: [0.58, 0.03, 0.57],
      markers: [...baseContourMarkers, ...continentOutlineMarkers],
    });

    const onPointerDown = (event: PointerEvent) => {
      stateRef.current.dragging = true;
      stateRef.current.moved = false;
      stateRef.current.pointerId = event.pointerId;
      stateRef.current.startX = event.clientX;
      stateRef.current.startY = event.clientY;
      stateRef.current.lastX = event.clientX;
      stateRef.current.lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!stateRef.current.dragging || stateRef.current.pointerId !== event.pointerId) return;

      const dx = event.clientX - stateRef.current.lastX;
      const dy = event.clientY - stateRef.current.lastY;
      stateRef.current.lastX = event.clientX;
      stateRef.current.lastY = event.clientY;

      phi += dx * 0.008;
      theta = Math.max(-0.75, Math.min(0.75, theta + dy * 0.004));

      if (Math.abs(event.clientX - stateRef.current.startX) > 4 || Math.abs(event.clientY - stateRef.current.startY) > 4) {
        stateRef.current.moved = true;
      }
    };

    const onPointerHover = (event: PointerEvent) => {
      if (!onHotspotHover || stateRef.current.dragging) return;

      const picked = pickLatLon(canvas, event.clientX, event.clientY, phi, theta);
      if (!picked) {
        onHotspotHover(null);
        return;
      }

      const hotspot = findClosestHotspot(picked);
      onHotspotHover(hotspot?.id ?? null);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (stateRef.current.pointerId !== event.pointerId) return;

      const wasMoved = stateRef.current.moved;
      stateRef.current.dragging = false;
      stateRef.current.pointerId = -1;
      canvas.releasePointerCapture(event.pointerId);

      if (wasMoved || !onContinentSelect) return;

      const picked = pickLatLon(canvas, event.clientX, event.clientY, phi, theta);
      if (!picked) return;

      const hotspot = findClosestHotspot(picked);
      if (hotspot) {
        onHotspotSelect?.(hotspot.id);
      }

      const continent = classifyContinent(picked[0], picked[1]);
      if (continent) {
        onContinentSelect(continent);
      }
    };

    const onPointerLeave = () => {
      onHotspotHover?.(null);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointermove", onPointerHover);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);

    const frameLoop = () => {
      let nextPhi = phi;
      let nextTheta = theta;

      if (activeLocation) {
        // Cobe's phi=0 aligns close to lon=-90, apply correction for true centering.
        const targetPhi = (-(activeLocation[1] + 90) * Math.PI) / 180;
        const targetTheta = (activeLocation[0] * Math.PI) / 180;
        const phiDiff = normalizeAngle(targetPhi - nextPhi);
        const thetaDiff = targetTheta - nextTheta;

        nextPhi += phiDiff * 0.08;
        nextTheta += thetaDiff * 0.08;
      } else if (!stateRef.current.dragging) {
        nextPhi += 0.0015;
      }

      phi = normalizeAngle(nextPhi);
      theta = Math.max(-0.75, Math.min(0.75, nextTheta));
      stateRef.current.phi = phi;
      stateRef.current.theta = theta;

      globe.update({
        phi,
        theta,
      });

      animationFrame = window.requestAnimationFrame(frameLoop);
    };

    frameLoop();

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointermove", onPointerHover);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      globe.destroy();
    };
  }, [
    activeLocation,
    baseContourMarkers,
    continentOutlineMarkers,
    normalizedHotspots,
    onContinentSelect,
    onHotspotHover,
    onHotspotSelect,
    pixelSize,
    findClosestHotspot,
  ]);

  return (
    <div className={`relative mx-auto aspect-square w-full ${wrapperSizeClass} ${className ?? ""}`}>
      <canvas ref={canvasRef} className="h-full w-full cursor-grab active:cursor-grabbing" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_55%,rgba(10,0,6,0.58)_100%)]" />
    </div>
  );
}
