# Quick Start Guide - QA Executive Dashboard

## 🚀 Getting Started

### 1. Initial Setup

**Install Dependencies:**

```bash
npm install
```

**Configure Environment Variables:**

Create or update `.env.local`:

```env
# Required for Supabase (if using cloud storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional - For AI PRD Analysis
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Optional - For executive role detection
NEXT_PUBLIC_EXECUTIVE_EMAIL=your_email@example.com
```

**Run Development Server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Authentication

### Demo Mode (No Supabase Auth)

1. Navigate to `/login`
2. Click **"Quick Demo Access"**
3. You're logged in as QA Executive

### With Supabase Auth

1. Navigate to `/login`
2. Enter your email and password
3. Click **"Sign In"**

**Sign Out:**

- Click the "Sign Out" button at the bottom of the sidebar

---

## 📊 Executive Dashboard

**Access:** `/executive` (requires login)

**What You'll See:**

- **Overall Pass Rate** - Aggregate across all projects
- **Active Projects** - Number of projects in active status
- **Open Defects** - Total defects across organization
- **Test Coverage** - Total test cases

**Project Health Cards:**

- Click any project card to navigate to its details
- Color coding:
  - 🟢 Green: Pass rate ≥ 80%
  - 🟡 Amber: Pass rate 60-79%
  - 🔴 Red: Pass rate < 60%

---

## 🤖 AI-Powered PRD Analysis

### Upload and Analyze a PRD

1. **Navigate to a Project:**
   - Go to any project overview or settings page
   - Look for the "PRD Uploader" component

2. **Upload Document:**
   - Click "Select File"
   - Choose a `.txt` or `.md` file
   - Supported: Plain text, Markdown

3. **Analyze:**
   - Click **"Analyze with AI"**
   - Wait 5-10 seconds for processing
   - AI will extract test cases from the PRD

4. **Review Results:**
   - See generated test cases with:
     - Test Case ID (TC-001, TC-002, etc.)
     - Scenario description
     - Module/feature area
     - Step-by-step instructions
     - Expected results

5. **Import:**
   - Click **"Import Test Cases"**
   - Test cases are added to your project
   - Status: "Pending"

### Example PRD Content

Create a file `sample-prd.txt`:

```
User Authentication Feature

Requirements:
1. Users must be able to log in with email and password
2. System should validate email format
3. Failed login attempts should show error message
4. Successful login redirects to dashboard
5. Password must be at least 8 characters

Security:
- Passwords must be hashed
- Session timeout after 30 minutes
- Maximum 5 failed attempts before lockout
```

Upload this and the AI will generate test cases for each requirement.

---

## 🔗 Share Public Reports

### Generate Shareable Link

1. **Navigate to Reports:**
   - Go to `/projects/[your-project-id]/reports`

2. **Find "Share Public Summary" Card:**
   - Located in the left sidebar
   - Blue-tinted card with share icon

3. **Copy Link:**
   - Click the **Copy** button
   - Link is copied to clipboard
   - Example: `https://yourapp.com/public/projects/credit-bureau`

4. **Preview:**
   - Click **"Preview Public View"**
   - Opens in new tab
   - See exactly what stakeholders will see

### What Stakeholders See

When they open the public link:

- ✅ Project name and description
- ✅ Pass rate percentage
- ✅ Total test counts
- ✅ Open vs. resolved defects
- ✅ Test execution breakdown
- ❌ No edit controls
- ❌ No sensitive data
- ❌ No login required

---

## 📋 Common Workflows

### Daily QA Executive Workflow

**Morning Check:**

```
1. Login at /login
2. Go to /executive
3. Review overall pass rate
4. Check for projects with red health indicators
5. Review open defects count
```

**Project Deep Dive:**

```
1. Click project health card
2. Review functional/non-functional tests
3. Check defect tracking
4. Update test statuses
```

**Weekly Reporting:**

```
1. Go to project reports page
2. Generate shareable link
3. Send to stakeholders via email
4. Export CSV/JSON for records
```

### Stakeholder Workflow

**View Project Status:**

```
1. Receive public link from QA Executive
2. Open link (no login needed)
3. View pass rates and test counts
4. Check defect statistics
```

---

## 🎯 Tips & Best Practices

### For AI PRD Analysis

**✅ Do:**

- Use clear, structured PRD documents
- Include numbered requirements
- Specify expected behaviors
- Use plain text or Markdown

**❌ Don't:**

- Upload extremely large files (>15,000 chars)
- Use complex PDF formatting (not yet supported)
- Expect 100% accuracy (always review generated tests)

### For Public Sharing

**✅ Do:**

- Share public links with external stakeholders
- Use for client demos and status updates
- Include in weekly reports

**❌ Don't:**

- Share internal dashboard links (requires login)
- Expect stakeholders to edit data (read-only)

### For Executive Dashboard

**✅ Do:**

- Check daily for overall health
- Use color coding to prioritize attention
- Monitor defect trends

**❌ Don't:**

- Ignore red health indicators
- Forget to update test statuses regularly

---

## 🐛 Troubleshooting

### AI Analysis Not Working

**Problem:** "Analysis failed" error

**Solutions:**

1. Check if `GOOGLE_GENERATIVE_AI_API_KEY` is set in `.env.local`
2. Verify API key is valid
3. Check file format (must be `.txt` or `.md`)
4. Try with smaller file (<10KB)

**Fallback:** App will use mock data if API key is missing

### Public Link Not Working

**Problem:** 404 error on public link

**Solutions:**

1. Verify project exists and is active
2. Check project ID in URL is correct
3. Ensure build is up to date: `npm run build`

### Login Issues

**Problem:** Can't sign in

**Solutions:**

1. **Demo Mode:** Use "Quick Demo Access" button
2. **Supabase Auth:** Verify environment variables
3. Check browser console for errors

---

## 📞 Support

For issues or questions:

1. Check `.gemini/IMPLEMENTATION_SUMMARY.md` for detailed docs
2. Review `.gemini/QA_EXECUTIVE_DASHBOARD_PLAN.md` for architecture
3. Check build logs: `npm run build`

---

## 🎉 You're All Set!

Your QA Executive Dashboard is ready to use. Start by:

1. ✅ Logging in at `/login`
2. ✅ Viewing your executive dashboard at `/executive`
3. ✅ Uploading a PRD to test AI analysis
4. ✅ Sharing a public report with a stakeholder

**Happy Testing!** 🚀
