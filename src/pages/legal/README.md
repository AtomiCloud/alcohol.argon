# Legal Documents Versioning

This folder contains versioned legal documents for LazyTax.

## Structure

```
legal/
├── README.md           # This file
├── 2025-09-26/        # Current version (YYYY-MM-DD format)
│   ├── privacy.tsx    # Privacy Policy
│   ├── refund.tsx     # Refund Policy
│   └── terms.tsx      # Terms & Conditions
└── [future dates]/    # Future versions
```

## Version History

### 2025-09-26
- **Initial LazyTax-specific version**
- Added PDPA/GDPR compliance sections
- Added Privacy Officer details (Ho Ching Wee, chingwee@lazytax.club)
- Added custom frequency habits support (daily, weekly, custom intervals)
- Added streak and gamification data handling
- Added charity donation legal framework
- Added fair use and protecting interests sections
- Made subscription fees non-refundable
- Added Airwallex and Pledge fee disclosures

## Creating New Versions

1. Create new dated folder: `legal/YYYY-MM-DD/`
2. Copy current version files to new folder
3. Make necessary changes to new version
4. Update the export paths in the main page files:
   - `src/pages/privacy.tsx`
   - `src/pages/refund.tsx`
   - `src/pages/terms.tsx`
5. Update this README with version notes

## Current Active Version

**Current:** `2025-09-26`

The main page files (`privacy.tsx`, `refund.tsx`, `terms.tsx`) automatically redirect to the current version.