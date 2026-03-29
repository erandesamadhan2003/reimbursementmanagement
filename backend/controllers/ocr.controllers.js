import Groq from 'groq-sdk';
import multer from 'multer';

// Memory storage — buffer goes straight to Groq, no disk write needed
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
    }
  },
});

let _groq = null;
const getGroq = () => {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
};

/**
 * POST /api/expenses/ocr
 * Multer single upload (field: 'receipt')
 * Returns structured JSON: { amount, currency, date, vendor, category, description }
 */
export const scanReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No receipt image uploaded. Use field name "receipt"',
      });
    }

    const base64 = req.file.buffer.toString('base64');
    const mime = req.file.mimetype;

    const response = await getGroq().chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct', // free Groq vision model
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mime};base64,${base64}` },
            },
            {
              type: 'text',
              text:
                'Extract expense details from this receipt image. ' +
                'Return ONLY valid JSON with no markdown fences, no extra text:\n' +
                '{"amount":number,"currency":"USD","date":"YYYY-MM-DD",' +
                '"vendor":"string","category":"travel|food|accommodation|utilities|other",' +
                '"description":"string"}\n' +
                'Rules:\n' +
                '- amount: numeric value only (no currency symbols)\n' +
                '- currency: ISO 4217 3-letter code\n' +
                '- date: in YYYY-MM-DD format\n' +
                '- category: must be exactly one of: travel, food, accommodation, utilities, other\n' +
                '- description: brief 1-line summary including vendor/item details',
            },
          ],
        },
      ],
    });

    const rawText = response.choices[0].message.content.trim();

    // Strip any accidental markdown fences
    const cleaned = rawText.replace(/```json|```/gi, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate required fields
    const required = ['amount', 'currency', 'date', 'vendor', 'category', 'description'];
    for (const field of required) {
      if (parsed[field] === undefined || parsed[field] === null) {
        throw new Error(`OCR response missing field: ${field}`);
      }
    }

    return res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('OCR error:', error.message);

    if (error instanceof SyntaxError) {
      return res.status(422).json({
        success: false,
        message: 'OCR returned invalid JSON — please fill in fields manually',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'OCR failed',
      detail: error.message,
    });
  }
};