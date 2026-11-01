const { stripe, isAdmin, cors } = require('./_lib');

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  try {
    if (!(await isAdmin(req))) return res.status(403).json({ error: 'forbidden' });
    const l = await stripe().checkout.sessions.list({ limit: 50, expand: ['data.line_items'] });
    const orders = l.data.filter(s => s.payment_status === 'paid').map(s => ({
      id: s.id,
      created: s.created,
      email: (s.customer_details && s.customer_details.email) || '',
      amount: (s.amount_total || 0) / 100,
      cur: s.currency,
      name: ((s.line_items && s.line_items.data) || []).map(i => i.description).join(', ')
    }));
    res.status(200).json({ orders });
  } catch (e) {
    console.error('orders', e.message);
    res.status(500).json({ error: 'server' });
  }
};
