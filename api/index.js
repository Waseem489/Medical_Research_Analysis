import express from 'express';
import cors from 'cors';
import schedule from 'node-schedule';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// CORS configuration
app.use(cors({
  origin: ['https://medical-research-analysis.vercel.app', 'http://localhost:5173'],
  credentials: true
}));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Generate PDF route
app.get('/api/generate-pdf', async (req, res) => {
  try {
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const pdfData = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
      res.send(pdfData);
    });

    // Add content to PDF
    doc.fontSize(25).text('Medical Research Report', 100, 100);
    doc.fontSize(12).text('Generated at: ' + new Date().toLocaleString(), 100, 150);
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Get latest report
app.get('/api/latest-report', (req, res) => {
  res.json({ message: 'No report available' });
});

export default app;
