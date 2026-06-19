import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ViewType } from "../types";
import { 
  Bot, 
  Orbit, 
  Compass, 
  Globe, 
  Zap, 
  Sparkles, 
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Cpu,
  RefreshCw,
  Power
} from "lucide-react";

interface LandingViewProps {
  onViewChange: (view: ViewType) => void;
  isLoggedIn: boolean;
  pilotName: string;
}

/* =========================================================================
     1. FLUIDIC BACKGROUND CANVAS COMPONENT
     Creates custom starry background flow with mouse fluid displacement vectors
   ========================================================================= */
function FluidicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Coordinate high-retina device DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Track mouse position and velocity
    const mouse = {
      x: -1000,
      y: -1000,
      px: -1000,
      py: -1000,
      vx: 0,
      vy: 0,
      active: false
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      if (mouse.px === -1000) {
        mouse.px = currentX;
        mouse.py = currentY;
      } else {
        mouse.px = mouse.x;
        mouse.py = mouse.y;
      }
      mouse.x = currentX;
      mouse.y = currentY;
      mouse.vx = mouse.x - mouse.px;
      mouse.vy = mouse.y - mouse.py;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener("resize", handleResize);

    // Initialize starry space particles
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      baseAlpha: number;
      speedModifier: number;
      color: string;
    }

    const particleCount = 150;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const size = Math.random() * 1.5 + 0.5;
      const alpha = Math.random() * 0.6 + 0.15;
      
      let color = "rgba(255, 255, 255, ";
      const rng = Math.random();
      if (rng > 0.85) {
        color = "rgba(141, 192, 255, "; // Cool space blue star
      } else if (rng > 0.7) {
        color = "rgba(255, 225, 172, "; // Warm light gold star
      }

      particles.push({
        x: rx,
        y: ry,
        // Steady, calming upward-left space voyage vector
        vx: -0.15 - Math.random() * 0.2,
        vy: -0.08 - Math.random() * 0.12,
        size,
        alpha,
        baseAlpha: alpha,
        speedModifier: Math.random() * 0.5 + 0.7,
        color
      });
    }

    // Dynamic Cosmic Nebulae Nodes (swirling ambient gradient nodes)
    interface Nebula {
      x: number;
      y: number;
      radius: number;
      angle: number;
      speed: number;
      orbitRadius: number;
      baseRadius: number;
      color: string;
    }

    const nebulae: Nebula[] = [
      {
        x: width * 0.25,
        y: height * 0.3,
        radius: 350,
        baseRadius: 350,
        angle: 0,
        speed: 0.0006,
        orbitRadius: 80,
        color: "rgba(100, 140, 255, 0.04)" // Ambient deep blue
      },
      {
        x: width * 0.75,
        y: height * 0.65,
        radius: 400,
        baseRadius: 400,
        angle: Math.PI,
        speed: 0.0004,
        orbitRadius: 100,
        color: "rgba(180, 95, 255, 0.03)" // Ambient light stellar ultraviolet
      },
      {
        x: width * 0.5,
        y: height * 0.2,
        radius: 280,
        baseRadius: 280,
        angle: Math.PI / 2,
        speed: -0.0008,
        orbitRadius: 60,
        color: "rgba(255, 255, 255, 0.015)" // Subtle central nebula highlight
      }
    ];

    let ticks = 0;

    // Animation Loop
    const render = () => {
      ticks++;
      
      // Wipe with pure background base black void of ASTRA
      ctx.fillStyle = "#131313";
      ctx.fillRect(0, 0, width, height);

      // Decelerate mouse velocities
      mouse.vx *= 0.95;
      mouse.vy *= 0.95;

      // 1. Render glowing Cosmic Nebulae
      ctx.globalCompositeOperation = "screen";
      nebulae.forEach((neb, idx) => {
        neb.angle += neb.speed;
        
        // Compute drifting orbital nodes
        const currentX = neb.x + Math.cos(neb.angle) * neb.orbitRadius;
        const currentY = neb.y + Math.sin(neb.angle * 1.4) * neb.orbitRadius;
        
        // Gentle diameter pulsing over time
        const currentRadius = neb.baseRadius * (1 + Math.sin(ticks * 0.007 + idx) * 0.07);

        const gradient = ctx.createRadialGradient(
          currentX, currentY, 0,
          currentX, currentY, currentRadius
        );
        gradient.addColorStop(0, neb.color);
        gradient.addColorStop(0.5, neb.color.replace("0.0", "0.012")); // gentle transition
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(currentX, currentY, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";

      // 2. Render and drift moving stardust
      particles.forEach((p) => {
        // Star movement vector
        p.x += p.vx * p.speedModifier;
        p.y += p.vy * p.speedModifier;

        // Subtle flight shimmer
        p.alpha = p.baseAlpha * (1 + Math.sin(ticks * 0.018 + p.x) * 0.18);

        // Screen wraps
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Interactive mouse warp physics
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const maxRadius = 150;

          if (distSq < maxRadius * maxRadius) {
            const dist = Math.sqrt(distSq);
            const force = (maxRadius - dist) / maxRadius;
            
            // Deflect stardust coordinates dynamically
            p.x += (dx / dist) * force * 3.6 + mouse.vx * 0.12;
            p.y += (dy / dist) * force * 3.6 + mouse.vy * 0.12;
          }
        }

        // Draw individual star
        ctx.fillStyle = p.color + `${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Draw mouse interactive radial ripple aura glow
      if (mouse.active) {
        ctx.globalCompositeOperation = "screen";
        const gradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          150
        );
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.03)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.01)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 150, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

/* =========================================================================
     2. INTERACTIVE 3D ORBIT MOTION GRAPHIC COMPONENT
     Projects different space flight modes (3D Globe orbit, Singularity vortex, Hyper flight)
   ========================================================================= */
function Interactive3DOrbit() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<"globe" | "singularity" | "warp">("globe");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.parentElement?.clientWidth || 500;
    let height = canvas.parentElement?.clientHeight || 500;
    let animationFrameId: number;

    // High-DPI resolution scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // View settings
    const radius = Math.min(width, height) * 0.28;
    const center = { x: width / 2, y: height / 2 };
    
    // 3D Angles
    let angleX = 0.25; // Pitch
    let angleY = -0.5; // Yaw
    
    // Mouse interactive drag control
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetAngleX = 0.25;
    let targetAngleY = -0.5;
    let ticks = 0;

    // Interactive mouse state inside Canvas box 
    const mouse = { x: width / 2, y: height / 2, active: false };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      const rect = canvas.getBoundingClientRect();
      prevMouseX = e.clientX - rect.left;
      prevMouseY = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      mouse.x = mx;
      mouse.y = my;
      mouse.active = true;

      if (isDragging) {
        const dx = mx - prevMouseX;
        const dy = my - prevMouseY;
        
        targetAngleY += dx * 0.007;
        targetAngleX += dy * 0.007;

        prevMouseX = mx;
        prevMouseY = my;
      } else {
        // Hover camera tilt
        const offX = (mx - width / 2) / (width / 2);
        const offY = (my - height / 2) / (height / 2);
        targetAngleY = angleY + offX * 0.015;
        targetAngleX = angleX - offY * 0.015;
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      isDragging = false;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      center.x = width / 2;
      center.y = height / 2;
    };
    window.addEventListener("resize", handleResize);

    // ==========================================
    // DATA STRUCTURE INITIALIZERS PER FLIGHT MODE
    // ==========================================

    // 1. Globe mode structures
    interface Satellite {
      radiusOrbit: number;
      speed: number;
      phase: number;
      orbitalTilt: number; 
      size: number;
      color: string;
      glowColor: string;
    }

    const satellites: Satellite[] = [];
    if (viewMode === "globe") {
      satellites.push(
        {
          radiusOrbit: radius * 1.5,
          speed: 0.012,
          phase: 0,
          orbitalTilt: -0.28,
          size: 3.5,
          color: "rgba(255,255,255,0.85)",
          glowColor: "rgba(255,255,255,0.3)"
        },
        {
          radiusOrbit: radius * 1.9,
          speed: -0.008,
          phase: Math.PI / 3,
          orbitalTilt: 0.52,
          size: 3,
          color: "rgba(147, 197, 253, 0.7)", // Light blue orbiter
          glowColor: "rgba(147, 197, 253, 0.2)"
        }
      );
    }

    // 2. Singularity mode swirling stardust
    interface SwirlParticle {
      angle: number;
      radius: number;
      speed: number;
      size: number;
      color: string;
    }
    const swirls: SwirlParticle[] = [];
    if (viewMode === "singularity") {
      const swirlCount = 180;
      for (let i = 0; i < swirlCount; i++) {
        // Concentrated distribution favoring gravity epicentre
        const r = Math.pow(Math.random(), 1.6) * (radius * 1.5 - 20) + 20;
        swirls.push({
          angle: Math.random() * Math.PI * 2,
          radius: r,
          speed: (0.01 + (1 - r / (radius * 1.5)) * 0.02) * (Math.random() * 0.5 + 0.8),
          size: Math.random() * 1.5 + 0.6,
          color: Math.random() > 0.45 ? "rgba(168, 85, 247, " : "rgba(34, 197, 94, " // Galactic Magenta / Cosmic Green
        });
      }
    }

    // 3. Warp mode FTL lines
    interface WarpStar {
      x: number;
      y: number;
      z: number; 
      color: string;
      size: number;
    }
    const warps: WarpStar[] = [];
    if (viewMode === "warp") {
      const warpCount = 120;
      for (let i = 0; i < warpCount; i++) {
        warps.push({
          x: Math.random() * width - width / 2,
          y: Math.random() * height - height / 2,
          z: Math.random() * 1000 + 40,
          size: Math.random() * 1.4 + 0.6,
          color: Math.random() > 0.6 ? "rgba(129, 140, 248, " : "rgba(255, 255, 255, " 
        });
      }
    }

    // 3D localized projection matrix math
    const project = (x: number, y: number, z: number, rX: number, rY: number) => {
      // Rotation Y
      const cosY = Math.cos(rY);
      const sinY = Math.sin(rY);
      let x1 = x * cosY - z * sinY;
      let z1 = x * sinY + z * cosY;

      // Rotation X
      const cosX = Math.cos(rX);
      const sinX = Math.sin(rX);
      let y2 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;

      const depth = 280;
      const scale = depth / (depth + z2);

      return {
        x: center.x + x1 * scale,
        y: center.y + y2 * scale,
        z: z2,
        scale
      };
    };

    // Main Canvas Tick Loop
    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      ticks++;

      // Easing rotations 
      angleX += (targetAngleX - angleX) * 0.1;
      angleY += (targetAngleY - angleY) * 0.1;

      if (!isDragging) {
        targetAngleY += 0.0018; // steady aesthetic orbital rotation
      }

      if (viewMode === "globe") {
        // --- MODE 1: TELEMETRY GLOBE GRAPHIC ---
        const radialGlow = ctx.createRadialGradient(
          center.x, center.y, radius * 0.2,
          center.x, center.y, radius * 1.1
        );
        radialGlow.addColorStop(0, "rgba(255, 255, 255, 0.02)");
        radialGlow.addColorStop(0.5, "rgba(255, 255, 255, 0.006)");
        radialGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = radialGlow;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius * 1.15, 0, Math.PI * 2);
        ctx.fill();

        // Underlay backdrop space particles
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        for (let s = 0; s < 18; s++) {
          const angle = (s / 18) * Math.PI * 2;
          const star = project(
            Math.cos(angle) * radius * 1.55,
            Math.sin(angle * 1.4) * radius * 1.35,
            Math.sin(angle) * radius * 1.55,
            angleX * 0.2,
            angleY * 0.2
          );
          ctx.beginPath();
          ctx.arc(star.x, star.y, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Latitudes
        const latCount = 7;
        for (let j = 1; j < latCount; j++) {
          const latAngle = (j / latCount) * Math.PI - Math.PI / 2;
          const latRadius = radius * Math.cos(latAngle);
          const latY = radius * Math.sin(latAngle);

          ctx.beginPath();
          const segments = 60;
          let p0 = project(latRadius, latY, 0, angleX, angleY);
          ctx.moveTo(p0.x, p0.y);

          for (let s = 1; s <= segments; s++) {
            const sAngle = (s / segments) * Math.PI * 2;
            const sx = latRadius * Math.cos(sAngle);
            const sz = latRadius * Math.sin(sAngle);
            const p = project(sx, latY, sz, angleX, angleY);

            ctx.strokeStyle = p.z > 0 ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.12)";
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
          }
        }

        // Draw Longitudes
        const lonCount = 10;
        for (let j = 0; j < lonCount; j++) {
          const lonAngle = (j / lonCount) * Math.PI;
          
          ctx.beginPath();
          const segments = 60;
          let p0 = project(Math.cos(lonAngle) * radius, -radius, Math.sin(lonAngle) * radius, angleX, angleY);
          ctx.moveTo(p0.x, p0.y);

          for (let s = 1; s <= segments; s++) {
            const sAngle = (s / segments) * Math.PI - Math.PI / 2;
            const sx = radius * Math.cos(sAngle) * Math.cos(lonAngle);
            const sy = radius * Math.sin(sAngle);
            const sz = radius * Math.cos(sAngle) * Math.sin(lonAngle);
            const p = project(sx, sy, sz, angleX, angleY);

            ctx.strokeStyle = p.z > 0 ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.12)";
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
          }
        }

        // Rigid Sphere Ring boundary rim
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Space satellites track tracing
        satellites.forEach((sat) => {
          sat.phase += sat.speed;

          ctx.beginPath();
          const lineCount = 80;
          for (let s = 0; s <= lineCount; s++) {
            const phi = (s / lineCount) * Math.PI * 2;
            const rx = sat.radiusOrbit * Math.cos(phi);
            const rz = sat.radiusOrbit * Math.sin(phi);
            const tiltedY = rz * Math.sin(sat.orbitalTilt);
            const tiltedZ = rz * Math.cos(sat.orbitalTilt);
            const p = project(rx, tiltedY, tiltedZ, angleX, angleY);

            if (s === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
          ctx.setLineDash([4, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          const satX = sat.radiusOrbit * Math.cos(sat.phase);
          const satPercentZ = sat.radiusOrbit * Math.sin(sat.phase);
          const activeY = satPercentZ * Math.sin(sat.orbitalTilt);
          const activeZ = satPercentZ * Math.cos(sat.orbitalTilt);
          const node = project(satX, activeY, activeZ, angleX, angleY);

          ctx.fillStyle = sat.glowColor;
          ctx.beginPath();
          ctx.arc(node.x, node.y, sat.size * 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = sat.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, sat.size, 0, Math.PI * 2);
          ctx.fill();

          // Instant laser pulse beacon to planet core
          if (node.z < 0 && Math.random() > 0.45) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(center.x, center.y);
            ctx.stroke();
          }
        });

      } else if (viewMode === "singularity") {
        // --- MODE 2: SINGULARITY (WORMHOLE SWIRL) ---
        // Gravity core lags/tracks mouse coords
        const gravityX = center.x + angleY * 55;
        const gravityY = center.y + angleX * 55;

        // Plasma accretion aura
        const gradient = ctx.createRadialGradient(
          gravityX, gravityY, 0,
          gravityX, gravityY, radius * 1.5
        );
        gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
        gradient.addColorStop(0.12, "rgba(168, 85, 247, 0.16)"); // Radiant ultraviolet violet
        gradient.addColorStop(0.35, "rgba(59, 130, 246, 0.05)"); // Deep stellar indigo
        gradient.addColorStop(0.7, "rgba(34, 197, 94, 0.015)");  // Outer green space dust
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(gravityX, gravityY, radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Schwarzschild radius / black hole core
        ctx.fillStyle = "rgba(10, 10, 10, 0.98)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(gravityX, gravityY, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#131313";
        ctx.beginPath();
        ctx.arc(gravityX, gravityY, 19, 0, Math.PI * 2);
        ctx.fill();

        // Spin cosmic dust particles
        swirls.forEach((p) => {
          p.angle += p.speed;
          p.radius -= 0.65 + (1 - p.radius / (radius * 1.5)) * 0.8;

          // Respawn at cosmos boundary when swallowed
          if (p.radius < 26) {
            p.radius = radius * 1.45 + Math.random() * 20;
            p.angle = Math.random() * Math.PI * 2;
          }

          const px = gravityX + Math.cos(p.angle) * p.radius;
          const py = gravityY + Math.sin(p.angle) * p.radius;

          const distanceAlpha = Math.min(1.0, (p.radius - 26) / 25) * (1.0 - (p.radius / (radius * 1.5)));
          ctx.fillStyle = p.color + `${distanceAlpha * 0.9})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Magnetic filament flashes
          if (p.radius > 50 && p.radius < 110 && Math.random() > 0.982) {
            ctx.strokeStyle = "rgba(168, 85, 247, 0.16)";
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(gravityX, gravityY);
            ctx.stroke();
          }
        });

      } else if (viewMode === "warp") {
        // --- MODE 3: STAR WARP VELOCITY SPEED LINES ---
        const hyperCenterX = center.x + angleY * 120;
        const hyperCenterY = center.y + angleX * 120;

        warps.forEach((p) => {
          p.z -= 18; // travel speed

          // Cycle star back to space depth limit
          if (p.z <= 12) {
            p.z = 1000;
            p.x = Math.random() * width - width / 2;
            p.y = Math.random() * height - height / 2;
          }

          const scale = 300 / p.z;
          const cx = hyperCenterX + p.x * scale;
          const cy = hyperCenterY + p.y * scale;

          // Forward motion trails
          const prevZ = p.z + 28;
          const prevScale = 300 / prevZ;
          const px = hyperCenterX + p.x * prevScale;
          const py = hyperCenterY + p.y * prevScale;

          if (cx >= 0 && cx <= width && cy >= 0 && cy <= height) {
            const distanceAlpha = Math.min(1.0, (1000 - p.z) / 200);
            ctx.strokeStyle = p.color + `${distanceAlpha * 0.8})`;
            ctx.lineWidth = Math.min(2.8, p.size * scale * 0.45);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(cx, cy);
            ctx.stroke();
          }
        });

        // Dynamic Cockpit Space HUD crosshair
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(hyperCenterX, hyperCenterY, 30, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.beginPath();
        ctx.moveTo(hyperCenterX, hyperCenterY - 6);
        ctx.lineTo(hyperCenterX, hyperCenterY + 6);
        ctx.moveTo(hyperCenterX - 6, hyperCenterY);
        ctx.lineTo(hyperCenterX + 6, hyperCenterY);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [viewMode]);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing flex items-center justify-center">
      
      {/* Simulation Selector Pills */}
      <div className="absolute top-6 left-6 right-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 z-30">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[8px] text-[#c4c7c8]/30 tracking-widest uppercase">Select Vector Algorithm</span>
          <span className="font-mono text-[9px] text-[#22c55e]/90 tracking-wide uppercase inline-flex items-center gap-1">
            <span className="w-1 h-1 bg-[#22c55e] rounded-full animate-ping" />
            Active Mode // {viewMode}
          </span>
        </div>
        <div className="flex gap-1 p-1 bg-white/[0.02] border border-white/[0.06] rounded-full backdrop-blur-md pointer-events-auto w-fit">
          {(["globe", "singularity", "warp"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-full font-mono text-[8px] tracking-widest uppercase cursor-pointer transition-all duration-300 ${
                viewMode === mode 
                  ? "bg-white text-[#131313] font-semibold scale-[1.03]" 
                  : "text-[#c4c7c8]/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Wireframe Canvas */}
      <canvas ref={canvasRef} className="max-w-full max-h-full block z-10" />

      {/* Outer Decorative Tech Interface Overlay */}
      <div className="absolute inset-0 border border-white/[0.03] rounded-3xl pointer-events-none flex flex-col justify-between p-6">
        <div className="flex justify-between items-start mt-20 sm:mt-12">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[8px] text-[#c4c7c8]/30 tracking-widest uppercase">System Axis Tracker</span>
            <span className="font-mono text-[9px] text-[#c4c7c8]/60 tracking-wider">SEC_X_7G // STABLE</span>
          </div>
          <div className="flex gap-1.5 font-mono text-[8px] text-[#c4c7c8]/20 bg-white/[0.01] px-2.5 py-1.5 rounded-md border border-white/[0.03] h-fit">
            <span>DRAG</span>
            <span className="text-white">TO SPIN</span>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <span className="font-mono text-[8px] text-[#c4c7c8]/20">0x00AFA_SECTOR</span>
          <span className="font-mono text-[8px] text-[#c4c7c8]/40 uppercase tracking-widest">Astra Command Simulation</span>
        </div>
      </div>
    </div>
  );
}

export default function LandingView({ onViewChange, isLoggedIn, pilotName }: LandingViewProps) {
  // Navigation categories triggers
  const handleAuthRedirect = () => {
    if (isLoggedIn) {
      onViewChange("dashboard");
    } else {
      onViewChange("login");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#131313] text-[#e5e2e1] overflow-x-hidden select-none font-sans flex flex-col">
      
      {/* Fluidic Space Dust Vector Background */}
      <FluidicBackground />

      {/* Decorative Grid Lines overlay and ambient glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(255,255,255,0.015),_transparent_75%)] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[150px] pointer-events-none" />

      {/* 1. Header Navigation Bar */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full h-20 border-b border-white/[0.08] flex items-center justify-between px-6 md:px-12 relative z-50 bg-[#131313]/50 backdrop-blur-md"
      >
        {/* Left: Logo Badge */}
        <div 
          onClick={() => onViewChange("landing")} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center bg-white/[0.02] transition-colors group-hover:border-white/40">
            <span className="font-display-lg text-lg text-white italic font-light lowercase">a</span>
          </div>
          <span className="font-display-lg text-2xl text-white tracking-tight">ASTRA</span>
        </div>

        {/* Middle: Categories */}
        <nav className="hidden md:flex items-center gap-10">
          {["Missions", "Orbit", "Logistics", "ASTRA AI"].map((item) => (
            <button
              key={item}
              onClick={handleAuthRedirect}
              className="text-[#c4c7c8]/70 hover:text-white text-xs uppercase tracking-[0.2em] transition-colors cursor-pointer relative py-1 group"
            >
              <span className="relative z-10">{item}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        {/* Right: Dynamic CTA State and Profile widgets */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleAuthRedirect}
            className="text-[#c4c7c8]/70 hover:text-white transition-colors p-1.5 cursor-pointer flex items-center justify-center rounded-full hover:bg-white/5"
            title="Operational Alerts"
          >
            <span className="material-symbols-outlined text-lg">notifications</span>
          </button>
          
          <button 
            onClick={handleAuthRedirect}
            className="text-[#c4c7c8]/70 hover:text-white transition-colors p-1.5 cursor-pointer flex items-center justify-center rounded-full hover:bg-white/5"
            title={isLoggedIn ? `Logged in as ${pilotName}` : "Access Credentials"}
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isLoggedIn ? "'FILL' 1" : "'FILL' 0" }}>
              account_circle
            </span>
          </button>

          <button
            onClick={handleAuthRedirect}
            className="px-6 py-2.5 rounded-full border border-white/25 text-white font-mono text-[10px] uppercase tracking-[0.15em] hover:bg-white hover:text-[#131313] hover:border-white transition-all duration-300 cursor-pointer text-center whitespace-nowrap"
          >
            {isLoggedIn ? "Initialize Console" : "Initialize"}
          </button>
        </div>
      </motion.header>

      {/* 2. Cinematic Responsive Grid Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 relative z-10 flex flex-col justify-center">
        
        {/* Responsive Grid with Left Text and Right 3D Orbit Graphic on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Hero side column (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* UPPER CAP EXCURSION BADGE */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center self-start bg-white/[0.04] border border-white/[0.08] rounded-full px-4.5 py-1.5 mb-8 backdrop-blur"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-2.5" />
              <span className="text-[9px] font-mono text-white/80 uppercase tracking-[0.25em] font-normal">
                MAIDEN CREWED VOYAGE TO MARS
              </span>
            </motion.div>

            {/* HEADLINING TYPOGRAPHY */}
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-display-lg text-5xl md:text-7xl lg:text-8xl text-white tracking-tight leading-[0.95] max-w-4xl font-normal"
            >
              Venture Past Our Sky Across the Universe
            </motion.h2>

            {/* PARAGRAPH BLURB */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-[#c4c7c8]/85 font-sans font-light text-sm md:text-base max-w-xl mt-8 leading-relaxed"
            >
              Prepare for the definitive leap in human exploration. ASTRA delivers uncompromising engineering for the next era of interplanetary transit.
            </motion.p>

            {/* METRICS ROW CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 max-w-xl">
              {/* CARD 1: Time to Orbit */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="group relative p-7 rounded-3xl bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.06] hover:border-white/20 transition-all duration-300 overflow-hidden backdrop-blur-sm cursor-default"
              >
                <div className="absolute inset-0 rounded-3xl pointer-events-none opacity-40 group-hover:opacity-85" />
                <span className="block text-[9px] text-[#c4c7c8]/50 font-mono uppercase tracking-[0.2em] mb-3">
                  TIME TO ORBIT
                </span>
                <span className="font-display-lg text-3xl md:text-4xl text-white italic font-normal tracking-wide">
                  34.5 Min
                </span>
              </motion.div>

              {/* CARD 2: Distance Covered */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="group relative p-7 rounded-3xl bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.06] hover:border-white/20 transition-all duration-300 overflow-hidden backdrop-blur-sm cursor-default"
              >
                <div className="absolute inset-0 rounded-3xl pointer-events-none opacity-40 group-hover:opacity-85" />
                <span className="block text-[9px] text-[#c4c7c8]/50 font-mono uppercase tracking-[0.2em] mb-3">
                  DISTANCE COVERED
                </span>
                <span className="font-display-lg text-3xl md:text-4xl text-white italic font-normal tracking-wide">
                  2.8B+
                </span>
              </motion.div>
            </div>

          </div>

          {/* Right Hero side interactive 3D Orbital Canvas (5 cols on lg) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
            className="lg:col-span-5 relative w-full h-[380px] sm:h-[480px] rounded-3xl border border-white/[0.06] bg-[#121212]/30 backdrop-blur"
          >
            {/* Real 3D Vector globe projection inside */}
            <Interactive3DOrbit />
          </motion.div>

        </div>

        {/* 3. Partners/Entities ribbon border */}
        <div className="w-full border-t border-white/[0.06] mt-24 pt-10 pb-4">
          <div className="flex flex-wrap justify-between items-center gap-8 text-[#c4c7c8]/40 text-xs tracking-[0.25em] font-display-lg italic">
            {["AEON", "VELA", "APEX", "ORBIT", "ZENO"].map((p, idx) => (
              <motion.span 
                key={p}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + (idx * 0.1) }}
                className="text-base md:text-xl font-light hover:text-white transition-colors cursor-default"
              >
                {p}
              </motion.span>
            ))}
          </div>
        </div>

        {/* 4. Production Evolved Segment */}
        <section className="w-full py-20 mt-12 flex flex-col items-center">
          <motion.h3 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display-lg text-4xl md:text-6xl text-white text-center mb-16 font-light tracking-tight"
          >
            Production evolved
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {/* Active System Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between h-80 group relative overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute inset-0 rounded-3xl pointer-events-none opacity-40 group-hover:opacity-85" />
              <div>
                <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mb-6 text-white">
                  <span className="material-symbols-outlined text-lg">landscape</span>
                </div>
                <h4 className="font-display-lg text-2xl text-white mb-3">AI Scenery</h4>
                <p className="text-[#c4c7c8]/80 text-sm leading-relaxed font-light">
                  Generative environments mapped to real-time telemetry.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-white/[0.06] mt-4">
                <span className="text-[9px] font-mono px-2.5 py-1 rounded bg-white/[0.04] text-[#c4c7c8]/50 tracking-widest uppercase">SYSTEM</span>
                <span className="text-[9px] font-mono px-2.5 py-1 rounded bg-white/[0.08] text-white tracking-widest uppercase inline-flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                  ACTIVE
                </span>
              </div>
            </motion.div>

            {/* Active System Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between h-80 group relative overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute inset-0 rounded-3xl pointer-events-none opacity-40 group-hover:opacity-85" />
              <div>
                <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mb-6 text-white">
                  <span className="material-symbols-outlined text-lg">precision_manufacturing</span>
                </div>
                <h4 className="font-display-lg text-2xl text-white mb-3">Batch Production</h4>
                <p className="text-[#c4c7c8]/80 text-sm leading-relaxed font-light">
                  Automated manufacturing protocols for orbital habitats.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-white/[0.06] mt-4">
                <span className="text-[9px] font-mono px-2.5 py-1 rounded bg-white/[0.04] text-[#c4c7c8]/50 tracking-widest uppercase">SYSTEM</span>
                <span className="text-[9px] font-mono px-2.5 py-1 rounded bg-white/[0.08] text-white tracking-widest uppercase inline-flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                  ACTIVE
                </span>
              </div>
            </motion.div>

            {/* Active System Card 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between h-80 group relative overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute inset-0 rounded-3xl pointer-events-none opacity-40 group-hover:opacity-85" />
              <div>
                <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mb-6 text-white">
                  <span className="material-symbols-outlined text-lg">lightbulb</span>
                </div>
                <h4 className="font-display-lg text-2xl text-white mb-3">Smart Lighting</h4>
                <p className="text-[#c4c7c8]/80 text-sm leading-relaxed font-light">
                  Circadian-sync illumination for extended zero-g missions.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-white/[0.06] mt-4">
                <span className="text-[9px] font-mono px-2.5 py-1 rounded bg-white/[0.04] text-[#c4c7c8]/50 tracking-widest uppercase">SYSTEM</span>
                <span className="text-[9px] font-mono px-2.5 py-1 rounded bg-white/[0.08] text-white tracking-widest uppercase inline-flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                  ACTIVE
                </span>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      {/* Footer minimal info */}
      <footer className="w-full border-t border-white/[0.06] py-10 text-center relative z-10 bg-[#131313]/90 backdrop-blur">
        <p className="text-[#c4c7c8]/40 text-xs tracking-widest uppercase">
          ASTRA Command &copy; {new Date().getFullYear()} • Dynamic Flight Console Simulation
        </p>
      </footer>

    </div>
  );
}
