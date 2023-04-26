import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';


export class LibStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
 // Create DynamoDB table
 const fileTable = new dynamodb.Table(this, 'FileTable', {
  partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
  tableName: 'fovustable'
});

// Create S3 bucket
const bucket = new s3.Bucket(this, 'bucket', {
  bucketName: '1-fovus-bucket-name', // Change this to a unique name
  removalPolicy: cdk.RemovalPolicy.DESTROY, // Only for testing purposes
});

// Create Lambda function
const handler = new lambda.Function(this, 'Handler', {
  runtime: lambda.Runtime.NODEJS_14_X,
  code: lambda.Code.fromAsset('lambda'),
  handler: 'index.handler',
  environment: {
    TABLE_NAME: fileTable.tableName,
    BUCKET_NAME: bucket.bucketName,
  },
});

// Grant permissions to Lambda function
fileTable.grantReadWriteData(handler);
bucket.grantReadWrite(handler);

// Create API Gateway
const api = new apigateway.RestApi(this, 'Api', {
  restApiName: 'SaveInputsApi',
});


// Create resource and method
const resource = api.root.addResource('save');
const method = resource.addMethod('POST',new apigateway.LambdaIntegration(handler));

// Connect Lambda function to API Gateway

  }
}
