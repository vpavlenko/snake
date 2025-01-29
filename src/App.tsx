import SnakeGame from "./components/SnakeGame";
import "./App.css";

function App() {
  return (
    <div className="app">
      <h1>Snake Game</h1>
      <SnakeGame />
      <div className="instructions">
        <p>Use arrow keys or WASD to control the snake</p>
        <p>Collect food to grow longer</p>
        <p>Avoid hitting the walls and yourself</p>
      </div>
    </div>
  );
}

export default App;
