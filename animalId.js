const { format } = require('date-fns');
const date = '2022-10-08T13:36:05.049Z';

pet = {
  id: 11,
  name: 'doggie',
  type: 'Cat',
};

const date2 = new Date(date);
let PetType = pet.type[0].toUpperCase();
let PetId = pet.id < 10 ? `0${pet.id}` : pet.id;

const formatString = `uuuu-MM-dd'-${PetId}${PetType}'`;
const formattedDate = format(date2, formatString);

console.log(typeof formattedDate);
console.log(formattedDate);

// Output
// string
// 2022-10-08-01D
//
