import React from 'react';
import { 
  HOUR_WIDTH,
  START_HOUR,
  END_HOUR,
  DRIVER_NAME_COLUMN_WIDTH
} from '@/utils/timeline/timeUtils';
import { DriverAssignment } from '@/types';

interface TimelineHeaderProps {
  className?: string;
  assignments?: DriverAssignment[];
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({ 
  className = '', 
  assignments = []
}) => {
  // 檢查指定時間段是否有司機發車（只檢查發車時間）
  const hasDepartureAtTime = (timeSlot: string): boolean => {
    return assignments.some(assignment => {
      // 只檢查發車時間是否等於該時間槽
      return assignment.startTime === timeSlot;
    });
  };

  // 檢查時間段是否需要發車（21:30 之後不需要發車）
  const shouldHaveDeparture = (timeSlot: string): boolean => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const cutoffTime = 21 * 60 + 30; // 21:30
    
    // 21:30 之後不需要發車（因為班次是2小時，會超出23:00結束時間）
    return timeInMinutes < cutoffTime;
  };

  // 根據發車狀態獲取指示器顏色（只在沒有發車時顯示警告）
  const getIndicatorColor = (hasDeparture: boolean): string => {
    if (!hasDeparture) {
      return 'bg-red-500'; // 沒有發車時顯示紅色警告
    }
    return ''; // 有發車時不顯示指示器
  };

  // 生成時間標籤（每 30 分鐘一個）
  const generateTimeLabels = () => {
    const labels = [];
    
    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
      // 整點標籤
      const hourTime = `${hour.toString().padStart(2, '0')}:00`;
      const hourHasDeparture = hasDepartureAtTime(hourTime);
      const hourShouldHaveDeparture = shouldHaveDeparture(hourTime);
      
      labels.push(
        <div 
          key={`${hour}:00`} 
          className="absolute top-0 h-full border-l border-gray-200 text-xs text-gray-500"
          style={{ left: `${(hour - START_HOUR) * HOUR_WIDTH}px` }}
        >
          <div className="relative px-1 py-1 font-medium bg-gray-50 border-b border-gray-200">
            {hour.toString().padStart(2, '0')}:00
            {/* 發車狀態指示器 - 只在需要發車但沒有發車時顯示警告 */}
            {hourShouldHaveDeparture && !hourHasDeparture && (
              <div 
                className={`absolute top-0 right-0 w-2 h-2 rounded-full ${getIndicatorColor(hourHasDeparture)}`}
                title="此時段無發車班次"
              />
            )}
          </div>
        </div>
      );
      
      // 半小時標籤（如果不是結束時間）
      if (hour < END_HOUR) {
        const halfHourTime = `${hour.toString().padStart(2, '0')}:30`;
        const halfHourHasDeparture = hasDepartureAtTime(halfHourTime);
        const halfHourShouldHaveDeparture = shouldHaveDeparture(halfHourTime);
        
        labels.push(
          <div 
            key={`${hour}:30`} 
            className="absolute top-0 h-full border-l border-gray-200 border-dashed text-xs text-gray-500"
            style={{ left: `${(hour - START_HOUR) * HOUR_WIDTH + HOUR_WIDTH/2}px` }}
          >
            <div className="relative px-1 py-1 font-medium bg-gray-50 border-b border-gray-200">
              {hour.toString().padStart(2, '0')}:30
              {/* 發車狀態指示器 - 只在需要發車但沒有發車時顯示警告 */}
              {halfHourShouldHaveDeparture && !halfHourHasDeparture && (
                <div 
                  className={`absolute top-0 right-0 w-2 h-2 rounded-full ${getIndicatorColor(halfHourHasDeparture)}`}
                  title="此時段無發車班次"
                />
              )}
            </div>
          </div>
        );
      }
    }
    
    return labels;
  };

  return (
    <div 
      className={`timeline-header flex h-10 bg-white border-b border-gray-200 ${className}`}
      style={{ minWidth: `${DRIVER_NAME_COLUMN_WIDTH + (END_HOUR - START_HOUR) * HOUR_WIDTH}px` }}
    >
      <div 
        className="sticky left-0 z-30 flex items-center px-3 font-bold text-sm text-gray-700 border-gray-200 bg-white box-border flex-shrink-0"
        style={{ width: `${DRIVER_NAME_COLUMN_WIDTH}px` }}
      >
        司機
        {/* 圖例說明 */}
        <div className="ml-2 flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" title="無發車班次"></div>
        </div>
      </div>
      <div 
        className="relative border-l border-gray-200"
        style={{ width: `${(END_HOUR - START_HOUR) * HOUR_WIDTH}px` }}
      >
        {generateTimeLabels()}
      </div>
    </div>
  );
};

export default TimelineHeader; 