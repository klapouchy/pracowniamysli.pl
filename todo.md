# Pracownia Mysli - WordPress to Astro Migration

## Current Progress

### Completed Tasks

- [x] **Phase 1: Project Setup**
  - [x] Initialized Astro project with TypeScript strict mode
  - [x] Installed React, Tailwind, and Sitemap integrations
  - [x] Configured shadcn/ui with required components (button, card, input, textarea, label, navigation-menu, sheet, separator)
  - [x] Created Tailwind config with therapy practice colors (sage green, warm cream, deep slate)
  - [x] Set up global CSS with CSS variables for shadcn

- [x] **Phase 2: Content Scraping**
  - [x] Create scraping scripts in `/scripts/scraper/`
  - [x] Scrape all pages from Wayback Machine (original site down)
  - [x] Extract page content and convert to Markdown
  - [x] Download and optimize images (WebP + JPEG fallback)
  - [x] Update placeholder content with real scraped content

- [x] **Phase 3: Component Development**
  - [x] `Header.astro` - Site header with logo
  - [x] `Navigation.tsx` - React island with responsive nav (desktop + mobile menu)
  - [x] `Footer.astro` - Contact info, navigation links
  - [x] `Hero.astro` - Homepage hero section with CTAs
  - [x] `Services.astro` - 6-card grid linking to service pages
  - [x] `ContactInfo.astro` - Contact details with placeholder map

- [x] **Phase 4: Content Integration**
  - [x] Set up Astro content collections (`src/content/pages/`)
  - [x] Created dynamic page routing with `[...slug].astro`
  - [x] Migrated real content from Wayback Machine archives
  - [x] Build tested and working

- [x] **Phase 5: AWS Deployment (Partial)**
  - [x] Create GitHub Actions workflow (`.github/workflows/deploy.yml`)
  - [ ] Set up S3 bucket for static hosting
  - [ ] Configure ACM certificate for SSL (us-east-1)
  - [ ] Create CloudFront distribution with HTTPS redirect
  - [ ] Configure Route 53 DNS records
  - [ ] Set up GitHub OIDC for AWS authentication

---

## AWS Setup Instructions

### Required GitHub Secrets

Add these secrets in GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `AWS_ROLE_ARN` | IAM Role ARN for OIDC authentication |
| `S3_BUCKET_NAME` | S3 bucket name (e.g., `pracowniamysli.pl`) |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID |

### AWS Resources to Create

#### 1. S3 Bucket
```bash
aws s3 mb s3://pracowniamysli.pl --region eu-central-1
aws s3api put-public-access-block --bucket pracowniamysli.pl \
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

#### 2. ACM Certificate (must be in us-east-1 for CloudFront)
```bash
aws acm request-certificate \
  --domain-name pracowniamysli.pl \
  --subject-alternative-names "*.pracowniamysli.pl" \
  --validation-method DNS \
  --region us-east-1
```

#### 3. CloudFront Distribution
- Origin: S3 bucket with OAC (Origin Access Control)
- Viewer Protocol Policy: Redirect HTTP to HTTPS
- Alternate Domain Names: pracowniamysli.pl, www.pracowniamysli.pl
- SSL Certificate: ACM certificate from step 2
- Default Root Object: index.html
- Custom Error Response: 404 -> /404.html

#### 4. Route 53 DNS Records
- A record for pracowniamysli.pl -> CloudFront (Alias)
- A record for www.pracowniamysli.pl -> CloudFront (Alias)

#### 5. IAM Role for GitHub OIDC
Create IAM role with trust policy for GitHub Actions and S3/CloudFront permissions.

---

## Project Structure

```
/Users/klapouchy/Code/Projects/pracowania-mysli/
├── astro.config.mjs          ✅ Configured
├── tailwind.config.mjs       ✅ Configured
├── components.json           ✅ shadcn config
├── tsconfig.json             ✅ Path aliases configured
├── public/
│   ├── favicon.svg           ✅ Created
│   └── images/               ✅ Scraped & optimized
├── src/
│   ├── components/
│   │   ├── ui/               ✅ shadcn components
│   │   ├── layout/           ✅ Header, Footer, Navigation
│   │   └── sections/         ✅ Hero, Services, ContactInfo
│   ├── content/
│   │   ├── config.ts         ✅ Content collections schema
│   │   └── pages/            ✅ Real content from WP
│   ├── layouts/
│   │   ├── BaseLayout.astro  ✅ Created
│   │   └── PageLayout.astro  ✅ Created
│   ├── pages/
│   │   ├── index.astro       ✅ Homepage
│   │   ├── kontakt.astro     ✅ Contact page
│   │   └── [...slug].astro   ✅ Dynamic routing
│   ├── lib/utils.ts          ✅ cn() helper
│   └── styles/globals.css    ✅ Tailwind + CSS variables
├── scripts/scraper/          ✅ Content scraper
└── .github/workflows/        ✅ Deploy workflow
```

---

## Site Pages

| Status | Page | URL | Content |
|--------|------|-----|---------|
| ✅ | Home | `/` | Hero + Services + Contact |
| ✅ | O Mnie | `/o-mnie` | Real content |
| ✅ | Jak Pomagam | `/jak-pomagam` | Real content |
| ✅ | Dla Kogo? | `/oferta` | Real content |
| ✅ | DDA | `/psychoterapia-dda` | Real content |
| ✅ | Online | `/konsultacje-online` | Real content |
| ✅ | Kontakt | `/kontakt` | Custom layout |
| ✅ | Polityka Prywatności | `/polityka-prywatnosci` | Placeholder |

---

## Commands

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Re-scrape content (uses Wayback Machine)
npm run scrape
```

---

## Next Steps

1. **Set up AWS infrastructure** (S3, CloudFront, ACM, Route 53)
2. **Configure GitHub OIDC** for secure AWS authentication
3. **Add GitHub secrets** for deployment
4. **Push to main branch** to trigger deployment
5. **Verify DNS propagation** and SSL certificate
