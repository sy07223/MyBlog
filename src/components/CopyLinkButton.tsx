"use client";

import { useState } from "react";

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" className="post-action" onClick={copyLink}>
      {copied ? "已复制链接" : "复制链接"}
    </button>
  );
}
