// Define the Shift interface
export interface Shift {
  name: string;
  start: string;
  end: string;
}

// Define the Driver interface
export interface Driver {
  id: string;
  name: string;
  vehicleNo: string;
  note: string;
  assignedSlots: number; // Number of assigned time slots
  shiftType: string; // Shift type, e.g., 'A', 'B', 'C'
}

// Define the DriverAssignment interface for the timeline
export interface DriverAssignment {
  id: string; // Unique assignment ID
  driverId: string; // ID of the assigned driver
  startTime: string; // Start time in HH:MM format
  endTime: string; // End time in HH:MM format
  shiftName: string; // The shift this assignment belongs to
}

// Define the TimeSlot interface for the timeline
export interface TimeSlot {
  time: string; // Time in HH:MM format
  isOccupied: boolean;
  assignmentId?: string; // ID of the assignment if occupied
}

// Define the GanttTask interface for Frappe Gantt integration
// Using string format for dates to match Frappe Gantt's expected format
export interface GanttTask {
  id: string;
  name: string;
  start: string; // ISO date string format
  end: string; // ISO date string format
  progress: number;
  dependencies: string;
  custom_class?: string;
  driverId?: string;
  vehicleNo?: string;
  shiftName?: string;
} 