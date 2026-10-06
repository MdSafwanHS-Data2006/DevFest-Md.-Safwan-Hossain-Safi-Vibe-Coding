# Tender Document Package Builder

## Participant

* Name: Md. Safwan Hossain Safi
* Registration Number: 251-15-520
* Competition: AI DevFest 2026 — Vibe Coding

## Live Demo

* Public HTTPS URL: https://dev-fest-md-safwan-hossain-safi-vibe-coding-onfyzr3x6.vercel.app/

## GitHub Repository

* https://github.com/MdSafwanHS-Data2006/DevFest-Md.-Safwan-Hossain-Safi-Vibe-Coding

## Overview

The **Tender Document Package Builder** is a frontend-only browser application designed to help office staff turn multiple individual tender-related PDF files into a single, verified, compliance-checked, and correctly ordered tender submission package PDF. The application runs entirely client-side in the browser, ensuring complete data privacy with no backend or external database dependencies.

## How to Run

### Prerequisites
* Node.js (v18 or higher recommended)
* npm (v9 or higher)

### Setup & Development

Install dependencies:
```bash
npm install
```

Start the local development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

> **Note:** The application processes all files entirely within the user's browser using standard Web APIs (`crypto.subtle`, `ArrayBuffer`, `Blob`). It does not require any backend server, cloud functions, or persistent database.

## Main Features

* **requirements.json import and tender information**: Allows importing `requirements.json` via drag-and-drop or file picker, parsing tender metadata (`tender_id`, `title`, `procuring_entity`, `bidder`, `submission_deadline`) and requirements array.
* **requirements sorted by order**: Automatically sorts requirements by numeric `order` and presents both English and Bangla titles.
* **PDF upload**: Supports multi-file drag-and-drop and file dialog selection.
* **PDF validation and page counting**: Rejects non-PDF files with clear bilingual error messages; inspects and displays page counts using `pdf.js` with `pdf-lib` fallback.
* **30-file / 50 MB limits**: Strictly enforces a maximum of 30 PDF files and a total combined size limit of 50 MB, complete with interactive storage quota meters.
* **one-to-one document matching**: Guarantees that each requirement has at most one matched file and each file can be matched to at most one requirement.
* **change/undo matching**: Provides an intuitive file selection interface with quick unmatch/clear actions.
* **expiry date validation**: Allows entering expiry dates for requirements where `has_expiry = true`; validates dates against the tender `submission_deadline` (same-day expiry is accepted as valid).
* **five document statuses**: Implements real-time evaluation with the five specified mutually exclusive statuses:
  * `Missing`: Mandatory requirement with no file.
  * `Expiry date needed`: Requirement with `has_expiry = true` has a matched file but no expiry date.
  * `Expired`: Document expiry date is strictly before the submission deadline.
  * `Not provided`: Optional requirement with no file.
  * `OK`: File matched and expiry is valid (or not required).
* **SHA-256 duplicate-content detection**: Computes cryptographic SHA-256 digests of file contents using the Web Crypto API, visually tags duplicate files, and prevents duplicate files from being matched to different requirements.
* **package generation**: Disables compilation while blocking statuses exist with clear bilingual explanations; enables 1-click package generation once all conditions are met.
* **English cover page**: Page 1 is an official English submission cover showing tender ID, title, procuring entity, bidder, submission deadline, creation timestamp, and a manifest table of included documents.
* **ordered PDF merging**: Merges matched documents in ascending requirement order while strictly preserving every source PDF page in its original sequence. Optional requirements without a file are automatically omitted.
* **Page X of Y footer**: Stamps `<tender_id> | Page X of Y` across all pages (including the cover). Scales content by 96% and translates it into a protected footer margin so original content is never obscured, accommodating all page rotations (0°, 90°, 180°, 270°).
* **required package filename**: Automatically triggers download with the required filename format: `<tender_id>_Package.pdf`.
* **English/Bangla UI switch**: Interactive language toggle switching all labels, buttons, messages, instructions, and requirement titles between English and বাংলা.

## Bonus Features

* **Completed bonus features**: None (intentionally focused on 100% completeness, stability, and precision of core competition requirements).
* **Not implemented**:
  * Bangla PDF cover page generation (core requirement specifies English cover).
  * Automated OCR date extraction from scanned PDFs.
  * Password-protected PDF decryption dialogs.

## Known Problems / Limitations

* **Encrypted / Password-Protected PDFs**: PDFs locked with an owner or user password must be decrypted prior to upload; browser-side `pdf-lib` cannot merge password-encrypted documents without the password.
* **Scanned Image Documents**: The application does not perform optical character recognition (OCR) on image-only scanned PDFs; expiry dates must be entered manually via the interface.
* **Browser Memory Consumption**: Processing up to 50 MB of PDFs occurs completely in browser RAM; on low-memory mobile devices, processing very large collections of complex PDFs may cause brief UI pauses.

## AI Tools Used

* **Antigravity IDE / AI coding agent**
* **ChatGPT**

AI tools were used for code generation, architecture planning, and development assistance. The participant remains fully responsible for the submitted implementation and code quality.

## Most Useful Prompt

> "Build the application foundation, requirements.json loading, tender information display, requirements list, PDF upload/page-count functionality, matching, expiry validation, duplicate detection, status engine, bilingual UI, and browser-only PDF generation according to the AI DevFest 2026 Vibe Coding problem statement."
> **ChatGPT prompt history:** https://chatgpt.com/share/6ac4f36d-74dc-83ec-bf5f-ac912106870a


## Technology

* **React** (v19)
* **TypeScript**
* **Vite**
* **pdf-lib**
* **pdfjs-dist**
* **Lucide React**

## Commits

* **c8aa065 (HEAD -> main, origin/main, origin/HEAD) Configure GitHub Pages deployment**
* **7ab9667 Complete contest README**
* **fd9828a Build core Tender Document Package Builder**
* **e532eb7 Initial commit**

## License

MIT License
