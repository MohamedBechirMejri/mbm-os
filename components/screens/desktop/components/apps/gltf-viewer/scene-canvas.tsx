"use client";

import {
  useGLTF,
  TransformControls,
  OrbitControls,
  Environment,
  Grid,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, memo, useRef, useMemo } from "react";
import { LoadingManager, type Group } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { GltfViewerState, SceneModel, TransformMode } from "./types";

// ---------------------------------------------------------------------------
// Model Component
// ---------------------------------------------------------------------------

interface ModelProps {
  model: SceneModel;
  isSelected: boolean;
  transformMode: TransformMode;
  onSelect: () => void;
  onTransformChange: (
    transform: Partial<Pick<SceneModel, "position" | "rotation" | "scale">>
  ) => void;
  orbitControlsRef: React.RefObject<OrbitControlsImpl | null>;
}

const Model = memo(function Model({
  model,
  isSelected,
  transformMode,
  onSelect,
  onTransformChange,
  orbitControlsRef,
}: ModelProps) {
  // Create a loading manager to handle external assets (textures, etc.)
  const manager = useMemo(() => {
    const m = new LoadingManager();
    if (model.assetMap) {
      m.setURLModifier(url => {
        // 1. Try exact match
        if (model.assetMap?.[url]) return model.assetMap[url];

        // 2. Try decoded URL match
        const decodedUrl = decodeURIComponent(url);
        if (model.assetMap?.[decodedUrl]) return model.assetMap[decodedUrl];

        // 3. Try filename only match
        const fileName = decodedUrl.split("/").pop();
        if (fileName && model.assetMap?.[fileName])
          return model.assetMap[fileName];

        return url;
      });
    }
    return m;
  }, [model.assetMap]);

  const { scene } = useGLTF(model.url, true, true, (loader: any) => {
    loader.manager = manager;
  });
  // Ref for the group that TransformControls will attach to
  const groupRef = useRef<Group>(null);

  // Clone the scene so each instance is independent
  const clonedScene = scene.clone();

  return (
    <>
      <group
        ref={groupRef}
        position={model.position}
        rotation={model.rotation}
        scale={model.scale}
        visible={model.visible}
        onClick={e => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <primitive object={clonedScene} />
      </group>

      {/* TransformControls attached to the group */}
      {isSelected && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode={transformMode}
          onMouseDown={() => {
            if (orbitControlsRef.current) {
              orbitControlsRef.current.enabled = false;
            }
          }}
          onMouseUp={() => {
            if (orbitControlsRef.current) {
              orbitControlsRef.current.enabled = true;
            }
          }}
          onChange={() => {
            if (!groupRef.current) return;
            const obj = groupRef.current;

            onTransformChange({
              position: [obj.position.x, obj.position.y, obj.position.z],
              rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
              scale: [obj.scale.x, obj.scale.y, obj.scale.z],
            });
          }}
        />
      )}
    </>
  );
});

// ---------------------------------------------------------------------------
// Scene Content
// ---------------------------------------------------------------------------

interface SceneContentProps {
  state: GltfViewerState;
  orbitControlsRef: React.RefObject<OrbitControlsImpl | null>;
}

function SceneContent({ state, orbitControlsRef }: SceneContentProps) {
  return (
    <>
      {/* Background color */}
      <color attach="background" args={["#1a1a1a"]} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />

      {/* Environment for nice reflections */}
      <Environment preset="city" />

      {/* Grid helper */}
      <Grid
        position={[0, -0.01, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#3a3a3a"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#5a5a5a"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      {/* Models */}
      {state.models.map(model => (
        <Suspense key={model.id} fallback={null}>
          <Model
            model={model}
            isSelected={state.selectedModelId === model.id}
            transformMode={state.transformMode}
            onSelect={() => state.selectModel(model.id)}
            onTransformChange={transform =>
              state.updateModelTransform(model.id, transform)
            }
            orbitControlsRef={orbitControlsRef}
          />
        </Suspense>
      ))}

      {/* Controls */}
      <OrbitControls
        ref={orbitControlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={1}
        maxDistance={100}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Scene Canvas
// ---------------------------------------------------------------------------

interface SceneCanvasProps {
  state: GltfViewerState;
}

export function SceneCanvas({ state }: SceneCanvasProps) {
  // Using useRef here is required for Three.js OrbitControls - no React alternative
  const orbitControlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <div className="flex-1 relative min-h-0 min-w-0 h-full w-full">
      <Canvas
        shadows
        camera={{ position: [5, 5, 5], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        style={{ background: "#1a1a1a" }}
      >
        <Suspense fallback={null}>
          <SceneContent state={state} orbitControlsRef={orbitControlsRef} />
        </Suspense>
      </Canvas>

      {/* Empty state */}
      {state.models.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-neutral-500">
            <div className="text-4xl mb-2">📦</div>
            <div className="text-sm font-medium">No models loaded</div>
            <div className="text-xs mt-1">
              Drop a .glTF or .glb file or use the sidebar
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
