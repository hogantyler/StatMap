import { useLoader, useThree } from "@react-three/fiber";
import { } from "@react-three/drei";
import React, { useMemo, useEffect } from "react";
import * as THREE from "three";
import EarthMap from "../../textures/8k_earth.png"
import EarthNormalMap from "../../textures/earth_normalmap_5400x2700.jpg"
import EarthSpecMap from "../../textures/8k_earth_specular_map.jpg"
import EarthCloudMap from "../../textures/cloud_texture.jpg"
//import EarthDisplacementMap from "../../textures/gebco_bathy_2700x1350.jpg"
import EarthNightMap from "../../textures/8k_earthNightMap.jpg"
import { TextureLoader } from "three";
import { useGraphicsSettings } from "../GraphicsContext";

// --- MODIFIED SHADER FUNCTION with normalScale ---
function createEarthMaterial(maps, sunDirection = new THREE.Vector3(-30, 0, 5).normalize()) {
    const { colorMap, normalMap, specularMap, nightMap } = maps;

    const uniforms = {
        dayTexture: { value: colorMap },
        nightTexture: { value: nightMap },
        normalMap: { value: normalMap },
        specularMap: { value: specularMap },
        sunDirection: { value: sunDirection },
        shininess: { value: 70.0 },
        // --- ADD NORMAL SCALE UNIFORM ---
        normalScale: { value: 0.7 } // <-- ADJUST THIS VALUE (0.0 to 1.0) to control intensity
    };

    // --- VERTEX SHADER (Unchanged from previous working version) ---
    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vNormalWorld;
        varying vec3 vPosition;
        varying vec3 vTangentWorld;
        varying vec3 vBitangentWorld;

        attribute vec4 tangent;

        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * viewMatrix * worldPosition;

            vNormalWorld = normalize(mat3(modelMatrix) * normal);
            vTangentWorld = normalize(mat3(modelMatrix) * tangent.xyz);
            vBitangentWorld = normalize(cross(vNormalWorld, vTangentWorld) * tangent.w);

            vUv = uv;
            vPosition = worldPosition.xyz;
        }
    `;

    // --- FRAGMENT SHADER (MODIFIED for normalScale) ---
    const fragmentShader = `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D normalMap;
        uniform sampler2D specularMap;
        uniform vec3 sunDirection;
        uniform float shininess;
        uniform float normalScale; // <-- Receive the uniform

        varying vec2 vUv;
        varying vec3 vNormalWorld;
        varying vec3 vPosition;
        varying vec3 vTangentWorld;
        varying vec3 vBitangentWorld;

        void main() {
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            vec2 rotatedUv = vec2(vUv.x + 0.25, vUv.y);
            if (rotatedUv.x < 0.0) rotatedUv.x += 1.0;

            // --- Normal Mapping ---
            // Sample and unpack the tangent-space normal from the map
            vec3 tangentNormalFromMap = texture2D(normalMap, rotatedUv).xyz * 2.0 - 1.0;

            // --- SCALE THE NORMAL MAP EFFECT ---
            // Blend towards the flat normal (0,0,1) based on normalScale
            // Use normalize() to ensure the resulting normal is still unit length
            vec3 scaledTangentNormal = normalize(mix(vec3(0.0, 0.0, 1.0), tangentNormalFromMap, normalScale));
            // --- END SCALE ---

            // Create the TBN matrix
            mat3 TBN = mat3(vTangentWorld, vBitangentWorld, vNormalWorld);

            // Transform the *scaled* tangent-space normal to world space
            vec3 finalNormal = normalize(TBN * scaledTangentNormal); // <-- Use scaledTangentNormal
            // --- End Normal Mapping ---


            // --- Lighting Calculation using finalNormal ---
            float sunOrientation = dot(sunDirection, finalNormal);

            // Day / night color mix (Using a potentially wider smoothstep range)
            float dayMix = smoothstep(-0.1, 0.5, sunOrientation); // <-- ADJUST RANGE if needed
            vec3 dayColor = texture2D(dayTexture, rotatedUv).rgb;
            vec3 nightColor = texture2D(nightTexture, rotatedUv).rgb;
            vec3 baseColor = mix(nightColor, dayColor, dayMix);

            // --- Specular Highlights using finalNormal ---
            vec3 specularColor = vec3(0.0);
            if (dayMix > 0.0) {
                vec3 reflection = reflect(-sunDirection, finalNormal);
                float specularStrength = texture2D(specularMap, rotatedUv).r;
                float specAngle = max(dot(reflection, viewDirection), 0.0);
                float specularFactor = pow(specAngle, shininess);
                specularColor = vec3(1.0) * specularStrength * specularFactor * dayMix;
            }
            // --- End Specular Highlights ---

            vec3 finalColor = baseColor + specularColor;
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    return new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });
}

