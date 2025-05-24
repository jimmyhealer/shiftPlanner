import { DriverAssignment, GanttTask, Driver } from '@/types';

// Helper function to convert HH:MM time to Date object (with today's date)
export const timeToDate = (timeString: string): Date => {
  const today = new Date();
  const [hours, minutes] = timeString.split(':').map(Number);
  
  const date = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    hours,
    minutes
  );
  
  return date;
};

// Helper function to convert HH:MM time to ISO string (with today's date)
export const timeToISOString = (timeString: string): string => {
  return timeToDate(timeString).toISOString();
};

// Convert Date object to HH:MM format
export const dateToTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Convert a DriverAssignment to a GanttTask
export const assignmentToTask = (
  assignment: DriverAssignment, 
  driver: Driver | undefined
): GanttTask => {
  const driverName = driver ? driver.name : 'Unknown';
  const vehicleNo = driver ? driver.vehicleNo : '';
  
  return {
    id: assignment.id,
    name: driverName,
    start: timeToISOString(assignment.startTime),
    end: timeToISOString(assignment.endTime),
    progress: 100,
    dependencies: '',
    custom_class: `shift-${assignment.shiftName.charAt(0).toLowerCase()}`,
    driverId: assignment.driverId,
    vehicleNo: vehicleNo,
    shiftName: assignment.shiftName
  };
};

// Convert a GanttTask to a DriverAssignment
export const taskToAssignment = (task: GanttTask): DriverAssignment => {
  return {
    id: task.id,
    driverId: task.driverId || '',
    startTime: dateToTime(task.start),
    endTime: dateToTime(task.end),
    shiftName: task.shiftName || ''
  };
};

// Convert an array of DriverAssignments to GanttTasks
export const assignmentsToTasks = (
  assignments: DriverAssignment[], 
  drivers: Driver[]
): GanttTask[] => {
  return assignments.map(assignment => {
    const driver = drivers.find(d => d.id === assignment.driverId);
    return assignmentToTask(assignment, driver);
  });
}; 