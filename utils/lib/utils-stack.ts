import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';


export class UtilsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Create DynamoDB table
    const fileTable = new dynamodb.Table(this, 'FileTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'input-storage'
});

fileTable.addGlobalSecondaryIndex({
  indexName: 'input-text-index',
  partitionKey: {
    name: 'input_text',
    type: dynamodb.AttributeType.STRING
  },
  sortKey: {
    name: 'id',
    type: dynamodb.AttributeType.STRING
  },
  projectionType: dynamodb.ProjectionType.ALL
});

// Add an input file path field to the table
fileTable.addGlobalSecondaryIndex({
  indexName: 'input-file-path-index',
  partitionKey: {
    name: 'input_file_path',
    type: dynamodb.AttributeType.STRING
  },
  sortKey: {
    name: 'id',
    type: dynamodb.AttributeType.STRING
  },
  projectionType: dynamodb.ProjectionType.ALL
});

// Create S3 bucket
const bucket = new s3.Bucket(this, 'bucket', {
  bucketName: 'fovus-challenge-input-bucket', // Change this to a unique name
});

// Create Lambda function
const handler = new lambda.Function(this, 'Handler', {
  functionName: 'dummy',
  runtime: lambda.Runtime.NODEJS_14_X,
  code: lambda.Code.fromAsset('lambda'),
  handler: 'index.handler',
  // environment: {
  //   TABLE_NAME: fileTable.tableName,
  //   BUCKET_NAME: bucket.bucketName,
  // },
});

// Grant permissions to Lambda function
fileTable.grantReadWriteData(handler);
bucket.grantReadWrite(handler);

// Create API Gateway
const api = new apigateway.RestApi(this, 'Api', {
  restApiName: 'SendToDynamo',defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
    allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
  },
});


// Create resource and method
const resource = api.root.addResource('send');
const method = resource.addMethod('POST',new apigateway.LambdaIntegration(handler));

// Connect Lambda function to API Gateway

  }
}