'use client';

import { useEffect, useRef } from 'react';

export default function PrismBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = (canvas.width = window.innerWidth);
        let h = (canvas.height = window.innerHeight);

        // Orbs configuration
        const orbs = [
            { x: w * 0.2, y: h * 0.3, r: 300, color: 'rgba(0, 255, 255, 0.15)', vx: 0.5, vy: 0.3 },
            { x: w * 0.8, y: h * 0.2, r: 400, color: 'rgba(138, 43, 226, 0.15)', vx: -0.4, vy: 0.4 },
            { x: w * 0.5, y: h * 0.8, r: 350, color: 'rgba(0, 100, 255, 0.15)', vx: 0.3, vy: -0.5 },
            { x: w * 0.1, y: h * 0.9, r: 250, color: 'rgba(50, 205, 50, 0.1)', vx: 0.6, vy: -0.2 },
        ];

        const animate = () => {
            ctx.clearRect(0, 0, w, h);

            // Black background
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);

            // Draw orbs
            orbs.forEach((orb) => {
                orb.x += orb.vx;
                orb.y += orb.vy;

                // Bounce
                if (orb.x < -orb.r || orb.x > w + orb.r) orb.vx *= -1;
                if (orb.y < -orb.r || orb.y > h + orb.r) orb.vy *= -1;

                const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
                gradient.addColorStop(0, orb.color);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
                ctx.fill();
            });

            // overlay grid
            // ctx.strokeStyle = 'rgba(255,255,255,0.03)';
            // ctx.lineWidth = 1;
            // ... grid logic if needed ...

            requestAnimationFrame(animate);
        };

        const handleResize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        animate();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none filter blur-[60px]" // High blur creates the prism/aurora effect
        />
    );
}
