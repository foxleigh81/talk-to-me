# Talk To Me

[![npm version](https://img.shields.io/npm/v/talk-to-me.svg)](https://www.npmjs.com/package/talk-to-me)
[![npm downloads](https://img.shields.io/npm/dm/talk-to-me.svg)](https://www.npmjs.com/package/talk-to-me)
[![License](https://img.shields.io/npm/l/talk-to-me.svg)](https://github.com/yourusername/talk-to-me/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)](https://supabase.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/yourusername/talk-to-me/pulls)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/yourusername/talk-to-me/graphs/commit-activity)
[![Coverage Status](https://coveralls.io/repos/github/yourusername/talk-to-me/badge.svg?branch=main)](https://coveralls.io/github/yourusername/talk-to-me?branch=main)

A modern, accessible, and feature-rich commenting system for React applications, powered by [Supabase](https://www.supabase.com).

## Features

- 🔒 Secure authentication with Supabase
- 💬 Threaded comments with nested replies
- 👥 User avatars with [Gravatar](https://www.gravatar.com) integration
- 🛡️ Built-in spam prevention
- ⚡ Real-time updates
- 🎨 Customisable theming
- ♿ Full accessibility support
- 📱 Mobile-friendly design
- 🔍 SEO optimised
- 🧪 Comprehensive test coverage

## Installation

Choose your preferred package manager:

```bash
# Using pnpm
pnpm add talk-to-me

# Using npm
npm install talk-to-me

# Using yarn
yarn add talk-to-me
```

## Quick Start

### First, set up your Supabase project and create the required database tables

```bash
# Copy the SQL schema
cp node_modules/talk-to-me/docs/schema.sql ./supabase/migrations/001_initial_schema.sql

# Execute the SQL in your Supabase SQL editor
```

### Deploy the required edge function

```bash
# Copy the edge function
cp -r node_modules/talk-to-me/templates/edge-functions/sync-user ./supabase/functions/

# Deploy using Supabase CLI
supabase functions deploy sync-user
```

### Wrap your app with the `TalkToMeProvider`

```tsx
import { TalkToMeProvider } from 'talk-to-me'

function App() {
  return (
    <TalkToMeProvider
      supabaseUrl="your-supabase-url"
      supabaseAnonKey="your-supabase-anon-key"
      config={{
        adminEmails: ['admin@example.com'],
        theme: {
          primaryColour: '#007AFF',
          darkMode: false
        },
        socialSignIn: {
          providers: ['google', 'github', 'facebook', 'linkedin']
        }
      }}
    >
      <YourApp />
    </TalkToMeProvider>
  )
}
```

1. Add the `TalkToMe` component where you want comments to appear:

```tsx
import { TalkToMe } from 'talk-to-me'

function BlogPost() {
  return (
    <article>
      <h1>My Blog Post</h1>
      <p>Post content...</p>
      <TalkToMe pageId="blog-post-1" />
    </article>
  )
}
```

## Configuration

The `TalkToMeProvider` accepts the following configuration:

```typescript
interface TalkToMeConfig {
  adminEmails: string[]
  theme?: {
    primaryColour?: string
    darkMode?: boolean
    fontFamily?: string
  }
  socialSignIn?: {
    providers: ('google' | 'github' | 'facebook' | 'linkedin')[]
  }
  allowEdit?: boolean
  allowDelete?: boolean
  maxThreadDepth?: number
  commentsPerPage?: number
  onBeforePost?: (comment: CommentData) => Promise<boolean | CommentData>
  onApprove?: (comment: CommentData) => Promise<void>
  renderAvatar?: (user: User) => React.ReactNode
  onError?: (error: Error) => void
}
```

## Documentation

- [Database Setup](docs/database-setup.md)
- [Edge Functions](docs/edge-functions.md)
- [API Reference](docs/api.md)
- [Contributing](CONTRIBUTING.md)

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build package
pnpm build
```

## License

MIT © [Your Name]

## Support

If you find this package helpful, please consider:

- Starring the repository
- Reporting bugs
- Contributing code or documentation
- Sharing with others
- Donating to my coffee fund via [Ko-Fi](https://ko-fi.com/foxleigh81)

## Credits

- Built with [React](https://reactjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Icons from [Heroicons](https://heroicons.com/)
- Gravatar integration for user avatars
