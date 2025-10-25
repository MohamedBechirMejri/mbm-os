import { generateRampTexture } from "./color-ramps";
import type { RendererConfig, ScatterDataset } from "./types";

const POINT_VERTEX_SHADER = /* wgsl */ `
struct Uniforms {
  viewMatrix: mat3x3<f32>,
  pointSize: f32,
  canvasWidth: f32,
  canvasHeight: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var rampSampler: sampler;
@group(0) @binding(2) var rampTexture: texture_2d<f32>;

struct VertexInput {
  @location(0) position: vec2<f32>,
  @location(1) category: f32,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) category: f32,
}

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
  var out: VertexOutput;

  // Transform to view space
  let viewPos = uniforms.viewMatrix * vec3<f32>(in.position, 1.0);

  // Convert to clip space (-1 to 1)
  let clipX = (viewPos.x / uniforms.canvasWidth) * 2.0 - 1.0;
  let clipY = 1.0 - (viewPos.y / uniforms.canvasHeight) * 2.0;

  out.position = vec4<f32>(clipX, clipY, 0.0, 1.0);
  out.category = clamp(in.category, 0.0, 1.0);

  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  let color = textureSample(rampTexture, rampSampler, vec2<f32>(in.category, 0.5));
  return vec4<f32>(color.xyz, 0.88);
}
`;

export class ScatterRenderer {
  private device: GPUDevice | null = null;
  private context: GPUCanvasContext | null = null;
  private pipeline: GPURenderPipeline | null = null;
  private uniformBuffer: GPUBuffer | null = null;
  private uniformBindGroup: GPUBindGroup | null = null;
  private vertexBuffer: GPUBuffer | null = null;
  private sampler: GPUSampler | null = null;
  private rampTexture: GPUTexture | null = null;
  private rampTextureView: GPUTextureView | null = null;
  private bindGroupLayout: GPUBindGroupLayout | null = null;
  private pointCount = 0;
  private canvasWidth = 0;
  private canvasHeight = 0;
  private currentRampId: string | null = null;
  private clearColor = { r: 0.05, g: 0.05, b: 0.05, a: 1 };

