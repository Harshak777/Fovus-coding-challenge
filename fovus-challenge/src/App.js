import React, { useState } from 'react';

const App = () => {
  const [textInput, setTextInput] = useState('');
  const [fileContent, setFileContent] = useState('');

  const handleTextInputChange = (event) => {
    setTextInput(event.target.value);
  }

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      setFileContent(e.target.result);
    };

    reader.readAsText(file);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle submit logic here
    console.log('Text Input:', textInput);
    console.log('File Content:', fileContent);
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

