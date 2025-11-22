# Complete Image Placement & Reference Guide

## Quick Summary

Bạn cần:
1. **Generate 19 diagrams** từ [MERMAID_DIAGRAMS.md](./MERMAID_DIAGRAMS.md) bằng https://mermaid.live/
2. **Take ~40 screenshots** của website
3. **Add image references** vào main document tại các vị trí được chỉ định
4. **Update List of Figures**
5. **Add links to references**

---

## PART 1: FOLDER STRUCTURE

Tạo folders này:
```
F:\FINALPROJECT\Codemaster-3\
├── images/
│   ├── diagrams/       (19 mermaid diagrams)
│   ├── screenshots/    (~40 website screenshots)
│   └── charts/         (3 charts from mermaid)
```

---

## PART 2: MERMAID DIAGRAMS (19 total)

### How to Generate:
1. Mở https://mermaid.live/
2. Copy code từ [MERMAID_DIAGRAMS.md](./MERMAID_DIAGRAMS.md)
3. Paste vào editor
4. Click "Download PNG" (hoặc SVG)
5. Save với tên file như dưới đây

### Diagram List:

| # | File Name | Source | Insert Location in Document |
|---|-----------|--------|------------------------------|
| 1 | diagram-01-system-architecture.png | MERMAID_DIAGRAMS.md - Diagram 1 | Chapter 5.1 - System Architecture Overview (after line 957) |
| 2 | diagram-02-database-erd.png | MERMAID_DIAGRAMS.md - Diagram 2 | Chapter 5.2 - Database Design (after line 1001) |
| 3 | diagram-03-oauth-flow.png | MERMAID_DIAGRAMS.md - Diagram 3 | Chapter 2.4.1 - OAuth 2.0 Protocol (line 427) |
| 4 | diagram-04-email-auth-flow.png | MERMAID_DIAGRAMS.md - Diagram 4 | Chapter 5.5 - Security Architecture (line 1409) |
| 5 | diagram-05-stripe-payment.png | MERMAID_DIAGRAMS.md - Diagram 5 | Chapter 2.5.1 & Chapter 6.4 (lines 460, 1735) |
| 6 | diagram-06-cloudinary-upload.png | MERMAID_DIAGRAMS.md - Diagram 6 | Chapter 2.6.2 & Chapter 6.4 (lines 487, 1813) |
| 7 | diagram-07-enrollment-progress.png | MERMAID_DIAGRAMS.md - Diagram 7 | Chapter 4.3 - Use Cases (line 650) |
| 8 | diagram-08-quiz-system.png | MERMAID_DIAGRAMS.md - Diagram 8 | Chapter 6.2 - Backend Implementation (line 1521) |
| 9 | diagram-09-api-routes.png | MERMAID_DIAGRAMS.md - Diagram 9 | Chapter 5.3 - API Design (line 1127) |
| 10 | diagram-10-security-layers.png | MERMAID_DIAGRAMS.md - Diagram 10 | Chapter 5.5 - Security Architecture (line 1409) |
| 11 | diagram-11-subscription-tiers.png | MERMAID_DIAGRAMS.md - Diagram 11 | Chapter 2.5.3 - Subscription Billing (line 475) |
| 12 | diagram-12-teacher-workflow.png | MERMAID_DIAGRAMS.md - Diagram 12 | Chapter 4.3 - Use Cases (line 650) |
| 13 | diagram-13-deployment-pipeline.png | MERMAID_DIAGRAMS.md - Diagram 13 | Chapter 6.5 - Deployment Process (line 1849) |
| 14 | diagram-14-user-journey.png | MERMAID_DIAGRAMS.md - Diagram 14 | Chapter 4.3 - Use Cases (line 650) |
| 15 | diagram-15-error-handling.png | MERMAID_DIAGRAMS.md - Diagram 15 | Chapter 6.2 - Backend Implementation (line 1521) |
| 16 | diagram-16-file-structure.png | MERMAID_DIAGRAMS.md - Diagram 16 | Chapter 6.1 - Development Environment (line 1511) |
| 17 | chart-01-tech-stack.png | MERMAID_DIAGRAMS.md - Chart 1 | Chapter 6.1 - Development Environment (line 1511) |
| 18 | chart-02-api-distribution.png | MERMAID_DIAGRAMS.md - Chart 2 | Chapter 5.3 - API Design (line 1127) |
| 19 | chart-03-firestore-collections.png | MERMAID_DIAGRAMS.md - Chart 3 | Chapter 5.2 - Database Design (line 1001) |

