//    eyes       body     ar/mo/le/ta   bg ex
// 00-000-0000 000-0000 000-000-000-000 00 00 //

const prime = 4294967291;

const NRRandInt = i => {
  if (i >= prime) return i;
  const residue = (i*i) % prime;
  return (i <= Math.trunc(prime / 2)) ? residue : prime - residue;
};

module.exports = id => {
  const genome = (NRRandInt((NRRandInt(id) + 92837498) ^ 0x5bf03635)).toString(2);
  return {
    id,
    background: `backgound${ parseInt(genome.substr(28, 2), 2) }.svg`,
    eyes: `eyes${ parseInt(genome.substr(0, 5), 2) }.svg`,
    eyeColor: parseInt(genome.substr(5, 4), 2),
    body: `body${ parseInt(genome.substr(9, 3), 2) }.svg`,
    bodyColor: parseInt(genome.substr(12, 4), 2),
    arms: `arms${ parseInt(genome.substr(16, 3), 2) }.svg`,
    mouth: `mouth${ parseInt(genome.substr(19, 3), 2) }.svg`,
    legs: `legs${ parseInt(genome.substr(22, 3), 2) }.svg`,
    tail: `tail${ parseInt(genome.substr(25, 3), 2) }.svg`,
    extra: `extra${ parseInt(genome.substr(30, 2), 2) }.svg`
  };
};
