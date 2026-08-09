export function launchConfetti(canvas: HTMLCanvasElement, durationMs: number = 3500) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#6C2BD9', '#C026D3', '#F59E0B', '#1FAE6B', '#3B82F6', '#E5484D'];
  const particles: {
    x: number;
    y: number;
    size: number;
    speedY: number;
    speedX: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
    gravity: number;
  }[] = [];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: canvas.height + 20,
      size: Math.random() * 8 + 5,
      speedY: -(Math.random() * 14 + 8),
      speedX: (Math.random() - 0.5) * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      gravity: 0.28,
    });
  }

  let animationFrame: number;
  const startTime = performance.now();

  function animate(time: number) {
    if (!ctx) return;
    const elapsed = time - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let aliveCount = 0;
    particles.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.speedY += p.gravity;
      p.rotation += p.rotationSpeed;

      if (p.y < canvas.height + 40) {
        aliveCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      }
    });

    if (elapsed < durationMs && aliveCount > 0) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animationFrame = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(animationFrame);
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}
