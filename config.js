export default {
  port: process.env.PORT || 3001,
  allowedOrigins: process.env.NODE_ENV === 'production' 
    ? [
        'https://medical-research-analysis.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000'
      ]
    : ['http://localhost:5173', 'http://localhost:3000'],
  pdfUpdateInterval: '*/5 * * * *', // كل 5 دقائق
};
