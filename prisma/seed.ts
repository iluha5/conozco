import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { importWordsData } from '../lib/word-data'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create reference data
  const userRolesData = [
    { code: 'USER', displayName: 'Пользователь' },
    { code: 'ADMIN', displayName: 'Администратор' },
  ]
  const userRoles: Record<string, { id: number }> = {}

  for (const role of userRolesData) {
    const record = await prisma.userRole.upsert({
      where: { code: role.code },
      update: {
        displayName: role.displayName,
      },
      create: role,
    })
    userRoles[role.code] = { id: record.id }
  }
  console.log('✅ Ensured user roles')

  const wordStatusesData = [
    { code: 'NOT_LEARNED', displayName: 'Не выучено' },
    { code: 'LEARNED', displayName: 'Выучено' },
  ]

  for (const status of wordStatusesData) {
    await prisma.wordStatus.upsert({
      where: { code: status.code },
      update: {
        displayName: status.displayName,
      },
      create: status,
    })
  }
  console.log('✅ Ensured word statuses')

  const sentenceTypesData = [
    { code: 'AFFIRMATIVE', displayName: 'Утвердительное', isNegative: false, isQuestion: false },
    { code: 'NEGATIVE', displayName: 'Отрицательное', isNegative: true, isQuestion: false },
    { code: 'QUESTION', displayName: 'Вопросительное', isNegative: false, isQuestion: true },
    { code: 'NEGATIVE_QUESTION', displayName: 'Отрицательно-вопросительное', isNegative: true, isQuestion: true },
  ]

  for (const type of sentenceTypesData) {
    await prisma.sentenceType.upsert({
      where: { code: type.code },
      update: {
        displayName: type.displayName,
        isNegative: type.isNegative,
        isQuestion: type.isQuestion,
      },
      create: type,
    })
  }
  console.log('✅ Ensured sentence types')

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
      roleId: userRoles['ADMIN'].id,
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
      roleId: userRoles['USER'].id,
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

