import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  uniform float uProgress;

  varying vec2 vUv;

  void main() {
    vUv = uv;

    vec3 pos = position;

    // Fast expansion
    float growth = smoothstep(0.0, 0.25, uProgress);

    // Flame expands toward +X
    pos.x *= 0.25 + growth * 0.9;

    // Slight vertical expansion
    pos.y *= 0.5 + growth * 0.5;

    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uSeed;

  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(
      mix(a, b, f.x),
      mix(c, d, f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 4; i++) {
      value += noise(p) * amplitude;
      p *= 2.0;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 uv = vUv;

    float x = uv.x;
    float y = uv.y;

    float centeredY = y - 0.5;

    // ---------------------------------------------
    // Animation
    // ---------------------------------------------

    float appear = smoothstep(
      0.0,
      0.10,
      uProgress
    );

    float disappear = 1.0 - smoothstep(
      0.35,
      1.0,
      uProgress
    );

    float animation = appear * disappear;

    // ---------------------------------------------
    // Animated noise
    // ---------------------------------------------

    vec2 noiseUv = vec2(
      x * 4.0 + uTime * 7.0 + uSeed,
      y * 5.0
    );

    float n = fbm(noiseUv);

    // Flame distortion
    float distortion =
      (n - 0.5) *
      0.38 *
      smoothstep(0.0, 0.7, x);

    float flameY =
      abs(centeredY + distortion);

    // ---------------------------------------------
    // Flame body
    // ---------------------------------------------

    // Wide at muzzle
    // Very thin at tip
    float width = mix(
      0.48,
      0.015,
      pow(x, 0.65)
    );

    width += (n - 0.5) * 0.16;

    float flame = 1.0 - smoothstep(
      width * 0.35,
      width,
      flameY
    );

    // Taper
    float taper = 1.0 - smoothstep(
      0.55,
      1.0,
      x
    );

    flame *= taper;

    // ---------------------------------------------
    // Flame tongues
    // ---------------------------------------------

    float tongues = noise(
      vec2(
        x * 10.0 - uTime * 12.0 + uSeed,
        y * 8.0
      )
    );

    tongues = smoothstep(
      0.25,
      0.75,
      tongues
    );

    flame *= mix(
      0.65,
      1.15,
      tongues
    );

    // ---------------------------------------------
    // Hot inner core
    // ---------------------------------------------

    float core = 1.0 - smoothstep(
      0.0,
      0.23,
      flameY
    );

    core *= 1.0 - smoothstep(
      0.25,
      0.8,
      x
    );

    // ---------------------------------------------
    // Muzzle blast
    // ---------------------------------------------

    float muzzle = 1.0 - smoothstep(
      0.0,
      0.28,
      x
    );

    // ---------------------------------------------
    // Colors
    // ---------------------------------------------

    vec3 orange = vec3(
      1.0,
      0.08,
      0.005
    );

    vec3 yellow = vec3(
      1.0,
      0.45,
      0.015
    );

    vec3 white = vec3(
      1.0,
      0.95,
      0.65
    );

    vec3 color = mix(
      orange,
      yellow,
      core
    );

    color = mix(
      color,
      white,
      core * core
    );

    // Very bright muzzle
    color += white * muzzle * 0.7;

    // ---------------------------------------------
    // Alpha
    // ---------------------------------------------

    float alpha = flame;

    alpha *= 0.75 + core * 0.4;

    alpha *= animation;

    // Fade left/right edges
    alpha *= smoothstep(
      0.0,
      0.05,
      x
    );

    if (alpha < 0.01) {
      discard;
    }

    gl_FragColor = vec4(
      color,
      alpha
    );
  }
`;

export function MuzzleFlash({
  trigger = 0,
  scale = [1.5, 0.65, 1],
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  duration = 0.12,
}) {
  const materialRef =
    useRef(null);

  const previousTrigger =
    useRef(trigger);

  const elapsedRef =
    useRef(duration);

  const [uSeedValue] = useState(() => Math.random() * 1000);

  useEffect(() => {
    if (trigger === previousTrigger.current) {
      return;
    }

    previousTrigger.current = trigger;

    elapsedRef.current = 0;

    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = 0;

      materialRef.current.uniforms.uSeed.value =
        Math.random() * 1000;
    }
  }, [trigger]);

  useFrame((state, delta) => {
    const material = materialRef.current;

    if (!material) return;

    material.uniforms.uTime.value =
      state.clock.elapsedTime;

    // No active flash
    if (elapsedRef.current >= duration) {
      material.uniforms.uProgress.value = 1;
      return;
    }

    elapsedRef.current += delta;

    material.uniforms.uProgress.value =
      Math.min(
        elapsedRef.current / duration,
        1
      );
  });

  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={scale}
      frustumCulled={false}
    >
      <planeGeometry args={[1, 1]} />

      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: {
            value: 0,
          },

          uProgress: {
            value: 1,
          },

          uSeed: {
            value: uSeedValue,
          },
        }}
        transparent
        depthWrite={false}
        depthTest
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}