const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  region: 'eu-west-1'
});

const binPath = `${process.env['LAMBDA_TASK_ROOT']}/imagemagick/bin`;
process.env['LD_LIBRARY_ROOT'] = `${process.env['LAMBDA_TASK_ROOT']}/imagemagick/lib`;
const gm = require('gm').subClass({ imageMagick: true, appPath: binPath });

const md5 = require ('md5');

const { createReadStream, writeFileSync } = require('fs');
const genomeParser = require('./genomeParser');

const getColorChangePercentage = () => {
  const out = [];
  for (let i = 0; i < 3; i++) {
    const randInt = Math.floor(Math.random() * 100);
    if (randInt > 75) {
      out.push(Math.floor(Math.random() * 100) - 25);
    } else {
      out.push(randInt);
    }
  }
  return out;
};

exports.handler = ({ tokenId }, context, callback) => {

  process.env['PATH'] =`${process.env['PATH']}:${binPath}`;

  const { id, layers } = genomeParser(tokenId);
  const idKey = md5(id.toString());

  s3.headObject({
    Bucket: 'cryptomon',
    Key: `monsters/${idKey}.svg`
  }).promise()
    .then(() => console.log('Sprite monster already created'))
    .catch(() => {
      layers.slice(1)
        .map(layer =>
          gm(`./layers/${layer}.svg`)
            .background('transparent')
            .colorize(...getColorChangePercentage())
            .stream('svg'))
        .forEach((stream, index) => {
          const chunks = [];
          stream.on('data', chunk => chunks.push(chunk));
          stream.once('end', () => writeFileSync(`/tmp/${index}.svg`, Buffer.concat(chunks)));
        });

      const chunks = [];
      layers.slice(1).reduce((acc, layer, index) =>
        gm(acc, '*.svg')
          .background('transparent')
          .composite(`/tmp/${index}.svg`)
          .stream('svg'), createReadStream(`./layers/${layers[0]}.svg`))
        .on('data', chunk => chunks.push(chunk))
        .once('end', () => {
          s3.putObject({
            Key: `monsters/${idKey}.svg`,
            Bucket: 'cryptomon',
            Body: Buffer.concat(chunks)
          }).promise()
            .then(_ => console.log('upload on s3'))
            .catch(console.error);
        });
    });
};
