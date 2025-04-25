import React , {useEffect} from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import galaxyTexturePath from '../../textures/galaxy_texture.jpg'; // Adjust path as needed

function GalaxyBackground() {
    const { gl } = useThree();

    // Load the texture
    const texture = useLoader(THREE.TextureLoader, galaxyTexturePath);

    useEffect(() => {
        // Define maximum anisotropy based on GPU capabilities
        //const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

        //const anisotropyLevel = Math.min(maxAnisotropy, graphicsSettings.anisotropicFiltering);

        const applyTextureSettings = (texture) => {
            if (!texture) return;

            //console.log("anisotropyLevel", anisotropyLevel);

            // Apply anisotropic filtering
            //texture.anisotropy = anisotropyLevel;

            // Set texture wrapping
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);

            // Apply offset for proper alignment

            texture.offset.x = (Math.PI * 5 / 3) / (2 * Math.PI);


            // Ensure mipmaps are generated for better performance
            //texture.generateMipmaps = true;
            //texture.minFilter = THREE.LinearMipMapLinearFilter;
            //texture.magFilter = THREE.LinearFilter;

            // Ensure textures are updated
            texture.needsUpdate = true;
        };

        // Apply settings to texture
        applyTextureSettings(texture);

    }, [texture]);

    return (
        <mesh>
            <sphereGeometry args={[900, 5, 5]} />
            <meshBasicMaterial map={texture} side={THREE.BackSide} />
        </mesh>
    );
}

export default GalaxyBackground;