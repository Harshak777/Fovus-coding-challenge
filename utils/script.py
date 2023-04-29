import boto3
import os
import shutil

directory_path = 'dummy/'

stop_message_processor = False

if os.path.isdir(directory_path):
    shutil.rmtree(directory_path)

os.mkdir(directory_path)

# Define the S3 bucket name and file paths
bucket_name = 'fovus-challenge-input-bucket'

# Define the DynamoDB table name and item ID
table_name = 'input-storage'
attribute_name = 'id'

# Initialize the AWS clients for DynamoDB and S3
dynamodb = boto3.client('dynamodb')
s3 = boto3.client('s3')

def dynamoFunction(id):
    response = dynamodb.get_item(
        TableName=table_name,
        Key={
            'id': {'S': id}
        }
    )

    # print(response)

    input_text = response['Item']['input_text']['S']
    input_file_path = response['Item']['input_file_path']['S']

    print(input_file_path)

    file_name = input_file_path.split('/')[1]
    # print(extension, file_name)

    # Download the input file from S3
    s3.download_file(Bucket=bucket_name, Key=file_name, Filename= directory_path + file_name)

    with open(directory_path + file_name, 'r') as f:
        file_contents = f.read()
    
    updated_contents = f"{file_contents} : {input_text}"

    output_file_name = file_name.split('.')[0] + '-OutputFile.txt'

    # Write the updated contents to a new file
    with open(directory_path + output_file_name, 'w') as f:
        f.write(updated_contents)

    s3.upload_file(directory_path + output_file_name, bucket_name, output_file_name)

    dynamodb.put_item(
        TableName=table_name,
        Item={'id': id, 'output_file_path': bucket_name + '/' + output_file_name}
    )

    # table = dynamodb.Table(table_name)
    # table.put_item(Item={'id': id, 'output_file_path': bucket_name + '/' + output_file_name})


id_values = []

response = dynamodb.scan(TableName=table_name)

for item in response['Items']:
    id_value = item[attribute_name]['S']
    id_values.append(id_value)

print(id_values)

for id in id_values:
    dynamoFunction(id)
