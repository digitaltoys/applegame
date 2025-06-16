import React, { useState, useEffect } from 'react';
import './Grid.css';

interface GridProps {
  // Props will be defined later
}

const GRID_SIZE = 10;

const generateRandomNumber = () => Math.floor(Math.random() * 9) + 1;

const initializeGrid = (): number[][] => {
  const newGrid = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    const row = [];
    for (let j = 0; j < GRID_SIZE; j++) {
      row.push(generateRandomNumber());
    }
    newGrid.push(row);
  }
  return newGrid;
};

const Grid: React.FC<GridProps> = () => {
  const [gridData, setGridData] = useState<number[][]>([]);

  useEffect(() => {
    setGridData(initializeGrid());
  }, []);

  const cells = [];
  for (let i = 0; i < gridData.length; i++) {
    for (let j = 0; j < gridData[i].length; j++) {
      cells.push(
        <div
          key={`${i}-${j}`}
          className="grid-cell"
        >
          {gridData[i][j]}
        </div>
      );
    }
  }

  if (gridData.length === 0) {
    return <div>Loading Grid...</div>; // Or some other loading indicator
  }

  return (
    <div className="grid-container">
      {cells}
    </div>
  );
};

export default Grid;
