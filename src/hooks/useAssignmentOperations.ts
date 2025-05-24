import { useState, useRef } from 'react';
import { timeToDate } from '@/utils/ganttUtils';
import { 
  timeToPosition, 
  positionToTime, 
  TIME_SLOT_WIDTH,
  HOUR_WIDTH,
  START_HOUR,
  END_HOUR,
  DEFAULT_ASSIGNMENT_DURATION,
  DRIVER_NAME_COLUMN_WIDTH,
} from '@/utils/timeline/timeUtils';
import { Shift, DriverAssignment } from '@/types';

interface UseAssignmentOperationsProps {
  assignments: DriverAssignment[];
  shifts: Shift[];
  updateAssignment: (id: string, startTime: string, endTime: string) => void;
  removeAssignment: (id: string) => void;
  addAssignment: (driverId: string, startTime: string, endTime: string, shiftName: string) => void;
  drivers: { id: string; shiftType: string }[];
  isValidAssignment: (driverId: string, startTime: string, endTime: string, shiftName: string, currentAssignmentId?: string) => { isValid: boolean; error?: string };
}

export const useAssignmentOperations = ({
  assignments,
  shifts,
  updateAssignment,
  removeAssignment,
  addAssignment,
  drivers,
  isValidAssignment
}: UseAssignmentOperationsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingTask, setDraggingTask] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ driverId: string, time: string } | null>(null);

  // 檢查時間槽是否已被佔用
  const isTimeSlotOccupied = (driverId: string, time: string): boolean => {
    return assignments.some(assignment => 
      assignment.driverId === driverId && 
      time >= assignment.startTime && 
      time < assignment.endTime
    );
  };

  // 處理任務拖曳
  const handleTaskDrag = (e: React.MouseEvent, assignmentId: string) => {
    if (draggingTask) return;
    
    e.preventDefault();
    setDraggingTask(assignmentId);
    
    const startX = e.clientX;
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    const initialStartPos = timeToPosition(assignment.startTime);
    const initialEndPos = timeToPosition(assignment.endTime);
    const taskWidth = initialEndPos - initialStartPos;
    
    const moveHandler = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      
      const deltaX = moveEvent.clientX - startX;
      
      let newStartPos = Math.max(0, initialStartPos + deltaX);
      const timelineWidth = (END_HOUR - START_HOUR) * HOUR_WIDTH;
      
      // 確保任務保持在時間軸範圍內
      if (newStartPos + taskWidth > timelineWidth) {
        newStartPos = timelineWidth - taskWidth;
      }
      
      // 對齊到 30 分鐘間隔
      newStartPos = Math.round(newStartPos / TIME_SLOT_WIDTH) * TIME_SLOT_WIDTH;
      
      const newStartTime = positionToTime(newStartPos);
      const newEndTime = positionToTime(newStartPos + taskWidth);
      
      // 檢查新位置是否有效
      const validation = isValidAssignment(
        assignment.driverId, 
        newStartTime, 
        newEndTime, 
        assignment.shiftName, 
        assignmentId
      );
      
      // 視覺上更新任務位置
      const taskElement = document.getElementById(`task-${assignmentId}`);
      if (taskElement) {
        taskElement.style.left = `${newStartPos}px`;
        
        // 添加視覺反饋
        if (validation.isValid) {
          taskElement.classList.remove('opacity-50', 'border-red-500');
          taskElement.classList.add('shadow-lg');
        } else {
          taskElement.classList.add('opacity-50', 'border-red-500');
          taskElement.classList.remove('shadow-lg');
        }
        
        // 即時更新時間顯示
        const timeDisplay = taskElement.querySelector('.time-display');
        if (timeDisplay) {
          timeDisplay.textContent = `${newStartTime} - ${newEndTime}`;
        }
      }
    };
    
    const upHandler = (upEvent: MouseEvent) => {
      setDraggingTask(null);
      
      const deltaX = upEvent.clientX - startX;
      
      let newStartPos = Math.max(0, initialStartPos + deltaX);
      const timelineWidth = (END_HOUR - START_HOUR) * HOUR_WIDTH;
      
      // 確保任務保持在時間軸範圍內
      if (newStartPos + taskWidth > timelineWidth) {
        newStartPos = timelineWidth - taskWidth;
      }
      
      // 對齊到 30 分鐘間隔
      newStartPos = Math.round(newStartPos / TIME_SLOT_WIDTH) * TIME_SLOT_WIDTH;
      
      const newStartTime = positionToTime(newStartPos);
      const newEndTime = positionToTime(newStartPos + taskWidth);
      
      // 最終驗證
      const validation = isValidAssignment(
        assignment.driverId, 
        newStartTime, 
        newEndTime, 
        assignment.shiftName, 
        assignmentId
      );
      
      if (validation.isValid) {
        // 更新排班時間
        updateAssignment(assignmentId, newStartTime, newEndTime);
      } else {
        // 如果無效則恢復原始位置
        const taskElement = document.getElementById(`task-${assignmentId}`);
        if (taskElement) {
          taskElement.style.left = `${initialStartPos}px`;
          taskElement.classList.remove('opacity-50', 'border-red-500', 'shadow-lg');
          
          // 恢復時間顯示
          const timeDisplay = taskElement.querySelector('.time-display');
          if (timeDisplay) {
            timeDisplay.textContent = `${assignment.startTime} - ${assignment.endTime}`;
          }
        }
      }
      
      // 清理事件監聽器
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
      document.removeEventListener('keydown', escapeHandler);
    };
    
    // ESC 鍵取消拖曳
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setDraggingTask(null);
        
        // 恢復原始位置
        const taskElement = document.getElementById(`task-${assignmentId}`);
        if (taskElement) {
          taskElement.style.left = `${initialStartPos}px`;
          taskElement.classList.remove('opacity-50', 'border-red-500', 'shadow-lg');
          
          const timeDisplay = taskElement.querySelector('.time-display');
          if (timeDisplay) {
            timeDisplay.textContent = `${assignment.startTime} - ${assignment.endTime}`;
          }
        }
        
        // 清理事件監聽器
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
    document.addEventListener('keydown', escapeHandler);
  };

  // 處理滑鼠移動檢測添加按鈕位置
  const handleMouseMove = (e: React.MouseEvent, driverId: string) => {
    if (!containerRef.current || draggingTask) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - DRIVER_NAME_COLUMN_WIDTH;
    
    // 確保在有效範圍內
    if (x < 0) {
      setHoverPosition(null);
      return;
    }
    
    const snappedX = Math.floor(x / TIME_SLOT_WIDTH) * TIME_SLOT_WIDTH;
    const time = positionToTime(snappedX);
    
    // 根據司機班別找對應 shift
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) {
      setHoverPosition(null);
      return;
    }
    
    const shift = shifts.find(s => s.name.startsWith(driver.shiftType));
    if (!shift) {
      setHoverPosition(null);
      return;
    }
    
    // 使用常數定義的預設時長
    const startDate = timeToDate(time);
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + DEFAULT_ASSIGNMENT_DURATION);
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    
    // 用 context 驗證
    const validation = isValidAssignment(driverId, time, endTime, shift.name);
    if (validation.isValid) {
      setHoverPosition({ driverId, time });
    } else {
      setHoverPosition(null);
    }
  };

  // 處理滑鼠離開隱藏添加按鈕
  const handleMouseLeave = () => {
    setHoverPosition(null);
  };

  // 處理添加按鈕點擊
  const handleAddClick = (driverId: string, time: string) => {
    // 根據司機確定班次
    const driverShift = drivers.find(d => d.id === driverId)?.shiftType || '';
    const shift = shifts.find(s => s.name.startsWith(driverShift));
    if (!shift) return;
    
    // 使用常數定義的預設時長
    const startDate = timeToDate(time);
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + DEFAULT_ASSIGNMENT_DURATION);
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    
    // 創建新排班
    addAssignment(driverId, time, endTime, shift.name);
    setHoverPosition(null);
  };

  // 處理刪除排班
  const handleDeleteAssignment = (assignmentId: string) => {
    removeAssignment(assignmentId);
  };

  return {
    containerRef,
    draggingTask,
    hoverPosition,
    isTimeSlotOccupied,
    handleTaskDrag,
    handleMouseMove,
    handleMouseLeave,
    handleAddClick,
    handleDeleteAssignment
  };
}; 