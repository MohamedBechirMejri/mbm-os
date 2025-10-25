export const COMPUTE_SHADER = /* wgsl */ `
struct Particle {
  position: vec2f,
  velocity: vec2f,
  force: vec2f,
}

struct SimParams {
  deltaTime: f32,
  gravity: f32,
  viscosity: f32,
  mouseX: f32,
  mouseY: f32,
  mouseForce: f32,
  mouseActive: f32,
  boundsWidth: f32,
  boundsHeight: f32,
  particleCount: f32,
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> params: SimParams;

const DAMPING = 0.998;
const INTERACTION_RADIUS = 30.0;
const REPULSION_FORCE = 0.5;
const ATTRACTION_FORCE = 0.01;
const BOUNDARY_DAMPING = 0.7;

@compute @workgroup_size(256)
fn cs_main(@builtin(global_invocation_id) global_id: vec3u) {
  let index = global_id.x;
  if (index >= u32(params.particleCount)) {
    return;
  }

  var particle = particles[index];
  var force = vec2f(0.0, params.gravity);

  // Mouse interaction
  if (params.mouseActive > 0.5) {
    let mousePos = vec2f(params.mouseX, params.mouseY);
    let toMouse = mousePos - particle.position;
    let dist = length(toMouse);

    if (dist < 150.0 && dist > 0.1) {
      let strength = (1.0 - dist / 150.0) * params.mouseForce;
      force += normalize(toMouse) * strength;
    }
  }

  // Particle-particle interaction (spatial hashing would be better for performance)
  // For now, we'll sample a subset to keep it real-time
  let sampleStep = max(1u, u32(params.particleCount) / 1024u);

  for (var i = 0u; i < u32(params.particleCount); i += sampleStep) {
    if (i == index) {
      continue;
    }

    let other = particles[i];
    let delta = other.position - particle.position;
    let dist = length(delta);

    if (dist < INTERACTION_RADIUS && dist > 0.1) {
      let dir = normalize(delta);
      // Repulsion at close range, slight attraction at medium range
      if (dist < INTERACTION_RADIUS * 0.5) {
        force -= dir * REPULSION_FORCE * (1.0 - dist / (INTERACTION_RADIUS * 0.5));
      } else {
        force += dir * ATTRACTION_FORCE * (dist / INTERACTION_RADIUS);
      }
    }
  }

  // Update velocity with forces and viscosity
  particle.velocity += force * params.deltaTime;
  particle.velocity *= (1.0 - params.viscosity * params.deltaTime);
  particle.velocity *= DAMPING;

  // Update position
  particle.position += particle.velocity * params.deltaTime;

  // Boundary collision
  if (particle.position.x < 0.0) {
    particle.position.x = 0.0;
    particle.velocity.x *= -BOUNDARY_DAMPING;
  }
  if (particle.position.x > params.boundsWidth) {
    particle.position.x = params.boundsWidth;
    particle.velocity.x *= -BOUNDARY_DAMPING;
  }
  if (particle.position.y < 0.0) {
    particle.position.y = 0.0;
    particle.velocity.y *= -BOUNDARY_DAMPING;
  }
  if (particle.position.y > params.boundsHeight) {
    particle.position.y = params.boundsHeight;
    particle.velocity.y *= -BOUNDARY_DAMPING;
  }

  particles[index] = particle;
}
`;

export const VERTEX_SHADER = /* wgsl */ `
struct Particle {
  position: vec2f,
  velocity: vec2f,
  force: vec2f,
}

struct Uniforms {
  resolution: vec2f,
  particleSize: f32,
  colorMode: f32,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) velocity: f32,
  @location(1) particlePos: vec2f,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@vertex
fn vs_main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOutput {
  let particle = particles[instanceIndex];

  // Create a quad for each particle
  var positions = array<vec2f, 6>(
    vec2f(-1.0, -1.0),
    vec2f( 1.0, -1.0),
    vec2f(-1.0,  1.0),
    vec2f(-1.0,  1.0),
    vec2f( 1.0, -1.0),
    vec2f( 1.0,  1.0),
  );

  let offset = positions[vertexIndex] * uniforms.particleSize;
  let screenPos = particle.position + offset;

  // Convert to clip space
  let clipPos = (screenPos / uniforms.resolution) * 2.0 - 1.0;

  var output: VertexOutput;
  output.position = vec4f(clipPos.x, -clipPos.y, 0.0, 1.0);
  output.velocity = length(particle.velocity);
  output.particlePos = particle.position;

  return output;
}
`;

export const FRAGMENT_SHADER = /* wgsl */ `
struct Uniforms {
  resolution: vec2f,
  particleSize: f32,
  colorMode: f32,
}

@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@fragment
fn fs_main(
  @builtin(position) fragCoord: vec4f,
  @location(0) velocity: f32,
  @location(1) particlePos: vec2f,
) -> @location(0) vec4f {
  // Color based on mode
  var color: vec3f;

  if (uniforms.colorMode < 0.5) {
    // Depth mode - blue gradient based on y position
    let depth = particlePos.y / uniforms.resolution.y;
    color = mix(vec3f(0.4, 0.7, 1.0), vec3f(0.1, 0.2, 0.5), depth);
  } else if (uniforms.colorMode < 1.5) {
    // Velocity mode - color based on speed
    let speed = clamp(velocity / 500.0, 0.0, 1.0);
    color = mix(vec3f(0.2, 0.4, 0.8), vec3f(0.9, 0.3, 0.5), speed);
  } else {
    // Pressure mode - based on position
    let pressure = sin(particlePos.x * 0.01) * 0.5 + 0.5;
    color = mix(vec3f(0.1, 0.5, 0.8), vec3f(0.8, 0.9, 1.0), pressure);
  }

  return vec4f(color, 0.7);
}
`;
