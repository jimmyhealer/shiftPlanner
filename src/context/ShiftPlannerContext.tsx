import { createContext, useState, ReactNode, useContext, useMemo, useCallback } from 'react';
import { Driver, Shift, DriverAssignment } from '@/types';
import { drivers as initialDrivers, shifts, initialAssignments } from '@/data/mockData';
import { v4 as uuidv4 } from 'uuid';

// Define the context shape
interface ShiftPlannerContextType {
  drivers: Driver[];
  shifts: Shift[];
  assignments: DriverAssignment[];
  addAssignment: (driverId: string, startTime: string, endTime: string, shiftName: string) => void;
  removeAssignment: (assignmentId: string) => void;
  updateAssignment: (assignmentId: string, startTime: string, endTime: string) => void;
  isValidAssignment: (driverId: string, startTime: string, endTime: string, shiftName: string, currentAssignmentId?: string) => { isValid: boolean; error?: string };
  error: string | null;
  setError: (error: string | null) => void;
}

// Create the context
const ShiftPlannerContext = createContext<ShiftPlannerContextType | null>(null);

// Create the provider component
export const ShiftPlannerProvider = ({ children }: { children: ReactNode }) => {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [assignments, setAssignments] = useState<DriverAssignment[]>(initialAssignments);
  const [error, setError] = useState<string | null>(null);

  // Helper function to update driver assigned slot count
  const updateDriverAssignedSlots = useCallback((driverId: string, change: number) => {
    setDrivers(prevDrivers => 
      prevDrivers.map(driver => 
        driver.id === driverId 
          ? { ...driver, assignedSlots: driver.assignedSlots + change } 
          : driver
      )
    );
  }, []);

  // Helper function to convert HH:MM to minutes
  const timeToMinutes = useCallback((time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }, []);

  // Add a new assignment
  const addAssignment = useCallback((driverId: string, startTime: string, endTime: string, shiftName: string) => {
    const validation = isValidAssignment(driverId, startTime, endTime, shiftName);
    if (!validation.isValid) {
      setError(validation.error || 'Failed to add assignment');
      return;
    }

    const newAssignment: DriverAssignment = {
      id: uuidv4(),
      driverId,
      startTime,
      endTime,
      shiftName
    };

    setAssignments(prev => [...prev, newAssignment]);
    updateDriverAssignedSlots(driverId, 1);
  }, [updateDriverAssignedSlots]);

  // Remove an assignment
  const removeAssignment = useCallback((assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      updateDriverAssignedSlots(assignment.driverId, -1);
    }
  }, [assignments, updateDriverAssignedSlots]);

  // Update an existing assignment
  const updateAssignment = useCallback((assignmentId: string, startTime: string, endTime: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    
    if (assignment) {
      const validation = isValidAssignment(
        assignment.driverId, 
        startTime, 
        endTime, 
        assignment.shiftName,
        assignmentId
      );
      if (!validation.isValid) {
        setError(validation.error || 'Failed to update assignment');
        return;
      }
      setAssignments(prev => 
        prev.map(a => 
          a.id === assignmentId 
            ? { ...a, startTime, endTime } 
            : a
        )
      );
    }
  }, [assignments]);

  // Validate if an assignment is valid according to business rules
  const isValidAssignment = useCallback((
    driverId: string, 
    startTime: string, 
    endTime: string, 
    shiftName: string,
    currentAssignmentId?: string
  ): { isValid: boolean; error?: string } => {
    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return { isValid: false, error: "Invalid time format. Please use HH:MM format." };
    }

    // Check if start time is before end time
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    if (startMinutes >= endMinutes) {
      return { isValid: false, error: "Start time must be before end time." };
    }

    const driver = drivers.find(d => d.id === driverId);
    
    // Check if driver exists
    if (!driver) {
      return { isValid: false, error: "Driver not found." };
    }
    
    // Check if driver has reached the maximum assignments (4)
    if (driver.assignedSlots >= 4 && !currentAssignmentId) {
      return { isValid: false, error: "Driver has reached the maximum number of assignments (4)." };
    }
    
    // Check if the assignment is within the shift time range
    const shift = shifts.find(s => s.name === shiftName);
    if (!shift) {
      return { isValid: false, error: "Shift not found." };
    }
    
    if (startTime < shift.start || endTime > shift.end) {
      return { isValid: false, error: `Assignment must be within shift hours (${shift.start} - ${shift.end}).` };
    }
    
    // Check for overlapping assignments
    const overlappingAssignment = assignments.find(assignment => {
      // Skip the current assignment being updated
      if (currentAssignmentId && assignment.id === currentAssignmentId) {
        return false;
      }
      
      const assignmentStartMinutes = timeToMinutes(assignment.startTime);
      
      // For same driver, check if any time overlaps
      if (assignment.driverId === driverId) {
        const assignmentEndMinutes = timeToMinutes(assignment.endTime);
        
        // 完整的重疊檢測：兩個時間段重疊當且僅當 max(start1, start2) < min(end1, end2)
        const overlapStart = Math.max(startMinutes, assignmentStartMinutes);
        const overlapEnd = Math.min(endMinutes, assignmentEndMinutes);
        return overlapStart < overlapEnd;
      }
      
      // For different drivers, only check if start time overlaps
      return startMinutes === assignmentStartMinutes;
    });
    
    if (overlappingAssignment) {
      return { isValid: false, error: "Assignment overlaps with an existing assignment." };
    }
    
    return { isValid: true };
  }, [drivers, assignments, timeToMinutes]);

  const value = useMemo(() => ({
    drivers,
    shifts,
    assignments,
    addAssignment,
    removeAssignment,
    updateAssignment,
    isValidAssignment,
    error,
    setError
  }), [drivers, assignments, addAssignment, removeAssignment, updateAssignment, isValidAssignment, error]);

  return (
    <ShiftPlannerContext.Provider value={value}>
      {children}
    </ShiftPlannerContext.Provider>
  );
};

// Custom hook to use the context
export const useShiftPlanner = () => {
  const context = useContext(ShiftPlannerContext);
  if (!context) {
    throw new Error('useShiftPlanner must be used within a ShiftPlannerProvider');
  }
  return context;
}; 