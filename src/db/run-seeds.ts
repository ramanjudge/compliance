import { seedCityZones } from './seed-cities';

async function main() {
  await seedCityZones();
  console.log('Done!');
  process.exit(0);
}

main();
