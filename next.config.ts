import path from "node:path";
import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});

export default withMDX(nextConfig);
