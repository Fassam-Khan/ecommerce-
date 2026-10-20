
"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

export default function Input1({
  type,
  name,
  placeholder,
  width = "100%",
  handler,
  value,
}) {
  return (
    <Box
      sx={{ "& > :not(style)": { width: width } }}
      noValidate
      autoComplete="off"
    >
      <TextField
        onChange={handler}
        type={type}
        id={name || "outlined-basic"}
        name={name}
        value={value}
        label={placeholder}
        variant="outlined"
        size="small"
      />
    </Box>
  );
}
