if (process.env.NEXTAUTH_URL?.trim() === "") {
  delete process.env.NEXTAUTH_URL;
}

if (process.env.NEXTAUTH_URL_INTERNAL?.trim() === "") {
  delete process.env.NEXTAUTH_URL_INTERNAL;
}

if (process.env.VERCEL_URL?.trim() === "") {
  delete process.env.VERCEL_URL;
}

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;
