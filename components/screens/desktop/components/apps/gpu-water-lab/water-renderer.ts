import { COMPUTE_SHADER, RENDER_SHADER } from "./shaders";
import type { RendererStats, SimulationBounds, WaterConfig } from "./types";

interface Particle {
  position: [number, number];
  velocity: [number, number];
  force: [number, number];
}

export class WaterRenderer {
  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private computePipeline!: GPUComputePipeline;
  private renderPipeline!: GPURenderPipeline;
  private particleBuffer!: GPUBuffer;
  private simParamsBuffer!: GPUBuffer;
  private renderUniformsBuffer!: GPUBuffer;
  private computeBindGroup!: GPUBindGroup;
  private renderBindGroup!: GPUBindGroup;
  private canvasFormat!: GPUTextureFormat;

  private config: WaterConfig;
  private bounds: SimulationBounds;
  private mousePos = { x: 0, y: 0 };
  private mouseActive = false;
  private animationId: number | null = null;
  private lastFrameTime = 0;
  private stats: RendererStats = {
    fps: 0,
    frameTime: 0,
    computeTime: 0,
    renderTime: 0,
  };

  constructor(config: WaterConfig, bounds: SimulationBounds) {
    this.config = config;
    this.bounds = bounds;
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    if (!navigator.gpu) {
      throw new Error("WebGPU not supported");
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("No GPU adapter found");
    }

    this.device = await adapter.requestDevice();
    const context = canvas.getContext("webgpu");
    if (!context) {
      throw new Error("Failed to get WebGPU context");
    }

    this.context = context;
    const format = navigator.gpu.getPreferredCanvasFormat();
    this.canvasFormat = format;
    this.context.configure({
      device: this.device,
      format,
      alphaMode: "premultiplied",
    });

    this.initBuffers();
    this.initPipelines(format);
    this.initParticles();
  }

  private initBuffers(): void {
    // Particle buffer (position, velocity, force for each particle)
    const particleBufferSize =
      this.config.particleCount * 6 * Float32Array.BYTES_PER_ELEMENT;
    this.particleBuffer = this.device.createBuffer({
      size: particleBufferSize,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC,
    });

    // Simulation parameters buffer
    this.simParamsBuffer = this.device.createBuffer({
      size: 10 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Render uniforms buffer
    this.renderUniformsBuffer = this.device.createBuffer({
      size: 4 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  private initPipelines(format: GPUTextureFormat): void {
    // Compute pipeline
    const computeModule = this.device.createShaderModule({
      code: COMPUTE_SHADER,
    });

    const computeBindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "storage" },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "uniform" },
        },
      ],
    });

