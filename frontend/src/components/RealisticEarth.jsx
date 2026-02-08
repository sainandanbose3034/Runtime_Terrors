import React, { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Shooting Star Component
// Shooting Star Component
const ShootingStar = () => {
    const ref = useRef();

    useFrame(() => {
        const mesh = ref.current;
        if (!mesh) return;

        // Initialize user data if not present
        if (!mesh.userData.velocity) {
            mesh.userData = { active: false, velocity: new THREE.Vector3() };
            mesh.visible = false;
        }

        if (!mesh.userData.active) {
            if (Math.random() < 0.005) { // 0.5% chance per frame to spawn
                // Reset/Spawn
                const x = (Math.random() - 0.5) * 40;
                const y = (Math.random()) * 20;
                const z = (Math.random() - 0.5) * 40;

                mesh.position.set(x, y, z);

                // Random velocity vector pointing mostly down/left
                mesh.userData.velocity.set(
                    -0.2 - Math.random() * 0.3,
                    -0.2 - Math.random() * 0.3,
                    (Math.random() - 0.5) * 0.2
                ).normalize().multiplyScalar(0.5 + Math.random() * 0.5);

                mesh.userData.active = true;
                mesh.visible = true;
            }
        } else {
            // Move if active
            mesh.position.add(mesh.userData.velocity);

            // Reset if out of bounds or too low
            if (mesh.position.y < -20 || Math.abs(mesh.position.x) > 30) {
                mesh.userData.active = false;
                mesh.visible = false;
            }
        }
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#ccffff" transparent opacity={0.9} />
        </mesh>
    );
};

// Animated Stars Component
const AnimatedStars = () => {
    const starsRef = useRef();
    useFrame(() => {
        if (starsRef.current) {
            starsRef.current.rotation.y += 0.00015; // Slow rotation for the starfield
            starsRef.current.rotation.x += 0.00005;
        }
    });
    return (
        <group ref={starsRef}>
            <Stars radius={300} depth={60} count={6000} factor={6} saturation={0.5} fade speed={1.5} />
        </group>
    );
};

const Earth = ({ mouse }) => {
    const earthRef = useRef();
    const cloudsRef = useRef();

    const [colorMap, normalMap, specularMap, cloudsMap] = useLoader(TextureLoader, [
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
    ]);

    useEffect(() => {
        return () => {
            // Explicitly dispose of resources if needed, though R3F usually handles this.
            // This is a safeguard against memory leaks in complex scenes.
            if (earthRef.current) {
                earthRef.current.geometry?.dispose();
                earthRef.current.material?.dispose();
            }
            if (cloudsRef.current) {
                cloudsRef.current.geometry?.dispose();
                cloudsRef.current.material?.dispose();
            }
        };
    }, []);

    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime();

        // Target rotation based on mouse position
        // Using window mouse coordinates passed via ref ensures interaction even when overlayed
        const targetX = mouse.current.y * 0.15; // Subtle vertical tilt
        const targetY = (elapsedTime / 25) + (mouse.current.x * 0.3); // Constant rotation + horizontal mouse influence

        if (earthRef.current) {
            // Smoothly interpolate current rotation to target rotation (Lerp) for jitter-free movement
            earthRef.current.rotation.x = THREE.MathUtils.lerp(earthRef.current.rotation.x, targetX, 0.05);
            earthRef.current.rotation.y = THREE.MathUtils.lerp(earthRef.current.rotation.y, targetY, 0.05);
        }
        if (cloudsRef.current) {
            // Clouds rotate slightly independently
            const cloudTargetY = (elapsedTime / 22) + (mouse.current.x * 0.35);
            cloudsRef.current.rotation.x = THREE.MathUtils.lerp(cloudsRef.current.rotation.x, targetX, 0.05);
            cloudsRef.current.rotation.y = THREE.MathUtils.lerp(cloudsRef.current.rotation.y, cloudTargetY, 0.05);
        }
    });

    return (
        <>
            {/* Earth Sphere */}
            <mesh ref={earthRef} position={[0, 0, 0]}>
                <sphereGeometry args={[2.5, 64, 64]} />
                <meshPhongMaterial
                    map={colorMap}
                    normalMap={normalMap}
                    specularMap={specularMap}
                    shininess={15}
                />
            </mesh>

            {/* Clouds Sphere */}
            <mesh ref={cloudsRef} position={[0, 0, 0]}>
                <sphereGeometry args={[2.53, 64, 64]} />
                <meshStandardMaterial
                    map={cloudsMap}
                    transparent={true}
                    opacity={0.3}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Atmosphere Glow */}
            <mesh position={[0, 0, 0]} scale={[2.6, 2.6, 2.6]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial
                    color="#4db2ff"
                    transparent
                    opacity={0.08}
                    side={THREE.BackSide}
                />
            </mesh>
        </>
    );
};

const RealisticEarth = () => {
    // Global mouse tracking ref to avoid re-renders and occlusion issues
    const mouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event) => {
            // Normalize coordinates to -1 to 1
            mouse.current = {
                x: (event.clientX / window.innerWidth) * 2 - 1,
                y: -(event.clientY / window.innerHeight) * 2 + 1
            };
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Disable pointer events on canvas to allow click-through, but we track mouse globally */}
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <pointLight position={[20, 10, 10]} intensity={1.5} />

                <AnimatedStars />

                <ShootingStar />
                <ShootingStar />
                <ShootingStar />

                <Suspense fallback={null}>
                    <Earth mouse={mouse} />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default RealisticEarth;
