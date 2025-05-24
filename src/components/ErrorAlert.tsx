import { Alert, Snackbar } from '@mui/material';
import { useShiftPlanner } from '@/context/ShiftPlannerContext';

export const ErrorAlert = () => {
  const { error, setError } = useShiftPlanner();

  const handleClose = () => {
    setError(null);
  };

  return (
    <Snackbar
      open={!!error}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
        {error}
      </Alert>
    </Snackbar>
  );
}; 