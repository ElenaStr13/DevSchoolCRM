import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';


export const PageContainer = styled(Box)(({ theme }) => ({
    backgroundColor: '#4CAF50', // зелений фон як у ТЗ
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
}));

export const FormContainer = styled(Box)(({ theme }) => ({
    backgroundColor: '#ffffff',
    padding: theme.spacing(4),
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '380px',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));


