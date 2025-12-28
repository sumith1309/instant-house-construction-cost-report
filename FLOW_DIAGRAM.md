# Visual Flow Diagrams

## 1. User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                            │
└─────────────────────────────────────────────────────────────────┘

Step 1: Free Estimate
┌──────────┐
│  User    │
│  visits  │──────► Fill form (area, spec, location, floors)
│  site    │
└──────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  Calculate Cost Estimate (Button)        │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  FREE RESULT DISPLAYED                   │
│  ₹30,00,000 - ₹36,00,000                │
│  "This is a high-level estimate"         │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  VALUE PROPOSITION                       │
│  "Why this report saves you money"       │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  LOCKED PREVIEW (Blurred)                │
│  "Detailed breakdown locked"             │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  PRICE & CTA                             │
│  ₹499                                    │
│  [Unlock Full Report]                    │
└──────────────────────────────────────────┘

Step 2: Payment
     │
     ▼
┌──────────────────────────────────────────┐
│  Redirect to Gumroad                     │
│  (Payment Gateway)                       │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  User Completes Payment                  │
│  (Credit Card / UPI / etc.)              │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  Gumroad Redirects Back                  │
│  success.html?purchase_id=ABC123         │
└──────────────────────────────────────────┘

Step 3: Verification & Access
     │
     ▼
┌──────────────────────────────────────────┐
│  "Verifying your payment..."             │
│  (Loading spinner)                       │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  Backend Verifies with Gumroad API       │
│  ✓ Purchase is real                      │
│  ✓ Not refunded                          │
│  ✓ Not disputed                          │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  "Payment Successful!"                   │
│  Full breakdown displayed                │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  DETAILED BREAKDOWN                      │
│  - Foundation & Structure: 35%           │
│  - Masonry & Plastering: 20%             │
│  - Flooring & Finishing: 20%             │
│  - Electrical: 10%                       │
│  - Plumbing: 8%                          │
│  - Miscellaneous: 7%                     │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  TIMELINE                                │
│  "Expected duration: 6-8 months"         │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  [Download PDF Report]                   │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  PDF Downloaded                          │
│  construction-cost-1500sqft-2024-12-29   │
└──────────────────────────────────────────┘
```

## 2. Technical Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      TECHNICAL DATA FLOW                        │
└─────────────────────────────────────────────────────────────────┘

Frontend (Browser)                Backend (Vercel)              External
─────────────────                ──────────────────            ────────

1. Calculate Free Estimate
┌──────────────┐
│  index.html  │
│  + app.js    │
└──────┬───────┘
       │
       │ Client-side approximation
       │ (rough calculation only)
       │
       ▼
┌──────────────┐
│ Display      │
│ ₹30L - ₹36L  │
└──────┬───────┘
       │
       │ Save state to localStorage
       │ (base64 encoded)
       │
       ▼
┌──────────────┐
│ localStorage │
│ calc_state   │
└──────────────┘

2. Payment Redirect
┌──────────────┐
│ Click Unlock │
└──────┬───────┘
       │
       │ window.location.href =
       │ "https://gumroad.com/l/product"
       │
       ▼
                                                            ┌──────────┐
                                                            │ Gumroad  │
                                                            │ Payment  │
                                                            └────┬─────┘
                                                                 │
                                                                 │ Process
                                                                 │ Payment
                                                                 │
                                                                 ▼
                                                            ┌──────────┐
                                                            │ Redirect │
                                                            │ + ID     │
                                                            └────┬─────┘
                                                                 │
       ┌─────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│ success.html │
│ ?purchase_id │
└──────┬───────┘

3. Payment Verification
       │
       │ POST /api/verify-payment
       │ { purchaseId, area, spec, ... }
       │
       ├──────────────────────────────►┌─────────────────┐
       │                                │ verify-payment  │
       │                                │ .js             │
       │                                └────────┬────────┘
       │                                         │
       │                                         │ GET /v2/sales/{id}
       │                                         │ Authorization: Bearer
       │                                         │
       │                                         ├──────────────────►┌──────────┐
       │                                         │                   │ Gumroad  │
       │                                         │                   │ API      │
       │                                         │◄──────────────────┤          │
       │                                         │ Sale details      └──────────┘
       │                                         │
       │                                         │ Validate:
       │                                         │ - Not refunded
       │                                         │ - Not disputed
       │                                         │
       │                                         ▼
       │                                ┌─────────────────┐
       │                                │ lib/constants   │
       │                                │ Calculate costs │
       │                                └────────┬────────┘
       │                                         │
       │                                         ▼
       │                                ┌─────────────────┐
       │                                │ lib/jwt         │
       │                                │ Generate token  │
       │                                └────────┬────────┘
       │                                         │
       │◄────────────────────────────────────────┤
       │ { success: true, token: "eyJ..." }
       │
       ▼
┌──────────────┐
│ Store token  │
│ in memory    │
└──────┬───────┘

4. Fetch Breakdown
       │
       │ POST /api/get-breakdown
       │ Authorization: Bearer {token}
       │
       ├──────────────────────────────►┌─────────────────┐
       │                                │ get-breakdown   │
       │                                │ .js             │
       │                                └────────┬────────┘
       │                                         │
       │                                         │ Verify token
       │                                         │ signature
       │                                         │
       │                                         ▼
       │                                ┌─────────────────┐
       │                                │ lib/jwt         │
       │                                │ verifyToken()   │
       │                                └────────┬────────┘
       │                                         │
       │                                         │ Valid?
       │                                         │
       │                                         ▼
       │                                ┌─────────────────┐
       │                                │ lib/constants   │
       │                                │ getBreakdown()  │
       │                                └────────┬────────┘
       │                                         │
       │◄────────────────────────────────────────┤
       │ { breakdown: [...], timeline: "..." }
       │
       ▼
┌──────────────┐
│ Display      │
│ breakdown    │
└──────┬───────┘

5. Generate PDF
       │
       │ POST /api/generate-pdf
       │ Authorization: Bearer {token}
       │
       ├──────────────────────────────►┌─────────────────┐
       │                                │ generate-pdf    │
       │                                │ .js             │
       │                                └────────┬────────┘
       │                                         │
       │                                         │ Verify token
       │                                         │
       │                                         ▼
       │                                ┌─────────────────┐
       │                                │ Return PDF data │
       │                                └────────┬────────┘
       │                                         │
       │◄────────────────────────────────────────┤
       │ { pdfData: { ... } }
       │
       ▼
┌──────────────┐
│ jsPDF        │
│ Generate PDF │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Download     │
│ PDF file     │
└──────────────┘
```

