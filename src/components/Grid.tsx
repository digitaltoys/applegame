import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import './Grid.css';

interface GridProps {
  // Props will be defined later
}

// 셀의 좌표를 나타내는 인터페이스
interface CellPosition {
  row: number;
  col: number;
}

// 선택된 사과 정보를 나타내는 인터페이스
interface SelectedApple extends CellPosition {
  value: number;
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

// Helper function to get cell coordinates from mouse event relative to the grid
const getCellCoordsFromEvent = (event: React.MouseEvent<HTMLDivElement>, gridRef: HTMLDivElement | null): CellPosition | null => {
  if (!gridRef) return null;

  const rect = gridRef.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Assuming square cells and no margins/padding within the grid container affecting cell positioning
  // These cell dimensions should ideally come from dynamic calculation or props if they can vary
  const cellWidth = gridRef.offsetWidth / GRID_SIZE;
  const cellHeight = gridRef.offsetHeight / GRID_SIZE;

  const col = Math.floor(x / cellWidth);
  const row = Math.floor(y / cellHeight);

  if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
    return { row, col };
  }
  return null;
};


const Grid: React.FC<GridProps> = () => {
  const [gridData, setGridData] = useState<number[][]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartCell, setDragStartCell] = useState<CellPosition | null>(null);
  const [dragCurrentCell, setDragCurrentCell] = useState<CellPosition | null>(null); // dragCurrentCell is kept for potential future use, though not directly used in selection logic in this version
  const [selectedApples, setSelectedApples] = useState<SelectedApple[]>([]);
  const [currentSum, setCurrentSum] = useState<number>(0);
  const gridRef = useRef<HTMLDivElement>(null); // Ref for the grid container

  useEffect(() => {
    setGridData(initializeGrid());
  }, []);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    // Check if the click is on a grid cell directly, not on the scrollbars or edges of grid-container
    const target = event.target as HTMLElement;
    if (!target.classList.contains('grid-cell') && !target.classList.contains('grid-container')) {
        // If the click is not on a cell or the container itself, but maybe on a scrollbar, ignore.
        // This check can be refined. For now, we allow starting drag from container for simplicity with getCellCoordsFromEvent.
    }

    const coords = getCellCoordsFromEvent(event, gridRef.current);
    if (coords) {
      setIsDragging(true);
      setDragStartCell(coords);
      setSelectedApples([{ row: coords.row, col: coords.col, value: gridData[coords.row][coords.col] }]); // Select starting cell
      setCurrentSum(gridData[coords.row][coords.col]); // Set sum for the starting cell
      setDragCurrentCell(coords);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartCell) return;

    const currentCoords = getCellCoordsFromEvent(event, gridRef.current);
    if (currentCoords) {
      // Optimization: only update if current cell changes
      if (dragCurrentCell && currentCoords.row === dragCurrentCell.row && currentCoords.col === dragCurrentCell.col) {
        return;
      }
      setDragCurrentCell(currentCoords);

      const newSelectedApples: SelectedApple[] = [];
      const minRow = Math.min(dragStartCell.row, currentCoords.row);
      const maxRow = Math.max(dragStartCell.row, currentCoords.row);
      const minCol = Math.min(dragStartCell.col, currentCoords.col);
      const maxCol = Math.max(dragStartCell.col, currentCoords.col);

      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          if (gridData[r] && gridData[r][c] !== undefined) {
            newSelectedApples.push({ row: r, col: c, value: gridData[r][c] });
          }
        }
      }
      setSelectedApples(newSelectedApples);
      // Optional: Calculate sum in real-time during drag
      // const sum = newSelectedApples.reduce((acc, apple) => acc + apple.value, 0);
      // setCurrentSum(sum);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const sum = selectedApples.reduce((acc, apple) => acc + apple.value, 0);
    setCurrentSum(sum); // 합계는 표시를 위해 먼저 업데이트

    if (sum === 10) {
      const newGridData = [...gridData];
      selectedApples.forEach(apple => {
        newGridData[apple.row][apple.col] = 0; // 사과 제거 (0으로 표시)
      });
      setGridData(newGridData);
      // TODO: 점수 업데이트 로직 추가 필요 (2-4 태스크)
    }

    // 합이 10이든 아니든 선택 해제 및 합계 초기화
    setSelectedApples([]);
    setCurrentSum(0); // 실제 합계가 10이 아니었거나, 10이어서 처리된 후에는 UI 합계 표시를 0으로 리셋
    setDragStartCell(null); // 다음 드래그를 위해 시작 셀 초기화
    setDragCurrentCell(null); // 다음 드래그를 위해 현재 셀 초기화
  };

  // Render logic
  const cells = [];
  if (gridData.length > 0) { // Ensure gridData is loaded
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const isSelected = selectedApples.some(apple => apple.row === i && apple.col === j);
        cells.push(
          <div
            key={`${i}-${j}`}
            className={`grid-cell ${isSelected ? 'selected-apple' : ''}`}
            data-row={i}
            data-col={j}
          >
            {gridData[i][j]}
          </div>
        );
      }
    }
  }


  if (gridData.length === 0) {
    return <div>Loading Grid...</div>;
  }

  return (
    <div>
      <div
        ref={gridRef} // Attach ref here
        className="grid-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // End drag if mouse leaves grid
      >
        {cells}
      </div>
      <div className="sum-display">
        <p>Current Sum: {currentSum}</p>
      </div>
    </div>
  );
};

export default Grid;
