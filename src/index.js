const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'eu-west-3' });
const SVGSpriter = require('svg-sprite');
const File = require('vinyl');
const md5 = require ('md5');
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const spriter = new SVGSpriter({
  mode: {
    stack: true
  }
});

const genomeParser = require('./genomeParser');

//todo
/*const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const light = 'D4CCCB';
const shadow = 'AFA8A7';
const dark = '6E6A69';

const colors = [
  ['', '', ''], //green
  ['', '', ''], //pink
  ['', '', ''], //yellow
  ['', '', ''], // cyan
  ['', '', ''], //blue
  ['', '', ''], //orange
  ['', '', ''], //red
  ['', '', ''] //purple
];

const getRandoColor = () => colors[getRandomInt(0, 7)];

const changeColors = (buffer) => {
  const [newLight, newShadow, newDark] = getRandoColor();
  return buffer.toString()
    .replace(new RegExp(light, 'g'), newLight)
    .replace(new RegExp(shadow, 'g'), newShadow)
    .replace(new RegExp(dark, 'g'), newDark);
};
*/

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
        }).promise().then(({ Body }) => Body);
      }))
    )
    .then(buffers => {
      //todo
      //changeColors(buffers[0]);
      buffers.forEach(buffer => {
        spriter.add(new File({
          path: '*!/!*.svg',
          base: '*!/!*.svg',
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
