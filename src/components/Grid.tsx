import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import './Grid.css';

interface GridProps {
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setCurrentSum: React.Dispatch<React.SetStateAction<number>>;
  onGameWin: () => void;
  isPaused: boolean; // isPaused prop 추가
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

const initializeGrid = (): (number | string)[][] => {
  const newGrid: (number | string)[][] = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    const row: (number | string)[] = [];
    for (let j = 0; j < GRID_SIZE; j++) {
      row.push(generateRandomNumber());
    }
    newGrid.push(row);
  }
  return newGrid;
};

// Helper function to get cell coordinates from mouse or touch event relative to the grid
const getCellCoordsFromEvent = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, gridRef: HTMLDivElement | null): CellPosition | null => {
  if (!gridRef) return null;

  const rect = gridRef.getBoundingClientRect();
  let clientX, clientY;

  if ('touches' in event) {
    // Touch event
    if (event.touches.length === 0) return null; // No touches, should not happen in start/move
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else {
    // Mouse event
    clientX = event.clientX;
    clientY = event.clientY;
  }

  const x = clientX - rect.left;
  const y = clientY - rect.top;

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


const Grid: React.FC<GridProps> = ({ setScore, setCurrentSum, onGameWin, isPaused }) => {
  const [gridData, setGridData] = useState<(number | string)[][]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartCell, setDragStartCell] = useState<CellPosition | null>(null);
  const [dragCurrentCell, setDragCurrentCell] = useState<CellPosition | null>(null); // dragCurrentCell is kept for potential future use, though not directly used in selection logic in this version
  const [selectedApples, setSelectedApples] = useState<SelectedApple[]>([]);
  // const [currentSum, setCurrentSum] = useState<number>(0); // App.tsx에서 관리하도록 변경
  const gridRef = useRef<HTMLDivElement>(null); // Ref for the grid container

  useEffect(() => {
    setGridData(initializeGrid());
  }, []);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isPaused) return; // Disable interaction if paused
    // Check if the click is on a grid cell directly, not on the scrollbars or edges of grid-container
    const target = event.target as HTMLElement;
    if (!target.classList.contains('grid-cell') && !target.classList.contains('grid-container')) {
        // If the click is not on a cell or the container itself, but maybe on a scrollbar, ignore.
        // This check can be refined. For now, we allow starting drag from container for simplicity with getCellCoordsFromEvent.
    }

    const coords = getCellCoordsFromEvent(event, gridRef.current);
    if (coords) {
      const cellValue = gridData[coords.row][coords.col];
      // 빈 문자열인 셀에서는 드래그를 시작할 수 없도록 처리 (선택 사항이지만, UX 개선 가능)
      if (cellValue === '') {
        setIsDragging(false); // 드래그 시작 안 함
        return;
      }
      const numericValue = Number(cellValue); // `''`는 0으로, 숫자는 숫자로 변환

      setIsDragging(true);
      setDragStartCell(coords);
      setSelectedApples([{ row: coords.row, col: coords.col, value: numericValue }]); // Select starting cell
      setCurrentSum(numericValue); // Update sum in App.tsx
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
          // Ensure gridData[r] exists and gridData[r][c] is not undefined
          if (gridData[r] && gridData[r][c] !== undefined) {
            const cellValue = gridData[r][c];
            // Only include actual apples (not empty strings)
            if (cellValue !== '') {
              newSelectedApples.push({ row: r, col: c, value: Number(cellValue) });
            }
          }
        }
      }
      setSelectedApples(newSelectedApples);
      // Optional: Calculate sum in real-time during drag
      const sum = newSelectedApples.reduce((acc, apple) => acc + apple.value, 0);
      setCurrentSum(sum); // 실시간 합계 업데이트
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const sum = selectedApples.reduce((acc, apple) => acc + apple.value, 0);
    // setCurrentSum(sum); // App.tsx의 setCurrentSum으로 업데이트는 handleMouseMove에서 이미 처리됨

    if (sum === 10) {
      setScore(prevScore => prevScore + selectedApples.length);

      const newGridData = gridData.map(row => [...row]); // Deep copy
      selectedApples.forEach(apple => {
        newGridData[apple.row][apple.col] = ''; // Remove apples
      });
      setGridData(newGridData);
      // setCurrentSum(0); // Reset sum display in App.tsx
      setSelectedApples([]);
      //onSumChange(0); // Reset sum display in App.tsx

      // Check for game win condition (all apples cleared)
      const remainingApples = newGridData.flat().some(cell => cell !== '' && cell !== 0);
      if (!remainingApples) {
        onGameWin(); // Notify App.tsx that the game is won
      }

    } else {
      // If sum is not 10, just clear selection and reset sum display
      setSelectedApples([]);
      // setCurrentSum(0); // Reset sum display in App.tsx
      //onSumChange(0); // Reset sum display in App.tsx
    }

    setDragStartCell(null);
    setDragCurrentCell(null);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (isPaused) return; // Disable interaction if paused
    event.preventDefault(); // Prevent scrolling
    const target = event.target as HTMLElement;
    if (!target.classList.contains('grid-cell') && !target.classList.contains('grid-container')) {
        return;
    }

    const coords = getCellCoordsFromEvent(event, gridRef.current);
    if (coords) {
      const cellValue = gridData[coords.row][coords.col];
      if (cellValue === '') {
        setIsDragging(false);
        return;
      }
      const numericValue = Number(cellValue);

      setIsDragging(true);
      setDragStartCell(coords);
      setSelectedApples([{ row: coords.row, col: coords.col, value: numericValue }]);
      setCurrentSum(numericValue); // Update sum in App.tsx
      setDragCurrentCell(coords);
    }
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent scrolling during drag
    if (!isDragging || !dragStartCell) return;

    const currentCoords = getCellCoordsFromEvent(event, gridRef.current);
    if (currentCoords) {
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
            const cellValue = gridData[r][c];
            if (cellValue !== '') {
              newSelectedApples.push({ row: r, col: c, value: Number(cellValue) });
            }
          }
        }
      }
      setSelectedApples(newSelectedApples);
      const sum = newSelectedApples.reduce((acc, apple) => acc + apple.value, 0);
      setCurrentSum(sum); // Update sum in App.tsx in real-time
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const sum = selectedApples.reduce((acc, apple) => acc + apple.value, 0);

    if (sum === 10) {
      setScore(prevScore => prevScore + selectedApples.length);
      const newGridData = [...gridData];
      selectedApples.forEach(apple => {
        newGridData[apple.row][apple.col] = '';
      });
      setGridData(newGridData);
      setSelectedApples([]);
      // setCurrentSum(0); // Reset sum display in App.tsx
    } else {
      setSelectedApples([]);
      // setCurrentSum(0); // Reset sum display in App.tsx
    }

    setSelectedApples([]); // Clear selection regardless of sum
    setDragStartCell(null);
    setDragCurrentCell(null);
    // isDragging은 이미 false로 설정됨
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
            {gridData[i][j] !== 0 && gridData[i][j] !== '' ? gridData[i][j] : ''}
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {cells}
      </div>
      {/* SumDisplay는 App.tsx에서 렌더링되므로 여기서 제거 */}
    </div>
  );
};

export default Grid;
