const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'eu-west-3' });
const SVGSpriter = require('svg-sprite');
const File = require('vinyl');
const md5 = require ('md5');
const spriter = new SVGSpriter({
  mode: {
    stack: true
  }
});

const genomeParser = require('./genomeParser');

const detail = 'D4CCCB';
const primary = 'AFA8A7';
const contrast = '6E6A69';

const availablePalette = [
  ['ececd2', '89c742', '46a73e'], //green
  ['e8cbd9', 'f96aaa', '9f446d'], //pink
  ['f8f8e4', 'fddc15', 'fcb712'], //yellow
  ['d7e6ed', '31c2f1', '1e7794'], //cyan
  ['d7e9f3', '145cee', '07235b'], //blue
  ['ede2ce', 'f27825', 'd03c0f'], //orange
  ['eecec7', 'ec311e', 'a11b10'], //red
  ['ebd8df', 'a24e99', '82387f'] //purple
];

const changeColors = (buffer, [newDetail, newPrimary, newContrast]) => new Buffer(buffer.toString()
  .replace(new RegExp(detail, 'g'), newDetail)
  .replace(new RegExp(primary, 'g'), newPrimary)
  .replace(new RegExp(contrast, 'g'), newContrast));


exports.handler = (event, context, callback) => {
  const { tokenId } = event;
  const { id, layers, palettes } = genomeParser(tokenId);
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
          Key: `images/${layer}`
        }).promise().then(({ Body }) => Body);
      }))
    )
    .then(buffers => {
      buffers.forEach((buffer, i) => {
        buffer = changeColors(buffer, availablePalette[palettes[i]]);
        spriter.add(new File({
          path: '*!/!*.svg',
          base: '*!/!*.svg',
          contents: buffer
        }));
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