    this.computePipeline = this.device.createComputePipeline({
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [computeBindGroupLayout],
      }),
      compute: {
        module: computeModule,
        entryPoint: "cs_main",
      },
    });

    this.computeBindGroup = this.device.createBindGroup({
      layout: computeBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.particleBuffer } },
        { binding: 1, resource: { buffer: this.simParamsBuffer } },
      ],
    });

    // Render pipeline
    const renderModule = this.device.createShaderModule({
      code: RENDER_SHADER,
    });

    const renderBindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "read-only-storage" },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: "uniform" },
        },
      ],
    });

    this.renderPipeline = this.device.createRenderPipeline({
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [renderBindGroupLayout],
      }),
      vertex: {
        module: renderModule,
        entryPoint: "vs_main",
      },
      fragment: {
        module: renderModule,
        entryPoint: "fs_main",
        targets: [
          {
            format,
            blend: {
              color: {
                srcFactor: "src-alpha",
                dstFactor: "one-minus-src-alpha",
                operation: "add",
              },
              alpha: {
                srcFactor: "one",
                dstFactor: "one-minus-src-alpha",
                operation: "add",
              },
            },
          },
        ],
      },
      primitive: {
        topology: "triangle-list",
      },
    });

    this.renderBindGroup = this.device.createBindGroup({
      layout: renderBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.particleBuffer } },
        { binding: 1, resource: { buffer: this.renderUniformsBuffer } },
      ],
    });
  }

  private initParticles(): void {
    const particles: Particle[] = [];
    const { width, height } = this.bounds;

    // Create particles in a water-like initial state (pooled at bottom)
    for (let i = 0; i < this.config.particleCount; i++) {
      const x = Math.random() * width;
      const y = height * 0.3 + Math.random() * height * 0.3; // Pool in lower portion

      particles.push({
        position: [x, y],
        velocity: [0, 0],
        force: [0, 0],
      });
    }

    const data = new Float32Array(this.config.particleCount * 6);
    particles.forEach((p, i) => {
      data[i * 6 + 0] = p.position[0];
      data[i * 6 + 1] = p.position[1];
      data[i * 6 + 2] = p.velocity[0];
      data[i * 6 + 3] = p.velocity[1];
      data[i * 6 + 4] = p.force[0];
      data[i * 6 + 5] = p.force[1];
    });

    this.device.queue.writeBuffer(this.particleBuffer, 0, data);
  }

  setMousePosition(x: number, y: number, active: boolean): void {
    this.mousePos = { x, y };
    this.mouseActive = active;
  }

  updateConfig(config: Partial<WaterConfig>): void {
    const needsReinit =
      config.particleCount !== undefined &&
      config.particleCount !== this.config.particleCount;

    this.config = { ...this.config, ...config };

    if (needsReinit) {
      this.initBuffers();
      this.initParticles();

      // Recreate bind groups with new buffers
      this.computeBindGroup = this.device.createBindGroup({
        layout: this.computePipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.particleBuffer } },
          { binding: 1, resource: { buffer: this.simParamsBuffer } },
        ],
      });

      this.renderBindGroup = this.device.createBindGroup({
        layout: this.renderPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.particleBuffer } },
          { binding: 1, resource: { buffer: this.renderUniformsBuffer } },
        ],
      });
    }
  }

  updateBounds(bounds: SimulationBounds): void {
    this.bounds = bounds;
    this.context.configure({
      device: this.device,
      format: this.canvasFormat,
      alphaMode: "premultiplied",
    });
  }

  start(): void {
    if (this.animationId !== null) return;

    const frame = (timestamp: number) => {
      const deltaTime = this.lastFrameTime
        ? Math.min((timestamp - this.lastFrameTime) / 1000, 0.016)
        : 0.016;
      this.lastFrameTime = timestamp;

      this.simulate(deltaTime);
      this.render();

      this.animationId = requestAnimationFrame(frame);
    };

    this.animationId = requestAnimationFrame(frame);
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private simulate(deltaTime: number): void {
    const computeStart = performance.now();

    // Update simulation parameters
    const simParams = new Float32Array([
      deltaTime,
      this.config.gravity,
      this.config.viscosity,
      this.mousePos.x,
      this.mousePos.y,
      this.config.mouseForce,
      this.mouseActive ? 1.0 : 0.0,
      this.bounds.width,
      this.bounds.height,
      this.config.particleCount,
    ]);

    this.device.queue.writeBuffer(this.simParamsBuffer, 0, simParams);

    const commandEncoder = this.device.createCommandEncoder();
    const computePass = commandEncoder.beginComputePass();

    computePass.setPipeline(this.computePipeline);
    computePass.setBindGroup(0, this.computeBindGroup);

    const workgroupCount = Math.ceil(this.config.particleCount / 256);
    computePass.dispatchWorkgroups(workgroupCount);

    computePass.end();
    this.device.queue.submit([commandEncoder.finish()]);

    this.stats.computeTime = performance.now() - computeStart;
  }

  private render(): void {
    const renderStart = performance.now();

    // Update render uniforms
    const colorModeMap: Record<WaterConfig["colorMode"], number> = {
      depth: 0,
      velocity: 1,
      pressure: 2,
    };

    const renderUniforms = new Float32Array([
      this.bounds.width,
      this.bounds.height,
      this.config.particleSize,
      colorModeMap[this.config.colorMode],
    ]);

    this.device.queue.writeBuffer(this.renderUniformsBuffer, 0, renderUniforms);

    const commandEncoder = this.device.createCommandEncoder();
    const textureView = this.context.getCurrentTexture().createView();

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.05, g: 0.05, b: 0.08, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    renderPass.setPipeline(this.renderPipeline);
    renderPass.setBindGroup(0, this.renderBindGroup);
    renderPass.draw(6, this.config.particleCount);
    renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);

    this.stats.renderTime = performance.now() - renderStart;
    this.stats.frameTime = this.stats.computeTime + this.stats.renderTime;
    this.stats.fps = Math.round(1000 / this.stats.frameTime);
  }

  getStats(): RendererStats {
    return { ...this.stats };
  }

  destroy(): void {
    this.stop();
    this.particleBuffer?.destroy();
    this.simParamsBuffer?.destroy();
    this.renderUniformsBuffer?.destroy();
  }
}
