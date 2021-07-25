import { AmazonLinuxGeneration, Instance, InstanceClass, InstanceSize, InstanceType, MachineImage, Peer, Port, SecurityGroup, SubnetType, Vpc } from '@aws-cdk/aws-ec2';
import { PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { Bucket } from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { CfnOutput } from '@aws-cdk/core';

export interface IBastionStackProps {
    vpc: Vpc
    keyName: string
    bucket: Bucket
}

export class ServerConstruct extends cdk.Construct {

    public readonly role: Role
    public readonly securityGroup: SecurityGroup
    public readonly instance: Instance

    constructor(scope: cdk.Construct, id: string, props: IBastionStackProps) {
        super(scope, id)
        this.role = new Role(
            scope,
            'rdsPlayground-serverRole',
            {
                assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
            }
        )
        this.role.addToPolicy(new PolicyStatement({
            resources: [
                props.bucket.bucketArn,
                `${props.bucket.bucketArn}/*`
            ],
            actions: [
                's3:GetObject',
                's3:ListBucket'
            ]
        }))
        this.securityGroup = new SecurityGroup(scope, 'rdsPlayground-serverInstance-sg', {
            allowAllOutbound: true,
            vpc: props.vpc,
            securityGroupName: 'rdsPlayground-serverInstance-sg'
        })
        this.securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(8080))
        this.securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(443))
        this.securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22))

        this.instance = new Instance(scope, 'rdsPlayground-serverInstance', {
            vpc: props.vpc,
            role: this.role,
            instanceName: 'rdsPlayground-serverInstance',
            securityGroup: this.securityGroup,
            instanceType: InstanceType.of(
                InstanceClass.T2,
                InstanceSize.MICRO
            ),
            machineImage: MachineImage.genericLinux({
                'eu-west-2': 'ami-0440d46c51f4e0817'
            }),
            vpcSubnets: {
                subnetType: SubnetType.PUBLIC
            },
            keyName: props.keyName
        })
        
        new CfnOutput(scope, 'rdsPlayground-serverInstance-output', {
            description: 'endpoint',
            value: this.instance.instancePublicDnsName
        })

    }
}
