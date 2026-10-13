"use client"
import * as React from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

function handleClick(event) {
  event.preventDefault();
  console.info('You clicked a breadcrumb.');
}

export default function Breadcrumb({title, active , titleSlug, activeSlug}) {
  return (
    <div role="presentation" onClick={handleClick}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href={titleSlug}>
          {title}
        </Link>
        
        <Link
          underline="hover"
          href={activeSlug}
          aria-current="page"
          sx={{
            color: 'text.primary',
          }}
        >
          {active}
        </Link>
      </Breadcrumbs>
    </div>
  );
}
