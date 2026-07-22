import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  const html = marked.parse(content, { async: false }) as string;
  const clean = DOMPurify.sanitize(html);

  return (
    <div
      className="post-content"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
