# Quick Start Guide

Get your construction cost calculator running in 10 minutes.

## 1. Install Dependencies

```bash
npm install
```

## 2. Local Development

```bash
npm run dev
```

This starts Vercel dev server at `http://localhost:3000`

## 3. Test Locally (Without Payment)

1. Open `http://localhost:3000`
2. Fill in the calculator form
3. Click "Calculate Cost Estimate"
4. Instead of clicking "Unlock", go directly to:
   ```
   http://localhost:3000/success.html?dev=true
   ```
5. You should see the full breakdown without payment

## 4. Setup Gumroad (5 minutes)

1. Sign up at https://gumroad.com (free)
2. Create a product:
   - Name: "Construction Cost Report"
   - Price: ₹499 or $6 USD
   - Redirect URL: `http://localhost:3000/success.html` (for testing)
3. Copy your product URL (e.g., `https://gumroad.com/l/your-product`)
4. Get access token: Settings → Advanced → Generate Access Token

## 5. Configure Environment Variables

Create `.env` file in root:

```env
JWT_SECRET=your-random-secret-key-here
GUMROAD_ACCESS_TOKEN=your-gumroad-token-here
```

Generate JWT_SECRET: https://randomkeygen.com/ (use "CodeIgniter Encryption Keys")

## 6. Update Gumroad URL

Edit `public/app.js` line 82:

```javascript
const GUMROAD_PRODUCT_URL = 'https://gumroad.com/l/YOUR-PRODUCT-SLUG';
```

## 7. Test Full Flow Locally

1. Restart dev server: `npm run dev`
2. Calculate an estimate
3. Click "Unlock Full Report"
4. Complete payment on Gumroad (use test mode)
5. You'll be redirected back with breakdown

## 8. Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Or connect GitHub repo at https://vercel.com/new

## 9. Configure Production Environment

In Vercel dashboard:
1. Settings → Environment Variables
2. Add `JWT_SECRET` and `GUMROAD_ACCESS_TOKEN`
3. Redeploy

## 10. Update Gumroad Redirect

Change Gumroad redirect URL to:
```
https://your-project.vercel.app/success.html
```

## Done!

Your calculator is now live and accepting payments.

## Troubleshooting

**"Payment verification not configured"**
- Add GUMROAD_ACCESS_TOKEN to environment variables
- Restart dev server or redeploy

**Breakdown not loading**
- Check browser console for errors
- Verify JWT_SECRET is set
- Try dev mode: `?dev=true`

**PDF not generating**
- Check if jsPDF CDN is loading
- Look for errors in browser console

## Next Steps

- [ ] Add custom domain
- [ ] Set up Google Analytics
- [ ] Customize pricing
- [ ] Add more payment options
- [ ] Create email notifications

## Support

- Check `DEPLOYMENT.md` for detailed instructions
- Check `SECURITY.md` for security details
- Check Vercel function logs for errors
