import Link from "next/link";
import { FileText, Calendar } from "lucide-react";
import type { BlogPost } from "@/types";
import { formatDate, toPlainText } from "@/lib/utils";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/resources/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-navy-100">
        {post.featured_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.featured_image} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center bg-navy-800">
            <FileText className="h-10 w-10 text-gold-400" />
          </div>
        )}
        {post.category && (
          <span className="absolute left-3 top-3 rounded-full bg-gold-500 px-2.5 py-1 text-xs font-semibold text-navy-950">
            {post.category}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {post.published_date && (
          <p className="flex items-center gap-1.5 text-xs text-navy-500">
            <Calendar className="h-3 w-3" /> {formatDate(post.published_date)}
          </p>
        )}
        <h3 className="mt-2 font-display text-lg font-semibold text-navy-900 group-hover:text-gold-600">
          {post.title}
        </h3>
        {post.content && (
          <p className="mt-2 line-clamp-3 text-sm text-navy-500">
            {toPlainText(post.content)}
          </p>
        )}
        {post.author && (
          <p className="mt-auto pt-3 text-sm font-medium text-gold-600">{post.author}</p>
        )}
      </div>
    </Link>
  );
}
