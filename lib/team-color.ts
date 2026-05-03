function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getTeamColor(teamKey: string): string {
  const key = teamKey?.trim() ? teamKey.trim() : "(unknown)";

  // Color dinámico (escala a N equipos) pero determinístico: mismo equipo => mismo color.
  // Usamos HSL para poder generar muchos colores distinguibles sin hardcodear una paleta enorme.
  const h = hashString(key);
  const hue = h % 360;
  const saturation = 72 + ((h >>> 8) % 10); // 72–81
  const lightness = 52 + ((h >>> 16) % 8); // 52–59 (contraste sobre fondo oscuro)

  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}
