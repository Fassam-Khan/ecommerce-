import Checkbox from '@mui/material/Checkbox';

const label = { slotProps: { input: { 'aria-label': 'Checkbox demo' } } };

export default function CheckBox1() {
  return (
    <div>
      <Checkbox {...label} defaultChecked />
    
    </div>
  );
}
