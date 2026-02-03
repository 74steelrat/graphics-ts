export const randomHslColor = (
  hueMin = 0,
  hueMax = 360,
  saturation = 100,
  lightness = 60
): string => {
  const hue = hueMin + Math.random() * (hueMax - hueMin);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
