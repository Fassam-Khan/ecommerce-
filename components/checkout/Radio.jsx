"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function BasicSelect({handler, value, name}) {
  const [payment, setPayment] = React.useState('');

 

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Payment</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value}
          name={name}
          label="Age"
          onChange={(e)=> handler(e)}
          size='small'
        >
          <MenuItem value={"bank"}>Bank Transfer</MenuItem>
          <MenuItem value={"cod"}>COD</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