---

## PART 3: WEBSITE SCREENSHOTS (~40 total)

### Screenshots Needed:

#### A. Authentication & Registration (5 screenshots)
| # | File Name | What to Capture | Insert Location |
|---|-----------|----------------|-----------------|
| 1 | screenshot-01-homepage.png | Homepage with navigation | Chapter 1 - Introduction (after Abstract, line ~40) |
| 2 | screenshot-02-login-page.png | Login page with Google OAuth button | Chapter 5.5 - Security (line ~1409) |
| 3 | screenshot-03-google-oauth-consent.png | Google consent screen | Chapter 2.4.1 (line ~427) |
| 4 | screenshot-04-role-selection.png | Student/Teacher role selection | Chapter 5.5 (line ~1409) |
| 5 | screenshot-05-auth-success.png | Successful login redirect | Chapter 5.5 (line ~1409) |

#### B. Student Interface (15 screenshots)
| # | File Name | What to Capture | Insert Location |
|---|-----------|----------------|-----------------|
| 6 | screenshot-06-student-dashboard.png | Student dashboard overview | Chapter 5.4 - UI Design (line ~1205) |
| 7 | screenshot-07-course-catalog.png | Browse courses page with filters | Chapter 5.4 (line ~1205) |
| 8 | screenshot-08-course-detail.png | Individual course page with enroll button | Chapter 5.4 (line ~1205) |
| 9 | screenshot-09-course-lessons-list.png | Course lessons sidebar | Chapter 5.4 (line ~1205) |
| 10 | screenshot-10-lesson-video-viewer.png | Lesson with video player | Chapter 5.4 (line ~1205) |
| 11 | screenshot-11-lesson-text-content.png | Lesson with text content | Chapter 5.4 (line ~1205) |
| 12 | screenshot-12-quiz-start.png | Quiz start screen | Chapter 5.4 (line ~1205) |
| 13 | screenshot-13-quiz-question.png | Quiz question interface | Chapter 5.4 (line ~1205) |
| 14 | screenshot-14-quiz-results-passed.png | Quiz results - passed | Chapter 5.4 (line ~1205) |
| 15 | screenshot-15-quiz-results-failed.png | Quiz results - failed | Chapter 5.4 (line ~1205) |
| 16 | screenshot-16-my-learning.png | My Learning page with enrolled courses | Chapter 5.4 (line ~1205) |
| 17 | screenshot-17-progress-tracking.png | Course progress indicator | Chapter 5.4 (line ~1205) |
| 18 | screenshot-18-certificate.png | Generated certificate | Chapter 5.4 (line ~1205) |
| 19 | screenshot-19-student-profile.png | Student profile page | Chapter 5.4 (line ~1205) |
| 20 | screenshot-20-cart-page.png | Shopping cart (if applicable) | Chapter 5.4 (line ~1205) |

