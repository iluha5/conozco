# Flash Cards - Foreign Language Learning App

Application for learning English and Spanish using flash cards and interactive training sessions.

## 📚 Documentation

- **[⚡ Quick Start](QUICKSTART.md)** - Launch in 3 minutes
- **[📖 User Guide](USAGE.md)** - Detailed instructions
- **[🏗 Architecture](ARCHITECTURE.md)** - Technical documentation
- **[🤝 How to Contribute](CONTRIBUTING.md)** - Developer guide
- **[📝 Changelog](CHANGELOG.md)** - Change history

## Technology Stack

- **Frontend**: Next.js 14 (React) + TypeScript
- **UI Kit**: shadcn/ui (based on Radix UI + Tailwind CSS)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Containerization**: Docker + Docker Compose

## Features

### Word Management

- Adding new words with automatic translation search
- Preview up to 5 translation options with usage examples
- Ability to enter custom translation
- Two lists: learned and unlearned words
- Language filtering (English/Spanish)

### 4 Training Stages

1. **Stage 1: Viewing and Memorization**
    - Display word in foreign language
    - Automatic pronunciation (Web Speech API)
    - Show translation on click

2. **Stage 2: Choosing Correct Translation**
    - Display foreign word
    - Select correct translation from 4 options

3. **Stage 3: Word Matching**
    - Match foreign words with their translations
    - Group training with 4 words

4. **Stage 4: Word Building**
    - Show Russian translation
    - Build foreign word from scrambled letters

### Translation Caching

- Automatic caching of translation API requests
- Cache usage before external service requests
- Mocks for Google Cloud Translate API (real API connects later)

## Project Launch

### Prerequisites

- Docker and Docker Compose
- Git

### Launch Instructions

1. **Clone the repository**

```bash
git clone <repository-url>
cd flash-cards
```

2. **Launch the application via Docker Compose**

```bash
docker compose up --build
```

This command:

- Launches PostgreSQL on port 5433
- Launches Next.js application on port 8000
- Automatically runs database migrations

3. **Open the application in browser**

```
http://localhost:8000
```

### Development without Docker

If you want to run the application locally without Docker:

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment variables**

Create `.env.local` file:

```env
DATABASE_URL="postgresql://flashcards:flashcards_password@localhost:5433/flashcards"
```

3. **Launch PostgreSQL locally** (or use Docker only for DB)

```bash
docker compose up postgres
```

4. **Run migrations**

```bash
npx prisma migrate dev
```

5. **Generate Prisma Client**

```bash
npx prisma generate
```

6. **Launch the application**

```bash
npm run dev
```

## Useful Commands

### Prisma

```bash
# Create new migration
npm run prisma:migrate

# Open Prisma Studio (database UI)
npm run prisma:studio

# Generate Prisma Client
npm run prisma:generate
```

### Database Backup

```bash
# Create database backup
npm run db:backup

# Or via shell script
./scripts/backup-db.sh

# Backup files are saved to backups/ folder
# along with metadata files (.info)
```

**Requirements:** Docker and running database container

```bash
# Ensure container is running
docker compose up -d postgres
docker ps | grep flashcards-db

# Run backup
npm run db:backup
```

### Docker

```bash
# Launch all services
docker compose up

# Launch with rebuild
docker compose up --build

# Stop all services
docker compose down

# Stop and remove volumes (DB cleanup)
docker compose down -v

# View logs
docker compose logs -f app
```

## Project Structure

```
flash-cards/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── translations/     # Translation endpoints
│   │   ├── words/            # Words CRUD
│   │   └── training/         # Training API
│   ├── words/                # Word management page
│   ├── training/             # Training page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── training/             # Training stage components
│   └── add-word-dialog.tsx   # Add word dialog
├── lib/                      # Utilities and libraries
│   ├── prisma.ts             # Prisma client
│   ├── auth.ts               # NextAuth configuration
│   ├── word-data.ts          # Word utilities
│   └── utils.ts              # Helper functions
├── hooks/                    # React hooks
│   └── use-toast.ts          # Toast hook
├── prisma/                   # Prisma schema and migrations
│   └── schema.prisma         # Database schema
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # Application Dockerfile
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript configuration
```

## Database

### Tables

- **User** - System users
- **Word** - User words for learning
- **BaseWord** - Base words dictionary
- **WordTranslation** - Word translations
- **TrainingSession** - Training history
- **Language**, **PartOfSpeech**, **Tense**, **Pronoun** - Reference tables

### Database Schema

See `prisma/schema.prisma` for detailed schema.

## Word Dictionary

The system uses a base words dictionary stored in the database:

- `BaseWord` table - foreign words with parts of speech
- `WordTranslation` table - word translations (up to 3 per language)
- Seed script loads initial word set during initialization

To add new words, use seed script or add via API.

## Future Improvements

- [x] User system and authentication
- [x] Base words dictionary in DB
- [ ] Learning statistics and progress
- [ ] Additional languages
- [ ] Dictionary export/import
- [ ] Mobile application
- [ ] Offline mode

## License

Project developed for personal use.
