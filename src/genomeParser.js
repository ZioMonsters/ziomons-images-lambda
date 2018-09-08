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
    layers: [
      `mani${ parseInt(genome.substr(0, 3), 2) +1 }.svg`,
      `piedi${ parseInt(genome.substr(3, 3), 2) +1 }.svg`,
      `corpo${ parseInt(genome.substr(6, 3), 2) +1 }.svg`,
      `bocca${ parseInt(genome.substr(9, 3), 2) +1 }.svg`,
      `occhi${ parseInt(genome.substr(12, 3), 2) +1}.svg`
    ],
    palettes: [
      parseInt(genome.substr(15, 3), 2),
      parseInt(genome.substr(18, 3), 2),
      parseInt(genome.substr(21, 3), 2),
      parseInt(genome.substr(24, 3), 2),
      parseInt(genome.substr(27, 3), 2)
    ]
  };
};

