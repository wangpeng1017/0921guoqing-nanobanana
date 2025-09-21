# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is an AI-powered children's portrait generation application that uses Google Gemini AI to create themed portrait photos. The app allows users to upload a child's photo and generate portraits in different artistic styles (patriotic/flag themes, nostalgic vintage themes).

**Key Features:**
- Single-page application with drag-and-drop image upload
- AI-powered face swapping using Google Gemini 2.5 Flash Image Preview
- Multi-API key rotation system for high availability
- Daily quota management with localStorage
- Vercel Blob storage for temporary image storage
- Client-side image compression and validation

## Development Environment

### Essential Commands

**Development:**
```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Test API keys
node scripts/test-api-keys.js
```

### Environment Configuration

Create `.env.local` with these required variables:
```bash
# Multi-key rotation system (primary setup)
GEMINI_API_KEY_1=your_key_here
GEMINI_API_KEY_2=your_key_here  
GEMINI_API_KEY_3=your_key_here

# Fallback single key (optional)
GEMINI_API_KEY=your_key_here

# Vercel Blob storage
BLOB_READ_WRITE_TOKEN=your_blob_token_here

# App configuration
NEXT_PUBLIC_APP_NAME=AI国庆儿童写真
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
```

**Critical:** Never commit API keys. See `VERCEL_ENV_CONFIG.md` for production deployment setup.

## Architecture Overview

### Core Application Flow
1. **Image Upload** (`src/components/ImageUpload.tsx`): Client-side compression and validation
2. **Style Selection** (`src/components/StyleSelector.tsx`): Choose from predefined portrait styles
3. **AI Processing** (`src/app/api/nanobanana-process/route.ts`): Server-side API route handling
4. **Result Display** (`src/components/ResultDisplay.tsx`): Show processed image with download options

### Key Architectural Components

**API Key Management (`src/lib/apiKeyManager.ts`):**
- Intelligent rotation between 3 Gemini API keys
- Automatic failure detection and recovery
- 5-minute cooldown for failed keys
- Supports fallback to single key setup

**Quota System (`src/lib/quota.ts`):**
- Client-side daily quota tracking (10 free uses/day)
- localStorage-based persistence
- Automatic cleanup of expired data

**Image Processing Pipeline:**
1. Client-side compression (800x800 max, 80% quality)
2. Upload to Vercel Blob storage
3. Gemini 2.5 Flash Image Preview processing
4. Local image composition for final result

### API Routes Structure
```
src/app/api/
├── key-status/route.ts          # Monitor API key pool status
├── nanobanana-process/route.ts  # Main image processing endpoint
├── process-image/route.ts       # Alternative processing route
└── upload/route.ts              # File upload handling
```

### Style Templates System

**Defined Styles (`src/types/styles.ts`):**
- `flag`: Patriotic theme with red flag and "我和我的祖国" text
- `nostalgic`: Vintage theme with retro colors and "亲亲我的祖国" text

Each style has specific prompts for precise face swapping while preserving background elements.

### Error Handling Strategy

**Multi-layer Error Recovery:**
1. API key rotation on failure
2. Local image composition as fallback
3. User-friendly error messages (`src/lib/errorHandler.ts`)

## Development Guidelines

### Testing API Integration
```bash
# Test all configured API keys
node scripts/test-api-keys.js
```

### Deployment Process
1. Push to GitHub (environment variables excluded by `.gitignore`)
2. Vercel automatically deploys from main branch
3. Configure environment variables in Vercel dashboard
4. Monitor API key status at `/api/key-status`

### Key Files to Monitor
- `src/lib/apiKeyManager.ts` - API rotation logic
- `src/lib/gemini.ts` - Core AI processing
- `src/lib/quota.ts` - Daily usage limits
- `src/app/api/nanobanana-process/route.ts` - Main processing endpoint

### Common Development Tasks

**Adding New Portrait Styles:**
1. Add style definition to `src/types/styles.ts`
2. Update prompt templates in `src/lib/gemini.ts`
3. Add corresponding thumbnail images to `public/templates/`

**Debugging API Issues:**
1. Check API key status: `GET /api/key-status`
2. Monitor server logs for key rotation events
3. Verify environment variables in Vercel dashboard

**Image Processing Pipeline Debug:**
1. Client compression logs in browser console
2. Server processing logs show Gemini API responses
3. Blob storage URLs for uploaded images

### Performance Considerations

**Image Optimization:**
- Client-side compression before upload (800x800, 80% quality)
- Vercel Blob CDN for fast image delivery
- Base64 conversion only for Gemini API processing

**API Efficiency:**
- Smart key rotation minimizes quota exhaustion
- Automatic retry with exponential backoff
- Quota monitoring and management for Gemini 2.5 Flash Image Preview

## Security Notes

- All API keys stored as environment variables
- Client quota limits prevent abuse
- Temporary image storage with automatic cleanup
- No persistent user data storage

## Technology Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **AI Service:** Google Gemini 2.5 Flash Image Preview
- **Storage:** Vercel Blob Storage
- **Deployment:** Vercel platform
- **Image Processing:** Sharp + Canvas API