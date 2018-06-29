const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'eu-west-1' });
const gm = require('gm').subClass({ imageMagick: true });
const { writeFileSync } = require('fs');
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
  const { id, layers } = genomeParser(tokenId);
  const idKey = id.toString().split().reverse().join('');

  s3.headObject({
    Bucket: 'cryptomon',
    Key: `monsters/${idKey}.svg`
  }).promise()
    .then(_ => console.log('Sprite monster already created'))
    .catch(_ => {
      layers.slice(1).forEach(layer =>
        gm(`./layers/${layer}.svg`)
          .background('transparent')
          .colorize(...getColorChangePercentage())
          .toBuffer('SVG', (err, buffer) => {
            if(err) console.error(err);
            writeFileSync(`/tmp/${layer}.svg`, buffer)
          }));


      const final = layers.slice(1).reduce((acc, layer) =>
        gm(acc)
          .background('transparent')
          .composite(`/tmp/${layer}.svg`), `./layers/${layers[0]}.svg`);

      final.toBuffer('SVG', (err, buffer) => {
        s3.putObject({
        Key: `monsters/${idKey}.svg`,
        Bucket: 'cryptomon',
        Body: buffer
      }).promise()
        .then(_ => console.log('upload on s3'))
        .catch(console.error);
      })

    //   const chunks = [];
    //   stream.on('data', chunk => chunks.push(chunk));
    //   stream.once('end', () => {
    //     s3.putObject({
    //       Key: `monsters/${idKey}.svg`,
    //       Bucket: 'cryptomon',
    //       Body: Buffer.concat(chunks)
    //     }).promise()
    //       .then(_ => console.log('upload on s3'))
    //       .catch(console.error);
    //   });
    // });
};
