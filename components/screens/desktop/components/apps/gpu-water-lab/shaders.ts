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

  if (params.mouseActive > 0.5) {
    let mousePos = vec2f(params.mouseX, params.mouseY);
    let toMouse = mousePos - particle.position;
    let dist = length(toMouse);

    if (dist < 150.0 && dist > 0.1) {
      let strength = (1.0 - dist / 150.0) * params.mouseForce;
      force += normalize(toMouse) * strength;
    }
  }

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
      if (dist < INTERACTION_RADIUS * 0.5) {
        force -= dir * REPULSION_FORCE * (1.0 - dist / (INTERACTION_RADIUS * 0.5));
      } else {
        force += dir * ATTRACTION_FORCE * (dist / INTERACTION_RADIUS);
      }
    }
  }

  particle.velocity += force * params.deltaTime;
  particle.velocity *= (1.0 - params.viscosity * params.deltaTime);
  particle.velocity *= DAMPING;

  particle.position += particle.velocity * params.deltaTime;

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

export const RENDER_SHADER = /* wgsl */ `
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
  @location(1) localCoord: vec2f,
  @location(2) normalizedPos: vec2f,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@vertex
fn vs_main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> VertexOutput {
  let particle = particles[instanceIndex];

  var corners = array<vec2f, 6>(
    vec2f(-1.0, -1.0),
    vec2f( 1.0, -1.0),
    vec2f(-1.0,  1.0),
    vec2f(-1.0,  1.0),
    vec2f( 1.0, -1.0),
    vec2f( 1.0,  1.0),
  );

  let radius = uniforms.particleSize * 0.5;
  let offset = corners[vertexIndex] * radius;
  let worldPos = particle.position + offset;

  let resolution = max(uniforms.resolution, vec2f(1.0, 1.0));
  let clipPos = vec2f(
    (worldPos.x / resolution.x) * 2.0 - 1.0,
    (worldPos.y / resolution.y) * 2.0 - 1.0,
  );

  var output: VertexOutput;
  output.position = vec4f(clipPos.x, -clipPos.y, 0.0, 1.0);
  output.velocity = length(particle.velocity);
  output.localCoord = corners[vertexIndex];
  output.normalizedPos = clamp(particle.position / resolution, vec2f(0.0, 0.0), vec2f(1.0, 1.0));

  return output;
}

@fragment
fn fs_main(
  @location(0) velocity: f32,
  @location(1) localCoord: vec2f,
  @location(2) normalizedPos: vec2f,
) -> @location(0) vec4f {
  let dist = length(localCoord);
  if (dist > 1.0) {
    discard;
  }

  let rim = smoothstep(0.0, 1.0, dist);
  let alpha = (1.0 - rim) * 0.85;

  var color: vec3f;

  if (uniforms.colorMode < 0.5) {
    let depth = normalizedPos.y;
    color = mix(vec3f(0.35, 0.7, 1.0), vec3f(0.05, 0.2, 0.45), depth);
  } else if (uniforms.colorMode < 1.5) {
    let speed = clamp(velocity / 350.0, 0.0, 1.0);
    color = mix(vec3f(0.1, 0.35, 0.9), vec3f(0.95, 0.4, 0.6), speed);
  } else {
    let pressure = sin((normalizedPos.x + normalizedPos.y) * 6.28318) * 0.5 + 0.5;
    color = mix(vec3f(0.15, 0.55, 0.9), vec3f(0.75, 0.9, 1.0), pressure);
  }

  let shading = 0.65 + 0.35 * (1.0 - dist * dist);
  return vec4f(color * shading, alpha);
}
`;
