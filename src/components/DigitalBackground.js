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

    // Set canvas size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Create initial nodes
    const createNodes = () => {
      const nodes = [];
      for (let i = 0; i < 50; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          color: `rgba(34, 211, 238, ${Math.random() * 0.5 + 0.25})`
        });
      }
      nodesRef.current = nodes;
    };
    createNodes();

    // Animation
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      nodesRef.current.forEach((node, i) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off walls
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Connect nodes
        nodesRef.current.forEach((otherNode, j) => {
          if (i !== j) {
            const dx = otherNode.x - node.x;
            const dy = otherNode.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(otherNode.x, otherNode.y);
              ctx.strokeStyle = `rgba(34, 211, 238, ${0.1 * (1 - distance / 150)})`;
              ctx.stroke();
            }
          }
        });

        // React to mouse
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

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [mouse]);

  const handleMouseMove = (e) => {
    setMouse({ x: e.clientX, y: e.clientY });
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      className="fixed top-0 left-0 w-full h-full -z-10 bg-black"
    />
  );
};

export default DigitalBackground;
