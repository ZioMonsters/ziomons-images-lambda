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

//=================================== main

const { id, layers } = require('./mobData.json');
const background = layers.shift();

layers.forEach(layer => gm(createReadStream(`./images/${layer}.svg`), '*.svg')
  .background('transparent')
  .colorize(...getColorChangePercentage())
  .write(`./images/${layer}_colorize.svg`, err => err ? console.error(err) : console.log('write image colorize')));

layers.reduce((acc, layer) => {
  return acc
    .background('transparent')
    .composite(`./images/${layer}_colorize.svg`);
}, gm(`./images/${background}.svg`))
  .stream('svg')
  .pipe(createWriteStream(`./images/Sprite_${id}.svg`));
