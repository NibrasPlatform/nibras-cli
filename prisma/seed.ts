import { PrismaClient, SystemRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user (idempotent)
  await prisma.user.upsert({
    where: { email: 'admin@nibras.local' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@nibras.local',
      systemRole: SystemRole.admin,
    },
  });
  console.log('Seed complete: admin@nibras.local (systemRole: admin)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
