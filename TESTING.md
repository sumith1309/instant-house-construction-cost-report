# Testing Guide

Complete testing procedures for the Construction Cost Estimator.

## Local Testing Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials (or use dev mode without them).

### 3. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

## Test Scenarios

### Test 1: Free Estimate Calculation

**Purpose**: Verify basic calculator functionality

**Steps**:
1. Open `http://localhost:3000`
2. Fill in form:
   - Area: 1500
   - Specification: Standard
   - Location: Medium
   - Floors: G+0
3. Click "Calculate Cost Estimate"

**Expected Result**:
- Cost range displayed (approximately ₹30,00,000 - ₹36,00,000)
- "This is a high-level estimate" message shown
- Value proposition section appears
- Payment gate with blurred preview appears

**Pass Criteria**: ✅ All sections display correctly

---

### Test 2: Input Validation

**Purpose**: Verify form validation works

**Steps**:
1. Try to calculate without filling any fields
2. Try with area < 100
3. Try with missing specification
4. Try with missing location
5. Try with missing floors

**Expected Result**:
- Alert messages for each validation error
- No calculation performed
- Form remains in initial state

**Pass Criteria**: ✅ All validations trigger correctly

---

### Test 3: State Persistence

**Purpose**: Verify calculation data is saved

**Steps**:
1. Calculate an estimate
2. Open browser DevTools → Application → Local Storage
3. Check for `calc_state` key

**Expected Result**:
- `calc_state` exists
- Value is base64 encoded
- Decoding reveals: area, specification, location, floors

**Pass Criteria**: ✅ State is saved and encoded

---

### Test 4: Dev Mode Bypass (No Payment)

**Purpose**: Test backend without Gumroad

**Steps**:
1. Calculate an estimate
2. Navigate to: `http://localhost:3000/success.html?dev=true`
3. Wait for verification

**Expected Result**:
- "Verifying payment..." appears briefly
- Success message: "Payment Successful!"
- Total cost range displayed
- Breakdown table populated with 6 rows
- Timeline displayed (6-8 or 8-12 months)
- Assumptions section visible
- "Download PDF Report" button enabled

**Pass Criteria**: ✅ Full breakdown loads without payment

---

### Test 5: Backend API - Verify Payment

**Purpose**: Test payment verification endpoint

**Steps**:
1. Use curl or Postman:

```bash
curl -X POST http://localhost:3000/api/verify-payment \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseId": "dev_test_token",
    "area": 1500,
    "specification": "standard",
    "location": "medium",
    "floors": "g0"
  }'
```

**Expected Result**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Payment verified successfully"
}
```

**Pass Criteria**: ✅ Returns valid JWT token

---

### Test 6: Backend API - Get Breakdown

**Purpose**: Test breakdown endpoint with token

**Steps**:
1. Get token from Test 5
2. Call breakdown endpoint:

```bash
curl -X POST http://localhost:3000/api/get-breakdown \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Result**:
```json
{
  "success": true,
  "data": {
    "breakdown": [
      {
        "component": "Foundation & Structure",
        "percentage": 35,
        "minAmount": 1050000,
        "maxAmount": 1260000
      },
      ...
    ],
    "timeline": "6-8 months",
    "minCost": 3000000,
    "maxCost": 3600000,
    "area": 1500
  }
}
```

**Pass Criteria**: ✅ Returns complete breakdown data

---

### Test 7: Backend API - Invalid Token

**Purpose**: Verify token validation works

**Steps**:
1. Call breakdown endpoint with fake token:

```bash
curl -X POST http://localhost:3000/api/get-breakdown \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake_token_12345"
```

**Expected Result**:
```json
{
  "error": "Invalid or expired token"
}
```

**Pass Criteria**: ✅ Rejects invalid tokens

---

### Test 8: Backend API - Missing Token

**Purpose**: Verify authorization is required

**Steps**:
1. Call breakdown endpoint without token:

```bash
curl -X POST http://localhost:3000/api/get-breakdown \
  -H "Content-Type: application/json"
```

**Expected Result**:
```json
{
  "error": "Missing or invalid authorization token"
}
```

**Pass Criteria**: ✅ Requires authorization header

---

### Test 9: PDF Generation

**Purpose**: Test PDF download functionality

**Steps**:
1. Complete Test 4 (dev mode bypass)
2. Click "Download PDF Report"
3. Check downloaded file

