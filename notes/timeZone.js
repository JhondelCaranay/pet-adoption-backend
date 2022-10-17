const user = {
  id: 10,
  email: 'plana@gmail.com',
  profile: {
    fist_name: 'Jonathan',
    last_name: 'Plana',
    imageUrl: null,
    contact: '09123456789',
    address: 'Malolos city',
  },
  createdAt: '2022-10-09T20:04:57.079Z',
};

const newDate = new Date(user.createdAt);
// philippines manila time zone
console.log(newDate.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));

// output 10/10/2022, 4:04:57 AM
//
