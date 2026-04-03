import { useEffect, useRef } from "react";

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ01アイウエオカキクケコ";
const FONT_SIZE = 13;
const COLOR = "#00ff4120"; // very faint green

export default function MatrixRain({ opacity = 0.18 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const cols = Math.floor(canvas.width / FONT_SIZE) + 1;
    const drops = Array(cols).fill(1);

    const draw = () => {
      // Fade trail
      ctx.fillStyle = "rgba(8, 13, 26, 0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00ff41";
      ctx.font = `${FONT_SIZE}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        // Brighter head char
        ctx.fillStyle = drops[i] * FONT_SIZE > canvas.height * 0.6
          ? "rgba(0,255,65,0.9)"
          : "rgba(0,255,65,0.25)";
        ctx.fillText(char, i * FONT_SIZE, drops[i] * FONT_SIZE);

        if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 55);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity,
      }}
    />
  );
}
