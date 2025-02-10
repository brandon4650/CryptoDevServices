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

    // Helper function to create points for a letter
    const createLetterPoints = (letter, startX, startY, scale = 1) => {
      const points = [];
      const letterShapes = {
        'C': [
          [0, 0], [0.5, 0], [1, 0],
          [0, 0.5],
          [0, 1], [0.5, 1], [1, 1]
        ],
        'D': [
          [0, 0], [0.5, 0], [0.8, 0.2],
          [0, 0.5], [1, 0.5],
          [0, 1], [0.5, 1], [0.8, 0.8]
        ],
        '$': [
          [0.5, 0], // Top
          [0, 0.3], [1, 0.3], // Upper curve
          [0.5, 0.5], // Middle
          [0, 0.7], [1, 0.7], // Lower curve
          [0.5, 1], // Bottom
          [0.5, 0.2], [0.5, 0.8] // Vertical line
        ]
      };

      const shape = letterShapes[letter] || [];
      return shape.map(([x, y]) => ({
        baseX: startX + x * 50 * scale,
        baseY: startY + y * 80 * scale,
        range: 10,
        speed: 0.02 + Math.random() * 0.02,
        angle: Math.random() * Math.PI * 2
      }));
    };

    const createNodes = () => {
      const nodes = [];
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Create dollar sign points
      const dollarPoints = createLetterPoints('$', centerX - 200, centerY - 40, 1.2);
      
      // Create "CCD" points
      const c1Points = createLetterPoints('C', centerX + 50, centerY - 40, 1);
      const c2Points = createLetterPoints('C', centerX + 150, centerY - 40, 1);
      const dPoints = createLetterPoints('D', centerX + 250, centerY - 40, 1);

      // Combine all shape points
      const shapePoints = [...dollarPoints, ...c1Points, ...c2Points, ...dPoints];

      // Create nodes for shapes
      shapePoints.forEach(point => {
        nodes.push({
          ...point,
          x: point.baseX,
          y: point.baseY,
          radius: 3,
          color: `rgba(34, 211, 238, ${0.5 + Math.random() * 0.3})`
        });
      });

      // Add some random nodes
      for (let i = 0; i < 50; i++) {
        nodes.push({
          baseX: Math.random() * canvas.width,
          baseY: Math.random() * canvas.height,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 2 + Math.random() * 2,
          color: `rgba(34, 211, 238, ${0.3 + Math.random() * 0.3})`,
          range: 20 + Math.random() * 20,
          speed: 0.02 + Math.random() * 0.02,
          angle: Math.random() * Math.PI * 2
        });
      }

      nodesRef.current = nodes;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodesRef.current.forEach((node, i) => {
        // Update position with floating motion
        node.angle += node.speed;
        node.x = node.baseX + Math.cos(node.angle) * node.range;
        node.y = node.baseY + Math.sin(node.angle) * node.range;

        // Draw node
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(34, 211, 238, 0.5)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nearby nodes
        nodesRef.current.forEach((otherNode, j) => {
          if (i !== j) {
            const dx = otherNode.x - node.x;
            const dy = otherNode.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 80) {
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(otherNode.x, otherNode.y);
              ctx.strokeStyle = `rgba(34, 211, 238, ${0.2 * (1 - distance / 80)})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });

        // Mouse interaction
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
        background: 'transparent',
        mixBlendMode: 'screen',
        opacity: 0.8
      }}
    />
  );
};

export default DigitalBackground;
