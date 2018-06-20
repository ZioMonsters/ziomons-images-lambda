const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'eu-west-1' });
const gm = require('gm').subClass({ imageMagick:true });
const { createReadStream, createWriteStream, writeFileSync } = require('fs');

const getColorChangePercentage = () => {
  const out = [];
  for (let i = 0; i < 3; i++) {
    const randInt = Math.floor(Math.random() * 100);
    if (randInt > 75) {
      out.push(Math.floor(Math.random() * 100) - 25)
    } else {
      out.push(randInt);
    }
  }
  return out;
};

//1 minuto ./tmp
const imageColorize = imageToUse => new Promise(resolve => {
  resolve([...imageToUse].slice(2).map(image => {
    return [
      `${image.slice(0, -4)}_colorize.svg`,
      gm(createReadStream(`./images/${image}`), 'svg.svg')
        .background('transparent')
        .colorize(...getColorChangePercentage())
        .stream('svg')
    ];
  }));
});

//=================================== main

const data = require('./mobData.json');
const mobDataEntries = Object.entries(data);
const { id } = data;
const mobData = [...mobDataEntries].slice(1);
const mobDataLen = mobData.length;
const imageToUse = mobDataEntries.map(([, fileName]) => fileName);

let value = gm(createReadStream(`./images/${mobData[0][1]}`), 'svg.svg')
  .background('transparent');

imageColorize(imageToUse)
  .then(out => {
    out.forEach(([fileName, stream]) => {
      const chunks = [];
      stream.on('data', data => chunks.push(data));
      stream.once('end', () => writeFileSync(`./images/${fileName}`, Buffer.concat(chunks)));
    });

    mobData.forEach(([, image], index) => {
      if (index !== mobDataLen - 1) {
        value = value
          .composite(`./images/${mobData[index + 1][1].slice(0, -4)}_colorize.svg`)
          .background('transparent');
      }
      else {
        value
          .stream('svg')
          .pipe(createWriteStream(`./images/Sprite-${id}.svg`))
      }
    })
  })
  .catch(console.error);

    /*value
      .toBuffer('SVG', (err, buffer) => {
        /!*if(err) console.error(err);
        const putParams = {
          Key: `${id}.svg`,
          Bucket: 'cryptomon',
          Body: buffer
        };
        s3.putObject(putParams)
          .promise()
          .then(_ => console.log('cryptomon created'))
          .catch(console.error)
      });*!/*/
