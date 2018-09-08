const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'eu-west-3' });

const File = require('vinyl');
const SVGSpriter = require('svg-sprite');
const spriter = new SVGSpriter({
  mode: {
    stack: true
  }
});

const md5 = require ('md5');
const { readFileSync } = require('fs');
const { join, resolve } = require('path');

const genomeParser = require('./genomeParser');

//todo: decidere se cambiare colori da css o programmaticamente

exports.handler = ({ tokenId }, context, callback) => {
  const {id, layers} = genomeParser(tokenId);
  const idKey = md5(id.toString());

  s3.headObject({
    Bucket: 'cryptomon',
    Key: `monsters/${idKey}.svg`
  }).promise()
    .then(() => console.log('Sprite monster already created'))
    .catch(() => {
      const cwd = resolve('layers');
      layers.forEach(layer => {
        const path = join(`${cwd}`, `${layer}.svg`);
        spriter.add(path, null, readFileSync(path, {encoding: 'utf-8'}));
        console.log('caricato su spriter')
      });

      spriter.compile((err, { stack: { sprite: { contents } } }) => {
        if (err) console.error(err);
        else
          console.log('quasi fatta')
          s3.putObject({
            Key: `monsters/${idKey}.svg`,
            Bucket: 'cryptomon',
            Body: contents,
            ContentType: 'image/svg+xml'
          }).promise()
            .then(() => console.log(`upload ${idKey}.svg on s3`))
            .catch(console.error);
      })
    })
    .catch(err => console.error(err))
};
