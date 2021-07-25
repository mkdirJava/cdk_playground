import { InstanceClass, InstanceSize, InstanceType, Port, SecurityGroup, SubnetType, Vpc } from "@aws-cdk/aws-ec2";
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, MysqlEngineVersion } from "@aws-cdk/aws-rds";
import { CfnOutput, Construct, RemovalPolicy, SecretValue } from "@aws-cdk/core";
import { runInThisContext } from "vm";

export interface IRdsConstruct {
    allowedInSecuritygroups: SecurityGroup[]
    vpc: Vpc
    rootUser: string,
    rootPassword: string
}

export class RdsConstruct extends Construct {

    public readonly securityGroup: SecurityGroup
    public readonly rds: DatabaseInstance

    constructor(scope: Construct, id: string, props: IRdsConstruct) {
        super(scope, id)

        this.securityGroup = new SecurityGroup(this, 'rdsSecuritygroup', {
            vpc: props.vpc,
            securityGroupName: 'rdsPlayground-rds-sg'
        })
        props.allowedInSecuritygroups.forEach((sg: SecurityGroup) => {
            this.securityGroup.addIngressRule(sg, Port.tcp(3306))
        })
        this.rds = new DatabaseInstance(this, 'rdsPlayground-rds', {
            engine: DatabaseInstanceEngine.mysql({
                version: MysqlEngineVersion.VER_5_7_33
            }),
            instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: SubnetType.ISOLATED
            },
            removalPolicy: RemovalPolicy.DESTROY,
            credentials: Credentials.fromPassword(props.rootUser, SecretValue.plainText(props.rootPassword)),
            maxAllocatedStorage: 200,
            securityGroups: [this.securityGroup],
        })

        new CfnOutput(this, 'rds-Endpoint', {
            description: 'rds endpoint',
            value: this.rds.instanceEndpoint.hostname
        })
    }
}