const { stripe } = require('./_lib');

const raw = req => new Promise((ok, no) => { const c = []; req.on('data', d => c.push(d)); req.on('end', () => ok(Buffer.concat(c))); req.on('error', no); });

// כאן מוסיפים פעולות אחרי תשלום מוצלח: שליחת מייל, מתן גישה, עדכון מלאי וכו'.
async function fulfill(s) {
  console.log('PAID', s.id, s.metadata && s.metadata.product_id, s.customer_details && s.customer_details.email);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  let ev;
  try {
    ev = stripe().webhooks.constructEvent(await raw(req), req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return res.status(400).send('bad signature');
  }
  try {
    const s = ev.data.object;
    if ((ev.type === 'checkout.session.completed' || ev.type === 'checkout.session.async_payment_succeeded') && s.payment_status === 'paid') await fulfill(s);
  } catch (e) {
    console.error('fulfill', e.message);
    return res.status(500).end();
  }
  res.status(200).json({ received: true });
};
module.exports.config = { api: { bodyParser: false } };
