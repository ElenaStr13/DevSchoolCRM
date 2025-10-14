import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router/Router';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <ThemeProvider theme={theme}>
    <RouterProvider router={router}/>
    </ThemeProvider>
);