#### C. Teacher Interface (10 screenshots)
| # | File Name | What to Capture | Insert Location |
|---|-----------|----------------|-----------------|
| 21 | screenshot-21-teacher-dashboard.png | Teacher dashboard | Chapter 5.4 (line ~1205) |
| 22 | screenshot-22-create-course-form.png | Course creation form | Chapter 5.4 (line ~1205) |
| 23 | screenshot-23-course-thumbnail-upload.png | Cloudinary upload interface | Chapter 6.4 (line ~1813) |
| 24 | screenshot-24-lesson-management.png | Lesson management page | Chapter 5.4 (line ~1205) |
| 25 | screenshot-25-create-lesson-form.png | Lesson creation with rich text editor | Chapter 5.4 (line ~1205) |
| 26 | screenshot-26-quiz-management.png | Quiz management page | Chapter 5.4 (line ~1205) |
| 27 | screenshot-27-quiz-builder.png | Quiz builder interface | Chapter 5.4 (line ~1205) |
| 28 | screenshot-28-question-form.png | Add question form | Chapter 5.4 (line ~1205) |
| 29 | screenshot-29-student-analytics.png | Teacher view of student progress | Chapter 5.4 (line ~1205) |
| 30 | screenshot-30-course-approval-status.png | Course pending approval | Chapter 5.4 (line ~1205) |

#### D. Admin Interface (2 screenshots)
| # | File Name | What to Capture | Insert Location |
|---|-----------|----------------|-----------------|
| 31 | screenshot-31-admin-dashboard.png | Admin dashboard | Chapter 4.2 - Stakeholder Analysis (line ~642) |
| 32 | screenshot-32-user-management.png | User management interface | Chapter 4.2 (line ~642) |

#### E. Payment & Subscription (3 screenshots)
| # | File Name | What to Capture | Insert Location |
|---|-----------|----------------|-----------------|
| 33 | screenshot-33-pricing-tiers.png | Subscription pricing page | Chapter 2.5.3 (line ~475) |
| 34 | screenshot-34-stripe-checkout.png | Stripe checkout page | Chapter 2.5.1 & 6.4 (lines ~460, 1735) |
| 35 | screenshot-35-payment-success.png | Payment success confirmation | Chapter 2.5.1 & 6.4 (lines ~460, 1735) |

#### F. Community Features (3 screenshots)
| # | File Name | What to Capture | Insert Location |
|---|-----------|----------------|-----------------|
| 36 | screenshot-36-community-forum.png | Community/forum page | Chapter 4.3 (line ~650) |
| 37 | screenshot-37-study-groups.png | Study groups page | Chapter 4.3 (line ~650) |
| 38 | screenshot-38-blog-page.png | Blog posts page | Chapter 4.3 (line ~650) |

#### G. Mobile Responsive (2 screenshots)
| # | File Name | What to Capture | Insert Location |
|---|-----------|----------------|-----------------|
| 39 | screenshot-39-mobile-homepage.png | Homepage on mobile | Chapter 5.4 (line ~1205) |
| 40 | screenshot-40-mobile-course-view.png | Course viewing on mobile | Chapter 5.4 (line ~1205) |

### How to Take Screenshots:
- **Full page**: Use browser extension như "GoFullPage" (Chrome)
- **Specific area**: Use Windows Snipping Tool (Win + Shift + S)
- **Mobile**: Use Chrome DevTools Device Mode (F12 → Toggle device toolbar)
- **Resolution**: 1920x1080 hoặc higher
- **Format**: PNG

---

## PART 4: CODE & TECHNICAL SCREENSHOTS (Optional - 5 screenshots)

| # | File Name | What to Capture | Insert Location |
|---|-----------|----------------|-----------------|
| 41 | screenshot-41-vscode-structure.png | VS Code showing project structure | Chapter 6.1 (line ~1511) |
| 42 | screenshot-42-firestore-console.png | Firebase Firestore collections | Chapter 5.2 (line ~1001) |
| 43 | screenshot-43-vercel-dashboard.png | Vercel deployment dashboard | Chapter 6.5 (line ~1849) |
| 44 | screenshot-44-env-variables.png | Environment variables (blur sensitive values) | Chapter 6.5 (line ~1849) |
| 45 | screenshot-45-api-endpoint-code.png | Sample API endpoint code | Chapter 6.2 (line ~1521) |

---

## PART 5: HOW TO INSERT IMAGES INTO DOCUMENT

### Markdown Syntax:
```markdown
![Description](./images/diagrams/diagram-01-system-architecture.png)
*Figure X.X: Caption text*
```

### Example Insertions:

#### For Chapter 5.1 (System Architecture) - Line ~957:

