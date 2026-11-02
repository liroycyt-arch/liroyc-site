const { stripe, SITE, product, cors } = require('./_lib');

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  try {
    const id = (req.body && req.body.id) || '';
    const p = await product(id);
    if (!p) return res.status(404).json({ error: 'not_found' });
    const s = await stripe().checkout.sessions.create({
      mode: 'payment',
      locale: 'he',
      line_items: [{
        quantity: 1,
        price_data: { currency: p.cur, unit_amount: p.amount, product_data: { name: p.name, ...(p.desc ? { description: p.desc } : {}) } }
      }],
      metadata: { product_id: id },
      success_url: SITE() + '/?paid=1&session_id={CHECKOUT_SESSION_ID}#/shop/success',
      cancel_url: SITE() + '/#/shop/cancel'
    });
    res.status(200).json({ url: s.url });
  } catch (e) {
    console.error('checkout', e.message);
    res.status(500).json({ error: 'server', detail: String(e.message || e).slice(0, 200) });
  }
};
