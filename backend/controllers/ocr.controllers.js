import Groq from 'groq-sdk';
import multer from 'multer';
import Tesseract from 'tesseract.js';

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

const OCR_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const OCR_RETRY_DELAYS_MS = [1200, 2500];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isProviderBusyError = (error) => {
  const status = error?.status ?? error?.response?.status;
  const message = error?.message ?? error?.response?.error?.message ?? '';
  return status === 503 || /over capacity|rate limit|temporarily unavailable/i.test(message);
};

const runOcrRequest = async (mime, base64) => {
  let lastError = null;

  for (let attempt = 0; attempt <= OCR_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await getGroq().chat.completions.create({
        model: OCR_MODEL,
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
    } catch (error) {
      lastError = error;

      if (!isProviderBusyError(error) || attempt === OCR_RETRY_DELAYS_MS.length) {
        throw error;
      }

      await sleep(OCR_RETRY_DELAYS_MS[attempt]);
    }
  }

  throw lastError;
};

const normalizeWhitespace = (value = '') => value.replace(/\s+/g, ' ').trim();

const detectCurrency = (text) => {
  const upper = text.toUpperCase();
  if (/\bINR\b|₹|RS\.?/i.test(upper)) return 'INR';
  if (/\bUSD\b|\$/i.test(upper)) return 'USD';
  if (/\bEUR\b|€/i.test(upper)) return 'EUR';
  if (/\bGBP\b|£/i.test(upper)) return 'GBP';
  if (/\bAED\b/i.test(upper)) return 'AED';
  return 'USD';
};

const detectCategory = (text) => {
  const haystack = text.toLowerCase();
  if (/(restaurant|bistro|cafe|meal|dinner|lunch|food|beverage)/i.test(haystack)) return 'food';
  if (/(hotel|stay|accommodation|room|lodging)/i.test(haystack)) return 'accommodation';
  if (/(flight|taxi|uber|ola|train|bus|travel|airport|fuel)/i.test(haystack)) return 'travel';
  if (/(electricity|internet|water|utility|utilities|phone)/i.test(haystack)) return 'utilities';
  return 'other';
};

const parseDate = (text) => {
  const patterns = [
    /\b(\d{4})-(\d{2})-(\d{2})\b/,
    /\b(\d{2})[\/\-](\d{2})[\/\-](\d{4})\b/,
    /\b(\d{2})\s+([A-Za-z]{3,9})\s+(\d{4})\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    if (pattern === patterns[0]) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }

    if (pattern === patterns[1]) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }

    const months = {
      jan: '01', january: '01',
      feb: '02', february: '02',
      mar: '03', march: '03',
      apr: '04', april: '04',
      may: '05',
      jun: '06', june: '06',
      jul: '07', july: '07',
      aug: '08', august: '08',
      sep: '09', sept: '09', september: '09',
      oct: '10', october: '10',
      nov: '11', november: '11',
      dec: '12', december: '12',
    };
    const month = months[match[2].toLowerCase()];
    if (month) {
      return `${match[3]}-${month}-${match[1]}`;
    }
  }

  return new Date().toISOString().slice(0, 10);
};

const parseAmount = (text) => {
  const totalLine =
    text
      .split('\n')
      .map((line) => normalizeWhitespace(line))
      .find((line) => /\b(total|grand total|amount due)\b/i.test(line)) || '';

  const extractNumbers = (source) =>
    [...source.matchAll(/(\d{1,3}(?:[,\s]\d{3})*(?:\.\d{2})|\d+\.\d{2}|\d+)/g)]
      .map((match) => Number(match[1].replace(/[,\s]/g, '')))
      .filter((value) => Number.isFinite(value) && value > 0);

  const totalCandidates = extractNumbers(totalLine);
  if (totalCandidates.length > 0) {
    return totalCandidates[totalCandidates.length - 1];
  }

  const allCandidates = extractNumbers(text);
  if (allCandidates.length > 0) {
    return Math.max(...allCandidates);
  }

  return 0;
};

const parseVendor = (text) => {
  const lines = text
    .split('\n')
    .map((line) => normalizeWhitespace(line))
    .filter(Boolean);

  return lines.find((line) => /[A-Za-z]{3,}/.test(line)) || 'Unknown Vendor';
};

const buildParsedFallback = (text) => {
  const vendor = parseVendor(text);
  const amount = parseAmount(text);
  const currency = detectCurrency(text);
  const date = parseDate(text);
  const category = detectCategory(`${vendor}\n${text}`);
  const description = `${vendor} receipt${amount ? ` for ${currency} ${amount.toFixed(2)}` : ''}`;

  return {
    amount,
    currency,
    date,
    vendor,
    category,
    description,
  };
};

const runLocalReceiptOcr = async (buffer) => {
  const result = await Tesseract.recognize(buffer, 'eng', {
    logger: () => {},
  });

  return buildParsedFallback(result?.data?.text || '');
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

    let parsed;

    try {
      const response = await runOcrRequest(mime, base64);
      const rawText = response.choices[0].message.content.trim();

      // Strip any accidental markdown fences
      const cleaned = rawText.replace(/```json|```/gi, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (error) {
      if (!isProviderBusyError(error)) {
        throw error;
      }

      parsed = await runLocalReceiptOcr(req.file.buffer);
    }

    // Validate required fields
    const required = ['amount', 'currency', 'date', 'vendor', 'category', 'description'];
    for (const field of required) {
      if (parsed[field] === undefined || parsed[field] === null || parsed[field] === '') {
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