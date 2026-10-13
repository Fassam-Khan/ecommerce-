import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export default function Button1({message, handler}) {
  return (
    <Stack direction="row" spacing={2}>
      <Button onClick={handler} variant="contained">{message}</Button>
    
      
    </Stack>
  );
}
