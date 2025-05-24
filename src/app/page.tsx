'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ShiftPlannerProvider } from '@/context/ShiftPlannerContext';
import GanttChart from '@/components/GanttChart';
import { ErrorAlert } from '@/components/ErrorAlert';

export default function Home() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ShiftPlannerProvider>
        <div className="min-h-screen bg-gray-100 p-4">
          <ErrorAlert />
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">ShiftPlanner MVP</h1>
            <p className="text-gray-600">排班系統</p>
          </header>
          
          <main className="flex flex-col md:flex-row gap-4">
            <GanttChart />
          </main>
        </div>
      </ShiftPlannerProvider>
    </DndProvider>
  );
}
