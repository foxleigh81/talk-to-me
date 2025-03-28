# Edge Functions

This document describes the edge functions required by the Talk To Me comment system and how to deploy them to your Supabase instance.

## User Sync Function

The `sync-user` edge function automatically syncs authenticated users into our custom `users` table. This function:

1. Is triggered automatically after user authentication
2. Checks if the user already exists in our custom `users` table
3. If not, creates a new user record with:
   - User ID from Supabase Auth
   - Email address
   - Username (from full name or email)
   - Avatar URL (from user metadata or Gravatar)
   - Default admin status (false)

### Deployment

1. Navigate to your Supabase project dashboard
2. Go to Edge Functions
3. Create a new function called `sync-user`
4. Copy the contents of `templates/edge-functions/sync-user/index.ts` into the function editor
5. Set the following environment variables in your Supabase dashboard:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### Implementation Details

The function is implemented in TypeScript and runs on Deno. It:

- Uses the Supabase service role key for database access
- Handles CORS for cross-origin requests
- Includes error handling and validation
- Generates Gravatar URLs for users without avatars

### Usage

The function is automatically called by the `TalkToMeProvider` component after successful authentication. You don't need to call it manually.

### Security Considerations

1. The function uses the service role key for database access, which has full access to your database
2. It validates the user's authentication token before processing
3. It only creates new user records and doesn't modify existing ones
4. It uses Gravatar's default "mystery person" avatar when no Gravatar exists

### Error Handling

The function returns appropriate error responses for:

- Missing authentication headers
- Invalid authentication tokens
- Database errors
- Missing environment variables

### Local Development

To test the edge function locally:

1. Install the Supabase CLI
2. Copy the function files from `templates/edge-functions/sync-user` to your local Supabase project
3. Run `supabase functions serve sync-user` to start the local development server
4. Use the Supabase CLI to deploy the function: `supabase functions deploy sync-user`
