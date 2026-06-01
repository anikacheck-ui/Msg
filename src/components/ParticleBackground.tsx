import React, { useEffect, useRef } from 'react';
import { PortalThemeId } from '../types';

interface ParticleBackgroundProps {
  themeId: PortalThemeId;
}

export default function ParticleBackground({ themeId }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      decay: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.size = Math.random() * 2.5 + 0.5;
        this.alpha = Math.random() * 0.5 + 0.15;
        this.decay = Math.random() * 0.001 + 0.0003;
        this.color = this.getRandomColor();
      }

      getRandomColor() {
        switch (themeId) {
          case 'cyber-toxic':
            return Math.random() > 0.5 ? '16, 185, 129' : '13, 148, 136'; // Emerald, Teal
          case 'deep-void':
            return Math.random() > 0.5 ? '168, 85, 247' : '99, 102, 241'; // Purple, Indigo
          case 'red-obsidian':
            return Math.random() > 0.5 ? '239, 68, 68' : '244, 63, 94'; // Red, Rose
          case 'vapor-dream':
            return Math.random() > 0.5 ? '236, 72, 153' : '6, 182, 212'; // Pink, Cyan
          default:
            return '168, 85, 247';
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        c.shadowBlur = 5;
        c.shadowColor = `rgba(${this.color}, 0.5)`;
        c.fill();
        c.restore();
      }
    }

    const particles: Particle[] = Array.from({ length: 40 }, () => new Particle());

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Simple lines connecting close particles for neat network grid
      ctx.beginPath();
      switch (themeId) {
        case 'cyber-toxic':
          ctx.strokeStyle = 'rgba(20, 184, 166, 0.05)';
          break;
        case 'deep-void':
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.05)';
          break;
        case 'red-obsidian':
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.05)';
          break;
        case 'vapor-dream':
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.05)';
          break;
      }
      ctx.lineWidth = 0.55;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
          }
        }
      }
      ctx.stroke();

      particles.forEach((p) => {
        p.update();
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [themeId]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0" 
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
