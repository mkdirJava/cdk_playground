import { Bucket } from "@aws-cdk/aws-s3";
import { BucketDeployment, Source } from "@aws-cdk/aws-s3-deployment";
import { CfnOutput, Construct } from "@aws-cdk/core";
import * as path from 'path'


export class UploadAppConstruct extends Construct {
    public readonly uploadResult: BucketDeployment
    public readonly appBucket: Bucket
    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.appBucket = new Bucket(scope, 'rdsPlayground-appS3', {
            publicReadAccess: false
        });

        this.uploadResult = new BucketDeployment(scope, 'RdsPLaygroundDeployApp', {
            sources: [
                Source.asset(path.join(__dirname, '../app/playground-app'))
            ],
            destinationBucket: this.appBucket,
        });

        new CfnOutput(scope, 'rdsPlayground-appS3-bucketName', {
            description: 'rdsPlayground-appS3-bucketName',
            value: this.appBucket.bucketName
        })
    }
}