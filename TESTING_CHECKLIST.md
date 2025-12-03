# 🧪 CYNICAL TESTER'S CHECKLIST

This is your comprehensive testing guide to ensure everything works before launch.

---

## ⚡ PRE-FLIGHT CHECKS

### 1. Environment Setup
- [ ] All API keys in `.env.local`
- [ ] Supabase project accessible
- [ ] SendGrid verified sender email configured
- [ ] Node modules installed (`npm install`)

### 2. Database Setup
- [ ] Run migration: `001_initial_schema.sql`
- [ ] Run migration: `002_fix_no_auth.sql`
- [ ] Verify tables exist in Supabase dashboard
- [ ] Verify storage buckets exist (`investigation-files`, `reports`)

---

## 🚀 STARTUP TEST

```bash
cd investigator-ai
npm run dev
```

**Expected:**
- Server starts on http://localhost:3000
- No compilation errors
- Homepage loads successfully

**Common Issues:**
- Port 3000 in use → Kill process or use different port
- Module not found → Run `npm install`
- Environment var missing → Check `.env.local`

---

## 🏠 HOMEPAGE TESTS

### Test 1: Page Loads
- [ ] Homepage renders without errors
- [ ] All sections visible (header, hero, features, footer)
- [ ] Responsive design works (test mobile view)

### Test 2: Quick Investigation Form
- [ ] Can type in "Company Name" field
- [ ] Can type in "Website URL" field
- [ ] Can type in "Email" field
- [ ] Button is clickable
- [ ] Button shows loading state when clicked

### Test 3: Form Validation
- [ ] Empty form shows alert
- [ ] Valid input redirects to investigation page
- [ ] Invalid email shows error (if validation added)

**Test Cases:**
1. Just company name → Should work
2. Company name + URL → Should work
3. Company name + email → Should work
4. Empty → Should show alert

---

## 📁 INVESTIGATION PORTAL TESTS

### Test 4: Portal Loads
After submitting homepage form:
- [ ] Redirects to `/investigate/[id]` page
- [ ] Investigation ID in URL is valid UUID
- [ ] Target name displays correctly
- [ ] Status badge shows "pending"

### Test 5: File Upload
- [ ] Click upload area opens file picker
- [ ] Can select single file
- [ ] Can select multiple files
- [ ] Upload progress shown
- [ ] Success toast appears
- [ ] File count updates

**Test with these files:**
- [ ] Small PDF (< 1MB)
- [ ] Large PDF (> 5MB)
- [ ] PNG image
- [ ] JPG image
- [ ] Multiple files at once
- [ ] Invalid file type (should reject)
- [ ] File > 20MB (should reject)

### Test 6: Text Content
- [ ] Can paste text into textarea
- [ ] Text persists when typing
- [ ] Can clear and re-enter text
- [ ] Long text (> 5000 chars) works
- [ ] Special characters don't break (test: `<script>`, emojis, etc.)

### Test 7: URL Submission
- [ ] Can enter URL in field
- [ ] Press Enter adds URL to list
- [ ] Click button adds URL to list
- [ ] Can remove URL from list
- [ ] Multiple URLs can be added
- [ ] Invalid URL shows error

**Test URLs:**
- [ ] `https://google.com`
- [ ] `http://example.com` (http)
- [ ] `google.com` (no protocol - should fail)
- [ ] `not-a-url` (should fail)

### Test 8: Submit Investigation
- [ ] Submit button works with only files
- [ ] Submit button works with only text
- [ ] Submit button works with only URLs
- [ ] Submit button works with all three
- [ ] Empty submission shows error
- [ ] Button shows loading state
- [ ] Success toast appears
- [ ] Status changes to "processing"

---

## 🤖 AI INVESTIGATION TESTS

### Test 9: Investigation Processing
After submission:
- [ ] Status updates to "processing"
- [ ] Progress indicator shows
- [ ] Status messages update
- [ ] Page polls for updates (check network tab)

### Test 10: Investigation Completion
Wait 2-5 minutes:
- [ ] Status changes to "completed"
- [ ] Auto-redirects to results page
- [ ] Results page loads successfully

**Monitor Console for Errors:**
```bash
# In terminal where npm run dev is running
# Watch for these logs:
✓ Investigation started
✓ Web research complete
✓ Document analysis complete
✓ Analysis generated
✓ PDF created
✓ Email sent (if email provided)
```

### Test 11: Edge Cases
Test with these targets:
- [ ] **Legitimate company:** "Microsoft" or "Apple"
  - Expected: High score (8-10), TRUST recommendation
- [ ] **Controversial company:** Search for companies with mixed reviews
  - Expected: Medium score (5-7), PROCEED_WITH_CAUTION
- [ ] **Known scam:** Search for known scam sites/companies
  - Expected: Low score (1-3), AVOID or HIGH_RISK_SCAM
- [ ] **Non-existent entity:** "XYZ123FAKE456COMPANY"
  - Expected: Should handle gracefully, low confidence

### Test 12: API Timeout Handling
- [ ] Investigation completes within 10 minutes
- [ ] If timeout, status shows "failed"
- [ ] Error message is user-friendly

---

## 📊 RESULTS PAGE TESTS

### Test 13: Report Display
- [ ] Legitimacy score displays correctly (1-10)
- [ ] Score color matches level (green=high, red=low)
- [ ] Recommendation badge shows correct text
- [ ] Recommendation color matches severity
- [ ] Executive summary is readable
- [ ] All tabs are clickable

### Test 14: Tabs Content
- [ ] **Key Findings tab:**
  - Shows bullet-point list
  - Each finding has check icon
  - Text is readable and formatted

- [ ] **Red Flags tab:**
  - Shows if red flags exist
  - Each flag has severity badge
  - Evidence and impact displayed
  - Shows "No red flags" if none

