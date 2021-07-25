import { AmazonLinuxGeneration, Instance, InstanceClass, InstanceSize, InstanceType, MachineImage, Peer, Port, SecurityGroup, SubnetType, Vpc } from '@aws-cdk/aws-ec2';
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';
import { CfnOutput } from '@aws-cdk/core';

export interface IBastionStackProps {
    vpc: Vpc
    keyName: string
}

export class BastionConstruct extends cdk.Construct {

    public readonly role: Role
    public readonly securityGroup: SecurityGroup
    public readonly instance: Instance

    constructor(scope: cdk.Construct, id: string, props: IBastionStackProps) {
        super(scope, id)
        this.role = new Role(
            scope,
            'rdsPlayground-bastionRole',
            {
                assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
            }
        )
        this.securityGroup = new SecurityGroup(scope, 'rdsPlayground-bastionInstance-sg', {
            allowAllOutbound: true,
            vpc: props.vpc,
            securityGroupName: 'playground-rds-ec2-bastion-sg'
        })
        this.securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22))

        this.instance = new Instance(scope, 'rdsPlayground-bastionInstance', {
            vpc: props.vpc,
            role: this.role,
            instanceName: 'rdsPlayground-bastionInstance',
            securityGroup: this.securityGroup,
            instanceType: InstanceType.of(
                InstanceClass.T2,
                InstanceSize.MICRO
            ),
            machineImage: MachineImage.latestAmazonLinux({
                generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
            }),
            vpcSubnets: {
                subnetType: SubnetType.PUBLIC
            },
            keyName: props.keyName
        })

        new CfnOutput(scope, 'rdsPlayground-bastionInstance-output', {
            description: 'endpoint',
            value: this.instance.instancePublicDnsName
        })

    }
}
