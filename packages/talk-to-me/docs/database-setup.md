# Database Setup for Talk To Me

This guide will help you set up the required database tables in your Supabase instance for the Talk To Me comment system.

## Prerequisites

- A Supabase project
- Access to your Supabase dashboard
- Basic understanding of SQL

## Database Schema

The SQL schema for the Talk To Me comment system can be found in `schema.sql`. You can execute this SQL in your Supabase SQL editor.

The schema includes:

- Users table with authentication integration
- Comments table with support for threaded replies
- Appropriate indexes for performance
- Row Level Security (RLS) policies
- Automatic timestamp updates

## Important Notes

### GDPR Compliance

1. **Data Storage**: The schema is designed to store only essential data. Rejected comments are not stored, and deleted comments are marked with a 'deleted' status rather than being permanently removed.

2. **User Data**: We store minimal user data and rely on Supabase Auth for authentication. The `users` table only contains necessary information for the comment system.

3. **Data Retention**: You are responsible for implementing your own data retention policies. Consider:
   - How long to keep deleted comments
   - Whether to implement automatic deletion of old comments
   - Your obligations under GDPR Article 17 (Right to erasure)

4. **User Consent**: You must:
   - Inform users about data collection and processing
   - Obtain explicit consent for storing comments
   - Provide clear information about how their data will be used
   - Implement mechanisms for users to request data deletion

### Security Considerations

1. **Row Level Security**: The schema includes RLS policies to ensure:
   - Users can only view approved comments
   - Users can only edit their own comments
   - Admins have appropriate access levels

2. **Admin Access**: Admin privileges are determined by the `is_admin` flag in the users table. Set this carefully and consider implementing additional security measures.

### Performance Considerations

1. **Indexes**: The schema includes indexes on frequently queried columns to improve performance.

2. **Cascading Deletes**: The schema uses `ON DELETE CASCADE` for appropriate relationships to maintain referential integrity.

## Next Steps

1. Execute the SQL in your Supabase SQL editor
2. Verify the tables and policies are created correctly
3. Test the RLS policies with different user roles
4. Implement your GDPR compliance measures
5. Configure your application to use the Talk To Me package

For more information about GDPR compliance, visit the [Information Commissioner's Office website](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/).
