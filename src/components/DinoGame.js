import React, { useState, useEffect, useRef } from 'react';

const DinoGame = () => {
  const canvasRef = useRef(null);
  const [isJumping, setIsJumping] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [runFrame, setRunFrame] = useState(0);
  const animationSpeed = useRef(0.15);
  
  // Game states
  const gameState = useRef({
    dino: {
      x: 50,
      y: 200,
      width: 30,
      height: 50,
      velocity: 0,
      jumpForce: -15,
      gravity: 0.8
    },
    cactuses: [],
    baseSpeed: 5,
    gameSpeed: 5,
    speedMultiplier: 1,
    groundY: 250,
    nextCactusIn: 50,
    lastPattern: null
  });

  // Enhanced cactus patterns
  const cactusPatterns = [
    // Single cactus
    () => [{
      x: 800,
      y: gameState.current.groundY - 40,
      width: 20,
      height: 40
    }],
    // Double cactus
    () => [{
      x: 800,
      y: gameState.current.groundY - 40,
      width: 20,
      height: 40
    }, {
      x: 840,
      y: gameState.current.groundY - 30,
      width: 15,
      height: 30
    }],
    // Triple cactus
    () => [{
      x: 800,
      y: gameState.current.groundY - 35,
      width: 15,
      height: 35
    }, {
      x: 860,
      y: gameState.current.groundY - 45,
      width: 20,
      height: 45
    }, {
      x: 920,
      y: gameState.current.groundY - 30,
      width: 15,
      height: 30
    }],
    // Wide gap pattern
    () => [{
      x: 800,
      y: gameState.current.groundY - 50,
      width: 20,
      height: 50
    }, {
      x: 900,
      y: gameState.current.groundY - 30,
      width: 20,
      height: 30
    }],
    // Cluster pattern
    () => [{
      x: 800,
      y: gameState.current.groundY - 45,
      width: 15,
      height: 45
    }, {
      x: 830,
      y: gameState.current.groundY - 35,
      width: 15,
      height: 35
    }, {
      x: 860,
      y: gameState.current.groundY - 40,
      width: 15,
      height: 40
    }],
    // Alternating heights
    () => [{
      x: 800,
      y: gameState.current.groundY - 30,
      width: 15,
      height: 30
    }, {
      x: 850,
      y: gameState.current.groundY - 45,
      width: 15,
      height: 45
    }, {
      x: 900,
      y: gameState.current.groundY - 35,
      width: 15,
      height: 35
    }],
    // Long jump pattern
    () => [{
      x: 800,
      y: gameState.current.groundY - 30,
      width: 20,
      height: 30
    }, {
      x: 840,
      y: gameState.current.groundY - 35,
      width: 20,
      height: 35
    }, {
      x: 880,
      y: gameState.current.groundY - 30,
      width: 20,
      height: 30
    }]
  ];

  // Running animation frames
  const runningFrames = [
    // Frame 1 - mid stride
    (ctx, x, y) => {
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      // Head
      ctx.beginPath();
      ctx.arc(x + 15, y + 10, 8, 0, Math.PI * 2);
      ctx.stroke();
      // Body with forward lean
      ctx.beginPath();
      ctx.moveTo(x + 15, y + 18);
      ctx.lineTo(x + 17, y + 35);
      // Arms with running motion
      ctx.moveTo(x + 15, y + 25);
      ctx.lineTo(x + 25, y + 20);
      ctx.moveTo(x + 15, y + 25);
      ctx.lineTo(x + 5, y + 30);
      // Legs with running motion
      ctx.moveTo(x + 17, y + 35);
      ctx.lineTo(x + 25, y + 45);
      ctx.moveTo(x + 17, y + 35);
      ctx.lineTo(x + 5, y + 42);
      ctx.stroke();
    },
    // Frame 2 - full stride
    (ctx, x, y) => {
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      // Head
      ctx.beginPath();
      ctx.arc(x + 15, y + 10, 8, 0, Math.PI * 2);
      ctx.stroke();
      // Body with forward lean
      ctx.beginPath();
      ctx.moveTo(x + 15, y + 18);
      ctx.lineTo(x + 17, y + 35);
      // Arms with alternate running motion
      ctx.moveTo(x + 15, y + 25);
      ctx.lineTo(x + 5, y + 20);
      ctx.moveTo(x + 15, y + 25);
      ctx.lineTo(x + 25, y + 30);
      // Legs with alternate running motion
      ctx.moveTo(x + 17, y + 35);
      ctx.lineTo(x + 5, y + 45);
      ctx.moveTo(x + 17, y + 35);
      ctx.lineTo(x + 25, y + 42);
      ctx.stroke();
    }
  ];

  const drawStickFigure = (ctx, x, y) => {
    if (isJumping) {
      // Jump animation
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      // Head
      ctx.beginPath();
      ctx.arc(x + 15, y + 10, 8, 0, Math.PI * 2);
      ctx.stroke();
      // Body leaning forward
      ctx.beginPath();
      ctx.moveTo(x + 15, y + 18);
      ctx.lineTo(x + 18, y + 35);
      // Arms up and back
      ctx.moveTo(x + 15, y + 25);
      ctx.lineTo(x + 5, y + 15);
      ctx.moveTo(x + 15, y + 25);
      ctx.lineTo(x + 25, y + 15);
      // Legs tucked
      ctx.moveTo(x + 18, y + 35);
      ctx.lineTo(x + 12, y + 45);
      ctx.lineTo(x + 8, y + 42);
      ctx.moveTo(x + 18, y + 35);
      ctx.lineTo(x + 22, y + 45);
      ctx.lineTo(x + 26, y + 42);
      ctx.stroke();
    } else {
      // Running animation
      const frameIndex = Math.floor(runFrame) % 2;
      runningFrames[frameIndex](ctx, x, y);
    }
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let frameCount = 0;

    const handleKeyDown = (e) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && !isJumping) {
        jump();
      }
      if (gameOver && e.code === 'Space') {
        handleClick();
      }
    };

    const jump = () => {
      if (!isJumping && !gameOver) {
        setIsJumping(true);
        gameState.current.dino.velocity = gameState.current.dino.jumpForce;
      }
    };

    const drawCactus = (cactus) => {
      ctx.fillStyle = '#22d3ee';
      // Enhanced cactus design
      ctx.beginPath();
      // Main stem with curve
      ctx.moveTo(cactus.x + cactus.width/3, cactus.y + cactus.height);
      ctx.quadraticCurveTo(
        cactus.x + cactus.width/2,
        cactus.y + cactus.height/2,
        cactus.x + cactus.width/3,
        cactus.y
      );
      ctx.lineTo(cactus.x + cactus.width*2/3, cactus.y);
      ctx.quadraticCurveTo(
        cactus.x + cactus.width/2,
        cactus.y + cactus.height/2,
        cactus.x + cactus.width*2/3,
        cactus.y + cactus.height
      );
      ctx.fill();
      
      // Side branches
      ctx.beginPath();
      ctx.ellipse(
        cactus.x + cactus.width/4,
        cactus.y + cactus.height/3,
        cactus.width/2,
        cactus.height/6,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    };

    const drawParallaxBackground = () => {
      ctx.fillStyle = '#1e3a8a20';
      for (let i = 0; i < 20; i++) {
        const x = ((Date.now() * (0.2 + i * 0.1)) % canvas.width) - 50;
        const y = 50 + i * 10;
        const size = 1 + i * 0.2;
        ctx.fillRect(x, y, size, size);
      }
    };

    const spawnCactusPattern = () => {
      let patternIndex;
      do {
        patternIndex = Math.floor(Math.random() * cactusPatterns.length);
      } while (patternIndex === gameState.current.lastPattern);
      
      gameState.current.lastPattern = patternIndex;
      const newCactuses = cactusPatterns[patternIndex]();
      gameState.current.cactuses.push(...newCactuses);
    };

    const updateGame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      drawParallaxBackground();

      // Update dino
      if (isJumping) {
        gameState.current.dino.velocity += gameState.current.dino.gravity;
        gameState.current.dino.y += gameState.current.dino.velocity;

        if (gameState.current.dino.y > gameState.current.groundY - gameState.current.dino.height) {
          gameState.current.dino.y = gameState.current.groundY - gameState.current.dino.height;
          gameState.current.dino.velocity = 0;
          setIsJumping(false);
        }
      }

      // Update running animation
      if (!isJumping) {
        setRunFrame(prev => (prev + animationSpeed.current) % 2);
      }

      // Update speed based on score with smoother progression
      const newSpeedMultiplier = 1 + (score / 750); // Slower speed increase
      gameState.current.gameSpeed = gameState.current.baseSpeed * newSpeedMultiplier;

      // Update and draw cactuses
      gameState.current.cactuses.forEach(cactus => {
        cactus.x -= gameState.current.gameSpeed;
        drawCactus(cactus);
      });

      // Clean up off-screen cactuses
      gameState.current.cactuses = gameState.current.cactuses.filter(cactus => cactus.x > -50);

      // Spawn new cactuses
      gameState.current.nextCactusIn--;
      if (gameState.current.nextCactusIn <= 0) {
        spawnCactusPattern();
        // Adjust spawn rate based on speed
        gameState.current.nextCactusIn = Math.random() * (120 - gameState.current.gameSpeed * 2) + 100;
      }

      // Check collisions
      gameState.current.cactuses.forEach(cactus => {
        if (checkCollision(gameState.current.dino, cactus)) {
          setGameOver(true);
        }
      });

      // Draw ground
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, gameState.current.groundY);
      ctx.lineTo(canvas.width, gameState.current.groundY);
      ctx.stroke();

      // Draw stick figure
      drawStickFigure(ctx, gameState.current.dino.x, gameState.current.dino.y);

      // Update score
      frameCount++;
      if (frameCount % 5 === 0) {
        setScore(prev => prev + 1);
      }

      // Game loop
      if (!gameOver) {
        animationId = requestAnimationFrame(updateGame);
      } else {
        // Game over screen
        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('Press Space to restart', canvas.width / 2, canvas.height / 2 + 80);
      }
    };

    const checkCollision = (dino, cactus) => {
      const padding = 5;
      return dino.x + padding < cactus.x + cactus.width &&
             dino.x + dino.width - padding > cactus.x &&
             dino.y + padding < cactus.y + cactus.height &&
             dino.y + dino.height - padding > cactus.y;
    };

    const handleClick = () => {
      if (gameOver) {
        // Reset game
        gameState.current.cactuses = [];
        gameState.current.dino.y = 200;
        gameState.current.dino.velocity = 0;
        gameState.current.gameSpeed = gameState.current.baseSpeed;
        gameState.current.lastPattern = null;
        setScore(0);
        setGameOver(false);
        updateGame();
      } else {
        jump();
      }
    };

    canvas.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    updateGame();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [gameOver, isJumping, score]);

  return (
    <div className="flex flex-col items-center p-4 bg-blue-950/95 rounded-lg">
      <div className="mb-4 text-xl text-cyan-400">Score: {score}</div>
      <canvas 
        ref={canvasRef}
        width={800}
        height={300}
        className="bg-blue-950 border-2 border-cyan-400/20 rounded-lg cursor-pointer"
      />
      <div className="mt-4 text-sm text-zinc-400">
        Press Space/Up or Click to jump
      </div>
      {!gameOver && score > 0 && (
        <div className="mt-2 text-sm text-cyan-400">
          Speed: {Math.round(gameState.current.gameSpeed * 10) / 10}x
        </div>
      )}
    </div>
  );
};

export default DinoGame;
