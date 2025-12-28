# System Architecture

## High-Level Overview

```
┌─────────────┐
│   Browser   │
│  (Frontend) │
└──────┬──────┘
       │
       │ 1. Calculate (free estimate)
       │
       ▼
┌─────────────────────────────────┐
│  index.html + app.js            │
│  - Input form                   │
│  - Client-side approximation    │
│  - State management             │
└──────┬──────────────────────────┘
       │
       │ 2. Redirect to payment
       │
       ▼
┌─────────────────────────────────┐
│        Gumroad                  │
│  - Payment processing           │
│  - Returns purchase_id          │
└──────┬──────────────────────────┘
       │
       │ 3. Redirect with purchase_id
       │
       ▼
┌─────────────────────────────────┐
│  success.html + success.js      │
│  - Calls verify-payment API     │
└──────┬──────────────────────────┘
       │
       │ 4. POST /api/verify-payment
       │    { purchaseId, area, spec, ... }
       │
       ▼
┌─────────────────────────────────┐
│  Vercel Serverless Function     │
│  /api/verify-payment.js         │
│  - Calls Gumroad API            │
│  - Validates purchase           │
│  - Generates JWT token          │
└──────┬──────────────────────────┘
       │
       │ 5. Returns { token }
       │
       ▼
┌─────────────────────────────────┐
│  success.js                     │
│  - Stores token                 │
│  - Calls get-breakdown API      │
└──────┬──────────────────────────┘
       │
       │ 6. POST /api/get-breakdown
       │    Authorization: Bearer <token>
       │
       ▼
┌─────────────────────────────────┐
│  Vercel Serverless Function     │
│  /api/get-breakdown.js          │
│  - Verifies JWT token           │
│  - Calculates breakdown         │
│  - Returns detailed data        │
└──────┬──────────────────────────┘
       │
       │ 7. Returns { breakdown, timeline }
       │
       ▼
┌─────────────────────────────────┐
│  success.html                   │
│  - Displays breakdown           │
│  - Enables PDF download         │
└─────────────────────────────────┘
```

## Component Breakdown

### Frontend (Static Files)

**Location**: `/public/`

**Files**:
- `index.html` - Main calculator page
- `app.js` - Calculator logic and payment redirect
- `success.html` - Post-payment page
- `success.js` - Payment verification and data display

**Responsibilities**:
- Collect user inputs
- Show free estimate (approximation)
- Redirect to Gumroad for payment
- Verify payment and display results
- Generate PDF from server data

**Security**:
- No sensitive calculation logic
- No hardcoded breakdown percentages
- State stored in localStorage (base64 encoded)
- All real data comes from backend APIs

### Backend (Serverless Functions)

**Location**: `/api/`

**Files**:
- `verify-payment.js` - Payment verification endpoint
- `get-breakdown.js` - Breakdown data endpoint
- `generate-pdf.js` - PDF data endpoint

**Responsibilities**:
- Verify Gumroad purchases
- Generate and validate JWT tokens
- Perform accurate cost calculations
- Return breakdown data to authorized users

**Security**:
- All endpoints validate inputs
- JWT token required for protected endpoints
- Gumroad API verification
- Server-side calculation logic

### Shared Libraries

**Location**: `/lib/`

**Files**:
- `constants.js` - Cost calculation logic (server-only)
- `jwt.js` - Token generation and verification

**Responsibilities**:
- Centralized calculation logic
- Token management
- Input validation

**Security**:
- Never exposed to frontend
- Contains sensitive business logic
- Used only by backend functions

## Data Flow

### 1. Free Estimate Flow

```
User Input → Client Validation → Rough Calculation → Display Range
                                                    ↓
                                            Save State (localStorage)
```

**Data**:
- Input: area, specification, location, floors
- Output: Approximate cost range (₹X - ₹Y)

**Security**: Client-side calculation is intentionally rough. Real calculation happens server-side.

### 2. Payment Flow

```
User Clicks "Unlock" → Redirect to Gumroad → User Pays → Gumroad Redirects
                                                              ↓
                                                    success.html?purchase_id=XXX
```

**Data**:
- Gumroad receives: Product ID, user email
- Gumroad returns: purchase_id, sale_id
- Redirect URL includes purchase_id

**Security**: Purchase ID is verified with Gumroad API, cannot be forged.

### 3. Verification Flow

```
Frontend → POST /api/verify-payment → Gumroad API → Validate → Generate Token
              { purchaseId, inputs }                              ↓
                                                        Return { token }
```

**Data**:
- Input: purchaseId, area, specification, location, floors
- Gumroad API returns: sale details, refund status
- Output: Signed JWT token with 24h expiration

**Security**: 
- Gumroad API verifies purchase is real
- Checks for refunds/disputes
- Token cryptographically signed
- Cannot be forged or modified

### 4. Breakdown Flow

```
Frontend → POST /api/get-breakdown → Verify Token → Calculate → Return Data
           Authorization: Bearer <token>              ↓
                                            lib/constants.js
```

**Data**:
- Input: JWT token (contains calculation inputs)
- Processing: Server-side calculation using real formulas
- Output: Detailed breakdown, timeline, costs

**Security**:
- Token signature verified
- Token expiration checked
- Calculation logic never exposed
- User cannot manipulate results

### 5. PDF Generation Flow

```
Frontend → POST /api/generate-pdf → Verify Token → Return PDF Data → jsPDF
           Authorization: Bearer <token>                              ↓
                                                            Client-side PDF
```

**Data**:
- Input: JWT token
- Output: Complete report data (breakdown, timeline, assumptions)
- Frontend uses jsPDF to generate PDF

**Security**:
- Token required
- PDF data only available to verified users
- Client-side generation (no server resources)

## Security Architecture

### Defense Layers