Insert AFTER the paragraph describing system architecture:

```markdown
The UniLearn system follows a three-tier architecture pattern with clear separation of concerns...

![System Architecture](./images/diagrams/diagram-01-system-architecture.png)
*Figure 5.1: CodeMaster-3 Complete System Architecture*

This architecture enables...
```

#### For Chapter 5.2 (Database Design) - Line ~1001:

Insert AFTER describing Firestore collections:

```markdown
The database schema consists of 17 Firestore collections...

![Database Entity Relationship Diagram](./images/diagrams/diagram-02-database-erd.png)
*Figure 5.2: Firestore Database Schema - Entity Relationship Diagram*

![Firestore Collections Distribution](./images/diagrams/chart-03-firestore-collections.png)
*Figure 5.3: Distribution of Firestore Collections by Category*

![Firestore Console Screenshot](./images/screenshots/screenshot-42-firestore-console.png)
*Figure 5.4: Firebase Firestore Console Showing Collections Structure*

Each collection serves a specific purpose...
```

#### For Chapter 5.4 (UI Design) - Line ~1205:

Insert AFTER describing UI design principles:

```markdown
The user interface follows modern design principles...

##### Student Interface

![Student Dashboard](./images/screenshots/screenshot-06-student-dashboard.png)
*Figure 5.5: Student Dashboard Interface*

![Course Catalog](./images/screenshots/screenshot-07-course-catalog.png)
*Figure 5.6: Course Catalog with Search and Filter Functionality*

![Course Detail Page](./images/screenshots/screenshot-08-course-detail.png)
*Figure 5.7: Individual Course Detail Page*

![Lesson Video Viewer](./images/screenshots/screenshot-10-lesson-video-viewer.png)
*Figure 5.8: Video Lesson Player Interface*

![Quiz Interface](./images/screenshots/screenshot-13-quiz-question.png)
*Figure 5.9: Interactive Quiz Question Interface*

![Certificate Display](./images/screenshots/screenshot-18-certificate.png)
*Figure 5.10: Auto-Generated Course Completion Certificate*

##### Teacher Interface

![Teacher Dashboard](./images/screenshots/screenshot-21-teacher-dashboard.png)
*Figure 5.11: Teacher Dashboard with Course Management*

![Create Course Form](./images/screenshots/screenshot-22-create-course-form.png)
*Figure 5.12: Course Creation Form*

![Quiz Builder](./images/screenshots/screenshot-27-quiz-builder.png)
*Figure 5.13: Interactive Quiz Builder Tool*

##### Mobile Responsive Design

![Mobile Homepage](./images/screenshots/screenshot-39-mobile-homepage.png)
*Figure 5.14: Responsive Mobile Homepage*
```

---

## PART 6: TABLE OF FIGURES

Sau khi insert tất cả images, update section "LIST OF FIGURES" (line ~215) với:

