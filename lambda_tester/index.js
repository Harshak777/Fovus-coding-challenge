const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { nanoid } = require('nanoid');

exports.handler = async (event, context, callback) => {
  console.log("hello");
  console.log(event);
  const body = JSON.parse(event.body);
  const inputText = body.input_text;
  const inputFilepath = body.input_file_path
  const recordId = nanoid();

  const REGION = "us-east-1";

  const dynamoClient = new DynamoDBClient({ region: REGION });

  // const params = {
  //   TableName: 'input-storage',
  //   Item: 
  // };
  const TABLE_NAME = 'input-storage';

  const item = {
    id: { S: recordId },
    input_text: { S: inputText },
    input_file_path:{ S: inputFilepath}
  };

  const putItemCommand = new PutItemCommand({
    TableName: TABLE_NAME,
    Item: item,
  });

  try {
    const response = await dynamoClient.send(putItemCommand);
    console.log("Item inserted successfully:", response);
    // callback(null, "Success!");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Record saved successfully' })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error saving record' })
    };
    // console.error("Error inserting item:", err);
    // callback(err);
  }
};