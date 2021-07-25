import { SecurityGroup, SubnetType, Vpc } from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';

export class VpcConstruct extends cdk.Construct {
    public readonly vpc: Vpc
    public readonly vpcSecuritygroup: SecurityGroup

    constructor(scope: cdk.Construct, id: string) {
        super(scope, id)
        this.vpc = new Vpc(this, 'rdsPlayground-vpc', {
            // nat gateways is a hourly cost
            natGateways: 0,
            maxAzs: 2,
            subnetConfiguration: [
                {
                    name: 'isolated',
                    subnetType: SubnetType.ISOLATED,
                },
                {
                    name: 'public',
                    subnetType: SubnetType.PUBLIC,
                }
            ]
        });
        this.vpcSecuritygroup = new SecurityGroup(this, 'rdsPlayground-vpc-sg', {
            vpc: this.vpc,
            securityGroupName: 'rdsPlayground-vpc-sg'
        })
    }
}
