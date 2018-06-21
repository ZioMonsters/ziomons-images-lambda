const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'eu-west-1' });
const gm = require('gm').subClass({ imageMagick: true });
const { createReadStream, createWriteStream, writeFileSync } = require('fs');

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

//1 minuto ./tmp
const imageColorize = imagesToUse => new Promise(resolve => {
  resolve(imagesToUse.map(image => {
    return [
      `${image}_colorize.svg`,
      gm(createReadStream(`./images/${image}.svg`), 'svg.svg')
        .background('transparent')
        .colorize(50, 50, 0)
        .stream('svg')
    ];
  }));
});

//=================================== main

const { id, layers } = require('./mobData.json');

const background = layers.shift();
layers.reduce((acc, layer) => {
  return acc
    .background('transparent')
    .composite(`./images/${layer}.svg`);
}, gm(`./images/${background}.svg`))
  .stream('jpg')
  .pipe(createWriteStream('./images/test.jpg'));
