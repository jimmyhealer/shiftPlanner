import { ShiftPlannerProvider } from '@/context/ShiftPlannerContext';
import { ErrorAlert } from '@/components/ErrorAlert';

function App() {
  return (
    <ShiftPlannerProvider>
      <ErrorAlert />
      {/* Your other components */}
    </ShiftPlannerProvider>
  );
}

export default App; 