**Expected Result**:
- PDF downloads with filename: `construction-cost-1500sqft-YYYY-MM-DD.pdf`
- PDF contains:
  - Title: "Construction Cost Estimate Report"
  - Project summary (area, spec, location, floors)
  - Total cost range (highlighted)
  - Breakdown table (6 rows)
  - Timeline
  - Assumptions (5 items)
  - Disclaimer

**Pass Criteria**: ✅ PDF generates correctly with all sections

---

### Test 10: Modal Functionality

**Purpose**: Test legal modals

**Steps**:
1. Click "Terms & Conditions" link
2. Verify modal opens
3. Click "Close" button
4. Repeat for "Disclaimer" and "Refund Policy"

**Expected Result**:
- Each modal opens with correct content
- Close button works
- Clicking outside modal closes it
- No page scroll when modal is open

**Pass Criteria**: ✅ All modals work correctly

---

### Test 11: Different Calculation Scenarios

**Purpose**: Verify calculations for various inputs

**Test Cases**:

| Area | Spec    | Location | Floors | Expected Range (approx) |
|------|---------|----------|--------|-------------------------|
| 1000 | Basic   | Low      | G+0    | ₹15L - ₹18L            |
| 1500 | Standard| Medium   | G+0    | ₹30L - ₹36L            |
| 2000 | Premium | High     | G+1    | ₹61L - ₹76L            |
| 2500 | Premium | High     | G+2    | ₹82L - ₹101L           |

**Steps**:
1. For each test case, calculate estimate
2. Use dev mode to see full breakdown
3. Verify costs are reasonable

**Pass Criteria**: ✅ All calculations within expected ranges

---

### Test 12: Token Expiration (Manual)

**Purpose**: Verify tokens expire after 24 hours

**Steps**:
1. Generate a token
2. Modify JWT expiration in `lib/jwt.js` to 10 seconds:
   ```javascript
   expiresIn: '10s'
   ```
3. Get breakdown immediately (should work)
4. Wait 15 seconds
5. Try to get breakdown again (should fail)

**Expected Result**:
- First call succeeds
- Second call returns "Invalid or expired token"

**Pass Criteria**: ✅ Token expiration works

---

### Test 13: Gumroad Integration (Production)

**Purpose**: Test real payment flow

**Prerequisites**:
- Gumroad account set up
- Product created
- Access token configured
- Redirect URL set

**Steps**:
1. Deploy to Vercel (or use production URL)
2. Calculate an estimate
3. Click "Unlock Full Report"
4. Complete payment on Gumroad (use test card)
5. Verify redirect back to success page
6. Check breakdown loads

**Expected Result**:
- Redirects to Gumroad
- Payment processes successfully
- Redirects back with purchase_id
- Backend verifies with Gumroad API
- Breakdown loads correctly

**Pass Criteria**: ✅ End-to-end payment flow works

---

### Test 14: Error Handling

**Purpose**: Verify graceful error handling

**Test Cases**:

1. **Network Error**:
   - Disconnect internet
   - Try to verify payment
   - Expected: "An error occurred during verification"

2. **Invalid Purchase ID**:
   - Go to: `success.html?purchase_id=invalid123`
   - Expected: "Invalid purchase ID"

3. **Missing Calculation Data**:
   - Clear localStorage
   - Go to: `success.html?dev=true`
   - Expected: "Calculation data not found"

4. **API Timeout**:
   - Simulate slow network
   - Expected: Graceful timeout handling

**Pass Criteria**: ✅ All errors handled gracefully

---

### Test 15: Security Tests

**Purpose**: Verify security measures

**Test Cases**:

1. **Inspect Frontend Code**:
   - Open DevTools → Sources
   - Search for "breakdown" or "percentage"
   - Expected: No breakdown percentages in frontend code

2. **Modify localStorage**:
   - Change area to 999999 in localStorage
   - Try to get breakdown
   - Expected: Backend validates and recalculates

3. **Forge Token**:
   - Create fake JWT token
   - Try to get breakdown
   - Expected: "Invalid or expired token"

4. **Reuse Purchase ID**:
   - Use same purchase_id twice
   - Expected: Works (unless you implement purchase tracking)

5. **SQL Injection Attempt**:
   - Try: `area: "1000; DROP TABLE users;"`
   - Expected: Validation error or safe handling

**Pass Criteria**: ✅ All security measures work

---

