import React, { useEffect, useRef, useState } from 'react';

const DigitalBackground = () => {
  const canvasRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const nodesRef = useRef([]);
  const requestRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createNodes(); // Recreate nodes on resize
    };

    const createNodes = () => {
      const nodes = [];
      // Create a hexagonal grid pattern
      const spacing = 150; // Space between nodes
      const rows = Math.ceil(canvas.height / spacing);
      const cols = Math.ceil(canvas.width / spacing);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * spacing + (row % 2) * spacing / 2;
          const y = row * spacing;
          
          nodes.push({
            baseX: x,
            baseY: y,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            radius: 3,
            color: `rgba(34, 211, 238, ${0.3 + Math.random() * 0.3})`,
            angle: Math.random() * Math.PI * 2,
            speed: 0.02 + Math.random() * 0.02,
            range: 20 + Math.random() * 20
          });
        }
      }
      nodesRef.current = nodes;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodesRef.current.forEach((node, i) => {
        // Gentle floating motion around base position
        node.angle += node.speed;
        node.x = node.baseX + Math.cos(node.angle) * node.range;
        node.y = node.baseY + Math.sin(node.angle) * node.range;

        // Draw node with glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(34, 211, 238, 0.5)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect to nearby nodes
        nodesRef.current.forEach((otherNode, j) => {
          if (i !== j) {
            const dx = otherNode.x - node.x;
            const dy = otherNode.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
              // Calculate opacity based on distance and scroll position
              const scrollFactor = 1 - (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight));
              const opacity = (0.15 * (1 - distance / 150)) * scrollFactor;

              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(otherNode.x, otherNode.y);
              ctx.strokeStyle = `rgba(34, 211, 238, ${opacity})`;
              ctx.lineWidth = 1;
              ctx.stroke();

              // Add small connecting dots
              const midX = (node.x + otherNode.x) / 2;
              const midY = (node.y + otherNode.y) / 2;
              ctx.beginPath();
              ctx.arc(midX, midY, 1, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(34, 211, 238, ${opacity * 2})`;
              ctx.fill();
            }
          }
        });

        // Subtle reaction to mouse
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          node.x += dx * 0.01;
          node.y += dy * 0.01;
        }
      });

      animationFrameId = window.requestAnimationFrame(animate);
    };

    handleResize();
    animate();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [mouse]);

  const handleMouseMove = (e) => {
    // Convert page coordinates to viewport coordinates
    const rect = canvasRef.current.getBoundingClientRect();
    setMouse({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0, // Place it between background and content
        background: 'transparent',
        mixBlendMode: 'screen',
        opacity: 0.7 // Slightly reduced opacity to not interfere with content
      }}
    />
  );
};

export default DigitalBackground;
