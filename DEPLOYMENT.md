# Deployment Guide - Construction Cost Estimator

## Prerequisites

1. **Gumroad Account** (Free)
   - Sign up at https://gumroad.com
   - Create a product for ₹499
   - Get your product URL and access token

2. **Vercel Account** (Free)
   - Sign up at https://vercel.com
   - Connect your GitHub account

3. **Node.js** (for local testing)
   - Install from https://nodejs.org

## Step 1: Setup Gumroad Product

1. Go to https://gumroad.com/products
2. Click "Create Product"
3. Fill in:
   - Name: "Construction Cost Report"
   - Price: ₹499 (or $6 USD)
   - Description: "Detailed construction cost breakdown with timeline and PDF report"
4. Under "Redirect URL", enter: `https://your-domain.vercel.app/success.html`
5. Save product and copy the product URL (e.g., `https://gumroad.com/l/your-product`)
6. Go to Settings → Advanced → Generate Access Token
7. Copy your access token (starts with `gumroad_`)

## Step 2: Update Frontend with Gumroad URL

Edit `public/app.js` line 82:

```javascript
const GUMROAD_PRODUCT_URL = 'https://gumroad.com/l/YOUR-PRODUCT-SLUG';
```

Replace `YOUR-PRODUCT-SLUG` with your actual Gumroad product slug.

## Step 3: Deploy to Vercel

### Option A: Deploy via GitHub (Recommended)

1. Create a new GitHub repository
2. Push all code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

3. Go to https://vercel.com/new
4. Import your GitHub repository
5. Vercel will auto-detect the configuration
6. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

## Step 4: Configure Environment Variables

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add these variables:

   **JWT_SECRET**
   - Value: Generate a random string (e.g., use https://randomkeygen.com/)
   - Example: `a8f5f167f44f4964e6c998dee827110c`

   **GUMROAD_ACCESS_TOKEN**
   - Value: Your Gumroad access token from Step 1
   - Example: `gumroad_xxxxxxxxxxxxxxxxxxxxxxxx`

4. Click "Save"
5. Redeploy the project (Vercel will prompt you)

## Step 5: Update Gumroad Redirect URL

1. Go back to your Gumroad product settings
2. Update "Redirect URL" to your actual Vercel domain:
   ```
   https://your-project-name.vercel.app/success.html
   ```
3. Save changes

## Step 6: Test the Flow

### Development Testing (Without Payment)

1. Calculate an estimate on your site
2. Instead of clicking "Unlock", manually go to:
   ```
   https://your-domain.vercel.app/success.html?dev=true
   ```
3. This bypasses Gumroad verification for testing

### Production Testing (Real Payment)

1. Calculate an estimate
2. Click "Unlock Full Report"
3. Complete payment on Gumroad (use a test card or real payment)
4. You'll be redirected back with a purchase ID
5. Verify the breakdown loads correctly
6. Test PDF download

## Step 7: Custom Domain (Optional)

1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your custom domain (e.g., `constructioncost.com`)
3. Follow Vercel's DNS configuration instructions
4. Update Gumroad redirect URL to use custom domain

## Security Checklist

- [ ] JWT_SECRET is set and random
- [ ] GUMROAD_ACCESS_TOKEN is set correctly
- [ ] Gumroad redirect URL matches your domain
- [ ] Test both dev and production flows
- [ ] Verify token expiration works (24 hours)
- [ ] Test with invalid purchase IDs
- [ ] Ensure breakdown data never appears in frontend source

## Troubleshooting

### "Payment verification not configured" error
- Check that GUMROAD_ACCESS_TOKEN is set in Vercel environment variables
- Redeploy after adding environment variables

### "Invalid purchase ID" error
- Verify Gumroad access token has correct permissions
- Check that purchase ID is being passed in URL correctly
- Test with `?dev=true` to bypass Gumroad

### Breakdown not loading
- Check browser console for errors
- Verify JWT_SECRET is set
- Check that token is being stored correctly

### PDF not generating
- Ensure jsPDF CDN is loading
- Check browser console for errors
- Verify token is valid and not expired

## Monitoring

1. **Vercel Logs**: Check function logs in Vercel dashboard
2. **Gumroad Analytics**: Monitor sales in Gumroad dashboard
3. **Error Tracking**: Add Sentry or similar (optional)

## Cost Breakdown

- **Vercel**: Free tier (100GB bandwidth, 100 serverless function executions/day)
- **Gumroad**: 10% + payment processing fees per sale
- **Total Monthly Cost**: $0 (until you exceed free tier limits)

## Scaling

Free tier limits:
- Vercel: 100GB bandwidth/month
- Vercel Functions: 100GB-hours compute time

If you exceed these:
- Vercel Pro: $20/month (1TB bandwidth)
- Or migrate to Cloudflare Workers (more generous free tier)

## Support

For issues:
1. Check Vercel function logs
2. Check browser console
3. Verify environment variables
4. Test with dev mode first

## Next Steps

1. Add Google Analytics for tracking
2. Set up email notifications for sales
3. Create a simple admin dashboard
4. Add more payment options (Stripe, Razorpay)
5. Implement email delivery of reports
