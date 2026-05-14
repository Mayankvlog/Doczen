# Doczen - Free Online PDF Editor

**Your PDFs, Perfected.**

Doczen is a full-stack web application that provides a comprehensive suite of free, browser-based PDF editing and conversion tools. Merge, split, compress, rotate, protect, unlock, convert, and perform many other PDF operations entirely online without installing any software.

## Features

### PDF Manipulation
- **Merge PDF** — Combine up to 20 PDFs into a single file
- **Split PDF** — Extract each page into individual PDFs (ZIP archive)
- **Compress PDF** — Reduce file size via configurable quality/resolution scaling
- **Rotate PDF** — Rotate all pages by a specified number of degrees
- **Reorder Pages** — Rearrange pages in any order
- **Delete Pages** — Remove specific pages by index
- **Flatten PDF** — Flatten form fields and annotations

### Security
- **Protect PDF** — Add password protection with user/owner passwords and permission restrictions
- **Unlock PDF** — Remove password protection by providing the correct password
- **Redact PDF** — Permanently black out regions of pages

### Content & Annotation
- **Add Page Numbers** — Insert centered page numbers with configurable start number and font size
- **Add Watermark** — Overlay diagonal text watermark at configurable opacity
- **Remove Annotations** — Strip comments and markup
- **Remove Watermark** — Strip watermark-like content

### Conversions
- **PDF to JPG** — Convert PDF pages to JPG images (ZIP archive)
- **JPG to PDF** — Combine images into a single PDF
- **PDF to TXT** — Extract all text content
- **HTML to PDF** — Convert HTML content into a PDF with word wrapping and pagination
- **PDF to PDF/A** — Convert to archival PDF/A format with metadata

### Metadata
- **Read Metadata** — Extract title, author, subject, keywords, page count, page sizes
- **Write Metadata** — Update title, author, subject, keywords, producer, creator

### Comparison
- **Compare PDF** — Compare two PDFs side-by-side (page count, title, author, per-page dimensions)

### User System
- Registration, login, and JWT-based authentication (access + refresh tokens)
- Profile management and password change
- Daily processing limits (10 files/day for free users)
- Storage usage tracking
- Full operation history with pagination, deletion, and clear-all

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT (access tokens) + httpOnly refresh token cookies, bcryptjs |
| **PDF Processing** | pdf-lib, pdf-parse, sharp |
| **File Upload** | Multer (disk storage, 50MB limit) |
| **Frontend** | React 18, React Router DOM v6 |
| **Styling** | Tailwind CSS v3.4, Heroicons |
| **HTTP Client** | Axios (with JWT refresh interceptor) |
| **SEO** | react-helmet-async (Open Graph, Twitter Cards, JSON-LD) |
| **Reverse Proxy** | nginx (SSL, rate limiting, caching, compression) |

## Project Structure

```
├── server/                    # Backend (Express.js API)
│   ├── server.js             # Entry point
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── History.js        # Operation history schema
│   │   └── File.js           # File tracking schema (TTL: 24h)
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication middleware
│   │   └── upload.js         # Multer upload configuration
│   ├── routes/
│   │   ├── auth.js           # Auth endpoints
│   │   ├── pdf.js            # PDF operation endpoints (30+)
│   │   └── history.js        # History endpoints
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── pdfController.js
│   ├── utils/
│   │   └── pdfUtils.js       # Core PDF manipulation functions
│   └── uploads/              # File upload storage directory
│
├── client/                    # Frontend (React SPA)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js            # Main app with all routes
│   │   ├── context/
│   │   │   └── AuthContext.js # Auth state management
│   │   ├── services/
│   │   │   └── api.js        # Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── Navbar.js, Footer.js, FileUploader.js
│   │   │   ├── ToolCard.js, ResultCard.js, LoadingSpinner.js
│   │   │   ├── ProtectedRoute.js, SEO.js
│   │   ├── pages/
│   │   │   ├── Home.js, Login.js, Register.js
│   │   │   ├── Dashboard.js, History.js
│   │   │   └── tools/        # 30+ tool pages
│   │   └── styles/
│   │       └── index.css     # Tailwind directives + custom styles
│   ├── tailwind.config.js
│   └── package.json
│
├── nginx.conf                # Production nginx configuration
├── .env.example              # Environment variable template
└── .gitignore
```

