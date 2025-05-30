"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface FlickeringGridProps {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  maxOpacity?: number;
  width?: number;
  height?: number;
  className?: string;
}

export default function FlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "#6B7280",
  maxOpacity = 0.3,
  width = 100,
  height = 100,
  className,
}: FlickeringGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();

    const animateGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rows = Math.floor(canvas.height / (squareSize + gridGap));
      const cols = Math.floor(canvas.width / (squareSize + gridGap));

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (Math.random() < flickerChance) {
            ctx.fillStyle = `${color}${Math.floor(
              Math.random() * maxOpacity * 255
            )
              .toString(16)
              .padStart(2, "0")}`;

            ctx.fillRect(
              j * (squareSize + gridGap),
              i * (squareSize + gridGap),
              squareSize,
              squareSize
            );
          }
        }
      }

      requestAnimationFrame(animateGrid);
    };

    animateGrid();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [squareSize, gridGap, flickerChance, color, maxOpacity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none", className)}
      style={{
        width: `${width}%`,
        height: `${height}%`,
      }}
    />
  );
} 