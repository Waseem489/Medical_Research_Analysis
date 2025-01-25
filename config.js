const config = {
  port: process.env.PORT || 3001,
  allowedOrigins: [
    'https://medical-research-analysis.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  env: process.env.NODE_ENV || 'development',
  pdfUpdateInterval: '*/5 * * * *', // كل 5 دقائق
};

export default config;