```
Layer 1: Frontend Obfuscation
├─ No sensitive logic in JavaScript
├─ State encoded (not encrypted)
└─ Rough approximation only

Layer 2: Payment Verification
├─ Gumroad API verification
├─ Check refund/dispute status
└─ Unique purchase IDs

Layer 3: JWT Authentication
├─ Cryptographically signed tokens
├─ 24-hour expiration
├─ Contains verified data
└─ Cannot be forged

Layer 4: API Authorization
├─ Bearer token in headers
├─ Signature verification
├─ Expiration checking
└─ Input validation

Layer 5: Server-Side Logic
├─ Calculation in lib/constants.js
├─ Never sent to browser
├─ Validated inputs
└─ Secure computation
```

### Attack Surface Analysis

**Frontend**:
- ✅ Can be inspected (but contains no secrets)
- ✅ Can be modified (but backend validates everything)
- ✅ State can be manipulated (but backend recalculates)

**Backend**:
- ❌ Cannot access without valid token
- ❌ Cannot forge tokens (requires JWT_SECRET)
- ❌ Cannot bypass payment (Gumroad verification)
- ❌ Cannot access calculation logic (server-only)

**Payment**:
- ❌ Cannot fake purchase IDs (Gumroad API checks)
- ❌ Cannot reuse refunded purchases (status checked)
- ❌ Cannot share tokens (expire after 24h)

## Deployment Architecture

### Vercel Platform

```
┌─────────────────────────────────────────┐
│           Vercel Edge Network           │
│  (CDN for static files, global)         │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐    ┌──────────────┐
│ Static  │    │  Serverless  │
│  Files  │    │  Functions   │
│         │    │              │
│ /public │    │    /api      │
└─────────┘    └──────────────┘
                      │
                      │ Calls external APIs
                      │
                      ▼
              ┌───────────────┐
              │  Gumroad API  │
              └───────────────┘
```

**Static Files**:
- Served from Vercel CDN
- Global edge locations
- Instant loading
- No server required

**Serverless Functions**:
- Node.js runtime
- Auto-scaling
- Pay-per-execution
- Cold start: ~100-300ms

**Environment Variables**:
- Stored in Vercel dashboard
- Encrypted at rest
- Injected at runtime
- Never exposed to frontend

## Scalability

### Current Limits (Free Tier)

- **Bandwidth**: 100GB/month
- **Function Executions**: 100GB-hours/month
- **Function Duration**: 10 seconds max
- **Concurrent Executions**: 1000

### Estimated Capacity

**Assumptions**:
- Average page size: 500KB
- Average function execution: 200ms
- 3 API calls per purchase

**Capacity**:
- ~200,000 page views/month
- ~33,000 purchases/month
- ~$16,500 revenue/month (at ₹499 each)

### Scaling Strategy

**If you exceed free tier**:

1. **Upgrade Vercel** ($20/month for Pro)
   - 1TB bandwidth
   - 1000GB-hours compute
   - ~2M page views/month

2. **Optimize Assets**
   - Compress images
   - Minify JavaScript
   - Use lazy loading

3. **Add Caching**
   - Cache static responses
   - CDN for assets
   - Browser caching headers

4. **Migrate Backend** (if needed)
   - Cloudflare Workers (more generous free tier)
   - AWS Lambda (pay-per-use)
   - Self-hosted VPS

## Monitoring & Observability

### What to Monitor

1. **Function Logs** (Vercel Dashboard)
   - Payment verification failures
   - Token validation errors
   - API errors

2. **Gumroad Dashboard**
   - Sales volume
   - Refund rate
   - Revenue

3. **Browser Console** (User-side)
   - JavaScript errors
   - API failures
   - PDF generation issues

### Key Metrics

- **Conversion Rate**: Free estimates → Paid purchases
- **Payment Success Rate**: Gumroad redirects → Verified tokens
- **Error Rate**: Failed API calls / Total calls
- **Token Expiration**: Users trying to access after 24h

## Future Enhancements

### Phase 1: Reliability
- [ ] Add database for purchase tracking
- [ ] Implement retry logic for API calls
- [ ] Add error monitoring (Sentry)
- [ ] Set up uptime monitoring

### Phase 2: Features
- [ ] Email delivery of reports
- [ ] Multiple payment options (Stripe, Razorpay)
- [ ] User accounts (optional)
- [ ] Report history

### Phase 3: Scale
- [ ] Caching layer (Redis)
- [ ] Rate limiting
- [ ] Load balancing
- [ ] Database optimization

### Phase 4: Business
- [ ] A/B testing
- [ ] Analytics dashboard
- [ ] Affiliate program
- [ ] API for partners

## Technology Choices

### Why Vercel?
- ✅ Free tier is generous
- ✅ Serverless = no server management
- ✅ Auto-scaling
- ✅ Global CDN
- ✅ Easy deployment
- ✅ Built-in HTTPS

### Why Gumroad?
- ✅ No upfront costs
- ✅ Simple integration
- ✅ Handles payments, taxes, invoices
- ✅ 10% fee (reasonable)
- ✅ No monthly fees
- ✅ Good for digital products

### Why JWT?
- ✅ Stateless (no database needed)
- ✅ Cryptographically secure
- ✅ Industry standard
- ✅ Built-in expiration
- ✅ Can include data in token

### Why jsPDF?
- ✅ Client-side generation (no server load)
- ✅ Free and open source
- ✅ No external dependencies
- ✅ Works in all browsers
- ✅ Customizable

## Conclusion

This architecture provides:
- ✅ Strong security (multi-layer defense)
- ✅ Low cost ($0 to start)
- ✅ Easy deployment (one command)
- ✅ Scalability (handles 33K purchases/month)
- ✅ Maintainability (simple codebase)
- ✅ Reliability (serverless auto-scaling)
