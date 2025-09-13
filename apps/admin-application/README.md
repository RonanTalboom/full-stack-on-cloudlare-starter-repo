# Admin Application

Admin dashboard for managing the platform, built with Next.js, tRPC, and deployed on Cloudflare Pages.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **API**: tRPC for type-safe APIs
- **Authentication**: Better-auth with Google OAuth
- **Database**: Cloudflare D1 (via @repo/data-ops)
- **Hosting**: Cloudflare Pages with Edge Runtime

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm package manager
- Cloudflare account
- Google OAuth credentials

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### Development

Run the development server:

```bash
# From root directory
pnpm dev-admin

# Or from this directory
pnpm dev
```

The admin dashboard will be available at http://localhost:3001

### Building

Build the application:

```bash
pnpm build
```

Build for Cloudflare Pages:

```bash
pnpm pages:build
```

### Deployment

Deploy to Cloudflare Pages:

```bash
# Stage environment
pnpm stage:deploy

# Production environment
pnpm production:deploy
```

Or from the root directory:

```bash
# Stage
pnpm stage:deploy-admin

# Production
pnpm production:deploy-admin
```

## Project Structure

```
admin-application/
├── app/                    # Next.js app directory
│   ├── (admin)/           # Admin routes (protected)
│   │   ├── layout.tsx     # Admin layout with sidebar
│   │   ├── page.tsx       # Dashboard
│   │   ├── users/         # User management
│   │   ├── links/         # Link management
│   │   ├── analytics/     # Analytics dashboard
│   │   └── settings/      # System settings
│   ├── api/               # API routes
│   │   ├── trpc/          # tRPC endpoint
│   │   └── auth/          # Auth endpoints
│   └── login/             # Login page
├── server/                 # Server-side code
│   ├── trpc.ts            # tRPC setup
│   ├── router.ts          # Main router
│   └── routers/           # Individual routers
├── lib/                    # Client utilities
│   ├── auth/              # Auth client
│   └── trpc/              # tRPC client
└── middleware.ts          # Next.js middleware for auth
```

## Features

- 🔐 **Authentication**: Google OAuth with admin role verification
- 👥 **User Management**: View, edit, and manage user accounts
- 📊 **Analytics Dashboard**: System metrics and usage statistics
- 🔗 **Link Management**: Manage shortened links
- ⚙️ **System Settings**: Configure platform settings
- 🚀 **Edge Runtime**: Optimized for Cloudflare Pages

## Environment Variables

Required environment variables:

- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `BETTER_AUTH_SECRET`: Secret for auth sessions

These are automatically available in production via Cloudflare Pages settings.

## Scripts

- `pnpm dev` - Start development server (port 3001)
- `pnpm build` - Build for production
- `pnpm pages:build` - Build for Cloudflare Pages
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview with Wrangler
- `pnpm stage:deploy` - Deploy to staging
- `pnpm production:deploy` - Deploy to production