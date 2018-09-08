const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'eu-west-3' });
const SVGSpriter = require('svg-sprite');
const md5 = require ('md5');
const { readFileSync } = require('fs');
const { join, resolve } = require('path');
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
    .catch(() => {
      const layersPath = join(process.env.LAMBDA_TASK_ROOT, 'layers');
      layers.forEach(layer => {
        const path = join(`${layersPath}`, `${layer}.svg`);
        console.log("spiter", path)
        spriter.add(path, null, readFileSync(path, { encoding: 'utf-8' }));
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
