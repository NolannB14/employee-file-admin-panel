# Employee Admin Panel

Web-based admin panel for managing employee profiles with Next.js 15, Cloudflare Pages Functions, D1 database, and R2 storage.

## Quick Start

### Development Mode (Mock Data)

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000
```

Login with any email/password combination in development mode.

### Production Mode (Real API)

```bash
# Build and preview with Cloudflare bindings
pnpm build && pnpm pages:dev

# Open http://localhost:8788
```

## Features

- **Employee Management**: Create, update, delete, and search employee profiles
- **Profile Pictures**: Upload and manage profile pictures stored in Cloudflare R2
- **Authentication**: Secure login/logout with session management
- **Responsive UI**: Clean interface with dark mode support
- **Real-time Updates**: No page reloads, instant feedback

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TailwindCSS, shadcn/ui
- **Backend**: Cloudflare Pages Functions
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Auth**: Session-based with HTTP-only cookies

## Project Structure

```
├── app/                        # Next.js pages (admin UI)
├── components/                 # React components
├── functions/                  # Cloudflare Pages Functions (API)
│   └── api/
│       ├── auth/              # Login, logout, session
│       ├── employees/         # CRUD operations
│       └── upload/            # Profile picture management
├── lib/                       # Utilities and API client
├── migrations/                # D1 database migrations
├── types/                     # TypeScript definitions
└── wrangler.toml             # Cloudflare configuration
```

## Database Schema

**employees**
- `id` (TEXT): Unique identifier
- `firstName` (TEXT): First name
- `lastName` (TEXT): Last name
- `email` (TEXT): Unique email address
- `phone` (TEXT): Phone number
- `role` (TEXT): Job title
- `linkedin` (TEXT): LinkedIn profile URL
- `avatarUrl` (TEXT): R2 storage path for profile picture
- `createdAt` (TEXT): ISO 8601 timestamp

**accounts**
- `id` (TEXT): Unique identifier
- `email` (TEXT): Login email
- `password` (TEXT): PBKDF2 hashed password
- `lastLogin` (TEXT): Last login timestamp

## API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - End session
- `GET /api/auth/session` - Check session status

### Employees
- `GET /api/employees` - List all employees (supports sorting)
- `POST /api/employees` - Create new employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Profile Pictures
- `POST /api/upload/profile-picture` - Upload picture (multipart/form-data, max 5MB)
- `GET /api/upload/profile-picture/:filename` - Retrieve picture
- `DELETE /api/upload/profile-picture/:filename` - Delete picture

## Setup (Production)

### Prerequisites
- Node.js 18+
- Cloudflare account
- Wrangler CLI: `npm install -g wrangler`

### 1. Configure Cloudflare

```bash
# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create demo_employees

# Update wrangler.toml with the database ID

# Run migrations
wrangler d1 migrations apply demo_employees
```

### 2. Create R2 Buckets

```bash
# Production bucket
wrangler r2 bucket create employee-profile-pictures

# Preview bucket (optional)
wrangler r2 bucket create employee-profile-pictures-preview
```

### 3. Create Admin Account

```bash
# Run the setup script
node scripts/create-admin.js
```

### 4. Deploy

```bash
# Build and deploy to Cloudflare Pages
pnpm build && pnpm pages:deploy
```

## Environment Variables

The app uses two modes controlled by `.env.local`:

**Development Mode (Mock Data)**
```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```
- Uses in-memory mock data
- No Cloudflare setup required
- Fast hot-reload development

**Production Mode (Real API)**
```env
NEXT_PUBLIC_USE_MOCK_DATA=false
```
- Uses Cloudflare D1 and R2
- Requires `pnpm build && pnpm pages:dev`
- Real data persistence

## Development Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server with mock data (port 3000) |
| `pnpm build` | Build Next.js static site |
| `pnpm pages:dev` | Local server with Cloudflare bindings (port 8788) |
| `pnpm pages:deploy` | Deploy to Cloudflare Pages |

## Security

- Passwords hashed with PBKDF2 (100,000 iterations)
- Session tokens in HTTP-only cookies (24h expiration)
- Parameterized SQL queries (injection prevention)
- File upload validation (type, size limits)
- CORS and CSP headers configured

## Mock Data (Development)

The app includes 5 test employees and a default admin account. Edit `lib/mock-data.ts` to customize.

**Default Login**: `admin@example.com` / any password

## Troubleshooting

**"No employees found" in dev mode**
- Ensure `NEXT_PUBLIC_USE_MOCK_DATA=true` in `.env.local`
- Restart dev server

**API errors in production mode**
- Verify `wrangler.toml` bindings match your resources
- Check D1 database ID: `wrangler d1 list`
- Check R2 buckets: `wrangler r2 bucket list`
- Ensure migrations are applied: `wrangler d1 migrations list demo_employees`

**Build fails**
```bash
# Clean and rebuild
rm -rf .next out
pnpm build
```

## License

Private project - Lyten