```markdown
## **LIST OF FIGURES**

**Chapter 1 - Introduction**
- Figure 1.1: Homepage Screenshot
- Figure 1.2: Platform Features Overview

**Chapter 2 - Literature Review**
- Figure 2.1: Google OAuth 2.0 Authentication Flow
- Figure 2.2: Stripe Payment Integration Flow
- Figure 2.3: Cloudinary CDN Architecture
- Figure 2.4: Subscription Tier Comparison

**Chapter 4 - Requirements Analysis**
- Figure 4.1: Stakeholder Roles and Permissions Matrix
- Figure 4.2: Course Enrollment and Progress Tracking Flow
- Figure 4.3: Teacher Course Management Workflow
- Figure 4.4: Student Learning Journey Map
- Figure 4.5: Admin Dashboard Interface
- Figure 4.6: Community Forum Features

**Chapter 5 - System Design**
- Figure 5.1: Complete System Architecture
- Figure 5.2: Database Entity Relationship Diagram
- Figure 5.3: Firestore Collections Distribution Chart
- Figure 5.4: Firebase Firestore Console Screenshot
- Figure 5.5: Student Dashboard Interface
- Figure 5.6: Course Catalog with Search and Filters
- Figure 5.7: Individual Course Detail Page
- Figure 5.8: Video Lesson Player Interface
- Figure 5.9: Interactive Quiz Question Interface
- Figure 5.10: Auto-Generated Course Certificate
- Figure 5.11: Teacher Dashboard with Course Management
- Figure 5.12: Course Creation Form
- Figure 5.13: Interactive Quiz Builder Tool
- Figure 5.14: Responsive Mobile Homepage
- Figure 5.15: API Route Structure and Endpoints
- Figure 5.16: Technology Stack Distribution Chart
- Figure 5.17: API Endpoints by Category Chart
- Figure 5.18: Security Architecture Layers
- Figure 5.19: Email/Password Authentication Flow

**Chapter 6 - Implementation**
- Figure 6.1: Project File Structure Tree
- Figure 6.2: VS Code Project Structure Screenshot
- Figure 6.3: Quiz Creation and Grading System Flowchart
- Figure 6.4: Error Handling and Logging Flow
- Figure 6.5: Sample API Endpoint Code
- Figure 6.6: Cloudinary Image Upload Flow
- Figure 6.7: Stripe Checkout Page
- Figure 6.8: Payment Success Confirmation
- Figure 6.9: Subscription Tier System Flow
- Figure 6.10: Vercel Deployment Dashboard
- Figure 6.11: Deployment Pipeline Diagram

**Chapter 8 - Testing & Evaluation**
- Figure 8.1: Testing Results Summary
- Figure 8.2: Performance Metrics Chart
```

---

## PART 7: REFERENCES WITH LINKS

Bạn đã có 190 references ở cuối document. Now add links where possible:

### Format for references (example):

```markdown
1. Aas, J. et al. (2019) 'Let's Encrypt: An automated certificate authority to encrypt the entire web', *Proceedings of the 2019 ACM SIGSAC Conference on Computer and Communications Security*, pp. 2473-2487. Available at: https://dl.acm.org/doi/10.1145/3319535.3363192

2. ACM (2018) *ACM Code of Ethics and Professional Conduct*. New York: Association for Computing Machinery. Available at: https://www.acm.org/code-of-ethics (Accessed: 6 November 2025).

31. Cloudinary (2023) *Cloudinary Documentation*. Available at: https://cloudinary.com/documentation (Accessed: 6 November 2025).

53. Facebook (2023) *Jest: Delightful JavaScript Testing Framework*. Menlo Park: Meta Platforms, Inc. Available at: https://jestjs.io/ (Accessed: 6 November 2025).

64. Google (2023) *Google Classroom Documentation*. Mountain View: Google LLC. Available at: https://support.google.com/edu/classroom (Accessed: 6 November 2025).

66. Google Cloud (2023) *Firebase Documentation*. Mountain View: Google LLC. Available at: https://firebase.google.com/docs (Accessed: 6 November 2025).

74. Hardt, D. (2012) *The OAuth 2.0 Authorization Framework. RFC 6749*. Internet Engineering Task Force. Available at: https://tools.ietf.org/html/rfc6749 (Accessed: 6 November 2025).

76. Hill, P. (2023) *State of Higher Ed LMS Market 2023 Edition*. e-Literate. Available at: https://eliterate.us/state-of-higher-ed-lms-market-2023/ (Accessed: 6 November 2025).

88. Jones, M., Bradley, J. and Sakimura, N. (2015) *JSON Web Token (JWT). RFC 7519*. Internet Engineering Task Force. Available at: https://tools.ietf.org/html/rfc7519 (Accessed: 6 November 2025).

109. Moodle (2023) *Moodle Documentation*. Perth: Moodle Pty Ltd. Available at: https://docs.moodle.org/ (Accessed: 6 November 2025).

117. Nielsen, J. (2012) *Usability 101: Introduction to Usability*. Nielsen Norman Group. Available at: https://www.nngroup.com/articles/usability-101-introduction-to-usability/ (Accessed: 6 November 2025).

122. Node.js Foundation (2023) *Node.js v20 Documentation*. Available at: https://nodejs.org/docs/latest/api/ (Accessed: 6 November 2025).

130. OWASP (2021) *OWASP Top 10 - 2021: The Ten Most Critical Web Application Security Risks*. Open Web Application Security Project. Available at: https://owasp.org/Top10/ (Accessed: 6 November 2025).

166. Stripe (2023) *Stripe API Documentation*. San Francisco: Stripe, Inc. Available at: https://stripe.com/docs/api (Accessed: 6 November 2025).

173. UNESCO (2020) *COVID-19 Educational Disruption and Response*. Paris: United Nations Educational, Scientific and Cultural Organization. Available at: https://en.unesco.org/covid19/educationresponse (Accessed: 6 November 2025).

175. Vercel (2023) *Vercel Documentation*. San Francisco: Vercel Inc. Available at: https://vercel.com/docs (Accessed: 6 November 2025).

179. W3C (2018) *Web Content Accessibility Guidelines (WCAG) 2.1*. World Wide Web Consortium. Available at: https://www.w3.org/TR/WCAG21/ (Accessed: 6 November 2025).

182. Wathan, A. (2019) *Tailwind CSS Documentation*. Available at: https://tailwindcss.com/docs (Accessed: 6 November 2025).
```

