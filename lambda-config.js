module.exports = env => ({
  Region: 'eu-west-3',
  ConfigOptions: {
    FunctionName: `cryptomon-images-lambda-${env}`,
    Description: 'build cryptomon sprite',
    Role: 'arn:aws:iam::477398036046:role/cryptomon-images-lambda',
    Handler: 'index.handler',
    MemorySize: 512,
    Timeout: 30,
    Runtime: 'nodejs8.10',
    Environment: {
      Variables: {
        NODE_ENV: env
      }
    }
  }
});
