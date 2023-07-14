import React from 'react';
import { Box } from '@mui/material';



export function MultilineText({requestData}){
    if(requestData !== null ){
        return (
            <Box
                sx={{
                    opacity: requestData ? "1" : "0",
                    transition: "all .5s",
                }}
            >
                <label>
                    <textarea className="multiline-text" type="text" value={requestData} />
                </label>
            </Box>
        );
    }else{

    }  
}