# Talk To Me Demo Site

This is a demo site showcasing the `talk-to-me` React commenting system for blogs and other content-heavy websites.

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Set up your Supabase database:

```bash
# Run the SQL migration script
supabase migration up
# Or manually execute the SQL from supabase/migrations/001_initial_schema.sql
```

3. Deploy the edge function:

```bash
supabase functions deploy sync-user
```

4. Run the development server:

```bash
pnpm dev
```

## Environment Variables

The following environment variables are required:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key for client-side auth
- `VITE_ADMIN_EMAIL`: Email address that will have admin privileges

## Using the Real Package

This demo currently uses mock components for development. To use the real `talk-to-me` package:

1. Once the package is published to npm:

```bash
npm install talk-to-me
# or
pnpm add talk-to-me
```

2. Update your imports to use the real package:

```tsx
// Change this:
import { TalkToMeProvider, TalkToMe } from './mock-talk-to-me';

// To this:
import { TalkToMeProvider, TalkToMe } from 'talk-to-me';
```

3. Make sure your Supabase instance has the correct database schema and edge functions deployed.

## Technologies Used

- React with TypeScript
- Vite for development and building
- Tailwind CSS for styling
- React Router for navigation
- Talk To Me for the commenting system
- Supabase for authentication and database

## Demo Structure

The demo consists of a simple blog with:

- A home page listing all blog posts
- Individual blog post pages with comments
- Integration with the Talk To Me commenting system

## Deploying to Vercel

This demo is designed to be deployed to Vercel:

1. Connect your repository to Vercel
2. Set the required environment variables
3. Deploy!
