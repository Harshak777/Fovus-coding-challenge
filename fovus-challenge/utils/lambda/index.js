const AWS = require('aws-sdk');
const { nanoid } = require('nanoid');

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const requestBody = JSON.parse(event.body);
    const inputText = requestBody.input_text;
    const inputFilepath = requestBody.input_file_path;
    
    // Upload the file to S3 and get the object key
    const s3ObjectKey = await uploadFileToS3(inputFilepath, event.isBase64Encoded ? Buffer.from(requestBody.file, 'base64') : requestBody.file);

    // Generate a unique ID for the record
    const recordId = nanoid();

    // Save the record to DynamoDB
    const params = {
      TableName: 'fovustable',
      Item: {
        id: recordId,
        input_text: inputText,
        input_file_path: inputFilepath,
        s3_object_key: s3ObjectKey,
      },
    };
    await dynamodb.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Record saved successfully' }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error saving record' }),
    };
  }
};

async function uploadFileToS3(filepath, fileContent) {
  const s3Params = {
    Bucket: '1-fovus-bucket-name',
    Key: filepath,
    Body: fileContent,
  };

  const s3Response = await s3.upload(s3Params).promise();
  return s3Response.Key;
}