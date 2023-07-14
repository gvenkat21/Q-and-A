import React, { useState, useEffect } from 'react';
import DataSourceTable from './components/DataSourceTable';
import neatCsv from 'neat-csv';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import './App.css';
import { TextField } from './components/TextField';
import { MultilineText } from './components/MultilineText';
import { Header } from './components/Header';
import { Button, Box } from '@mui/material';
import CircularProgress from "@mui/material/CircularProgress";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: '######',
    secretAccessKey: '#####'
  },
  region: 'us-west-2'
});

// Please tell us what you think about a recent product that you've purchased

function App(props) {
  const [dataSetData, setDataSetData] = useState([]);
  // array of string indexes
  const [dataFilterArray, setDataFilterArray] = useState([]);
  const [buttonText, setButtonText] = useState('Expand Response Datasource');
  const [showDatasource, setShowDatasource] = useState(false);
  const [queryData, setQueryData] = useState("");
  const [requestData, setRequestData] = useState("");
  const [loader, setLoader] = useState(false);


  useEffect(() => {
    const requestOptions = {
      method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryString: queryData })
    }

    if (queryData) {
      // setRequestData("");
      // setDataFilterArray([]);
      // setShowDatasource(false);
      // setButtonText('Expand Response Datasource');

      fetch('/analyzereview', requestOptions).then(res => res.json()).then(data => {
        setRequestData(data.payload);
        setDataFilterArray(data.arrayIndices);
        setLoader(false);
      });
    }
  }, [queryData]);

  useEffect(() => {
    setRequestData("");
    setDataFilterArray([]);
    setShowDatasource(false);
    setButtonText('Expand Response Datasource');
  }, [queryData])


  useEffect(() => {
    const command = new GetObjectCommand({
      Bucket: 'vci-ai-ml-sandbox',
      Key: 'data_cleaned_v4.csv',
      
    });

    s3Client
      .send(command)
      .then((response) => {
        return response.Body.transformToString();
      })
      .then((result) => {
        return neatCsv(result);
      })
      .then((collection) => {
        setDataSetData(collection);
      });
  }, []);



  const onButtonClick = () => {
    if (buttonText === 'Expand Response Datasource') {
      setDataFilterArray(dataFilterArray);
      setShowDatasource(true);
      setButtonText('Collapse Response Datasource');
    } else {
      setShowDatasource(false);
      setButtonText('Expand Response Datasource');
    }
    console.log('clicked');
  };
  return (
    <div className="App">
      <header className="App-header">
        <Header/><br></br><br></br>
        <span>Survey Reviews Summary</span>
      </header>
      <header className="App-subheader">
        <span>Survey Question: Please tell us what you think about a recent product that you've purchased.</span>
      </header>
      <header className="text-field-description">
        <span>
          What would you like to know about the responses to the above question?
        </span>
      </header>
      <TextField
        setQueryData={setQueryData}
        setLoader = {setLoader}
      />
      {loader ? (
        <Box sx={{ display: "flex", justifyContent: "center", padding: '10px' }}>
          <CircularProgress />
        </Box>
      ) : <React.Fragment />}
      {
        requestData ? (
          <MultilineText requestData = {requestData.trimStart()} />
        ) : <React.Fragment />
      }
      {showDatasource && dataFilterArray.length > 0 ? (
        <DataSourceTable
          data={dataSetData}
          filter={dataFilterArray}
        />
      ) : <React.Fragment /> }
      {dataFilterArray.length > 0 ? (
        <Box
        >
          <Button
            disableRipple
            class='submit-button data-source'
            variant="contained"
            onClick={onButtonClick}
          >
            {buttonText}
          </Button>
        </Box>
      ) : <React.Fragment />}
    </div>
  );
}

export default App;
