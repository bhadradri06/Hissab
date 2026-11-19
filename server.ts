import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  // Allow base64 payment screenshots up to 10MB
  app.use(express.json({ limit: '10mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      ocrConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  app.post('/api/ocr/read-amount', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        error: 'OCR service is not configured. Set GEMINI_API_KEY in server environment secrets or enter the payment amount manually.',
        code: 'OCR_NOT_CONFIGURED',
      });
      return;
    }

    const { imageDataUrl } = req.body as { imageDataUrl?: string };
    if (!imageDataUrl || typeof imageDataUrl !== 'string') {
      res.status(400).json({
        error: 'Missing payment screenshot image.',
        code: 'INVALID_INPUT',
      });
      return;
    }

    const match = imageDataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) {
      res.status(400).json({
        error: 'Unsupported image format. Please upload JPG, JPEG, PNG, or WEBP.',
        code: 'INVALID_IMAGE',
      });
      return;
    }

    const mimeType = match[1] === 'image/jpg' ? 'image/jpeg' : match[1];
    const base64Data = match[2];

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text:
                'You are reading an Indian UPI or bank payment screenshot (e.g. Google Pay, PhonePe, Paytm, BHIM, bank SMS/receipt). ' +
                'Extract the primary payment transaction amount in INR (Indian Rupees). ' +
                'Do NOT confuse transaction IDs, UTR numbers, phone numbers, dates, or times with the payment amount. ' +
                'If no clear payment amount is visible or the image is unreadable, set detectedAmount to null and explain briefly in reason.',
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedAmount: {
                type: Type.NUMBER,
                nullable: true,
                description: 'The extracted payment amount in INR, or null if not clearly detected.',
              },
              detectedDate: {
                type: Type.STRING,
                nullable: true,
                description: 'Transaction date in YYYY-MM-DD format if clearly visible, otherwise null.',
              },
              confidence: {
                type: Type.STRING,
                description: 'high, medium, or low',
              },
              reason: {
                type: Type.STRING,
                description: 'Brief explanation of what was read or why an amount could not be detected.',
              },
            },
            required: ['confidence', 'reason'],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText) as {
        detectedAmount?: number | null;
        detectedDate?: string | null;
        confidence?: string;
        reason?: string;
      };

      const validAmount =
        typeof parsed.detectedAmount === 'number' &&
        Number.isFinite(parsed.detectedAmount) &&
        parsed.detectedAmount > 0
          ? Math.round(parsed.detectedAmount * 100) / 100
          : null;

      res.json({
        detectedAmount: validAmount,
        detectedDate:
          typeof parsed.detectedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.detectedDate)
            ? parsed.detectedDate
            : null,
        confidence: parsed.confidence || 'low',
        reason: parsed.reason || '',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OCR processing failed';
      res.status(502).json({
        error: `Could not analyze screenshot automatically (${message}). Please enter the amount manually.`,
        code: 'OCR_FAILED',
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hisaab server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
