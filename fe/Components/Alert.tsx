import React from 'react';
import { Alert, AlertTitle, CircularProgress, Box } from '@mui/material';

interface LoadingProps {
    message?: string;
    status?: 'loading' | 'success' | 'error';
}

const Loading: React.FC<LoadingProps> = ({
    message = 'Đang tải...',
    status = 'loading',
}) => {
    // Map status to MUI Alert severity
    const getSeverity = () => {
        switch (status) {
            case 'success':
                return 'success';
            case 'error':
                return 'error';
            default:
                return 'info';
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100px',
            }}
        >
            <Alert
                severity={getSeverity()}
                icon={
                    status === 'loading' ? (
                        <CircularProgress size={20} />
                    ) : undefined
                }
                sx={{
                    width: 'fit-content',
                    maxWidth: '400px',
                    padding: '8px',
                }}
            >
                <AlertTitle>
                    {status === 'loading'
                        ? 'Processing'
                        : status === 'success'
                        ? 'Success'
                        : 'Error'}
                </AlertTitle>
                {message}
            </Alert>
        </Box>
    );
};

export default Loading;
