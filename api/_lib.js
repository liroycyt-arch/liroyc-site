const Stripe = require('stripe');
const env = n => { const v = process.env[n]; if (!v) throw new Error('Missing env var ' + n); return v; };
const stripe = () => new Stripe(env('STRIPE_SECRET_KEY'));
const SITE = () => env('SITE_URL').replace(/\/$/, '');
const DB = () => env('FIREBASE_DB_URL').replace(/\/$/, '');
const CURS = ['ils', 'usd', 'eur'];

// המחיר והשם נקראים תמיד מ-Firebase בשרת. הדפדפן שולח רק מזהה מוצר.
async function product(id) {
  if (!/^[a-z0-9]{3,20}$/i.test(id || '')) return null;
  const f = k => fetch(`${DB()}/shop/products/${id}/${k}.json`).then(r => (r.ok ? r.json() : null));
  const [name, price, cur, st, desc] = await Promise.all(['name', 'price', 'cur', 'st', 'desc'].map(f));
  if (st !== 'pub' || !name || !(price > 0) || !CURS.includes(cur)) return null;
  return { name: String(name).slice(0, 200), desc: desc ? String(desc).slice(0, 500) : undefined, cur, amount: Math.round(price * 100) };
}

// בדיקה שהבקשה הגיעה ממנהל האתר (טוקן התחברות של Firebase)
async function isAdmin(req) {
  const t = (req.headers.authorization || '').replace(/^Bearer /, '');
  if (!t) return false;
  const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + env('FIREBASE_API_KEY'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: t })
  });
  if (!r.ok) return false;
  const u = ((await r.json()).users || [])[0];
  return !!u && (u.email || '').toLowerCase() === env('ADMIN_EMAIL').toLowerCase();
}

// CORS נדרש רק אם האתר והפונקציות על דומיינים שונים
function cors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', SITE());
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).end(); return true; }
  return false;
}

module.exports = { stripe, SITE, product, isAdmin, cors };
