/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Repo root (monorepo root) for correct file tracing when multiple lockfiles exist */
const repoRoot = path.resolve(__dirname, '..', '..');

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: repoRoot,
};

export default nextConfig;
