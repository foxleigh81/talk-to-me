import { Link } from 'react-router-dom';
import { BlogPost as BlogPostType } from '../types/blog';

interface BlogListProps {
  posts: BlogPostType[];
}

export function BlogList({ posts }: BlogListProps) {
  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <article key={post.id} className="bg-white shadow-sm rounded-lg p-6">
          <Link to={`/post/${post.slug}`} className="block">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600">
              {post.title}
            </h2>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <div className="flex items-center text-gray-500 text-sm">
              <span>{post.author}</span>
              <span className="mx-2">•</span>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
