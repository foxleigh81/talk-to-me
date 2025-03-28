# Talk To Me – Build Plan for LLMs

This file outlines how to implement the “Talk To Me” comment system plugin using React and Supabase. Each task is clearly scoped and written as a prompt suitable for passing to another LLM.

---

## 1. Project Setup

**Prompt:**
Set up a monorepo using PNPM workspaces with two separate workspace directories:

- `packages/talk-to-me`: Create a new TypeScript React component library using plain React and Vite. Do not use TailwindCSS or Next.js. Use regular CSS files for styling and prefix all class names with `t-t-m-` to avoid conflicts. Do not use CSS Modules. Configure basic ESLint and Prettier support. The purpose of this workspace is to create an NPM package that can be easily added to any React project and will include a provider and a component to add a commenting system.

- `apps/demo-site`: Create a simple workspace containing just a single `index.html` file with a "Coming Soon" message, styled minimally using inline CSS. This workspace will later be expanded into a demo site to showcase the TalkToMe component.

---

## 2. Supabase Integration

**Prompt:**
A Supabase client has been initialised and the details are available in .env.local. Export the client so it can be used across the project.

---

## 3. Context Provider

**Prompt:**
Create a `TalkToMeProvider` component that wraps children in React context. It should:

- Accept Supabase credentials
- Accept a config object with admin emails, the social sign in providers that are used, theme colour, and darkMode flag
- Provide user and moderation state via context
- Initialize Supabase Auth client and store current user

---

## 4. Authentication

**Prompt:**
Implement authentication using Supabase:

- Allow sign-in with email magic link and Social Sign in. Use Facebook, Google, LinkedIn and GitHub has the provider options.
- Expose login and logout functions via context
- Track user session and expose user data (e.g., email, avatar, etc)
- If no avatar exists for a user, attempt to retreive one from Gravatar
- Automatically determine if user is an admin based on email match
- Determine admin privileges using Supabase user IDs rather than relying solely on emails for improved security.

---

## 5. Database Schema

**Prompt:**
Create clear, relational Supabase tables considering GDPR and efficient data management:

### users table

- `id`: UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
- `email`: TEXT UNIQUE NOT NULL
- `username`: TEXT UNIQUE NOT NULL
- `avatar_url`: TEXT
- `is_admin`: BOOLEAN DEFAULT FALSE

### comments table

- `id`: UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `post_id`: TEXT NOT NULL
- `author_id`: UUID REFERENCES users(id) ON DELETE SET NULL
- `content`: TEXT NOT NULL (Markdown-formatted content, including emoji)
- `status`: TEXT CHECK ('pending', 'approved') DEFAULT 'pending'
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `parent_id`: UUID REFERENCES comments(id) ON DELETE CASCADE (nullable)

**Important Notes:**

- Do not store duplicate user metadata; rely entirely on the relational link via `author_id`.
- Explicitly document that rejected comments should be deleted immediately, not stored.
- Clearly document in the README that GDPR compliance and obtaining user consent is the user's responsibility.

**Important Notes:**

- Clearly document that rejected comments should be deleted immediately, not stored.
- Explicitly mention in the README that GDPR compliance and obtaining user consent is the user's responsibility. Briefly explain what GDPR is and provide a link to a website for further information.

---

## 5.5. User Sync Edge Function

**Prompt:**
Create a Supabase Edge Function to sync authenticated users into the custom `users` table.

- This function should be triggered manually from the frontend after the user signs in
- It should check if the authenticated user's ID already exists in the `users` table
- If not, insert a new record using their `id`, `email`, `display_name` as username, and `avatar_url` (check gravatar to see if one exists against their email addresss, if not insert the default one from /src/lib/assets)
- Avoid overwriting user records on subsequent logins
- This function should be called from the frontend using `supabase.functions.invoke('sync-user', ...)` after the `SIGNED_IN` auth event
- The consumer of the package does not need to invoke this function manually—syncing should be completely automatic and handled internally within the TalkToMeProvider.
- Document this auto-sync behaviour in the README so that users are aware it is handled internally.

---

## 6. TalkToMe Component

**Prompt:**
Create a `TalkToMe` component that:

