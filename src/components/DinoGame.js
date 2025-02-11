import React, { useState, useEffect, useRef } from 'react';

const DinoGame = () => {
  const canvasRef = useRef(null);
  const [isJumping, setIsJumping] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  // Game states
  const gameState = useRef({
    dino: {
      x: 50,
      y: 200,
      width: 40,
      height: 50,
      velocity: 0,
      jumpForce: -15,
      gravity: 0.8
    },
    cactuses: [],
    gameSpeed: 5,
    groundY: 250,
    nextCactusIn: 50
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let frameCount = 0;

    const handleKeyDown = (e) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && !isJumping) {
        jump();
      }
    };

    const jump = () => {
      if (!isJumping && !gameOver) {
        setIsJumping(true);
        gameState.current.dino.velocity = gameState.current.dino.jumpForce;
      }
    };

    const drawDino = () => {
      ctx.fillStyle = '#22d3ee'; // Cyan color
      ctx.fillRect(
        gameState.current.dino.x,
        gameState.current.dino.y,
        gameState.current.dino.width,
        gameState.current.dino.height
      );
    };

    const drawGround = () => {
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, gameState.current.groundY);
      ctx.lineTo(canvas.width, gameState.current.groundY);
      ctx.stroke();
    };

    const spawnCactus = () => {
      gameState.current.cactuses.push({
        x: canvas.width,
        y: gameState.current.groundY - 40,
        width: 20,
        height: 40
      });
    };

    const drawCactuses = () => {
      ctx.fillStyle = '#22d3ee';
      gameState.current.cactuses.forEach(cactus => {
        ctx.fillRect(cactus.x, cactus.y, cactus.width, cactus.height);
      });
    };

    const updateGame = () => {
      // Clear canvas
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

      // Update cactuses
      gameState.current.cactuses.forEach(cactus => {
        cactus.x -= gameState.current.gameSpeed;
      });

      // Remove off-screen cactuses
      gameState.current.cactuses = gameState.current.cactuses.filter(cactus => cactus.x > -20);

      // Spawn new cactus
      gameState.current.nextCactusIn--;
      if (gameState.current.nextCactusIn <= 0) {
        spawnCactus();
        gameState.current.nextCactusIn = Math.random() * 100 + 50;
      }

      // Check collisions
      gameState.current.cactuses.forEach(cactus => {
        if (checkCollision(gameState.current.dino, cactus)) {
          setGameOver(true);
        }
      });

      // Draw everything
      drawGround();
      drawDino();
      drawCactuses();

      // Update score
      frameCount++;
      if (frameCount % 10 === 0) {
        setScore(prev => prev + 1);
      }

      // Continue animation if not game over
      if (!gameOver) {
        animationId = requestAnimationFrame(updateGame);
      } else {
        // Draw game over text
        ctx.fillStyle = '#22d3ee';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Press Space to restart', canvas.width / 2, canvas.height / 2 + 40);
      }
    };

    const checkCollision = (dino, cactus) => {
      return dino.x < cactus.x + cactus.width &&
             dino.x + dino.width > cactus.x &&
             dino.y < cactus.y + cactus.height &&
             dino.y + dino.height > cactus.y;
    };

    const handleClick = () => {
      if (gameOver) {
        // Reset game
        gameState.current.cactuses = [];
        gameState.current.dino.y = 200;
        gameState.current.dino.velocity = 0;
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
  }, [gameOver, isJumping]);

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
    </div>
  );
};

export default DinoGame;
