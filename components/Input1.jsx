"use client"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function Input1({type, name, placeholder, width , handler, value}) {
  return (
    <Box
      component="form"
      sx={{ '& > :not(style)': { width: width } }}
      noValidate
      autoComplete="off"
    >
      <TextField
      
      onChange={(e)=> handler(e)}
      
      type={type} id="outlined-basic" name={name} value={value} label={placeholder} variant="outlined" size='small' />
    </Box>
  );
}
