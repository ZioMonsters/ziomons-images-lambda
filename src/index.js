const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'eu-west-1' });
const gm = require('gm').subClass({ imageMagick: true });
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

exports.handler = (event, context, callback) => {
  const { id, layers } = genomeParser(event);

  layers.slice(1).forEach(layer =>
    gm(`./src/layers/${layer}.svg`)
      .background('transparent')
      .colorize(...getColorChangePercentage())
      .toBuffer('SVG', (err, buffer) => {
        if(err) console.log(err);
        writeFileSync(`/tmp/${layer}.svg`, buffer)
      }));

  const stream = layers.slice(1).reduce((acc, layer) =>
    gm(acc)
      .background('transparent')
      .composite(`/tmp/${layer}.svg`)
      .stream('svg'), createReadStream(`./src/layers/${layers[0]}.svg`));

  const chunks = [];
  stream.on('data', (chunk) => chunks.push(chunk));
  stream.once('end', () => {
    s3.putObject({
      Key: `images/Sprite_${id}.svg`,
      Bucket: 'cryptomon',
      Body: Buffer.concat(chunks)
    }).promise()
      .then(_ => console.log('upload on s3'))
      .catch(console.error);
  });
};
