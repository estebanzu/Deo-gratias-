require('dotenv').config();

module.exports = {
  brand: {
    name: 'Deo Gratias',
    tagline: 'Joyeria Fina',
  },

  port: parseInt(process.env.PORT, 10) || 3015,
  imagesDir: process.env.IMAGES_DIR || 'images',
  supportedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  maxImageSize: 10 * 1024 * 1024,

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER ?? '',
  },

  colors: {
    darkBg: '#080808',
    darkSurface: '#111111',
    darkElevated: '#1a1a1a',
    gold: '#e8b84b',
    goldMuted: '#c9a96e',
    goldLight: '#f0ca6a',
    cream: '#f5f0eb',
    white: '#ffffff',
    textSecondary: '#b8b8b8',
    textTertiary: '#6a6a7a',
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
  },

  fonts: {
    display: "'Cormorant Garamond', Georgia, serif",
    body: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', monospace",
  },

  admin: {
    user: process.env.ADMIN_USER || 'admin',
    pass: process.env.ADMIN_PASS || 'admin',
  },
  // JWT secret for auth tokens
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwt',

  pdf: {
    format: 'A4',
    outputDir: 'output',
    margins: { top: 20, right: 18, bottom: 25, left: 18 },
    productsPerPage: 4,
    columns: 2,
  },
};