## Automated Testing (Future)

### Unit Tests

```javascript
// Example: lib/constants.test.js
const { calculateCost } = require('./lib/constants');

test('calculates basic cost correctly', () => {
  const result = calculateCost(1000, 'basic', 'medium', 'g0');
  expect(result.minCost).toBe(1600000);
  expect(result.maxCost).toBe(1900000);
});
```

### Integration Tests

```javascript
// Example: api/verify-payment.test.js
test('verifies dev token', async () => {
  const response = await fetch('/api/verify-payment', {
    method: 'POST',
    body: JSON.stringify({
      purchaseId: 'dev_test_token',
      area: 1500,
      specification: 'standard',
      location: 'medium',
      floors: 'g0'
    })
  });
  
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.success).toBe(true);
  expect(data.token).toBeDefined();
});
```

### E2E Tests (Playwright)

```javascript
// Example: e2e/calculator.spec.js
test('complete purchase flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('#area', '1500');
  await page.selectOption('#specification', 'standard');
  await page.selectOption('#location', 'medium');
  await page.selectOption('#floors', 'g0');
  await page.click('#calculateBtn');
  
  await expect(page.locator('#costRange')).toBeVisible();
  await expect(page.locator('#paymentGate')).toBeVisible();
});
```

## Performance Testing

### Load Testing

Use Apache Bench or Artillery:

```bash
# Test API endpoint
ab -n 1000 -c 10 -p payload.json -T application/json \
  http://localhost:3000/api/verify-payment
```

**Expected**:
- Response time: < 500ms
- Success rate: > 99%
- No memory leaks

### Stress Testing

```bash
# Gradually increase load
artillery quick --count 10 --num 100 http://localhost:3000
```

**Monitor**:
- Function execution time
- Memory usage
- Error rate

## Browser Compatibility

Test in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

**Check**:
- Form inputs work
- Modals display correctly
- PDF downloads
- Responsive design

## Accessibility Testing

Use tools:
- Lighthouse (Chrome DevTools)
- WAVE (browser extension)
- axe DevTools

**Check**:
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- ARIA labels

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] Environment variables set
- [ ] Gumroad product configured
- [ ] Redirect URLs updated
- [ ] JWT_SECRET is strong and random
- [ ] CORS configured correctly
- [ ] Error handling tested
- [ ] PDF generation works
- [ ] Mobile responsive
- [ ] Browser compatibility verified
- [ ] Security tests pass
- [ ] Performance acceptable
- [ ] Legal modals reviewed
- [ ] Disclaimer accurate
- [ ] Refund policy clear

## Monitoring in Production

### Daily Checks

- [ ] Check Vercel function logs
- [ ] Check Gumroad sales dashboard
- [ ] Monitor error rate
- [ ] Check uptime

### Weekly Checks

- [ ] Review failed payments
- [ ] Check refund requests
- [ ] Analyze conversion rate
- [ ] Review user feedback

### Monthly Checks

- [ ] Security audit
- [ ] Performance review
- [ ] Cost analysis
- [ ] Feature requests

## Troubleshooting Common Issues

### Issue: "Payment verification not configured"

**Cause**: GUMROAD_ACCESS_TOKEN not set

**Fix**:
1. Check `.env` file has token
2. Restart dev server
3. Or use dev mode: `?dev=true`

### Issue: Breakdown not loading

**Cause**: Invalid or expired token

**Fix**:
1. Check browser console for errors
2. Verify JWT_SECRET is set
3. Check token hasn't expired
4. Try generating new token

### Issue: PDF not downloading

**Cause**: jsPDF not loading or data missing

**Fix**:
1. Check browser console
2. Verify jsPDF CDN is accessible
3. Check token is valid
4. Verify breakdown data exists

### Issue: Gumroad redirect not working

**Cause**: Redirect URL mismatch

**Fix**:
1. Check Gumroad product settings
2. Verify redirect URL matches your domain
3. Check for typos in URL
4. Test with localhost first

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Gumroad Help**: https://help.gumroad.com
- **JWT.io**: https://jwt.io (decode tokens)
- **jsPDF Docs**: https://github.com/parallax/jsPDF

## Conclusion

Thorough testing ensures:
- ✅ Reliable payment processing
- ✅ Secure data handling
- ✅ Good user experience
- ✅ Minimal support issues
- ✅ Confident deployment

Run all tests before each deployment!
