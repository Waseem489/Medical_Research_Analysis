import express from 'express';
import cors from 'cors';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import schedule from 'node-schedule';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// تكوين CORS
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://medical-research-analysis.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    // السماح بالطلبات من المتصفح مباشرة (للاختبار)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// إضافة middleware للأمان
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// إنشاء مجلد للملفات إذا لم يكن موجوداً
const uploadsDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

let currentPdfPath = '';
let currentPdfNumber = 1;

// دالة لإنشاء ملف PDF جديد
const generateNewPdf = () => {
    const doc = new PDFDocument();
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    currentPdfPath = join(uploadsDir, `medical-report-${currentPdfNumber}.pdf`);
    
    const stream = fs.createWriteStream(currentPdfPath);
    doc.pipe(stream);

    // تحسين تنسيق PDF
    doc.font('Helvetica');
    
    // إضافة ترويسة مع شعار وزارة الصحة (نص بسيط)
    doc.fontSize(25)
       .text('وزارة الصحة السورية', { align: 'right' });
    
    doc.moveDown()
       .fontSize(20)
       .text('تقرير الأبحاث الطبية', { align: 'right' });

    doc.moveDown()
       .fontSize(14)
       .text(`تاريخ التحديث: ${timestamp}`, { align: 'right' });

    doc.moveDown()
       .fontSize(16)
       .text('ملخص الأبحاث الجديدة:', { align: 'right' });

    // محتوى تجريبي محسن
    const researchTopics = [
        {
            title: 'دراسة جديدة حول علاج السكري',
            details: 'كشفت الدراسة عن فعالية علاج جديد يعتمد على...'
        },
        {
            title: 'تطورات في علاج أمراض القلب',
            details: 'أظهرت النتائج تحسناً ملحوظاً في...'
        },
        {
            title: 'أبحاث متقدمة في مجال الطب النفسي',
            details: 'تم تطوير نموذج جديد للعلاج يركز على...'
        },
        {
            title: 'دراسات حديثة في مجال طب الأطفال',
            details: 'اكتشاف طرق جديدة للوقاية من...'
        }
    ];

    researchTopics.forEach((topic, index) => {
        doc.moveDown()
           .fontSize(14)
           .text(`${index + 1}. ${topic.title}`, { align: 'right' })
           .fontSize(12)
           .text(topic.details, { align: 'right', indent: 20 });
    });

    // إضافة تذييل الصفحة
    doc.moveDown(2)
       .fontSize(10)
       .text('© وزارة الصحة السورية - جميع الحقوق محفوظة', { align: 'center' });

    doc.end();
    currentPdfNumber++;

    console.log(`تم إنشاء PDF جديد: ${currentPdfPath}`);
    return currentPdfPath;
};

// إنشاء أول ملف PDF
generateNewPdf();

// جدولة إنشاء ملف PDF جديد كل 5 دقائق
schedule.scheduleJob(config.pdfUpdateInterval, () => {
    generateNewPdf();
});

// مسار اختبار
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// مسار للحصول على آخر ملف PDF
app.get('/api/latest-report', (req, res) => {
    if (currentPdfPath && fs.existsSync(currentPdfPath)) {
        // إضافة headers للتحميل التلقائي
        if (req.query.autoDownload === 'true') {
            res.setHeader('Content-Disposition', 'attachment; filename=medical-report.pdf');
        }
        res.download(currentPdfPath);
    } else {
        res.status(404).json({ error: 'لم يتم العثور على الملف' });
    }
});

// مسار للحصول على ملف PDF محدد
app.get('/api/download-report/:filename', (req, res) => {
    const filePath = join(uploadsDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        // إضافة headers للتحميل التلقائي
        if (req.query.autoDownload === 'true') {
            res.setHeader('Content-Disposition', 'attachment; filename=medical-report.pdf');
        }
        res.download(filePath);
    } else {
        res.status(404).json({ error: 'لم يتم العثور على الملف' });
    }
});

// مسار للحصول على معلومات آخر تحديث
app.get('/api/report-info', (req, res) => {
    if (currentPdfPath && fs.existsSync(currentPdfPath)) {
        const stats = fs.statSync(currentPdfPath);
        res.json({
            lastUpdate: stats.mtime,
            filename: currentPdfPath.split(/(\\|\/)/).pop()
        });
    } else {
        res.status(404).json({ error: 'لم يتم العثور على معلومات التقرير' });
    }
});

const PORT = config.port;
app.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
    console.log('وضع التشغيل:', process.env.NODE_ENV);
    console.log('Origins المسموح بها:', config.allowedOrigins);
});

// تصدير التطبيق لـ Vercel
export default app;
