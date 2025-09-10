/*
Configures Next.js for the app.
*/

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ hostname: "localhost" }] },
  reactStrictMode: false
}

export default nextConfig
