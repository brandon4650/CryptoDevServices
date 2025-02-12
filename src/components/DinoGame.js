import React, { useState, useEffect, useRef } from 'react';

const DinoGame = () => {
  const canvasRef = useRef(null);
  const [isJumping, setIsJumping] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [animationFrame, setAnimationFrame] = useState(0);
  
  // Game states with enhanced cactus patterns
  const gameState = useRef({
    dino: {
      x: 50,
      y: 200,
      width: 30,  // Slightly smaller for tighter jumps
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
    lastPattern: null  // Track last pattern to avoid repeats
  });

  // Define cactus patterns for variety
  const cactusPatterns = [
    // Single cactus
    () => [{
      x: 800,
      y: gameState.current.groundY - 40,
      width: 20,
      height: 40
    }],
    // Double cactus close together
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
    // Triple cactus with gaps
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
    // Alternating heights
    () => [{
      x: 800,
      y: gameState.current.groundY - 50,
      width: 20,
      height: 50
    }, {
      x: 880,
      y: gameState.current.groundY - 30,
      width: 20,
      height: 30
    }]
  ];

  const drawStickFigure = (ctx, x, y, frame) => {
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Head
    ctx.arc(x + 15, y + 10, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.moveTo(x + 15, y + 18);
    ctx.lineTo(x + 15, y + 35);
    ctx.stroke();

    // Arms
    if (isJumping) {
      // Arms up during jump
      ctx.beginPath();
      ctx.moveTo(x + 15, y + 25);
      ctx.lineTo(x + 5, y + 15);
      ctx.moveTo(x + 15, y + 25);
      ctx.lineTo(x + 25, y + 15);
      ctx.stroke();
    } else {
      // Running arm animation
      const armSwing = Math.sin(frame * 0.5) * 10;
      ctx.beginPath();
      ctx.moveTo(x + 15, y + 25);
      ctx.lineTo(x + 5 + armSwing, y + 30);
      ctx.moveTo(x + 15, y + 25);
      ctx.lineTo(x + 25 - armSwing, y + 30);
      ctx.stroke();
    }

    // Legs
    if (isJumping) {
      // Legs bent during jump
      ctx.beginPath();
      ctx.moveTo(x + 15, y + 35);
      ctx.lineTo(x + 10, y + 45);
      ctx.lineTo(x + 5, y + 40);
      ctx.moveTo(x + 15, y + 35);
      ctx.lineTo(x + 20, y + 45);
      ctx.lineTo(x + 25, y + 40);
      ctx.stroke();
    } else {
      // Running leg animation
      const legSwing = Math.sin(frame * 0.5) * 10;
      ctx.beginPath();
      ctx.moveTo(x + 15, y + 35);
      ctx.lineTo(x + 10 + legSwing, y + 48);
      ctx.moveTo(x + 15, y + 35);
      ctx.lineTo(x + 20 - legSwing, y + 48);
      ctx.stroke();
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
      // Main stem
      ctx.fillRect(cactus.x + cactus.width/3, cactus.y, cactus.width/3, cactus.height);
      // Branches
      ctx.fillRect(cactus.x, cactus.y + cactus.height/3, cactus.width, cactus.height/4);
      // Optional top detail
      ctx.fillRect(cactus.x + cactus.width/4, cactus.y + 5, cactus.width/2, 3);
    };

    const spawnCactusPattern = () => {
      // Choose a random pattern, but not the same as last time
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

      // Update animation and speed
      setAnimationFrame(prev => prev + 0.2);
      const newSpeedMultiplier = 1 + (score / 500);
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
        gameState.current.nextCactusIn = Math.random() * (120 - gameState.current.gameSpeed * 2) + 80;
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
      drawStickFigure(
        ctx, 
        gameState.current.dino.x, 
        gameState.current.dino.y, 
        animationFrame
      );

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
      // Add some padding to make collision detection more forgiving
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
