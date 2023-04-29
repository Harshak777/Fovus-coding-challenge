import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as events from 'aws-cdk-lib/aws-lambda-event-sources';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class UtilsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Create DynamoDB table
    const fileTable = new dynamodb.Table(this, 'FileTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'input-storage',
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
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
  projectionType: dynamodb.ProjectionType.ALL,
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

fileTable.addGlobalSecondaryIndex({
  indexName: 'output-file-path-index',
  partitionKey: {
    name: 'output_file_path',
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
  bucketName: 'fovus-challenge-input-bucket',
  cors: [
    {
      allowedHeaders: ['*'],
      allowedMethods: [
        s3.HttpMethods.GET,
        s3.HttpMethods.POST,
        s3.HttpMethods.PUT,
        s3.HttpMethods.DELETE,
      ],
      allowedOrigins: ['*'],
      exposedHeaders: [],
      maxAge: 3000,
    },
  ],
});

// Create Lambda function
const handler = new lambda.Function(this, 'Handler', {
  functionName: 'dynamoLoader',
  runtime: lambda.Runtime.NODEJS_14_X,
  code: lambda.Code.fromAsset('lambda'),
  handler: 'index.handler'
});

const api = new apigateway.RestApi(this, 'LoadDataToDynamo', {
  defaultMethodOptions: {
    authorizationType: apigateway.AuthorizationType.NONE,
  },
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
    allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
  },
},
);

const myResource = api.root.addResource('send');

// myResource.addMethod('POST', new apigateway.LambdaIntegration(handler));
myResource.addMethod('ANY', new apigateway.LambdaIntegration(handler));

// Grant permissions to Lambda function
fileTable.grantReadWriteData(handler);

const organizer = new lambda.Function(this, 'Organizer', {
  functionName: 'VMInit',
  runtime: lambda.Runtime.NODEJS_14_X,
  code: lambda.Code.fromAsset('organizer'),
  handler: 'index.handler',
  timeout: cdk.Duration.minutes(10),
});

fileTable.grantWriteData(organizer);

organizer.addEventSource(new events.DynamoEventSource(fileTable, {
  startingPosition: lambda.StartingPosition.LATEST,
}));

fileTable.grantStreamRead(organizer);

const scriptBucket = new s3.Bucket(this, 'bucket123', {
  bucketName: 'fovus-challenge-script-bucket',
});

new s3deploy.BucketDeployment(this, 'DeployScript', {
  sources: [s3deploy.Source.asset('./script.zip')],
  destinationBucket: scriptBucket,
  destinationKeyPrefix: '/',
});

  }
}