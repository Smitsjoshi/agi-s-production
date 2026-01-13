'use client';

import { Canvas } from '@react-three/fiber';
import NeuralOrb from './neural-orb';

export default function NeuralOrbScene() {
    return (
        <div className="absolute inset-0 z-0 opacity-40">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <NeuralOrb />
            </Canvas>
        </div>
    );
}
