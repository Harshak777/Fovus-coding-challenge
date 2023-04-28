import React, { useState } from 'react';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { APIGatewayClient, CreateResourceCommand } from "@aws-sdk/client-api-gateway";

// Configure AWS S3 credentials
const s3Client = new S3Client({ region: "us-east-1",
credentials: {
  accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID, 
  secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY
},
});

const apiGatewayClient = new APIGatewayClient({ region: 'us-east-1',
credentials: {
  accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID, 
  secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY
},
});

const createResourceCommand = new CreateResourceCommand({
  restApiId: 'y1ejrwiam4',
  parentId: 'i4gy7bydp3',
  pathPart: '/send',
});


const App = () => {
  const [textInput, setTextInput] = useState('');
  const [fileContent, setFileContent] = useState('');

  const handleTextInputChange = (event) => {
    setTextInput(event.target.value);
  }

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    console.log(event.target.files[0]);

    setFileContent(file);
    // const reader = new FileReader();

    // reader.onload = (e) => {
    //   setFileContent(e.target.result);
    // };

    // reader.readAsText(file);
  }

  const handleFileUpload = async (file) => {
    console.log("file:")
    console.log(file)

    try {
      // Set the S3 bucket name and key (file name)
      const bucketName = process.env.REACT_APP_S3_BUCKET_NAME;
      const key = file.name;

      // Create a new S3 PutObject request
      const params = {
        Bucket: bucketName,
        Key: key,
        Body: file
      };

      console.log("came here")
      console.log(params);

      // Upload the file to S3
      const uploadCommand = new PutObjectCommand(params);
      await s3Client.send(uploadCommand);

      console.log("File uploaded successfully.");

      // API Gateway code
      // const url = 'https://y1ejrwiam4.execute-api.us-east-1.amazonaws.com/prod/';
      // const Lambdaparams = { param1: textInput, param2: key };
      // const response = await fetch(url, {
      //   method: 'POST',
      //   body: JSON.stringify(Lambdaparams),
      // });
      // console.log(Lambdaparams)
      // const json = await response.json();
      // console.log(json.result);

      apiGatewayClient.send(createResourceCommand).then(
        (data) => {
          console.log(data);
        },
        (error) => {
          console.log(error);
        }
      );

    } catch (err) {
      console.error("Failed to upload file:", err);
    }

  };
  

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle submit logic here
    console.log('Text Input:', textInput);
    console.log('File Content:', fileContent);
    handleFileUpload(fileContent);
  }

  return (
    <div>
      <h1>Responsive Web UI</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Text Input:
          <input type="text" value={textInput} onChange={handleTextInputChange} />
        </label>
        <br />
        <label>
          File Input:
          <input type="file" onChange={handleFileInputChange} />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;