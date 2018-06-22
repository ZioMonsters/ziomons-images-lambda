const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'eu-west-1' });
const gm = require('gm').subClass({ imageMagick: true });
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
  const background = layers.shift();

  layers.forEach(layer =>
    gm(`./src/layers/${layer}.svg`)
      .background('transparent')
      .colorize(...getColorChangePercentage())
      .write(`/tmp/${layer}_colorize.svg`, err => err ? console.error(err) : console.log('write image colorize')));

  layers.reduce((acc, layer, index) => {
    acc
      .background('transparent')
      .composite(`/tmp/${layer}_colorize.svg`)
      .write(`/tmp/step${index}.svg`, err => {
        if(err) console.error(err);
      });
    return gm(`/tmp/step${index}.svg`);
  }, gm(`./src/layers/${background}.svg`))
    .toBuffer('SVG', (err, buffer) => {
      if(err) console.error(err);
      const putParams = {
        Key: `images/Sprite_${id}.svg`,
        Bucket: 'cryptomon',
        Body: buffer
      };
      s3.putObject(putParams)
        .promise()
        .then(_ => console.log('cryptomon created'))
        .catch(console.error);
    });
};
