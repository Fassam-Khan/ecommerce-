"use client"
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Image from 'next/image';

const VisuallyHiddenInput = styled('input')({
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function UploadImg({handler, img}) {

  return (
    <>
    <Button  

    sx={{

    }}
      component="label"
      role={undefined}
      variant=""
      tabIndex={-1}
      
    >
      {img ? (
        <img src={img} alt='l' width={120} height={120}/>
      ): <p>Upload Image</p>}
      <VisuallyHiddenInput
      name="file"
        type="file"
        onChange={(e) => handler(e)}
        
      />
    </Button>
    </>
  );
}