/**
 * Renders a mesh with interactive globe with experimetnal features under testing and development.
 * 
 * @returns part of the 3D earth that has to do with texture wrapping and anisotropic filtering and defines three.js/react-three-fiber material
 */
function EarthTest(props) {
    const { graphicsSettings } = useGraphicsSettings();
    const spherePolygonCount = graphicsSettings.polygonCount;

    // Texture loading
    // const earthRef = useRef();
    const [colorMap, normalMap, specularMap, nightMap, cloudMap] = useLoader(
        TextureLoader,
        [EarthMap, EarthNormalMap, EarthSpecMap, EarthNightMap, EarthCloudMap]
    );
    const { gl } = useThree();
    // Apply anisotropic filtering to all textures
    useEffect(() => {
        // Define maximum anisotropy based on GPU capabilities
        const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

        const applyTextureSettings = (texture) => {
            if (!texture) return;

            // Apply anisotropic filtering
            texture.anisotropy = maxAnisotropy;

            // Set texture wrapping
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);

            // Apply offset for proper alignment
            if (!props.NoOffSet) {
                texture.offset.x = (Math.PI / 2) / (2 * Math.PI);
            }

            // Ensure mipmaps are generated for better performance
            texture.generateMipmaps = true;
            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;

            // Ensure textures are updated
            texture.needsUpdate = true;
        };

        // Apply settings to all textures
        [colorMap, normalMap, specularMap, nightMap, cloudMap].forEach(applyTextureSettings);

    }, [gl.capabilities, colorMap, normalMap, specularMap, nightMap, cloudMap]);

    // Create sphere geometry WITH TANGENTS using the built-in method
    const sphereGeometry = useMemo(() => {
        // Increased segments slightly for better tangent results
        const geom = new THREE.SphereGeometry(1, spherePolygonCount, spherePolygonCount);
        try {
            geom.computeTangents(); // Use built-in method
            //console.log("Tangents computed successfully using geom.computeTangents().");
        } catch (error) {
            console.error("Error computing tangents:", error);
            return new THREE.SphereGeometry(1, spherePolygonCount, spherePolygonCount); // Fallback to original segments
        }
        return geom;
    }, [spherePolygonCount]);

    // Create earth material with the MODIFIED shader function
    const earthMaterial = useMemo(() => {
        // Ensure all required maps for the *new* shader are loaded
        if (colorMap && normalMap && specularMap && nightMap) {
            return createEarthMaterial({
                colorMap,
                normalMap,
                specularMap,
                // cloudMap, // cloudMap not needed by the new shader function
                nightMap
            });
        }
        return null; // Return null if textures aren't ready
        // Update dependencies to match the new shader's needs
    }, [colorMap, normalMap, specularMap, nightMap]);

    console.log("earth render");

    return (
        <group>
            <mesh ref={props.cloudsRef}>
                <sphereGeometry args={[1.01, spherePolygonCount, spherePolygonCount]} />
                <meshPhongMaterial
                    map={cloudMap}
                    opacity={0.8}
                    depthWrite={false}
                    transparent={true}
                    side={THREE.FrontSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {earthMaterial && sphereGeometry && (
                <mesh
                    ref={props.globeRef}
                    geometry={sphereGeometry} // Use the geometry with tangents
                    material={earthMaterial} // Use the custom shader material
                    onPointerOver={(e) => e.stopPropagation()}
                    onPointerOut={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                />
            )}
        </group>
    );
}

export default EarthTest;