const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'eu-west-3' });
const SVGSpriter = require('svg-sprite');
const File = require('vinyl');
const md5 = require ('md5');
const { readFileSync } = require('fs');
const { join } = require('path');
const spriter = new SVGSpriter({
  mode: {
    stack: true
  }
});

const genomeParser = require('./genomeParser');

//todo: decidere se cambiare colori da css o programmaticamente

exports.handler = (event, context, callback) => {
  const { tokenId } = event;
  const { id, layers } = genomeParser(tokenId);
  const idKey = md5(id.toString());

  s3.headObject({
    Bucket: 'cryptomon',
    Key: `monsters/${idKey}.svg`
  }).promise()
    .then(() => callback(null, event))
    .catch(() =>
      Promise.all(layers.map(layer => {
        return s3.getObject({
          Bucket: 'cryptomon',
          Key: `images/${layer}.svg`
        }).promise().then(({Body}) => Body)
      }))
    )
    .then(buffers => {
      buffers.forEach(buffer => {
        spriter.add(new File({
          path: '*/*.svg',
          base: '*/*.svg',
          contents: buffer
        }))
      });

      spriter.compile((err, { stack: { sprite: { contents } } }) => {
        if (err) {
          return callback(err);
        }
        return s3.putObject({
          Key: `monsters/${idKey}.svg`,
          Bucket: 'cryptomon',
          Body: contents,
          ContentType: 'image/svg+xml'
        }).promise()
          .then(() => callback(null, event));
      });
    })
    .catch(err => callback(err));
};
