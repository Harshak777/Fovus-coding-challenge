import React, { useState } from 'react';
import AWS from 'aws-sdk';

// Configure AWS S3 credentials
AWS.config.update({
  accessKeyId: 'AKIARY5SVF3I3NKUN274',
  secretAccessKey: 'gVFNXkKP770xZ/rjhIGZvQFkQ1YZ/uaZA473a8UW',
  region: 'us-east-1' // Replace with your desired AWS S3 region
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

  const handleFileUpload = (file) => {
    console.log("file:")
    console.log(file)
    // Create an instance of the S3 service
    const s3 = new AWS.S3();
  
    // Set the S3 bucket name and key (file name)
    const bucketName = 'fovus-challenge-input-bucket';
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
    s3.upload(params, (err, data) => {
      if (err) {
        console.error(err);
      } else {
        console.log('File uploaded successfully:', data);
        // Handle successful upload, e.g., update UI, show success message, etc.
      }
    });
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

