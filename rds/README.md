# Web app backed by RDS instance deployed via CDK

This application uses typescript only.
The application uses
* express Http traffic
* prisma for persistence

![image](/rds/overview.png)

                            The end result
---
## Prerequsites:

1. Have an AWS account with a keyPair created, details to how to create one:
**PELASE REMEMBER THE NAME**: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html#having-ec2-create-your-key-pair

2. Have NodeJs installed, atleast v14.12.0, [Link to install](https://nodejs.org/en/download/)

3. Have mysqlWorkbench installed, [Link to install](https://dev.mysql.com/downloads/workbench/)

4. Have aws cli installed [Link to install](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
    * [For config of aws cli](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)


---
## The actual steps for running this project

1. Setup aws cli config 
Run the command
```
aws config configure 
```
Fill in the details from step 4, the config link section: Access key ID and secret access key. This will allow you to use the aws cli and issue commands.

2. Configure the source code
At the directory:
projectRoot/rds/bin/playground.ts
alter the details are you want, the schema, rootPassword and rootUser are details of the Database. The keyName is your keyname create at prerequisite step 1

```
...
new PlaygroundStack(app, 'PlaygroundStack', {
    rootPassword: 'password',
    rootUser: 'user',
    keyName: 'work',
    schemaName: 'test',
...
});
...
```
3. Start deploying
At the directory:
projectRoot/rds
run 
```
cdk boostrap // <-- This will use your awscli to bootstrap cdk to your reigion. Then you can deploy using cdk

npm install // <-- To install project dependencies

cdk deploy // <-- To acturally deploy the infastructure and code, might take 10-20 minutes to complete
```
You should see the output somthing like

![image](/rds/deploymentOutput.png)

### Finished !!!

### To take down the AWS resources
From directory:
projectRoot/rds
run 
```
    cdk destroy
```
---

## Extra steps
When the deployment has finished. You shuold see 4 outputs:
RDSPlaygroundRDSConstructrdsEndpoint <-- this is the endpoint for RDS 
rdsPlaygroundappS3bucketName <-- this is the bucket where the application code lives
rdsPlaygroundbastionInstanceoutput <-- this is the Ec2 bastion for ssh tunneling
rdsPlaygroundserverInstanceoutput <-- this is the app Ec2 Instance 


1. signup a user

```
    curl --location --request POST 'ec2-35-176-186-187.eu-west-2.compute.amazonaws.com:8080/signup' \
    --header 'Content-Type: application/json' \
    --data-raw '{
    "name": "Pretender",
    "email": "noWhere@home.com",
    "post": [{
    "title": "article one",
    "content": "This is why I am in this business"
    }]
    }'
```
2. List all Users

```
    curl --location --request GET 'ec2-35-176-186-187.eu-west-2.compute.amazonaws.com:8080/users'
```
3.  Submit a post in draft
```
curl --location --request POST 'ec2-35-176-186-187.eu-west-2.compute.amazonaws.com:8080/post' \
--header 'Content-Type: application/json' \
--data-raw '{
 "authorEmail": "noWhere@home.com",
    "title": "another show",
    "content":"more content"
}'
```

4. list current feeds
```
curl ec2-35-176-186-187.eu-west-2.compute.amazonaws.com:8080/feed
```
5. Publish a Post
```
curl --location --request PUT 'ec2-35-176-186-187.eu-west-2.compute.amazonaws.com:8080/publish/1'
//then
ec2-35-176-186-187.eu-west-2.compute.amazonaws.com:8080/feed
```

---
## Setup Tunneling
To get access to your data
1. Create new connect using the output from the deployment
    ![image](/rds/mysql.png)
    
    As connection method use 
    'standard TCP/IP over SSH'
    SSH Host name is the bastion server
    SSH username is ec-2-user
    SSH key file is the path of the key pair downloaded
    mySQL Hostname is the RDS instance 
    user name and password is the user found in step 2 of 
    **The actual steps for running this project** section, 
    It is in this file:
    <root of project>/rds/bin/playground.ts

When you connect you should see a schema and hopefully tables and if you executed some commands, data!!!

---

### CDK commands
The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

