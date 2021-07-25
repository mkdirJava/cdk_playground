import { expect as expectCDK, matchTemplate, MatchStyle, SynthUtils, haveResource, expect as cdkExpect } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { PlaygroundStack } from '../lib/playground-stack';
import * as jest from 'jest';

describe("playground", () => {
  test('this test shows you the drift from last commited code', () => {
    const app = new cdk.App();
    const stack = new PlaygroundStack(app, 'MyTestStack', {
      rootPassword: 'password',
      rootUser: 'user',
      keyName: 'work',
      schemaName: 'test',
    });
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });

  test('stack configuration', () => {
    const app = new cdk.App();
    // WHEN
    const rootPassword = 'password'
    const rootUser = 'user'
    const schema = 'test'
    const keyName = 'work'

    const stack = new PlaygroundStack(app, 'MyTestStack', {
      rootPassword: 'password',
      rootUser: 'user',
      keyName: 'work',
      schemaName: 'test',
    });

    cdkExpect(stack).to(haveResource('AWS::RDS::DBInstance', {
      MasterUserPassword: rootPassword,
      MasterUsername: rootUser
    }))

  });

})
