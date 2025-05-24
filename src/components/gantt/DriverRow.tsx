import React from 'react';
import { Driver, DriverAssignment, Shift } from '@/types';
import AssignmentBlock from './AssignmentBlock';
import { timeToPosition, DRIVER_NAME_COLUMN_WIDTH, HOUR_WIDTH, TIME_SLOT_WIDTH, START_HOUR, END_HOUR } from '@/utils/timeline/timeUtils';

interface DriverRowProps {
  driver: Driver;
  index: number;
  assignments: DriverAssignment[];
  shifts: Shift[];
  hoverPosition: { driverId: string; time: string } | null;
  draggingTaskId: string | null;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onTaskDrag: (e: React.MouseEvent, assignmentId: string) => void;
  onDeleteAssignment: (assignmentId: string) => void;
  onAddClick: (driverId: string, time: string) => void;
}

const DriverRow: React.FC<DriverRowProps> = ({
  driver,
  index,
  assignments,
  shifts,
  hoverPosition,
  draggingTaskId,
  onMouseMove,
  onMouseLeave,
  onTaskDrag,
  onDeleteAssignment,
  onAddClick
}) => {
  const driverAssignments = assignments.filter(a => a.driverId === driver.id);
  
  return (
    <div 
      className="relative mt-1 first:mt-0"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div 
        className="sticky left-0 z-20 h-full py-2 px-3 bg-gray-50 border-b border-gray-200 text-sm font-medium box-border flex-shrink-0"
        style={{ width: `${DRIVER_NAME_COLUMN_WIDTH}px` }}
      >
        <div className="truncate flex items-center gap-1">
          <span className="font-medium">{driver.name}</span>
          <span className="px-1.5 py-0.5 text-xs rounded bg-gray-200 text-gray-700">{driver.shiftType}</span>
        </div>
        <div className="text-xs text-gray-500 truncate">{driver.vehicleNo}</div>
      </div>
      
      <div 
        className={`absolute top-0 h-full border-b border-l border-gray-200 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}
        style={{ 
          left: `${DRIVER_NAME_COLUMN_WIDTH}px`,
          width: `${(END_HOUR - START_HOUR) * HOUR_WIDTH}px`
        }}
      >
        {driverAssignments.map(assignment => (
          <AssignmentBlock
            key={assignment.id}
            assignment={assignment}
            dragging={draggingTaskId === assignment.id}
            onDragStart={(e) => onTaskDrag(e, assignment.id)}
            onDelete={() => onDeleteAssignment(assignment.id)}
          />
        ))}
        
        {/* 添加按鈕 */}
        {hoverPosition && hoverPosition.driverId === driver.id && (
          <button
            className="absolute top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg z-30"
            style={{ 
              left: `${timeToPosition(hoverPosition.time) + TIME_SLOT_WIDTH / 2 - 10}px`,
            }}
            onClick={() => onAddClick(driver.id, hoverPosition.time)}
            title={`在 ${hoverPosition.time} 加入排班`}
          >
            +
          </button>
        )}
        
        {/* 顯示班次邊界 */}
        {shifts
          .filter(shift => shift.name.startsWith(driver.shiftType))
          .map(shift => (
          <React.Fragment key={shift.name}>
            <div 
              className={`absolute top-0 h-full border-l-2 z-5 ${shift.name.startsWith('A') ? 'border-blue-300' : shift.name.startsWith('B') ? 'border-green-300' : 'border-purple-300'}`}
              style={{ left: `${timeToPosition(shift.start)}px` }}
            />
            <div 
              className={`absolute top-0 h-full border-l-2 z-5 ${shift.name.startsWith('A') ? 'border-blue-300' : shift.name.startsWith('B') ? 'border-green-300' : 'border-purple-300'}`}
              style={{ left: `${timeToPosition(shift.end)}px` }}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default DriverRow; 