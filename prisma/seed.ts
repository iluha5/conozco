import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { importWordsData } from '../lib/word-data'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create languages
  const english = await prisma.language.upsert({
    where: { code: 'en' },
    update: {},
    create: {
      code: 'en',
      name: 'English',
    },
  })
  console.log('✅ Created language:', english.name)

  const spanish = await prisma.language.upsert({
    where: { code: 'es' },
    update: {},
    create: {
      code: 'es',
      name: 'Spanish',
    },
  })
  console.log('✅ Created language:', spanish.name)

  const russian = await prisma.language.upsert({
    where: { code: 'ru' },
    update: {},
    create: {
      code: 'ru',
      name: 'Russian',
    },
  })
  console.log('✅ Created language:', russian.name)

  // Create parts of speech for Spanish
  const spanishPartsOfSpeech = [
    { name: 'NOUN', displayName: 'существительное' },
    { name: 'VERB', displayName: 'глагол' },
    { name: 'ADJECTIVE', displayName: 'прилагательное' },
    { name: 'ADVERB', displayName: 'наречие' },
    { name: 'PRONOUN', displayName: 'местоимение' },
    { name: 'PREPOSITION', displayName: 'предлог' },
    { name: 'CONJUNCTION', displayName: 'союз' },
    { name: 'INTERJECTION', displayName: 'междометие' },
  ]

  const partsOfSpeechRecords: Record<string, any> = {}

  for (const pos of spanishPartsOfSpeech) {
    const partOfSpeech = await prisma.partOfSpeech.upsert({
      where: {
        name_languageId: {
          name: pos.name,
          languageId: spanish.id
        }
      },
      update: {},
      create: {
        name: pos.name,
        displayName: pos.displayName,
        languageId: spanish.id
      }
    })
    partsOfSpeechRecords[pos.name] = partOfSpeech
  }
  console.log('✅ Created parts of speech for Spanish')

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

  // Import words data
  console.log('📚 Importing words data...')
  await importWordsData(prisma, partsOfSpeechRecords)
  console.log('✅ Words data imported successfully')

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

