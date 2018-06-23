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

  const arrayLayers = [ [...layers.slice(1)], [...layers.slice(2)] ];
  arrayLayers.forEach((array, index) => {
    let path;
    let Key;
    (index === 0) ? path = './src/layers/' : path = '/tmp/';
    (index === 0) ? Key = `images/Sprite_${id}_BG.svg` : Key = `images/Sprite_${id}.svg`;
    const stream = array.reduce((acc, layer) =>
      gm(acc, '*.svg')
        .background('transparent')
        .composite(`/tmp/${layer}.svg`)
        .stream('svg'), createReadStream(`${path}${layers[index]}.svg`));

    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.once('end', () => {
      s3.putObject({
        Key,
        Bucket: 'cryptomon',
        Body: Buffer.concat(chunks)
      }).promise()
        .then(_ => console.log('upload on s3'))
        .catch(console.error);
    })
  });
};
