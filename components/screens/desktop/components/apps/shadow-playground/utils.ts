import { ShadowLayer } from "./types";

export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function generateCssValue(layers: ShadowLayer[]) {
  return layers
    .map(l => {
      const rgb = hexToRgb(l.color);
      let colorStr = l.color;
      if (rgb) {
        colorStr = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${l.opacity})`;
      }
      return `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${
        l.spread
      }px ${colorStr}`;
    })
    .join(", ");
}

export function generateTailwindValue(layers: ShadowLayer[]) {
  const shadowStr = layers
    .map(l => {
      const rgb = hexToRgb(l.color);
      let colorStr = l.color;
      if (rgb) {
        colorStr = `rgba(${rgb.r},${rgb.g},${rgb.b},${l.opacity})`;
      }
      return `${l.inset ? "inset_" : ""}${l.x}px_${l.y}px_${l.blur}px_${
        l.spread
      }px_${colorStr}`;
    })
    .join(",");
  return `shadow-[${shadowStr}]`;
}

export function generateJsValue(cssValue: string) {
  return `{\n  boxShadow: "${cssValue}"\n}`;
}
