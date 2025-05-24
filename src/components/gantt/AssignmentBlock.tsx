import React from 'react';
import { DriverAssignment } from '@/types';
import { getShiftColor, timeToPosition, getAssignmentWidth } from '@/utils/timeline/timeUtils';

interface AssignmentBlockProps {
  assignment: DriverAssignment;
  dragging: boolean;
  onDragStart: (e: React.MouseEvent) => void;
  onDelete: () => void;
}

const AssignmentBlock: React.FC<AssignmentBlockProps> = ({
  assignment,
  dragging,
  onDragStart,
  onDelete
}) => {
  const { bg, text, border } = getShiftColor(assignment.shiftName);
  const startPos = timeToPosition(assignment.startTime);
  const width = getAssignmentWidth(assignment.startTime, assignment.endTime);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      e.stopPropagation();
      onDelete();
    }
    // 支援 ESC 鍵取消操作的提示
    if (e.key === 'Escape') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      onDelete();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // 只有左鍵才觸發拖曳
    if (e.button === 0) {
      onDragStart(e);
    }
  };
  
  return (
    <div
      id={`task-${assignment.id}`}
      className={`absolute top-1 h-[calc(100%-8px)] ${bg} ${text} ${border} shadow-sm rounded-md border cursor-move 
        flex flex-col justify-center px-2 text-xs transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        ${dragging ? 'z-50 shadow-xl scale-105' : 'hover:scale-102'}`}
      style={{ 
        left: `${startPos}px`, 
        width: `${width}px`,
        zIndex: dragging ? 50 : 10
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`排班: ${assignment.startTime} 到 ${assignment.endTime}, ${assignment.shiftName}班. 按 Delete 刪除, 拖曳移動時間`}
      title="拖曳移動時間 | Shift+點擊或按 Delete 鍵刪除 | ESC 取消拖曳"
    >
      <div className="font-medium truncate time-display select-none">
        {assignment.startTime} - {assignment.endTime}
      </div>
      <div className="truncate select-none text-opacity-80">
        {assignment.shiftName}
      </div>
      
      {/* 拖曳指示器 */}
      {dragging && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
      )}
    </div>
  );
};

export default AssignmentBlock; 