/*
Configures Next.js for the app.
*/

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "localhost" },
      { protocol: "https", hostname: "html.tailus.io" },
      { protocol: "https", hostname: "tailus.io" }
    ]
  }
}

export default nextConfig
