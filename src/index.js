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

//todo: cambiare colori modificando il fill dell'immagine

const getRandomColor = ()  => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const changeColors = buffer => {
  /*const array = */buffer.toString()
    .split('\n')
    .map(e => {
      const colorIndex = e.indexOf('#');
      const string = e.substr(colorIndex, 7);
      console.log(string)
      console.log(e);
      e.replace(string, 'ccccccccccccccccccccccccccccc'/*getRandomColor()*/);
      console.log(e);
      return e;/*const color = 'cccc'/!*getRandomColor()*!/;
      console.log(e)
      if(_index > 0){
        console.log(color.split(''))
        color
          .split('')
          .forEach((letter, index) => {
            e[_index + index] = letter
          });
        console.log(e.substr(_index, _index+7))
      }
      return e;*/
    });
  //writeFileSync('./temp.svg', array.join('\n'));
};

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
      changeColors(buffers[0]);
      /*buffers.forEach(buffer => {
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
      });*/
    })
    .catch(err => callback(err));
};
