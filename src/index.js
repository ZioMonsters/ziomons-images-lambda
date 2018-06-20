const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'eu-west-1' });

const gm = require('gm').subClass({ imageMagick:true });
const { createReadStream, createWriteStream } = require('fs');

if (!Object.entries)
  Object.entries = obj => Object.keys(obj).map(prop => [prop, obj[prop]]);

const getPercentColorChange = () => {
  const out = [];
  for(let i = 0; i < 3, i++){
    let randInt = Math.floor(Math.random() * 100);
    if(randInt > 75) randInt = Math.floor(Math.random() * 100) - 25;
    out.push(randInt);
  }
  return out;
};

//1 minuto ./tmp
const imageColorize = imageToUse => {
  const [ red, green, blue ] = getPercentColorChange();

  const arrayTemp = [...imageToUse];
  arrayTemp.pop(0);

  arrayTemp.forEach(image =>
    gm(`./layers/${createReadStream(image)}`, 'svg.svg')
      .background('transparent')
      .colorize(red, green, blue)
      .stream('svg')
      .pipe(createWriteStream(`./tmp/${image.slice(0, -4)}_colorize.svg`)))
};

const composite = (gmInst, path) => gmInst
  .background('transparent')
  .composite(path)
  .background('transparent');

exports.handler = (event, context, callback) => {
  const objEntries = Object.entries(event.Records[0]);
  const entriesLength = objEntries.length;
  const [ , id ] = objEntries[0];

  const imageToUse = objEntries.map(([, fileName]) => fileName);

  imageColorize(imageToUse);

  let value = gm(createReadStream(`./tmp/${objEntries[0][1]}`), 'svg.svg');

  objEntries.forEach((layer, index) => {
    if (index !== entriesLength - 1)
      value = composite(value, `./tmp/${objEntries[index + 1][1].slice(0, -4)}_colorize.svg`);
    else {
      value
        .toBuffer('SVG', (err, buffer) => {
          if(err) console.error(err);
          const putParams = {
            Key: `${id}.svg`,
            Bucket: 'cryptomon',
            Body: buffer
          };
          s3.putObject(putParams)
            .promise()
            .then(_ => console.log('cryptomon created'))
            .catch(console.error)
        });
    }
  });
};
