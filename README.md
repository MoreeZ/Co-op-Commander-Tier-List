# StarCraft 2 Co-op Commander Tier List

A web application for crowdsourcing user opinions on the best commanders in StarCraft 2 Co-op missions. This project allows users to create and submit their personal tier lists, and view an aggregated community tier list based on all submissions.

## URL: `https://coop.starcraftier.com`

## Features

- **Community Summary Page**: View a non-editable tier list showing the community's aggregated rankings
- **User Input Page**: Create and submit your own tier list using drag-and-drop functionality
- **Multi-layered User Identification**: Prevents multiple submissions without requiring authentication
- **Responsive Design**: Works on both desktop and mobile devices
- **SEO Optimized**: Implements structured data, meta tags, sitemap, and other SEO best practices

## Technology Stack

- **Frontend**: React 19 with Vite
- **Routing**: React Router DOM
- **Drag and Drop**: @dnd-kit/core and related packages
- **Styling**: Styled Components
- **Backend/Database**: Supabase
- **User Identification**: FingerprintJS, localStorage, and IP hashing

## Project Structure

```
sc2cooptierlist/
├── public/
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Layout.jsx
│   │   └── tierlist/
│   │       ├── TierList.jsx
│   │       ├── TierRow.jsx
│   │       └── DraggableCommander.jsx
│   ├── pages/
│   │   ├── SummaryPage.jsx
│   │   └── UserInputPage.jsx
│   ├── services/
│   │   └── supabase.js
│   ├── utils/
│   │   └── userIdentification.js
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── supabase/
│   └── schema.sql
├── .env
├── package.json
└── README.md
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Set up your Supabase database using the SQL script in `supabase/schema.sql`
5. Start the development server:
   ```
   npm run dev
   ```

## Database Schema

### Commanders Table
- Stores information about each SC2 co-op commander
- Fields: id, name, image_url, faction, created_at

### Users Table
- Tracks unique users through fingerprinting and device info
- Fields: id, fingerprint, ip_hash, user_agent, device_info, created_at

### Submissions Table
- Stores user tier list submissions
- Fields: id, user_id, submission_data, created_at
- Has a uniqueness constraint on user_id to prevent multiple submissions

## User Identification Strategy

To prevent multiple submissions without requiring traditional authentication, this application uses a multi-layered approach:

1. Browser fingerprinting with FingerprintJS
2. LocalStorage flag to mark submission status
3. IP address hashing (handled server-side for privacy)
4. Device information collection

## SEO Optimization

This project implements comprehensive SEO best practices to improve search engine visibility:

### Structured Data
- **JSON-LD Implementation**: Multiple schema types including WebSite, ItemList, and BreadcrumbList
- **Centralized Utilities**: Structured data generation functions in `src/utils/structuredData.js`
- **Dynamic Generation**: Schema data generated based on page content and tier list data

### Meta Tags and Document Head
- **Custom SEO Component**: `src/components/common/SEO.jsx` for page-specific metadata
- **Open Graph Tags**: For better social media sharing
- **Twitter Card Support**: For Twitter link previews
- **Canonical URLs**: To prevent duplicate content issues

### Technical SEO
- **Sitemap Generation**: Automatic sitemap.xml creation during build process
- **Custom 404 Page**: SEO-friendly error page with navigation options
- **Performance Optimization**: Preload script for critical resources
- **Netlify Redirects**: Proper handling of domain redirects and SPA routing

### SEO Testing
- **Validation Script**: Run `npm run test-seo` to validate SEO implementation
- **Documentation**: See `SEO-GUIDE.md` for detailed SEO implementation information

## Disclaimer

This project is not affiliated with or endorsed by Blizzard Entertainment. StarCraft is a trademark or registered trademark of Blizzard Entertainment, Inc., in the U.S. and/or other countries.
