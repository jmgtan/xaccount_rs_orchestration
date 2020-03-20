# Cross Account Redshift ETL Orchestration

## Pre-Requisites

### AWS SAM
This example code uses SAM to do the deployment. Instructions on how to install SAM can be found [here](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).

### IAM Role in Target Account
**Target Account** contains the running Redshift cluster that you would be accessing. In order for the Lambda functions to access the Redshift cluster in the target account, it would need to assume a role. The following is an example policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "redshift:DescribeClusters",
                "redshift:PauseCluster",
                "redshift:ResumeCluster"
            ],
            "Resource": "*"
        }
    ]
}
```

With the following trust relationship:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::<account id where orchestration will run>:root"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Take note of the `Role ARN`, because this will be used as input for the CloudFormation template.

### S3 Bucket / Folder in the Orchestration Account
This bucket would be used to stage the Lambda artifacts as part of the deployment.

## Getting Started

### Clone the Repository
Close the repository using the following command:

```bash
git clone https://github.com/jmgtan/xaccount_rs_orchestration
cd xaccount_rs_orchestration
```

### SAM Build/Package/Deploy
Run the following command to download dependencies via NPM:

```bash
sam build
cd .aws-sam/build
```

The package procedure would then zip up the artifacts and upload them to S3, this will then generate a new template.yaml file which has updated S3 paths for the Lambda functions.

```bash
sam package -t template.yaml --s3-bucket <s3bucket> --s3-prefix <optional prefix/folder> --output-template-file packaged.yaml
```

Lastly, you can deploy the template using the following command:

```bash
sam deploy --template-file packaged.yaml --stack-name <stack name> --capabilities CAPABILITY_IAM --guided
```

Follow the guide and make sure to paste the `Role Arn` that was created in the target account.

## State Machines

There are 3 Step Functions State Machines that are created as part of the CloudFormation template, these are as follows:

1. ResumeClusterStateMachine
2. PauseClusterStateMachine
3. SampleProcessingStateMachine

The first 2 are self-explanatory, they're reusable state machines. You can view the 3rd state machine to see how you can use the Pause and Resume state machines as [nested workflows](https://docs.aws.amazon.com/step-functions/latest/dg/connect-stepfunctions.html).

To test it, you can pass the following execution parameters:

```json
{
  "clusterId": "<redshift cluster identifier>",
  "targetAccountRole": "<role arn that will be assumed>"
}
```