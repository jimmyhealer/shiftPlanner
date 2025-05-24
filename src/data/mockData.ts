import { Driver, Shift, DriverAssignment } from '@/types';

// Mock data for shifts as specified in the requirements
export const shifts: Shift[] = [
  { name: "A 班", start: "05:00", end: "14:00" },
  { name: "B 班", start: "14:00", end: "23:00" },
  { name: "C 班", start: "05:00", end: "23:00" },
];

// Mock data for drivers
export const drivers: Driver[] = [
  // A 班司機
  { id: "A001", name: "王小明", vehicleNo: "TW-123", note: "熟悉早班路線", assignedSlots: 0, shiftType: 'A' },
  { id: "A002", name: "李大華", vehicleNo: "TW-456", note: "有特殊路線經驗", assignedSlots: 0, shiftType: 'A' },
  { id: "A003", name: "張武", vehicleNo: "TW-789", note: "新進司機", assignedSlots: 0, shiftType: 'A' },
  
  // B 班司機
  { id: "B001", name: "林阿忠", vehicleNo: "TW-234", note: "經驗豐富", assignedSlots: 0, shiftType: 'B' },
  { id: "B002", name: "陳小華", vehicleNo: "TW-567", note: "熟悉午間路況", assignedSlots: 0, shiftType: 'B' },
  { id: "B003", name: "黃大明", vehicleNo: "TW-890", note: "擅長繁忙路線", assignedSlots: 0, shiftType: 'B' },
  
  // C 班司機
  { id: "C001", name: "劉小龍", vehicleNo: "TW-345", note: "熟悉夜間路線", assignedSlots: 0, shiftType: 'C' },
  { id: "C002", name: "吳小菁", vehicleNo: "TW-678", note: "夜間駕駛經驗豐富", assignedSlots: 0, shiftType: 'C' },
  { id: "C003", name: "趙小虎", vehicleNo: "TW-901", note: "精通城市夜間路線", assignedSlots: 0, shiftType: 'C' },
];

// Initial empty assignments
export const initialAssignments: DriverAssignment[] = [];

// Helper function to generate time slots from 05:00 to 23:00 in 10-minute intervals
export const generateTimeSlots = () => {
  const timeSlots: string[] = [];
  
  let hour = 5;
  let minute = 0;
  
  while (hour < 23 || (hour === 23 && minute === 0)) {
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    timeSlots.push(`${formattedHour}:${formattedMinute}`);
    
    minute += 10;
    if (minute >= 60) {
      minute = 0;
      hour += 1;
    }
  }
  
  return timeSlots;
};

// Generate all time slots
export const timeSlots = generateTimeSlots(); 