## Prerequisites

- **Node.js** v18+
- **npm** v9+
- **MongoDB** instance (Atlas cloud or local)
- (Optional) **nginx** for production deployment

## Installation

### 1. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Required | Description | Default |
|---|---|---|---|
| `PORT` | No | Backend server port | `80` |
| `MONGO_URI` | **Yes** | MongoDB connection string | — |
| `JWT_SECRET` | **Yes** | Secret key for signing JWT tokens | — |
| `JWT_EXPIRES_IN` | No | Access token TTL | `30d` |
| `OWNER_PASSWORD` | No | PDF owner password for encryption | `doczen-admin` |
 | `FRONTEND_URL` | No | Allowed CORS origin | `http://localhost` |
| `NODE_ENV` | No | Environment mode | `development` |

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

### 4. (Optional) Configure client API URL

Edit `client/.env`:
```
REACT_APP_API_URL=http://localhost
```

## Running Locally

### Development mode (two terminals)

**Terminal 1 — Backend** (port 80, hot-reload):
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend** (port 80):
```bash
cd client
npm start
```

### Production mode

```bash
cd client
npm run build
cd ../server
npm start
```

Configure nginx using the provided `nginx.conf` to reverse proxy to the backend and serve the frontend build directory.

## API Overview

All API routes are prefixed with `/api/`.

- `GET /api/health` — Health check
- `POST /api/auth/register` — User registration
- `POST /api/auth/login` — User login
- `POST /api/auth/refresh` — Refresh access token
- `POST /api/auth/logout` — Logout (clears refresh token)
- `GET /api/auth/profile` — Get user profile
- `PUT /api/auth/profile` — Update profile
- `PUT /api/auth/change-password` — Change password
- `GET /api/auth/limits` — Get usage limits
- `POST /api/pdf/*` — PDF operations (merge, split, compress, etc.)
- `GET /api/history` — Get operation history (paginated)
- `DELETE /api/history/:id` — Delete history entry
- `DELETE /api/history` — Clear all history

## Authentication Flow

1. User registers or logs in → receives a JWT access token (15-min expiry) in the response body + an httpOnly refresh token cookie (7-day expiry)
2. Axios interceptor automatically attaches the access token to every request via `Authorization: Bearer <token>`
3. On 401 responses, the interceptor attempts token refresh via the `/api/auth/refresh` endpoint; concurrent failed requests are queued during refresh
4. On logout, both tokens are invalidated

## Deployment

The included `nginx.conf` provides a production-ready reverse proxy configuration with:

- SSL termination (Let's Encrypt)
- Rate limiting (API: 30 req/s, Upload: 5 req/s, Auth: 10 req/min)
- Connection limiting (10 per IP)
- Caching (static files: 30d, API: 1h, uploads: 1d)
- Security headers (HSTS, CSP, X-Frame-Options, XSS protection)
- HTTP/2 and gzip compression
- WebSocket proxy support
- Internal file serving protection

## Limitations

- **pdf-lib** has limited support for complex PDF features (form fields, annotations, embedded fonts)
- **PDF-to-JPG** uses a workaround rendering SVG placeholders with Sharp rather than true page rasterization
- **PDF-to-Word, Word-to-PDF, Sign PDF, Edit PDF** are frontend placeholders awaiting a full client-side PDF rendering library
- Free tier is limited to 10 files/day per user
- Uploaded files are automatically deleted after 24 hours

## License

[MIT](LICENSE) (or your chosen license)
