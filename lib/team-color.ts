// 40 colors via golden angle (137.508deg) for maximum perceptual separation.
// Saturation and lightness alternated to further distinguish close hues.
const TEAM_PALETTE: string[] = [
  "hsl(0 85% 60%)",
  "hsl(138 80% 58%)",
  "hsl(275 85% 63%)",
  "hsl(53 90% 56%)",
  "hsl(190 80% 57%)",
  "hsl(328 85% 63%)",
  "hsl(105 80% 54%)",
  "hsl(243 85% 66%)",
  "hsl(20 90% 60%)",
  "hsl(158 80% 54%)",
  "hsl(295 85% 63%)",
  "hsl(73 85% 54%)",
  "hsl(210 85% 66%)",
  "hsl(348 85% 63%)",
  "hsl(125 80% 54%)",
  "hsl(263 85% 66%)",
  "hsl(40 90% 58%)",
  "hsl(178 80% 54%)",
  "hsl(315 85% 63%)",
  "hsl(93 82% 54%)",
  "hsl(230 85% 66%)",
  "hsl(8 90% 62%)",
  "hsl(145 80% 54%)",
  "hsl(283 85% 63%)",
  "hsl(60 88% 54%)",
  "hsl(198 80% 57%)",
  "hsl(335 85% 63%)",
  "hsl(113 80% 54%)",
  "hsl(250 85% 66%)",
  "hsl(28 90% 60%)",
  "hsl(165 80% 54%)",
  "hsl(303 85% 63%)",
  "hsl(80 85% 54%)",
  "hsl(218 85% 66%)",
  "hsl(355 85% 63%)",
  "hsl(133 80% 54%)",
  "hsl(270 85% 66%)",
  "hsl(48 90% 57%)",
  "hsl(185 80% 54%)",
  "hsl(323 85% 63%)",
];

export function getTeamColor(teamKey: number | string): string {
  if (typeof teamKey === "number") {
    return TEAM_PALETTE[Math.abs(teamKey) % TEAM_PALETTE.length];
  }
  // Fallback for string keys: hash to an index
  let h = 0;
  const key = teamKey?.trim() || "(unknown)";
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return TEAM_PALETTE[h % TEAM_PALETTE.length];
}
