import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemText } from '@mui/material';

function DataSourceTable(props) {
    const [displayData, setDisplayData] = useState([]);

    useEffect(() => {
        const filterDict = {};
        const newDisplayData = [];

        props.filter.forEach((index) => {
            filterDict[index] = true;
        });

        props.data.forEach((element) => {
            if (filterDict[element.index])
            newDisplayData.push(element);
        });

        setDisplayData(newDisplayData);
    }, [props.data, props.filter])

    return (
        <Box
            id='dataSourceTableContainer'
            sx={{
                display: 'flex',
                'justify-content': 'center',
                'margin-bottom': '10px',
                opacity: displayData.length > 0 ? "1" : "0",
                transition: "all .5s",
                'flex-direction': 'column'
            }}
        >
            <Box
                id='dataSourceTableDescription'
                sx={{}}
            >
                We used the following responses to compile the answer:
            </Box>
            <List
                id='dataSourceTable'
                sx={{
                    width: '75vw',
                    height: '300px',
                    maxWidth: '600px',
                    'overflow-y': 'scroll',
                    'margin-left': 'auto',
                    'margin-right': 'auto'
                }}
            >
                {displayData.map(({ index, full_review }, mapIndex) => {
                    return (
                        <ListItem
                            id={`dataSourceTableItem_${index}`}
                            key={index}
                            sx={{
                                display: 'flex',
                                width: '100%',
                                'border-radius': '10px',
                                'background-color': (mapIndex % 2) === 0 ? '#3D3835' : '#3D3835',
                                'margin-bottom': '8px'
                            }}
                        >
                            <ListItemText
                                sx={{
                                    color: 'white'
                                }}
                                primary={full_review}
                            />
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
}

export default DataSourceTable;
