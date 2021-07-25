import * as cdk from '@aws-cdk/core';
import { BastionConstruct } from './BastionConstruct';
import { RdsConstruct } from './RdsConstruct';
import { ServerConstruct } from './ServerConstruct';
import { UploadAppConstruct } from './UploadAppConstruct';
import { VpcConstruct } from './VpcConstruct';

export interface IPlaygroundStackProps extends cdk.StackProps {
  keyName: string
  rootUser: string,
  rootPassword: string,
  schemaName: string

}
export class PlaygroundStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: IPlaygroundStackProps) {
    super(scope, id, props);

    const vpcConstruct = new VpcConstruct(this, 'RdsPLaygroundVpcConstruct')
    const bastionConstruct = new BastionConstruct(this, 'RdsPLaygroundBastionConstruct', {
      vpc: vpcConstruct.vpc,
      keyName: props.keyName
    })
    const appUploadResult = new UploadAppConstruct(this, 'RdsPLaygroundUploadAppConstruct');

    const serverConstruct = new ServerConstruct(this, 'RdsPLaygroundServerConstruct', {
      vpc: vpcConstruct.vpc,
      keyName: props.keyName,
      bucket: appUploadResult.appBucket
    })

    const rdsConstruct = new RdsConstruct(this, 'RdsPLaygroundRdsConstruct', {
      allowedInSecuritygroups: [
        bastionConstruct.securityGroup,
        serverConstruct.securityGroup
      ],
      vpc: vpcConstruct.vpc,
      rootUser: props.rootUser,
      rootPassword: props.rootPassword
    })

    serverConstruct.instance.addUserData(
      'yum update -y',
      'yum install -y mariadb-server',
      `echo "
      #!/bin/bash
      export APP_PORT=8080
      export APP_RDS_CONNECTION_STRING=mysql://${props.rootUser}:${props.rootPassword}@${rdsConstruct.rds.dbInstanceEndpointAddress}:3306/${props.schemaName}
      " >/home/ec2-user/environment.sh`,
      `aws s3 sync s3://${appUploadResult.appBucket.bucketName} /home/ec2-user/app/`,
      `chown ec2-user -R /home/ec2-user/app/`,
      `systemctl enable app.service`,
      `systemctl start app.service`
    )
  }
}