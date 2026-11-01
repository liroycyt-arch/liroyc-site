# LIROYC · חנות עם Stripe

מה יש בתיקייה:
- `index.html` האתר שלך + עמוד `#/shop`, כפתורי "קנייה עכשיו", דפי הצלחה/ביטול, ולשונית **חנות** בפאנל הניהול (מוצרים + הזמנות).
- `api/checkout.js` יוצר דף תשלום של Stripe. המחיר נקרא בשרת מ-Firebase, לא מהדפדפן.
- `api/webhook.js` מקבל אישור תשלום מ-Stripe (עם אימות חתימה). הפונקציה `fulfill` היא המקום להוסיף מייל/גישה אחרי רכישה.
- `api/orders.js` מציג בפאנל הניהול את ההזמנות ששולמו, רק למנהל מחובר.
- `.env.example`, `firebase-rules-snippet.json`, `package.json`.

## התקנה (Vercel, חינם)

1. **Stripe:** פתחו חשבון, והעתיקו את `Secret key` (מצב Test) מ-Developers → API keys.
2. **העלאה ל-Vercel:** העלו את התיקייה (או חברו ל-GitHub) כפרויקט חדש. Framework: Other.
3. **משתני סביבה** ב-Vercel (Settings → Environment Variables): כל הערכים מ-`.env.example`. את `SITE_URL` מלאים בכתובת האתר הסופית.
4. **Firebase:** ב-Realtime Database → Rules הוסיפו את תוכן `firebase-rules-snippet.json` בתוך `rules` הקיים (בלי למחוק את הכללים שיש). זה מאפשר לכולם לקרוא מוצרים ורק לך לערוך.
5. **Webhook:** ב-Stripe → Developers → Webhooks → Add endpoint: `https://YOUR-DOMAIN.com/api/webhook`, אירועים `checkout.session.completed` ו-`checkout.session.async_payment_succeeded`. העתיקו את `Signing secret` ל-`STRIPE_WEBHOOK_SECRET` ופרסו מחדש (Redeploy).
6. **מוצרים:** היכנסו ל-`#/admin` → לשונית **חנות** → "מוצר חדש". הגדירו שם, מחיר, מטבע, סטטוס "פורסם".
7. **בדיקה:** ב-`#/shop` לחצו "קנייה עכשיו" ושלמו עם כרטיס הבדיקה `4242 4242 4242 4242`, תאריך עתידי וכל CVC.
8. **עלייה לאוויר:** החליפו ל-`sk_live_...` ו-Webhook של מצב Live, ופרסו מחדש.

## חשוב לדעת

- אם האתר שלך מתארח במקום אחר (למשל Firebase Hosting) והפונקציות ב-Vercel: ב-`index.html` מלאו את `SHOP_API` בכתובת Vercel, ו-`SITE_URL` בכתובת האתר.
- מוצרים בסטטוס "טיוטה" לא ניתנים לרכישה, אבל נשמרים בנתונים שנקראים בציבור. אל תשימו שם מידע סודי.
- דף ההצלחה הוא הודעה בלבד. הפעלת גישה/מייל מתבצעת רק ב-Webhook (`fulfill`).
- קבלות במייל: Stripe → Settings → Customer emails → Successful payments.
- **חשבונית מס בישראל:** Stripe לא מפיק חשבונית ישראלית. חברו מערכת חשבוניות (Green Invoice, iCount וכו') דרך ה-Webhook.
- מינימום חיוב בסטרייפ תלוי במטבע (בערך 2 ש"ח / 0.50 דולר). מחיר נמוך מזה יחזיר שגיאה בדף התשלום.