  async initialize(canvas: HTMLCanvasElement): Promise<boolean> {
    // Check WebGPU support
    if (!navigator.gpu) {
      console.error("WebGPU not supported");
      return false;
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      console.error("No WebGPU adapter found");
      return false;
    }

    this.device = await adapter.requestDevice();
    this.context = canvas.getContext("webgpu");

    if (!this.context) {
      console.error("Failed to get WebGPU context");
      return false;
    }

    const format = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device: this.device,
      format,
      alphaMode: "premultiplied",
    });

    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;

    // Create uniform buffer (view matrix + point size + canvas dimensions)
    this.uniformBuffer = this.device.createBuffer({
      size: 64, // mat3x3 (48 bytes) + f32 (4) + padding + 2x f32 (8)
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Create shader module
    const shaderModule = this.device.createShaderModule({
      code: POINT_VERTEX_SHADER,
    });

    // Create pipeline layout
    this.bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "uniform" },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: { type: "filtering" },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.FRAGMENT,
          texture: { sampleType: "float" },
        },
      ],
    });

    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [this.bindGroupLayout],
    });

    // Create render pipeline
    this.pipeline = this.device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: {
        module: shaderModule,
        entryPoint: "vs_main",
        buffers: [
          {
            arrayStride: 12, // vec2<f32> + f32 (x, y, category)
            attributes: [
              {
                shaderLocation: 0,
                offset: 0,
                format: "float32x2", // position
              },
              {
                shaderLocation: 1,
                offset: 8,
                format: "float32", // category
              },
            ],
          },
        ],
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fs_main",
        targets: [{ format }],
      },
      primitive: {
        topology: "point-list",
      },
    });

    this.sampler = this.device.createSampler({
      magFilter: "linear",
      minFilter: "linear",
    });

    return true;
  }

  setDataset(dataset: ScatterDataset): void {
    if (!this.device) return;

    this.pointCount = dataset.points.length;

    // Create vertex data: [x, y, category, x, y, category, ...]
    const vertexData = new Float32Array(this.pointCount * 3);
    for (let i = 0; i < this.pointCount; i++) {
      const point = dataset.points[i];
      if (!point) continue;
      vertexData[i * 3 + 0] = point.x;
      vertexData[i * 3 + 1] = point.y;
      vertexData[i * 3 + 2] = point.category;
    }

    // Create or recreate vertex buffer
    if (this.vertexBuffer) {
      this.vertexBuffer.destroy();
    }

    this.vertexBuffer = this.device.createBuffer({
      size: vertexData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });

    new Float32Array(this.vertexBuffer.getMappedRange()).set(vertexData);
    this.vertexBuffer.unmap();
  }

  updateConfig(config: RendererConfig): void {
    if (!this.device || !this.uniformBuffer) return;

    const { viewport } = config;

    // Build view matrix: translate(-center) * scale(zoom)
    // We need to convert from data space to pixel space
    const tx = -viewport.centerX * viewport.zoom + this.canvasWidth / 2;
    const ty = -viewport.centerY * viewport.zoom + this.canvasHeight / 2;

    const viewMatrix = new Float32Array([
      viewport.zoom,
      0,
      0,
      0, // padding
      0,
      viewport.zoom,
      0,
      0, // padding
      tx,
      ty,
      1,
      0, // padding
    ]);

    const pointSize = config.mode.pointSize ?? 2.0;
    const canvasDims = new Float32Array([this.canvasWidth, this.canvasHeight]);

    // Write uniforms
    const uniformData = new Float32Array(16);
    uniformData.set(viewMatrix, 0);
    uniformData[12] = pointSize;
    uniformData[13] = canvasDims[0];
    uniformData[14] = canvasDims[1];

    this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);

    this.applyColorRamp(config.colorRamp);
    this.updateBackground(config.backgroundColor);
  }

  render(): void {
    if (
      !this.device ||
      !this.context ||
      !this.pipeline ||
      !this.uniformBindGroup ||
      !this.vertexBuffer ||
      this.pointCount === 0
    ) {
      return;
    }

    const commandEncoder = this.device.createCommandEncoder();
    const textureView = this.context.getCurrentTexture().createView();

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: this.clearColor,
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.uniformBindGroup);
    renderPass.setVertexBuffer(0, this.vertexBuffer);
    renderPass.draw(this.pointCount);
    renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }

  resize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  destroy(): void {
    this.vertexBuffer?.destroy();
    this.uniformBuffer?.destroy();
    this.rampTexture?.destroy();
    this.device?.destroy();
  }

  private applyColorRamp(colorRamp: RendererConfig["colorRamp"]): void {
    if (
      !this.device ||
      !this.bindGroupLayout ||
      !this.uniformBuffer ||
      !this.sampler
    ) {
      return;
    }

    if (this.currentRampId === colorRamp.id && this.uniformBindGroup) {
      return;
    }

    const data = generateRampTexture(colorRamp, 256);
    const width = data.length / 4;

    const texture = this.device.createTexture({
      size: { width, height: 1, depthOrArrayLayers: 1 },
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    const textureData = new Uint8Array(data);

    this.device.queue.writeTexture(
      { texture },
      textureData,
      { bytesPerRow: width * 4 },
      { width, height: 1, depthOrArrayLayers: 1 },
    );

    this.rampTexture?.destroy();
    this.rampTexture = texture;
    this.rampTextureView = texture.createView();

    this.uniformBindGroup = this.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: this.uniformBuffer },
        },
        {
          binding: 1,
          resource: this.sampler,
        },
        {
          binding: 2,
          resource: this.rampTextureView,
        },
      ],
    });

    this.currentRampId = colorRamp.id;
  }

  private updateBackground(color: string): void {
    const parsed = parseHexToColor(color);
    if (parsed) {
      this.clearColor = parsed;
    }
  }
}

function parseHexToColor(
  hex: string,
): { r: number; g: number; b: number; a: number } | null {
  const cleaned = hex.trim().replace("#", "");
  if (cleaned.length !== 6) {
    return null;
  }

  const r = Number.parseInt(cleaned.slice(0, 2), 16);
  const g = Number.parseInt(cleaned.slice(2, 4), 16);
  const b = Number.parseInt(cleaned.slice(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return null;
  }

  return {
    r: r / 255,
    g: g / 255,
    b: b / 255,
    a: 1,
  };
}