- [ ] **Legitimacy tab:**
  - Shows positive indicators
  - Each indicator has strength rating
  - Evidence provided

- [ ] **Risk Assessment tab:**
  - All 4 risk categories show (financial, privacy, reputation, legal)
  - Each has level badge (critical/high/medium/low)
  - Descriptions are clear

### Test 15: Recommendations
- [ ] "For You" section has actionable advice
- [ ] "Next Steps" section has clear actions
- [ ] Recommendations match the verdict

### Test 16: PDF Download
- [ ] "Download PDF" button visible
- [ ] Click downloads file
- [ ] PDF opens successfully
- [ ] PDF contains all report data
- [ ] PDF is professionally formatted
- [ ] Colors render correctly in PDF
- [ ] Page breaks are logical

---

## 📧 EMAIL TESTS

### Test 17: Email Delivery
If email was provided:
- [ ] Email received in inbox (check spam too)
- [ ] Subject line is clear
- [ ] Email HTML renders correctly
- [ ] Score and recommendation shown
- [ ] Executive summary included
- [ ] "Download Report" link works
- [ ] Link downloads correct PDF
- [ ] From address is correct
- [ ] No broken images or formatting

**Test different email providers:**
- [ ] Gmail
- [ ] Outlook
- [ ] Yahoo
- [ ] Custom domain

### Test 18: Email Edge Cases
- [ ] Invalid email in form → No crash, investigation still runs
- [ ] No email provided → Investigation runs, no email sent
- [ ] Multiple investigations to same email → Both received

---

## 🔒 SECURITY & PERFORMANCE TESTS

### Test 19: Malicious Input
- [ ] SQL injection attempts in forms (e.g., `'; DROP TABLE--`)
- [ ] XSS attempts (e.g., `<script>alert('xss')</script>`)
- [ ] Very long strings (10,000+ characters)
- [ ] Special characters in all fields
- [ ] Unicode/emoji in company names

**Expected:** All should be handled safely, no crashes.

### Test 20: File Upload Security
- [ ] Upload .exe file → Should reject
- [ ] Upload .sh script → Should reject
- [ ] Upload renamed malicious file (virus.txt) → Depends on validation
- [ ] Upload file with no extension → Should handle gracefully
- [ ] Upload 0-byte file → Should reject or handle

### Test 21: Performance
- [ ] Upload 10 files at once → Should work
- [ ] Create multiple investigations simultaneously → Should queue properly
- [ ] Refresh page during processing → Should resume correctly
- [ ] Network interruption → Should retry or fail gracefully

### Test 22: Browser Compatibility
Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

### Test 23: Mobile Responsiveness
- [ ] Homepage readable on mobile
- [ ] Forms usable on mobile
- [ ] File upload works on mobile
- [ ] Results page scrollable
- [ ] PDFs downloadable on mobile

---

## 🚨 ERROR HANDLING TESTS

### Test 24: Network Errors
- [ ] Disable internet mid-investigation → Graceful error
- [ ] Slow connection → Shows loading states
- [ ] API timeout → Shows error message

### Test 25: Database Errors
- [ ] Invalid investigation ID in URL → 404 page
- [ ] Deleted investigation → Graceful error
- [ ] Database connection lost → Error message

### Test 26: AI API Errors
- [ ] Claude API key invalid → Error logged, status="failed"
- [ ] Claude API rate limit → Retry or fail gracefully
- [ ] Malformed AI response → Handle parsing errors

---

## ✅ ACCEPTANCE CRITERIA

**The app is ready for launch when:**

### Core Functionality (MUST HAVE):
- [x] ✅ Homepage loads and looks professional
- [ ] ✅ Can create investigation from homepage
- [ ] ✅ Can upload files successfully
- [ ] ✅ AI investigation completes successfully
- [ ] ✅ Results page displays comprehensive report
- [ ] ✅ PDF download works
- [ ] ✅ Email delivery works (if email provided)

### User Experience (MUST HAVE):
- [ ] ✅ No console errors on happy path
- [ ] ✅ Loading states are clear
- [ ] ✅ Error messages are user-friendly
- [ ] ✅ Mobile experience is acceptable
- [ ] ✅ Response time < 5 minutes for investigations

### Polish (NICE TO HAVE):
- [ ] 🟡 No build warnings
- [ ] 🟡 All images optimized
- [ ] 🟡 SEO meta tags set
- [ ] 🟡 Analytics integrated

---

## 📝 BUG REPORTING TEMPLATE

When you find a bug:

```markdown
**Bug Title:**
Brief description

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. Enter...

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Screenshots:**
[If applicable]

**Browser/Device:**
Chrome 120 / Windows 11

**Console Errors:**
[Paste any errors from browser console]

**Priority:**
Critical / High / Medium / Low
```

---

## 🎯 FINAL CHECKLIST BEFORE LAUNCH

- [ ] All critical bugs fixed
- [ ] Database migrations run successfully
- [ ] All environment variables set in production
- [ ] SendGrid sender verified
- [ ] Tested full flow end-to-end at least 3 times
- [ ] Tested with real company/entity
- [ ] PDF generation works in production
- [ ] Email delivery works in production
- [ ] Mobile testing completed
- [ ] Security review completed
- [ ] Performance acceptable (< 5 min investigations)
- [ ] Error handling tested
- [ ] Documentation updated
- [ ] README.md accurate
- [ ] Support email configured

---

**GO/NO-GO Decision:**

If ALL "MUST HAVE" items are ✅, you're ready to launch! 🚀
If any "MUST HAVE" is ❌, fix it before launch.
"NICE TO HAVE" items can be post-launch improvements.

---

**Remember:** It's better to launch with a working MVP than to wait for perfection!
