import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('12345678', 10)
  const userPasswordHash = await bcrypt.hash('12345678', 10)

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'ilya.rovda@gmail.com' },
    update: {},
    create: {
      email: 'ilya.rovda@gmail.com',
      password: adminPasswordHash,
      name: 'Ilya Rovda',
      role: 'ADMIN',
    },
  })
  console.log('✅ Created admin user:', admin.email)

  // Create regular user
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPasswordHash,
      name: 'Test User',
      role: 'USER',
    },
  })
  console.log('✅ Created regular user:', user.email)

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