## 3. Security Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                          │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Frontend Obfuscation
─────────────────────────────
┌──────────────────────────────────────┐
│  Frontend JavaScript                 │
│  ✓ No breakdown percentages          │
│  ✓ No calculation formulas           │
│  ✓ Only rough approximation          │
│  ✓ State base64 encoded              │
└──────────────────────────────────────┘
         │
         │ User can inspect but finds nothing
         │
         ▼
    ❌ No secrets to steal


Layer 2: Payment Verification
──────────────────────────────
┌──────────────────────────────────────┐
│  Gumroad API                         │
│  ✓ Verify purchase ID is real       │
│  ✓ Check not refunded                │
│  ✓ Check not disputed                │
└──────────────────────────────────────┘
         │
         │ Cannot fake purchase ID
         │
         ▼
    ❌ Bypass prevented


Layer 3: JWT Token Generation
──────────────────────────────
┌──────────────────────────────────────┐
│  Server generates token              │
│  ✓ Signed with JWT_SECRET            │
│  ✓ Contains verified data            │
│  ✓ Expires in 24 hours               │
└──────────────────────────────────────┘
         │
         │ Cannot forge without secret
         │
         ▼
    ❌ Token cannot be faked


Layer 4: API Authorization
───────────────────────────
┌──────────────────────────────────────┐
│  Every API request                   │
│  ✓ Requires Bearer token             │
│  ✓ Verifies signature                │
│  ✓ Checks expiration                 │
└──────────────────────────────────────┘
         │
         │ Invalid tokens rejected
         │
         ▼
    ❌ Unauthorized access blocked


Layer 5: Server-Side Logic
───────────────────────────
┌──────────────────────────────────────┐
│  lib/constants.js                    │
│  ✓ Real calculation formulas         │
│  ✓ Breakdown percentages             │
│  ✓ Never sent to browser             │
└──────────────────────────────────────┘
         │
         │ User cannot access
         │
         ▼
    ❌ Business logic protected
```

## 4. Attack Prevention Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                    ATTACK PREVENTION                            │
└─────────────────────────────────────────────────────────────────┘

Attack                          Defense                    Result
──────                          ───────                    ──────

Inspect frontend code    →   No secrets in JS         →   ✅ Safe
Modify URL parameters    →   No URL-based auth        →   ✅ Safe
Forge JWT token          →   Requires JWT_SECRET      →   ✅ Safe
Fake purchase ID         →   Gumroad API verify       →   ✅ Safe
Reuse expired token      →   Expiration check         →   ✅ Safe
Manipulate localStorage  →   Backend re-validates     →   ✅ Safe
Bypass payment           →   All data needs token     →   ✅ Safe
Share token              →   24h expiration           →   ✅ Safe
SQL injection            →   No database used         →   ✅ Safe
XSS attack               →   Input validation         →   ✅ Safe
```

## 5. Deployment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT FLOW                            │
└─────────────────────────────────────────────────────────────────┘

Local Development
─────────────────
┌──────────────┐
│ npm install  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Create .env  │
│ - JWT_SECRET │
│ - GUMROAD_*  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ npm run dev  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Test locally │
│ ?dev=true    │
└──────────────┘

Production Deployment
─────────────────────
┌──────────────┐
│ Push to      │
│ GitHub       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Connect to   │
│ Vercel       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Add env vars │
│ in Vercel    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Deploy       │
│ (automatic)  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Update       │
│ Gumroad URL  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Test live    │
│ payment      │
└──────────────┘
```

## 6. Revenue Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        REVENUE FLOW                             │
└─────────────────────────────────────────────────────────────────┘

User pays ₹499
     │
     ▼
┌──────────────────────────────────────┐
│  Gumroad processes payment           │
│  - Takes 10% fee (₹49.90)           │
│  - Handles taxes                     │
│  - Provides invoice                  │
└──────────────────────────────────────┘
     │
     ▼
You receive ₹449.10
     │
     ▼
┌──────────────────────────────────────┐
│  Monthly Revenue Calculation         │
│                                      │
│  100 sales/month                     │
│  = ₹49,900 gross                     │
│  = ₹44,910 net (after Gumroad)      │
│                                      │
│  1,000 sales/month                   │
│  = ₹4,99,000 gross                   │
│  = ₹4,49,100 net                     │
│                                      │
│  10,000 sales/month                  │
│  = ₹49,90,000 gross                  │
│  = ₹44,91,000 net                    │
└──────────────────────────────────────┘
     │
     ▼
Operating costs: ₹0
(Free tier covers 33K sales/month)
     │
     ▼
Net profit = Revenue - ₹0
```

---

**These diagrams provide a visual understanding of the entire system.**
**Refer to other documentation for detailed implementation.**
