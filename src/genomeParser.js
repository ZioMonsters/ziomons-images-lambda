//    eyes       body     ar/mo/le/ta   bg ex
// 00-000-0000 000-0000 000-000-000-000 00 00 //

//const prime = 4294967291;

/*const NRRandInt = i => {
  if (i >= prime) return i;
  const residue = (i*i) % prime;
  return (i <= Math.trunc(prime / 2)) ? residue : prime - residue;
};*/

module.exports = id => {
  //const genome = (NRRandInt((NRRandInt(id) + 92837498) ^ 0x5bf03635)).toString(2);
  return {
    id,
    layers: [
      //`backgound${ parseInt(genome.substr(28, 2), 2) }`,
      'corpo1',
      //`eyes${ parseInt(genome.substr(0, 5), 2) }`,
      'bocca1',
      'occhi1',
      'mani1',
      'piedi1'
      //parseInt(genome.substr(5, 4), 2),
      //`body${ parseInt(genome.substr(9, 3), 2) }`,
      //parseInt(genome.substr(12, 4), 2),
      //`arms${ parseInt(genome.substr(16, 3), 2) }`,
      //`mouth${ parseInt(genome.substr(19, 3), 2) }`,
      //`legs${ parseInt(genome.substr(22, 3), 2) }`,
      //`tail${ parseInt(genome.substr(25, 3), 2) }`,
      //`extra${ parseInt(genome.substr(30, 2), 2) }`
    ]
  };
};
