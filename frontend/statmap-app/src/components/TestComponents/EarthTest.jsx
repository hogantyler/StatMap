import { useLoader, useThree } from "@react-three/fiber";
import { } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";
import EarthMap from "../../textures/8k_earth.png"
import EarthNormalMap from "../../textures/earth_normalmap_5400x2700.jpg"
import EarthSpecMap from "../../textures/8k_earth_specular_map.jpg"
import EarthCloudMap from "../../textures/cloud_texture.jpg"
import EarthDisplacementMap from "../../textures/gebco_bathy_2700x1350.jpg"
import EarthNightMap from "../../textures/earth-nightmap-4k.jpg"
import { TextureLoader } from "three";

/**
 * Renders a mesh with interactive globe with experimetnal features under testing and development.
 * 
 * @returns part of the 3D earth that has to do with texture wrapping and anisotropic filtering and defines three.js/react-three-fiber material
 */
function EarthTest(props) {
    // Texture loading
    // const earthRef = useRef();
    const [colorMap, normalMap, specularMap, cloudMap, displacementMap] = useLoader(
        TextureLoader,
        [EarthMap, EarthNormalMap, EarthSpecMap, EarthCloudMap, EarthDisplacementMap]
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
        [colorMap, normalMap, specularMap, cloudMap, displacementMap].forEach(applyTextureSettings);

    }, [gl.capabilities, colorMap, normalMap, specularMap, cloudMap, displacementMap]);

    console.log("earth render");

    return (
        <group>
            <mesh ref={props.cloudsRef}>
                <sphereGeometry args={[1.01, 40, 40]} />
                <meshPhongMaterial
                    map={cloudMap}
                    opacity={0.7}
                    depthWrite={false}
                    transparent={true}
                    side={THREE.FrontSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <mesh ref={props.ref} onPointerOver={(e) => e.stopPropagation()} onPointerOut={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                <sphereGeometry args={[1, 40, 40]} />
                {/*<meshPhongMaterial specularMap={specularMap} />*/}
                <meshStandardMaterial map={colorMap} normalMap={normalMap} metalness={0.7} roughness={0.7} specularIntensityMap={specularMap}/>
            </mesh>
        </group>
    );
}

export default EarthTest;