//this code is changed version of atmopheric effect code found here: https://github.com/bobbyroe/earth-with-react-three-fiber/blob/main/src/App.jsx
import * as THREE from "three";

function getFresnelShaderArgs({ rimHex = 0x0088ff, facingHex = 0x000000 } = {}) {
  const uniforms = {
    color1: { value: new THREE.Color(rimHex) },
    color2: { value: new THREE.Color(facingHex) },
    fresnelBias: { value: 0.1 },
    fresnelScale: { value: 1.0 },
    fresnelPower: { value: 4.0 },
  };
  const vs = `
    uniform float fresnelBias;
    uniform float fresnelScale;
    uniform float fresnelPower;

    varying float vReflectionFactor;

    void main() {
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

      vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );

      vec3 I = worldPosition.xyz - cameraPosition;

      vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), fresnelPower );

      gl_Position = projectionMatrix * mvPosition;
    }
  `;
  const fs = `
    uniform vec3 color1;
    uniform vec3 color2;

    varying float vReflectionFactor;

    void main() {
      float f = clamp( vReflectionFactor, 0.0, 1.0 );
      vec4 atmosphereColor = vec4(mix(color2, color1, vec3(f)), f);

      // Blend the atmosphere color with the existing scene color
      gl_FragColor = atmosphereColor;
      gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb, gl_FragColor.a);
    }
  `;
  const args = {
    uniforms: uniforms,
    vertexShader: vs,
    fragmentShader: fs,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false, // Important for proper blending
  };
  return args;
}

function TestAtmosphere({
  rimHex = "#ADD8E6", // Light Blue for the rim
  facingHex = "#87CEEB", // Slightly darker blue for the facing
  radius = 2.03,
}) {
  const args = getFresnelShaderArgs({ rimHex, facingHex });
  return (
    <mesh>
      <icosahedronGeometry args={[radius, 32]} />
      <shaderMaterial {...args} />
    </mesh>
  );
}


export default TestAtmosphere;