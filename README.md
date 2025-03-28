# Talk To Me

A plug-and-play commenting system for React, powered by Supabase. Easily drop into your site with minimal config, full theming support, threaded replies, and built-in moderation tools.

## ✨ Features

- ✅ Drop-in React component with `TalkToMe`
- 🔄 Realtime comment syncing with Supabase
- 🔐 Auth via email magic link + optional social logins (Google, GitHub, Facebook, LinkedIn)
- 🧵 Threaded replies with support for nesting
- 🛠 Admin moderation tools (approve/decline)
- 🎨 Theming: light/dark modes, colour presets, font customisation (default: Sora)
- 🔔 Floating moderation badge for admins — no separate dashboard needed
- 🧩 Plugin system for spam filtering, avatars, error handling, and more
- 🚫 Optional user comment edit/delete support
- 📥 JSON import/export for posts
- 📬 Optional admin email notifications for new comments

## 🔧 Installation

```bash
npm install talk-to-me
```

## 🛠 Basic Usage

```tsx
import { TalkToMeProvider, TalkToMe } from 'talk-to-me';

const App = () => (
  <TalkToMeProvider
    supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL}
    supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}
    config={{
      adminEmails: ['you@example.com'],
      themeColor: '#ff6600',
      darkMode: true,
      allowEdit: true,
      allowDelete: false,
      disableDefaultStyling: false,
      font: 'Sora', // Any Google Font, or inherit from parent
      plugins: {
        onBeforePost: async (comment) => {
          // Optionally block or modify a comment before submission
          return comment;
        },
        onApprove: (comment) => {
          // Fire a webhook or log it
        },
        renderAvatar: (user) => <img src={user.avatar_url} />,
        onError: (error) => console.error(error),
      },
    }}
  >
    <YourAppContent />
    <TalkToMe postId="your-post-id" />
  </TalkToMeProvider>
);
```

## 📄 Supabase Schema

### `comments` table

- `id` – UUID
- `post_id` – string (required)
- `parent_id` – UUID (nullable, for threaded replies)
- `author` – string or user ID
- `content` – text
- `status` – enum: `'pending' | 'approved' | 'rejected' | 'deleted'`
- `created_at` – timestamp

### Optional `users` table

- `id` – UUID
- `email` – string
- `is_admin` – boolean

## 🧑‍💻 Author

Built with love by [Alex Foxleigh](https://github.com/foxleigh81).
