
import React from 'react';
import type { FunctionCardData } from '../types';

interface FunctionCardProps {
  card: FunctionCardData;
  isActive: boolean;
  onClick: (id: string, requiresTwo?: boolean) => void;
}

const FunctionCard: React.FC<FunctionCardProps> = ({ card, isActive, onClick }) => {
  const activeClasses = 'bg-blue-600 border-blue-400';
  const inactiveClasses = 'bg-gray-700/50 border-gray-600 hover:bg-gray-700';

  return (
    <div
      className={`function-card p-3 rounded-lg border-2 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center aspect-square ${isActive ? activeClasses : inactiveClasses}`}
      onClick={() => onClick(card.id, card.requiresTwo)}
      data-function={card.id}
    >
      <div className="text-2xl mb-1">{card.icon}</div>
      <div className="text-sm font-semibold">{card.name}</div>
    </div>
  );
};

export default FunctionCard;
