import { useEffect, useState, useCallback } from "react";
import { Position, GameState } from "../types";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10, color: "#4CAF50" }];
const GAME_SPEED = 150;
const FOOD_TIMEOUT = 5000; // 5 seconds in milliseconds

// Generate a random bright color
const generateColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`;
};

const generateFood = (snake: Position[]): Position => {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
      color: generateColor(),
    };
  } while (
    snake.some((segment) => segment.x === food.x && segment.y === food.y)
  );
  return food;
};

const SnakeGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE,
    food: generateFood(INITIAL_SNAKE),
    direction: "RIGHT",
    gameOver: false,
    lastFoodTime: Date.now(),
  });

  const [timeLeft, setTimeLeft] = useState(FOOD_TIMEOUT);

  const moveSnake = useCallback(() => {
    if (gameState.gameOver) return;

    const currentTime = Date.now();
    const timeSinceLastFood = currentTime - gameState.lastFoodTime;

    // Update time left
    setTimeLeft(Math.max(0, FOOD_TIMEOUT - timeSinceLastFood));

    // Calculate new head position
    const headX = gameState.snake[0].x;
    const headY = gameState.snake[0].y;
    let newHeadX = headX;
    let newHeadY = headY;

    switch (gameState.direction) {
      case "UP":
        newHeadY -= 1;
        break;
      case "DOWN":
        newHeadY += 1;
        break;
      case "LEFT":
        newHeadX -= 1;
        break;
      case "RIGHT":
        newHeadX += 1;
        break;
    }

    // Check collision with walls
    if (
      newHeadX < 0 ||
      newHeadX >= GRID_SIZE ||
      newHeadY < 0 ||
      newHeadY >= GRID_SIZE
    ) {
      setGameState((prev) => ({ ...prev, gameOver: true }));
      return;
    }

    // Check collision with self
    if (
      gameState.snake.some(
        (segment) => segment.x === newHeadX && segment.y === newHeadY
      )
    ) {
      setGameState((prev) => ({ ...prev, gameOver: true }));
      return;
    }

    let newSnake: Position[];

    // Check if food is eaten
    if (newHeadX === gameState.food.x && newHeadY === gameState.food.y) {
      // Create new head with food's color at food position
      // All other segments stay in their current positions
      newSnake = [
        { x: newHeadX, y: newHeadY, color: gameState.food.color },
        ...gameState.snake,
      ];

      setGameState((prev) => ({
        ...prev,
        snake: newSnake,
        food: generateFood(newSnake),
        lastFoodTime: currentTime,
      }));
    } else {
      // Normal movement: each segment moves to new position but keeps its color
      const positions = [{ x: newHeadX, y: newHeadY }];

      // Calculate new positions for all segments
      for (let i = 0; i < gameState.snake.length - 1; i++) {
        positions.push({ x: gameState.snake[i].x, y: gameState.snake[i].y });
      }

      // Create new snake array with new positions but keeping original colors
      newSnake = positions.map((pos, index) => ({
        x: pos.x,
        y: pos.y,
        color: gameState.snake[index].color,
      }));

      // Check if we need to remove tail due to timeout
      if (timeSinceLastFood >= FOOD_TIMEOUT && newSnake.length > 1) {
        newSnake.pop();
        setGameState((prev) => ({
          ...prev,
          snake: newSnake,
          lastFoodTime: currentTime,
        }));
      } else {
        setGameState((prev) => ({
          ...prev,
          snake: newSnake,
        }));
      }
    }
  }, [gameState]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      setGameState((prev) => {
        if ((key === "arrowup" || key === "w") && prev.direction !== "DOWN") {
          return { ...prev, direction: "UP" };
        }
        if ((key === "arrowdown" || key === "s") && prev.direction !== "UP") {
          return { ...prev, direction: "DOWN" };
        }
        if (
          (key === "arrowleft" || key === "a") &&
          prev.direction !== "RIGHT"
        ) {
          return { ...prev, direction: "LEFT" };
        }
        if (
          (key === "arrowright" || key === "d") &&
          prev.direction !== "LEFT"
        ) {
          return { ...prev, direction: "RIGHT" };
        }
        return prev;
      });
    };

    window.addEventListener("keydown", handleKeyPress);
    const gameInterval = setInterval(moveSnake, GAME_SPEED);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      clearInterval(gameInterval);
    };
  }, [moveSnake]);

  const resetGame = () => {
    setGameState({
      snake: INITIAL_SNAKE,
      food: generateFood(INITIAL_SNAKE),
      direction: "RIGHT",
      gameOver: false,
      lastFoodTime: Date.now(),
    });
    setTimeLeft(FOOD_TIMEOUT);
  };

  return (
    <div className="game-container">
      <div
        className="game-board"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          gap: "1px",
          backgroundColor: "#ccc",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE;
          const y = Math.floor(index / GRID_SIZE);
          const snakeSegment = gameState.snake.find(
            (segment) => segment.x === x && segment.y === y
          );
          const isFood = gameState.food.x === x && gameState.food.y === y;

          return (
            <div
              key={index}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: snakeSegment
                  ? snakeSegment.color
                  : isFood
                  ? gameState.food.color
                  : "#fff",
                borderRadius: "2px",
                transition: "background-color 0.2s ease",
              }}
            />
          );
        })}
      </div>
      <div className="game-info">
        <div className="score">Score: {gameState.snake.length - 1}</div>
        <div
          className="timer"
          style={{ color: timeLeft < 1000 ? "#ff0000" : "#333" }}
        >
          Time until shrink: {Math.ceil(timeLeft / 1000)}s
        </div>
      </div>
      {gameState.gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
