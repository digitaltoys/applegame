import React from 'react';
import './SumDisplay.css'; // Import the CSS

interface SumDisplayProps {
  sum: number;
}

const SumDisplay: React.FC<SumDisplayProps> = ({ sum }) => {
  return (
    <div className="sum-display">
      <p>Sum: {sum}</p>
    </div>
  );
};

export default SumDisplay;