- Accepts a `pageId` prop
- Loads and displays all approved comments for that page
- If the user is an admin, also shows pending comments with approve/decline buttons
- Includes a text input for adding a new comment
- Handles XSS safely (no raw HTML rendering)
- Explicitly sanitize comments using DOMPurify.
- Implement local caching of comments for improved load performance.
- Use optimistic UI updates when posting comments.
- Provide clear inline or toast notifications when comment submission errors occur.
- Implement pagination or infinite scrolling for large comment lists (over 50 comments).

---

## 7. Threaded Comments

**Prompt:**
"Extend the `comments` table to support threaded replies by adding a nullable `parent_id` column. Update the `TalkToMe` component to:

- Display comments in a nested thread format
- Allow users to reply to specific comments
- Indent or visually group replies under their parent
- Maintain sorting (e.g. oldest-first or newest-first) within threads
- Keep reply input boxes contextually located under each comment
- Limit nested reply depth to a configurable default (e.g., 5 levels) for UI and performance reasons.

---

## 8. ModerationBadge Component

**Prompt:**
Create a floating `ModerationBadge` component:

- Shows automatically on any page the Provider is rendered
- Only shows for admin users
- Displays number of posts with pending comments
- Clicking the badge causes a sidebar to slide in that shows a list of posts which have pending comments (you can use framer-motion for this)
- Hides automatically when no moderation is needed
- Displays in the top-right be default but can be repositioned using a config option in the provider
- Include ARIA attributes and ensure keyboard accessibility.

---

## 9. Realtime Subscriptions

**Prompt:**
Add realtime support to sync new comments from Supabase:

- Subscribe to new inserts into the `comments` table
- Automatically update the comment list and moderation badge in real-time
- Only show pending comments to admin users
- Document potential limits of Supabase realtime subscriptions in README.

---

## 10. Spam Prevention & Rate Limiting

**Prompt:**
Add basic spam prevention and rate limiting to the comment system. Include:

- A 10-second cooldown between comment submissions, preferably per-user session rather than IP.
- Expose a plugin hook (e.g. `onBeforePost`) for users to implement custom anti-spam logic or integrate CAPTCHA services like hCaptcha, reCAPTCHA, or Turnstile
- Document an example CAPTCHA integration using the plugin system
- Do not bundle any CAPTCHA SDKs directly into the library

---

## 11. User Comment Controls

**Prompt:**
Add support for allowing users to edit or delete their own comments.

- Only show edit/delete buttons if the logged-in user is the comment author
- Expose this via config: `allowEdit`, `allowDelete`
- Editing should allow updating the content before re-submitting for moderation
- Deleting should soft-delete the comment (e.g., mark status as `deleted`)

---

## 12. Admin Email Notifications

**Prompt:**
Add support for notifying admins when a new comment is pending moderation.

- Can be implemented using Supabase Functions, webhooks, or an external email provider like Resend
- Should be optional and configured via provider settings
- Include `postId`, truncated comment content, and timestamp in notification

---

## 13. Comment Import/Export

**Prompt:**
Add support for importing and exporting comments:

- Provide utility functions to export comments for a given `postId` as JSON
- Allow importing comments from a valid JSON array, assigning new IDs
- Admins only; should not be exposed to regular users

---

## 14. Plugin System

**Prompt:**
Add support for a plugin system by allowing users to pass custom hooks and render overrides through the `TalkToMeProvider` config.

Create a plugin interface that supports the following (all optional):

- `onBeforePost(commentData)`: return `false` to block or return modified comment
- `onApprove(commentData)`: called after an admin approves a comment
- `renderAvatar(user)`: return a custom React component to render instead of the default avatar
- `onError(error)`: handle or log errors from Supabase or rendering
- Wrap all plugin hook calls (`onBeforePost`, `onApprove`, `renderAvatar`, `onError`) in `try-catch` blocks to isolate plugin errors from the main application logic.
- Optionally expose logging hooks for debugging plugins.

---

## 15. Package and Distribution

**Prompt:**
"Prepare the library for NPM:

- Expose `TalkToMeProvider` and `TalkToMe` from index.ts
- Include a simple README.md and usage instructions
- Add types for all exposed components and props
- Ensure tree-shaking compatibility and small bundle size"

---

## 16. Additional UX Enhancements

**Prompt:**
Enhance user experience by:

- Adding support for user mentions (`@username`) in comments.
- Supporting basic markdown formatting (bold, italic, links) and emoji parsing within comments.
- Clearly documenting all UX features in README.md to guide users through available options.
