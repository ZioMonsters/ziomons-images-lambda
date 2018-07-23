const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'eu-west-1' });

const File = require('vinyl');
const SVGSpriter = require('svg-sprite');
const spriter = new SVGSpriter({
  mode: {
    symbol: true
  }
});

const md5 = require ('md5');

const { resolve, join } = require('path');
const { readFileSync } = require('fs');
const genomeParser = require('./genomeParser');

//todo: Aggiungere funzione per modificare i colori dei singoli layers
/*const getColorChangePercentage = () => {
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
};*/

exports.handler = ({ tokenId }, context, callback) => {
  const { id, layers } = genomeParser(tokenId);
  const idKey = md5(id.toString());

  s3.headObject({
    Bucket: 'cryptomon',
    Key: `monsters/${idKey}.svg`
  }).promise()
    .then(() => console.log('Sprite monster already created'))
    .catch(() => {
      const cwd = resolve('layers');

      layers.forEach(layer => {
        spriter.add(new File({
          path: join(cwd, `${layer}.svg`),
          base: cwd,
          contents: readFileSync(join(cwd, `${layer}.svg`))
        }))
      });

      spriter.compile((err, { stack: { sprite: { contents } } }) => {
        if(err) console.error(err);
        else
          s3.putObject({
            Key: `monsters/${idKey}.svg`,
            Bucket: 'cryptomon',
            Body: contents
          }).promise()
            .then(() => console.log(`upload ${idKey}.svg on s3`))
            .catch(console.error);
      })
    });
};