Most references đã có URLs in the text, bạn just needs to verify and ensure proper formatting.

---

## CHECKLIST

### ✅ Step-by-Step:

- [ ] 1. Create images folders (diagrams/, screenshots/, charts/)
- [ ] 2. Generate all 19 Mermaid diagrams from MERMAID_DIAGRAMS.md
- [ ] 3. Take ~40 website screenshots following the table above
- [ ] 4. Open main document: `THE COMP 1682 of version3 official - 10 nov (1).md`
- [ ] 5. Insert diagrams at specified line numbers
- [ ] 6. Insert screenshots at specified locations
- [ ] 7. Update List of Figures (line ~215)
- [ ] 8. Verify all references have proper links (already mostly done)
- [ ] 9. Check figure numbering is sequential
- [ ] 10. Preview entire document to ensure images display correctly

---

## QUICK INSERTION LOCATIONS SUMMARY

| Chapter | Lines | What to Insert |
|---------|-------|---------------|
| 1 - Introduction | ~40 | Homepage screenshots |
| 2 - Literature | ~427, ~460, ~475, ~487 | OAuth, Payment, Subscription, CDN diagrams |
| 4 - Requirements | ~642, ~650 | Stakeholder, use cases, workflows |
| 5 - Design | ~957, ~1001, ~1127, ~1205, ~1409 | Architecture, DB, API, UI, Security |
| 6 - Implementation | ~1511, ~1521, ~1735, ~1813, ~1849 | Dev env, backend, integrations, deployment |
| 8 - Testing | ~2128, ~2134, ~2161 | Testing pyramid, results, metrics |

---

## TIPS

1. **Consistent naming**: Use format `screenshot-XX-description.png`, `diagram-XX-description.png`
2. **Image quality**: PNG format, 1920x1080 or higher resolution
3. **File size**: Optimize images if too large (use TinyPNG.com)
4. **Captions**: Always include descriptive captions with figure numbers
5. **Cross-references**: Reference figures in text like "as shown in Figure 5.1"
6. **Alt text**: Include descriptive alt text in ![alt text](path) format

---

## FINAL CHECK

Before submission:
- [ ] All 19 diagrams generated and inserted
- [ ] All ~40 screenshots taken and inserted
- [ ] Table of Figures updated and complete
- [ ] All figure numbers sequential (Figure 5.1, 5.2, 5.3, ...)
- [ ] All images have captions
- [ ] References properly formatted with links
- [ ] Document renders correctly in Markdown preview
- [ ] No broken image links

---

**Total Images to Add: ~64 (19 diagrams + ~45 screenshots/charts)**

Good luck! 🚀
