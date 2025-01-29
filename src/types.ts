export type Position = {
  x: number;
  y: number;
  color?: string;
};

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export type GameState = {
  snake: Position[];
  food: Position;
  direction: Direction;
  gameOver: boolean;
  lastFoodTime: number;
};
