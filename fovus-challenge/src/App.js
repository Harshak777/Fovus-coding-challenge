// import React, { useState } from 'react';
// import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// // import { Credentials } from "@aws-sdk";

// // Configure AWS S3 credentials
// const s3Client = new S3Client({ region: "us-east-1",
// credentials: {
//   accessKeyId: "AKIARY5SVF3I3NKUN274", 
//   secretAccessKey: "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", 
// },
// });


// const App = () => {
//   const [textInput, setTextInput] = useState('');
//   const [fileContent, setFileContent] = useState('');

//   const handleTextInputChange = (event) => {
//     setTextInput(event.target.value);
//   }

//   const handleFileInputChange = (event) => {
//     const file = event.target.files[0];
//     console.log(event.target.files[0]);

//     setFileContent(file);
//     // const reader = new FileReader();

//     // reader.onload = (e) => {
//     //   setFileContent(e.target.result);
//     // };

//     // reader.readAsText(file);
//   }

//   const handleFileUpload = async (file) => {
//     console.log("file:")
//     console.log(file)

//     try {
//       // Set the S3 bucket name and key (file name)
//       const bucketName = 'fovus-challenge-input-bucket';
//       const key = file.name;

//       // Create a new S3 PutObject request
//       const params = {
//         Bucket: bucketName,
//         Key: key,
//         Body: file
//       };

//       console.log("came here")
//       console.log(params);

//       // Upload the file to S3
//       const uploadCommand = new PutObjectCommand(params);
//       await s3Client.send(uploadCommand);

//       console.log("File uploaded successfully.");
//     } catch (err) {
//       console.error("Failed to upload file:", err);
//     }

//   };
  

//   const handleSubmit = (event) => {
//     event.preventDefault();
//     // Handle submit logic here
//     console.log('Text Input:', textInput);
//     console.log('File Content:', fileContent);
//     handleFileUpload(fileContent);
//   }

//   return (
//     <div>
//       <h1>Responsive Web UI</h1>
//       <form onSubmit={handleSubmit}>
//         <label>
//           Text Input:
//           <input type="text" value={textInput} onChange={handleTextInputChange} />
//         </label>
//         <br />
//         <label>
//           File Input:
//           <input type="file" onChange={handleFileInputChange} />
//         </label>
//         <br />
//         <button type="submit">Submit</button>
//       </form>
//     </div>
//   );
// }

// export default App;

import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import AWS from 'aws-sdk';

AWS.config.update({ region: 'us-east-1' });

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = 'fovustable';
const bucketName = '1-fovus-bucket-name';

const lambdaFunction = new AWS.Lambda({
  region: 'us-east-1',
  credentials: {
      accessKeyId: "AKIARY5SVF3I3NKUN274", 
      secretAccessKey: "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", 
    },
});

// const apiGateway = new AWS.ApiGatewayManagementApi({
//   endpoint: 'https://6f1lg3ct3k.execute-api.us-east-1.amazonaws.com/',
// });

const apiGatewayUrl = 'https://6f1lg3ct3k.execute-api.us-east-1.amazonaws.com/prod/save';

const saveData = (inputText, inputFilePath) => {
  const id = nanoid();

  const data = {
    id: id,
    input_text: inputText,
    input_file_path: `${bucketName}/${inputFilePath}.txt`,
  };

  const params = {
    FunctionName: 'LibStack-Handler886CB40B-X4QL8q02ex1v',
    Payload: JSON.stringify(data),
  };

  lambdaFunction.invoke(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      saveToDynamoDB(id, inputText, `${bucketName}/${inputFilePath}.txt`);
      sendToApiGateway(id, inputText, `${bucketName}/${inputFilePath}.txt`);
    }
  });
};

const saveToDynamoDB = (id, inputText, inputFilePath) => {
  const params = {
    TableName: tableName,
    Item: {
      id: id,
      input_text: inputText,
      input_file_path: inputFilePath,
    },
  };

  dynamodb.put(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
};

const sendToApiGateway = (id, inputText, inputFilePath) => {
  const params = {
    Data: JSON.stringify({
      id: id,
      input_text: inputText,
      input_file_path: inputFilePath,
    }),
    Endpoint: apiGatewayUrl,
  };

  // apiGateway.postToConnection(params, (err, data) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log(data);
  //   }
  // });
};

function App() {
  const [inputText, setInputText] = useState('');
  const [inputFilePath, setInputFilePath] = useState('');

  const handleSave = () => {
    saveData(inputText, inputFilePath);
  };

  return (
    <div>
      <h1>HELLO</h1>
   
    <div>
      
      <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} />
      <input type="text" value={inputFilePath} onChange={(e) => setInputFilePath(e.target.value)} />
      <button onClick={handleSave}>Save</button>
    </div>
    </div>
  );
}

export default App;

