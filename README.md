## Fovus Coding Challenge
# Setting up the front end -  REACTJS
(Assuming the local machine has nodejs and npm installed)
1) Open a terminal/cmd and navigate inside the fovus-challenge folder
2) Install all the required packages by using the command `npm i`
3) After successfully installing the package, to start the reactJS use the command `npm run start`. The reactJS application will open up in the default browser.

# Setting up for the AWS Resource -  AWS CDK
1) Open a terminal/cmd and navigate to the utils folder.
2) To use AWS CDK, the system also needs AWS CLI configured with the AWS credentials configured to access the AWS account.
3) Assuming AWS CLI is installed, (you can refer this to link to install AWS CLI for your operating system - [AWS CLI: getting-started-install](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)) use the command `aws configure` to set your AWS credentials such as AWS Access Key ID, AWS Secret Access Key, Default region name. Please remember to use an IAM user which has corresponding access to provision all the resources used in this project.(I used a root user's credentials to configure my AWS CLI).
4) Install the neccesary node modules dependencies inside the lambda and organizer folder using the command `npm i` inside the respective folders.
5) To install AWS CDK, use the command `npm install aws-cdk-lib`.
6) Use the command `cdk boostrap` to create a link between the AWS CLI and AWS CDK.
7) Use the command `cdk synth` to execute the code and translate it into AWS CloudFormation template.
8) Use the command `cdk deploy` to deploy the above translated code to the AWS platform.
9) After successfully deploying the changes, the terminal/cmd will give the API Gateway endpoint. Please note this and paste it in the .env file.

# Setting up .env for REACTJS
Please create a file as .env (you can take the file: /fovus-challenge/src/.env.copy  as reference and fill the values)
1) REACT_APP_ACCESS_KEY_ID= Get this from AWS IAM (I used root's)
2) REACT_APP_SECRET_ACCESS_KEY= Get this from AWS IAM (I used root's)
3) REACT_APP_API_GATEWAY_ENDPOINT= You will get this when deployig the CDK
4) REACT_APP_METHOD= you will see this in CDK (I have made it as 'send')