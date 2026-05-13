import DOMPurify from 'dompurify';

/**
 * Strip every HTML tag and JS handler from a user-provided string.
 * Returns plain text content only. Use for inputs that should NEVER contain markup.
 *
 *   sanitizeText('<img src=x onerror="alert(1)">hi')  → 'hi'
 *   sanitizeText('foo <script>bad()</script> bar')    → 'foo  bar'
 *
 * Non-string inputs are returned unchanged.
 */
export const sanitizeText = (value) => {
  if (value == null || typeof value !== 'string') return value;
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  }).trim();
};

/**
 * Sanitize every string in an array.
 */
export const sanitizeArray = (arr) => {
  if (!Array.isArray(arr)) return arr;
  return arr.map((v) => (typeof v === 'string' ? sanitizeText(v) : v));
};

/**
 * Recursively sanitize string values in an object. Nested objects and arrays
 * are walked. Numbers, booleans, null, undefined, and Files pass through.
 *
 * Use this as the last step before sending a payload to the server.
 */
export const sanitizeObject = (obj) => {
  if (obj == null) return obj;
  if (typeof obj === 'string') return sanitizeText(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (typeof obj !== 'object') return obj;
  // Don't walk into Files/Blobs/FormData
  if (obj instanceof File || obj instanceof Blob || obj instanceof FormData) return obj;

  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = sanitizeObject(v);
  }
  return out;
};
