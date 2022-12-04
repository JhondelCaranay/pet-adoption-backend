import { PET_STATUS, PrismaClient, ROLE } from '@prisma/client';
const prisma = new PrismaClient();
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
async function main() {
  console.log(`Start seeding ...`);

  console.log(`Create users ...`);
  // salt
  const salt = await bcrypt.genSalt(10);
  // hash
  const hash = await bcrypt.hash('test123', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'petadoptionadmin@gmail.com',
      hash: hash,
      role: ROLE.ADMIN,
      profile: {
        create: {
          fist_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          contact: faker.phone.phoneNumber(),
          address: faker.address.streetAddress(),
          imageUrl: faker.image.avatar(),
        },
      },
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'petadoptionadminuser@gmail.com',
      hash: hash,
      role: ROLE.USER,
      profile: {
        create: {
          fist_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          contact: faker.phone.phoneNumber(),
          address: faker.address.streetAddress(),
          imageUrl: faker.image.avatar(),
        },
      },
    },
  });

  console.log(`Seeding data successfully!`);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
