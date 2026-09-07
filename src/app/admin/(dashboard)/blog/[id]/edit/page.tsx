import { notFound } from "next/navigation";
import { adminGetBlogPost } from "@/lib/admin-db";
import { BlogPostEditor } from "@/components/admin/blog-post-editor";

interface EditParams {
  params: Promise<{ id: string }>;
}

export default async function AdminBlogEditPage({ params }: EditParams) {
  const { id } = await params;
  const post = await adminGetBlogPost(id);
  if (!post) notFound();

  return <BlogPostEditor post={post} />;
}
