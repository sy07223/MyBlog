import { Metadata } from "next";
import GiscusComments from "@/components/GiscusComments";

export const metadata: Metadata = {
  title: "留言板",
  description: "给我留言",
};

export default function GuestbookPage() {
  return (
    <div className="post-detail">
      <div className="glass-panel">
        <header className="post-header">
          <h1 className="post-title">留言板</h1>
          <p className="text-[var(--blog-text-soft)]">
            有什么想说的？在下方评论区留言。
          </p>
        </header>
        <GiscusComments />
      </div>
    </div>
  );
}
