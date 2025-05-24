import React from 'react';
import { Shift } from '@/types';
import { getShiftColor } from '@/utils/timeline/timeUtils';

interface ShiftLegendProps {
  shifts: Shift[];
  className?: string;
}

const ShiftLegend: React.FC<ShiftLegendProps> = ({ shifts, className = '' }) => {
  return (
    <div className={`flex gap-4 justify-start ${className}`}>
      {shifts.map(shift => (
        <div key={shift.name} className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-sm ${getShiftColor(shift.name).bg}`}></div>
          <span className="text-sm">{shift.name} ({shift.start}-{shift.end})</span>
        </div>
      ))}
    </div>
  );
};

export default ShiftLegend; 