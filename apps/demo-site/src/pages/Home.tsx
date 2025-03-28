import { BlogList } from '../components/BlogList';
import { blogPosts } from '../data/blog-posts';

export function Home() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Latest Posts</h1>
      <BlogList posts={blogPosts} />
    </div>
  );
}
