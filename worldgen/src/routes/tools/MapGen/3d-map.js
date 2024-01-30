import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

function SpinningSphere() {
    const meshRef = useRef();
    const [hovered, setHover] = useState(false);
    const [clicked, setClick] = useState(false);

    // Load the texture
    const texture = useLoader(TextureLoader, 'temp/main-map.png');

    useFrame(() => (meshRef.current.rotation.y += 0.01));

    return (
        <mesh
            ref={meshRef}
            scale={3}
            onClick={() => setClick(!clicked)}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial map={texture} />
        </mesh>
    );
}

const ThreeJSMap = () => {
    return (
        <div className="threejs-canvas">
            <Canvas>
                <pointLight position={[10, 10, 10]} />
                <SpinningSphere />
            </Canvas>
        </div>
    );
}

export default ThreeJSMap;


