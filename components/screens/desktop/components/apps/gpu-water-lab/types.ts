export interface WaterConfig {
  particleCount: number;
  gravity: number;
  viscosity: number;
  particleSize: number;
  mouseForce: number;
  colorMode: "depth" | "velocity" | "pressure";
}

export interface RendererStats {
  fps: number;
  frameTime: number;
  computeTime: number;
  renderTime: number;
}

export interface SimulationBounds {
  width: number;
  height: number;
}
