# 📊 Dunamis Youth Empowerment — Analytics Dashboard

> A production-grade interactive analytics dashboard built for **Dunamis International Gospel Centre**, visualising responses from the Youth Empowerment Programme intake form.

---

## ✨ Overview

This dashboard transforms raw form submission data into actionable insights — helping leadership and programme coordinators make data-driven decisions about outreach, training allocation, and branch performance.

**160+ respondents** across multiple branches are analysed across demographics, employment status, education levels, and course interests — all in a fast, responsive web interface.

---

## 🖥️ Live Demo

> 🚀 **[View Dashboard →](https://your-project.vercel.app)**  
> *(Replace with your Vercel deployment URL after deploying)*

---

## 🎯 Features

### 📈 Interactive Charts
- **Gender Distribution** — doughnut chart breakdown of male/female respondents
- **Employment Status** — bar chart showing employed, unemployed, student, and self-employed segments
- **Education Levels** — distribution across WAEC, OND, HND, BSc, MSc, and PhD holders
- **Course Interest Fields** — visual breakdown of skill areas respondents want to train in
- **Branch Analysis** — per-branch response volumes and demographic comparisons

### 🔍 Advanced Filtering
- Filter by branch, gender, employment status, and education level simultaneously
- All charts and tables update in real-time as filters are applied
- Clear all filters with a single click

### 📤 Export Tools
- **PDF Report** — formatted summary report for presentations and archiving
- **Excel Workbook** — full data export with styled headers for further analysis
- **CSV Export** — raw data for use in external tools (SPSS, Power BI, Google Sheets, etc.)

### 🗂️ Three-Tab Layout
| Tab | Contents |
|-----|----------|
| **Overview** | High-level KPIs and all demographic charts |
| **Branch Analysis** | Per-branch breakdowns and comparisons |
| **Data Table** | Searchable, paginated full response table |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Charts | [Recharts](https://recharts.org/) |
| Language | TypeScript (strict mode) |
| Package Manager | [pnpm](https://pnpm.io/) |
| Deployment | [Vercel](https://vercel.com/) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Dashboard entry point
│   └── api/
│       └── export/         # PDF, Excel, CSV export routes
├── components/
│   ├── Dashboard.tsx       # Main dashboard shell
│   ├── charts/             # All chart components
│   ├── filters/            # Filter panel components
│   └── table/              # Data table components
├── lib/
│   ├── static-data.ts      # All 160+ form responses (static mode)
│   └── sheets.ts           # Google Sheets integration (optional)
├── public/                 # Static assets
├── postcss.config.mjs      # Tailwind v4 PostCSS config
└── tailwind.config.ts      # Tailwind configuration
```

---

## ⚙️ Data Modes

The dashboard supports two data sources and gracefully falls back to static data when no live integration is configured.

### Mode 1 — Static Data (Default)

All 160+ responses are bundled directly into the app via `lib/static-data.ts`. No external services or environment variables needed. **This is the current deployed mode.**

### Mode 2 — Live Google Sheets Sync

To connect a live Google Sheet that automatically reflects new form submissions:

1. Create a service account in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Google Sheets API**
3. Share your sheet with the service account email
4. Create a `.env.local` file:

```env
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

5. Restart the dev server — the dashboard will automatically use live data.

> **Note:** When deploying with live Google Sheets, add these same environment variables to your Vercel project settings under **Settings → Environment Variables**.

---

## 🌐 Deployment (Vercel)

This app is optimised for Vercel deployment.

```bash
# Install Vercel CLI (optional, for CLI-based deploys)
npm install -g vercel

# Deploy
vercel --prod
```

Or deploy via the Vercel dashboard:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repository
4. Leave all build settings as default — Vercel auto-detects Next.js
5. Click **Deploy**

> 💡 For static-only mode, no environment variables are needed.

---

## 📸 Dashboard Preview

| Section | Description |
|---------|-------------|
| Overview | KPI cards + demographic charts in a dark fintech layout |
| Branch Analysis | Side-by-side branch comparisons |
| Data Table | Full searchable respondent table with pagination |

---

## 🤝 Contributing

This is an internal tool for Dunamis International Gospel Centre. For updates to the dataset or new feature requests, please reach out to the development team or open an issue on this repository.

---

## 📄 License

This project is proprietary to **Dunamis International Gospel Centre**. All rights reserved.

---

<div align="center">
  <p>Built with ❤️ for the Dunamis Youth Empowerment Programme</p>
  <p><strong>Dunamis International Gospel Centre</strong></p>
</div>