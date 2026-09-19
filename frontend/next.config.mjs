/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

let exportedConfig = nextConfig;

if (process.env.NODE_ENV !== 'development') {
  const withPWA = (await import('@ducanh2912/next-pwa')).default;
  exportedConfig = withPWA({
    dest: 'public',
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    disable: false,
    workboxOptions: {
      disableDevLogs: true,
    },
  })(nextConfig);
}

export default exportedConfig;

