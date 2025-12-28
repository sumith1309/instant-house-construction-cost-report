# Gumroad Product Setup Guide

## Step 1: Create Your Product

1. Go to https://app.gumroad.com/products
2. Click "New Product" (+ button)
3. Select "Digital Product"

## Step 2: Fill Product Details

**Name:** 
```
Construction Cost Estimate Report
```

**Price:**
```
₹499 (or $6 USD)
```

**Description:**
```
Get a detailed construction cost breakdown for your residential project.

What you get:
✓ Itemized cost breakdown (Foundation, Masonry, Electrical, Plumbing, etc.)
✓ Realistic construction timeline
✓ Professional PDF report
✓ Based on current market rates

Perfect for:
- Homeowners planning construction
- Negotiating with contractors
- Budget planning

Instant access after payment.
```

**Cover Image:** Create a simple image with text "Construction Cost Report"

## Step 3: Configure Redirect URL

This is CRITICAL for the payment flow to work.

1. In product settings, find "After purchase" section
2. Set "Redirect URL" to:
```
https://YOUR-VERCEL-URL.vercel.app/success.html
```

Replace `YOUR-VERCEL-URL` with your actual Vercel deployment URL.

## Step 4: Get Your Product URL

After saving, your product URL will be something like:
```
https://sumithswaroop.gumroad.com/l/construction-cost-report
```

Copy this URL - you'll need to update it in the code.

## Step 5: Generate Access Token

1. Go to https://app.gumroad.com/settings/advanced
2. Scroll to "API" section
3. Click "Generate Access Token"
4. Copy the token (starts with something like `gumroad_...`)
5. Save this - you'll add it to Vercel environment variables

## Step 6: Update Code with Gumroad URL

Update `public/app.js` line 82 with your product URL:

```javascript
const GUMROAD_PRODUCT_URL = 'https://sumithswaroop.gumroad.com/l/YOUR-PRODUCT-SLUG';
```

## Step 7: Test the Flow

1. Go to your deployed site
2. Calculate an estimate
3. Click "Unlock Full Report"
4. You should be redirected to Gumroad
5. Complete a test purchase
6. You should be redirected back to success page
7. Breakdown should load

## Gumroad Settings Checklist

- [ ] Product created with ₹499 price
- [ ] Description is compelling
- [ ] Redirect URL set to your Vercel success page
- [ ] Access token generated
- [ ] Product URL copied

## Important Notes

1. **Redirect URL must match exactly** - Include the full URL with https://
2. **Test with a real purchase** - Gumroad doesn't have a test mode, but you can refund yourself
3. **Access token is secret** - Never commit it to code, only add to Vercel environment variables

## After Setup

Once Gumroad is configured:

1. Add `GUMROAD_ACCESS_TOKEN` to Vercel environment variables
2. Redeploy the project
3. Test the complete payment flow
4. Start marketing!

## Troubleshooting

**"Invalid purchase ID" error:**
- Check that access token is correct in Vercel
- Verify redirect URL matches your domain

**Not redirecting after payment:**
- Check redirect URL in Gumroad product settings
- Make sure URL includes `https://`

**Breakdown not loading:**
- Check Vercel function logs
- Verify JWT_SECRET is set
- Test with `?dev=true` first
