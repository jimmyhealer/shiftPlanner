"use client";

import React from "react";
import { useShiftPlanner } from "@/context/ShiftPlannerContext";
import { useAssignmentOperations } from "@/hooks/useAssignmentOperations";

// 導入子組件
import TimelineHeader from "./gantt/TimelineHeader";
import DriverRow from "./gantt/DriverRow";
import ShiftLegend from "./gantt/ShiftLegend";

const GanttChart: React.FC = () => {
  const {
    assignments,
    drivers,
    addAssignment,
    updateAssignment,
    removeAssignment,
    shifts,
    isValidAssignment,
  } = useShiftPlanner();

  // 使用 hook 處理排班操作
  const {
    containerRef,
    draggingTask,
    hoverPosition,
    handleTaskDrag,
    handleMouseMove,
    handleMouseLeave,
    handleAddClick,
    handleDeleteAssignment,
  } = useAssignmentOperations({
    assignments,
    shifts,
    updateAssignment,
    removeAssignment,
    addAssignment,
    drivers,
    isValidAssignment,
  });

  // 設置時間軸容器的樣式
  const timelineClasses =
    "timeline-container relative bg-white rounded-xl shadow-md border border-gray-100";

  return (
    <div className="flex-1 gantt-wrapper">
      <div className="mb-4 pb-2 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">班表排程</h2>
        <p className="text-sm text-gray-600">
          每個單位為 30 分鐘，每班次為 2 小時。可在空白區域點擊 + 新增排班 <br />
          按住 Shift 點擊班別可以移除該司機的班別。
        </p>
        <p className="text-xs text-blue-600 mt-1">
          💡 提示：未發班的時間段會以紅點顯示，方便識別需要安排的時段
        </p>
      </div>

      <div 
        className={`${timelineClasses} overflow-x-auto`}
        style={{ maxWidth: `calc(100vw - 30px)` }}
      >
        {/* 時間軸頭部 */}
        <TimelineHeader assignments={assignments} />

        {/* 司機列表和時間軸 */}
        <div
          ref={containerRef}
          className="timeline-body relative flex flex-col"
        >
          {drivers.map((driver, index) => (
            <DriverRow
              key={driver.id}
              driver={driver}
              index={index}
              assignments={assignments}
              shifts={shifts}
              hoverPosition={hoverPosition}
              draggingTaskId={draggingTask}
              onMouseMove={(e) => handleMouseMove(e, driver.id)}
              onMouseLeave={handleMouseLeave}
              onTaskDrag={handleTaskDrag}
              onDeleteAssignment={handleDeleteAssignment}
              onAddClick={handleAddClick}
            />
          ))}
        </div>
      </div>

      {/* 班次圖例 */}
      <ShiftLegend shifts={shifts} className="mt-4" />
    </div>
  );
};

export default GanttChart;
