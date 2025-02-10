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
      createNodes();
    };

    const createNodes = () => {
      const nodes = [];
      const nodeCount = Math.floor((canvas.width * canvas.height) / 15000); // Responsive node count
      
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          radius: Math.random() * 2 + 1.5,
          baseColor: `rgba(34, 211, 238, ${Math.random() * 0.5 + 0.3})`,
          pulseSpeed: 0.02 + Math.random() * 0.02,
          pulseOffset: Math.random() * Math.PI * 2
        });
      }
      nodesRef.current = nodes;
    };

    const animate = () => {
      // Clear the entire canvas each frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodesRef.current.forEach((node, i) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Keep within bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));

        // Pulsing effect
        const pulse = Math.sin(Date.now() * node.pulseSpeed + node.pulseOffset) * 0.5 + 0.5;
        const color = node.baseColor.replace(')', `, ${pulse})`);

        // Draw node with glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(34, 211, 238, 0.5)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nodes
        nodesRef.current.forEach((otherNode, j) => {
          if (i !== j) {
            const dx = otherNode.x - node.x;
            const dy = otherNode.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
              // Line gradient
              const gradient = ctx.createLinearGradient(
                node.x, node.y, otherNode.x, otherNode.y
              );
              const opacity = 0.2 * (1 - distance / 150);
              gradient.addColorStop(0, `rgba(34, 211, 238, ${opacity})`);
              gradient.addColorStop(1, `rgba(34, 211, 238, ${opacity})`);

              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(otherNode.x, otherNode.y);
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 1;
              ctx.stroke();

              // Data particle effect
              if (Math.random() < 0.01) {
                ctx.beginPath();
                ctx.arc(
                  node.x + dx * Math.random(),
                  node.y + dy * Math.random(),
                  1,
                  0,
                  Math.PI * 2
                );
                ctx.fillStyle = `rgba(34, 211, 238, ${opacity * 2})`;
                ctx.fill();
              }
            }
          }
        });

        // Mouse interaction
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 120) {
          node.vx += dx * 0.002;
          node.vy += dy * 0.002;
          
          // Limit velocity
          const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
          if (speed > 2) {
            node.vx = (node.vx / speed) * 2;
            node.vy = (node.vy / speed) * 2;
          }
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
        zIndex: 0,
        mixBlendMode: 'screen',
        opacity: 0.8
      }}
    />
  );
};

export default DigitalBackground;
