import { Shift } from '@/types';

// 計算時間單位
export const HOUR_WIDTH = 120; // 每小時的寬度（像素）
export const ROW_HEIGHT = 60; // 每行的高度（像素）
export const MINUTE_WIDTH = HOUR_WIDTH / 60; // 每分鐘的寬度
export const TIME_SLOT_WIDTH = MINUTE_WIDTH * 30; // 30分鐘時間槽的寬度

// 時間範圍
export const START_HOUR = 5; // 開始時間 05:00
export const END_HOUR = 23; // 結束時間 23:00

// 業務規則常數
export const MAX_ASSIGNMENTS_PER_DRIVER = 4; // 每個司機最多排班數
export const DEFAULT_ASSIGNMENT_DURATION = 120; // 預設排班時長（分鐘）
export const DRIVER_NAME_COLUMN_WIDTH = 150; // 司機名稱欄寬度（像素）

// 將時間字符串轉換為 x 位置
export const timeToPosition = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return (hours - START_HOUR) * HOUR_WIDTH + minutes * MINUTE_WIDTH;
};

// 將 x 位置轉換為時間字符串
export const positionToTime = (position: number): string => {
  const totalMinutes = Math.round(position / MINUTE_WIDTH);
  // 對齊到 30 分鐘間隔
  const snappedMinutes = Math.round(totalMinutes / 30) * 30;
  const hours = Math.floor(snappedMinutes / 60) + START_HOUR;
  const minutes = snappedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// 計算排班寬度
export const getAssignmentWidth = (startTime: string, endTime: string): number => {
  const startPos = timeToPosition(startTime);
  const endPos = timeToPosition(endTime);
  return endPos - startPos;
};

// 檢查時間是否對特定班次有效
export const isValidTimeForShift = (time: string, shiftName: string, shifts: Shift[]): boolean => {
  const shift = shifts.find(s => s.name === shiftName);
  if (!shift) return false;
  return time >= shift.start && time <= shift.end;
};

// 根據時間獲取班次
export const getShiftForTime = (time: string, shifts: Shift[]): Shift | undefined => {
  return shifts.find(shift => time >= shift.start && time <= shift.end);
};

// 將日期轉換為 HH:MM 格式
export const formatTimeHHMM = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 驗證時間格式是否正確 (HH:MM)
export const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// 驗證時間是否在有效範圍內
export const isTimeInRange = (time: string): boolean => {
  if (!isValidTimeFormat(time)) return false;
  const [hours] = time.split(':').map(Number);
  return hours >= START_HOUR && hours <= END_HOUR;
};

// 根據班次名稱獲取顏色
export const getShiftColor = (shiftName: string) => {
  switch(shiftName.charAt(0)) {
    case 'A': return { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600' };
    case 'B': return { bg: 'bg-green-500', text: 'text-white', border: 'border-green-600' };
    case 'C': return { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600' };
    default: return { bg: 'bg-gray-500', text: 'text-white', border: 'border-gray-600' };
  }
}; 