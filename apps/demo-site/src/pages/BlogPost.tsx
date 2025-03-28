import { useParams } from 'react-router-dom';
import { BlogPost as BlogPostComponent } from '../components/BlogPost';
import { blogPosts } from '../data/blog-posts';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
        <p className="text-gray-600">The post you're looking for doesn't exist.</p>
      </div>
    );
  }

  return <BlogPostComponent post={post} />;
}
