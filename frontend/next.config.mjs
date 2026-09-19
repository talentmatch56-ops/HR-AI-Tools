import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

let exportedConfig = nextConfig;

if (process.env.NODE_ENV === 'production') {
  try {
    const pwaModule = require('@ducanh2912/next-pwa');
    const withPWA = pwaModule.default || pwaModule;
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
  } catch (e) {
    console.warn('PWA initialization skipped:', e);
  }
}

export default exportedConfig;


