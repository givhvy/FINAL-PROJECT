Undergraduate Final Year Project Proposal

UNILEARN: A COMPREHENSIVE WEB-BASED E-LEARNING PLATFORM
A Full-Stack Learning Management System with Modern Web Technologies

[Your Name]

Bachelor of Science with Honours in Computer Science

[Your Student ID]

---

## 1. Overview

The COVID-19 pandemic accelerated the global shift to digital education, exposing critical gaps in existing Learning Management Systems (LMS). Traditional platforms like Moodle and Blackboard suffer from fragmented user experiences, requiring students and educators to navigate multiple disconnected tools for content delivery, communication, assessment, payment processing, and certification. This fragmentation increases cognitive load, creates security vulnerabilities, and reduces overall engagement.

**UniLearn** addresses these challenges by developing a modern, integrated web-based LMS that combines institutional-grade functionality with consumer-grade usability. The system will be built using contemporary full-stack web technologies including **Node.js/Express.js** backend, **Firebase Firestore** NoSQL database, **EJS** templating for server-side rendering, and **Tailwind CSS** for responsive UI design. The platform will implement a **Model-View-Controller (MVC)** architecture with RESTful API design, ensuring maintainability and scalability.

Key integrations include **Google OAuth 2.0** for seamless authentication, **Stripe** for subscription-based payment processing ($9.99/month Pro tier), **Cloudinary CDN** for media management, and **Vercel** serverless deployment for cloud-native scalability. The system will support three distinct user roles—Students, Teachers, and Administrators—with comprehensive **Role-Based Access Control (RBAC)**.

Core features include course creation and management, multimedia lesson delivery with progress tracking, interactive quizzes with automated grading, real-time analytics dashboards, automated certificate generation upon course completion, and gamified community features including study groups and leaderboards. Security will be paramount, implementing **OWASP Top 10** compliance through bcrypt password hashing, JWT authentication, HTTPS enforcement, and PCI DSS compliance via Stripe's hosted checkout.

This project demonstrates industry-standard development practices including RESTful API design, OAuth integration, secure payment processing, cloud deployment strategies, and comprehensive testing methodologies. The platform targets small-to-medium educational institutions and individual educators seeking affordable, feature-rich alternatives to expensive enterprise LMS solutions.

**Key Technologies:**
- **Backend Framework:** Node.js v18 with Express.js v4.18
- **Database:** Firebase Firestore (NoSQL, cloud-hosted)
- **Authentication:** JWT tokens, Google OAuth 2.0, bcrypt hashing
- **Payment Gateway:** Stripe API for subscription management
- **Frontend:** EJS templating, Tailwind CSS v3, Vanilla JavaScript
- **Cloud Services:** Vercel (deployment), Cloudinary (media CDN)
- **Architecture:** MVC pattern, RESTful API, serverless functions

---

## 2. Aim

To design, develop, and evaluate a comprehensive web-based e-learning platform demonstrating modern full-stack development practices while providing an integrated, secure, and user-friendly environment for online education that addresses fragmentation issues in current LMS offerings.

---

## 3. Objectives

### 3.1 Initial Investigation and Requirements Analysis

**Activities:**
- 3.1.1 Conduct literature review on e-learning systems evolution and LMS architectures [2.0 weeks]
- 3.1.2 Analyze existing platforms (Moodle, Canvas, Udemy, Google Classroom) to identify gaps [1.5 weeks]
- 3.1.3 Gather requirements through stakeholder interviews and use case development [1.0 week]
- 3.1.4 Define functional and non-functional requirements using MoSCoW prioritization [1.0 week]
- 3.1.5 Create user personas for Students, Teachers, and Administrators [0.5 week]

**Deliverables:**
- Literature review chapter documenting web architectures, authentication mechanisms, payment integration
- Competitive analysis report comparing 5 LMS platforms
- Requirements specification document with 32+ functional requirements
- Use case diagrams and user stories

### 3.2 System Design and Architecture Planning

**Activities:**
- 3.2.1 Design MVC architecture with clear separation of concerns (Models, Views, Controllers) [1.5 weeks]
- 3.2.2 Design Firebase Firestore database schema with 21+ collections [2.0 weeks]
- 3.2.3 Define RESTful API endpoints (19+ routes) with request/response formats [1.5 weeks]
- 3.2.4 Create UI/UX mockups and wireframes for key screens (dashboard, courses, quizzes) [2.0 weeks]
- 3.2.5 Plan security architecture including RBAC, JWT implementation, OWASP compliance [1.0 week]
- 3.2.6 Design integration workflows for Google OAuth, Stripe, and Cloudinary [1.0 week]

**Deliverables:**
- System architecture diagrams (component, deployment, sequence diagrams)
- Database schema documentation with entity relationships
- API specification document with endpoint definitions
- UI/UX design mockups and style guide
- Security architecture blueprint

### 3.3 Backend Implementation

**Activities:**
- 3.3.1 Set up development environment (Node.js, Express, Firebase Admin SDK, ESLint) [0.5 week]
- 3.3.2 Implement authentication system (JWT tokens, Google OAuth 2.0, bcrypt hashing) [2.0 weeks]
- 3.3.3 Develop Firestore models for Users, Courses, Lessons, Enrollments, Quizzes [2.5 weeks]
- 3.3.4 Create Express controllers for course management, enrollment, quiz operations [2.5 weeks]
- 3.3.5 Implement RBAC middleware and authorization checks [1.0 week]
- 3.3.6 Integrate Stripe payment gateway for subscription management [2.0 weeks]
- 3.3.7 Implement Cloudinary API for media upload and transformation [1.0 week]
- 3.3.8 Develop certificate generation system using PDF libraries [1.5 weeks]

**Deliverables:**
- Express.js server with 19+ RESTful API endpoints
- 21 Firestore collection models with CRUD operations
- Authentication middleware supporting JWT and OAuth
- Payment integration with Stripe webhooks
- Certificate generation module

### 3.4 Frontend Development

**Activities:**
- 3.4.1 Create EJS layout templates with partials (header, footer, navbar) [1.0 week]
- 3.4.2 Implement student dashboard with enrolled courses and progress tracking [1.5 weeks]
- 3.4.3 Build teacher course management interface (create, edit, publish courses) [2.0 weeks]
- 3.4.4 Develop lesson viewer with video support and completion tracking [1.5 weeks]
- 3.4.5 Create interactive quiz interface with timer and instant grading [2.0 weeks]
- 3.4.6 Implement payment flow UI with Stripe Checkout integration [1.0 week]
- 3.4.7 Build community features (study groups, leaderboard) [1.5 weeks]
- 3.4.8 Design responsive layouts using Tailwind CSS for mobile/tablet/desktop [1.5 weeks]
- 3.4.9 Implement dark mode toggle with localStorage persistence [0.5 week]

**Deliverables:**
- 15+ EJS view templates
- Responsive UI components using Tailwind CSS
- Client-side JavaScript for interactivity
- Dark mode implementation
- Mobile-optimized interfaces

### 3.5 Testing and Quality Assurance

**Activities:**
- 3.5.1 Write unit tests for controllers and models using Jest framework [2.0 weeks]
- 3.5.2 Perform integration testing with Firebase emulator [1.5 weeks]
- 3.5.3 Conduct security testing for OWASP Top 10 vulnerabilities [1.0 week]
- 3.5.4 Execute performance testing with Apache Bench (100+ concurrent users) [1.0 week]
- 3.5.5 Run cross-browser compatibility testing (Chrome, Firefox, Safari, Edge) [0.5 week]
- 3.5.6 Perform User Acceptance Testing with 15 participants [1.5 weeks]
- 3.5.7 Use Lighthouse for performance, accessibility, SEO audits [0.5 week]

**Deliverables:**
- Test suite with 80%+ code coverage
- Security audit report confirming OWASP compliance
- Performance benchmarks (response times, concurrent user handling)
- UAT feedback and System Usability Scale (SUS) scores
- Bug tracking log and resolution documentation

### 3.6 Deployment and DevOps

**Activities:**
- 3.6.1 Configure Vercel deployment with environment variables [0.5 week]
- 3.6.2 Set up Firebase production project with security rules [0.5 week]
- 3.6.3 Configure Stripe production webhooks and API keys [0.5 week]
- 3.6.4 Implement HTTPS with automatic SSL certificates [0.3 week]
- 3.6.5 Set up monitoring and logging systems [0.5 week]
- 3.6.6 Create deployment documentation and runbooks [0.5 week]

**Deliverables:**
- Production deployment on Vercel with custom domain
- Environment configuration documentation
- Deployment checklist and rollback procedures
- Monitoring dashboard setup

### 3.7 Documentation and Reporting

**Activities:**
- 3.7.1 Write technical documentation (API reference, architecture diagrams) [2.0 weeks]
- 3.7.2 Create user manuals for Students, Teachers, and Administrators [1.5 weeks]
- 3.7.3 Compile dissertation chapters (9 chapters: Introduction → Conclusion) [6.0 weeks]
- 3.7.4 Prepare appendices (code samples, database schema, testing results) [1.0 week]
- 3.7.5 Create demonstration video and presentation slides [1.0 week]
- 3.7.6 Proofread and format final report to University of Greenwich standards [1.0 week]

**Deliverables:**
- Academic dissertation (80 pages, ~25,000 words)
- Technical API documentation
- User manuals (student, teacher, admin guides)
- 15-20 minute video demonstration
- Final presentation slides

---

## 4. Legal, Social, Ethical and Professional Issues

### 4.1 Legal Issues

**Data Protection and Privacy:**
- **GDPR Compliance (EU Regulation 2016/679):** UniLearn will process personal data (names, emails, learning records) requiring compliance with data minimization, purpose limitation, and user consent principles. Students retain right to access, rectify, erase, and port their data. Privacy policy will clearly explain data collection, storage (Firebase servers), and third-party sharing (Google OAuth, Stripe).
- **COPPA Compliance (Children's Online Privacy Protection Act):** Age verification will restrict registration to users 13+ years old. Parental consent mechanisms required for younger users if platform expands to K-12 education.
- **Copyright and Intellectual Property:** Teachers uploading course content must certify ownership or fair use rights. Platform Terms of Service will prohibit pirated materials. DMCA takedown procedures will be implemented for copyright infringement claims. All original code licensed under MIT License.

**Payment Processing:**
- **PCI DSS Compliance:** By using Stripe Checkout hosted pages, UniLearn avoids direct card data handling, reducing compliance scope to SAQ A (simplest tier). No credit card numbers stored in Firestore database.
- **Consumer Protection:** Clear refund policies (14-day money-back guarantee), transparent pricing ($9.99/month Pro subscription), and automatic payment retry mechanisms with email notifications.

### 4.2 Social Issues

**Digital Divide and Accessibility:**
- **Socioeconomic Barriers:** Freemium model (3 free courses) ensures basic educational access regardless of financial capacity. Pro tier affordable at $9.99/month compared to enterprise LMS ($60-180/year per user).
- **Disability Inclusion:** Platform targets WCAG 2.1 Level AA compliance including keyboard navigation, screen reader compatibility, and high contrast mode. Video content encourages caption uploads.
- **Language Barriers:** Initial English-only interface; future internationalization planned for Vietnamese, Spanish, French languages.

**Educational Impact:**
- **Quality Assurance:** Teacher certification or qualification verification not enforced in MVP. Potential for unqualified instructors or misinformation spreading. Future: peer review system and content moderation.
- **Student Engagement:** Gamification (leaderboards, points) may prioritize competition over collaboration. Design balances individual achievement with community features (study groups).

### 4.3 Ethical Issues

**Academic Integrity:**
- **Plagiarism and Cheating:** Quiz system lacks proctoring features. Students may use external resources during assessments. Mitigation: randomized question banks, time limits, open-book exam design encouraged.
- **Fair Assessment:** Automated grading (MCQ, True/False) ensures consistency but lacks nuance of human evaluation for subjective questions. Teachers must manually grade short-answer responses.

**Data Ethics:**
- **Algorithmic Transparency:** Progress tracking algorithms visible to users. No hidden analytics or predictive dropout modeling that could bias instructor treatment.
- **Informed Consent:** Users explicitly agree to cookies, data collection, and third-party integrations (Google, Stripe) during registration. Granular privacy settings planned.

**Professional Responsibility:**
- Adherence to **BCS Code of Conduct** (British Computer Society, 2022): Public interest prioritized through accessible education; professional competence demonstrated through secure coding; duty to relevant authority (University of Greenwich) fulfilled through academic honesty.
- Adherence to **ACM Code of Ethics** (Association for Computing Machinery, 2018): Avoiding harm through security testing; respecting privacy through GDPR compliance; being honest about system limitations (no AI tutoring, limited offline access).

### 4.4 Professional Issues

**Industry Standards:**
- **Security Best Practices:** OWASP Top 10 compliance, HTTPS enforcement, bcrypt password hashing (12 rounds), JWT token expiration (24 hours), input validation, output encoding.
- **Code Quality:** ESLint linting with Airbnb style guide, JSDoc comments, MVC architectural pattern, RESTful API conventions, Git version control.
- **Testing Standards:** 80%+ code coverage target, unit/integration/UAT testing pyramid, automated Lighthouse audits.

**Sustainability and Maintenance:**
- **Technical Debt:** Modular MVC architecture enables future refactoring. API-first design supports mobile app development. Serverless deployment reduces infrastructure management burden.
- **Vendor Lock-In Risks:** Firebase dependency creates migration challenges. Mitigation: abstraction layer for database operations enables potential switch to MongoDB/PostgreSQL.

**Commercial Considerations:**
- **Business Model:** Freemium SaaS model balances accessibility (free tier) with sustainability (Pro subscriptions). Institutional licensing (B2B) potential for universities.
- **Market Competition:** Differentiation through affordability ($9.99/month vs Canvas $60-180/year), modern tech stack, integrated payments, community features absent in competitors.

---

## 5. Planning (see Appendix A)

The project will follow **Agile methodology** with iterative development cycles, enabling rapid prototyping and continuous feedback integration. Development spans **January 2025 to November 2025** (approximately 40 weeks), divided into seven major phases aligned with objectives.

**Project Management Approach:**
- **Version Control:** Git with GitHub repository for code versioning and collaboration
- **Task Tracking:** Kanban board (Trello/GitHub Projects) for sprint planning and progress monitoring
- **Testing Strategy:** Test-driven development (TDD) where feasible; continuous integration with automated testing
- **Risk Management:** Weekly risk assessments identifying technical blockers (API rate limits, database scaling), mitigation strategies documented
- **Milestone Reviews:** Bi-weekly supervisor meetings for progress evaluation and scope adjustments

**Dependencies and Critical Path:**
- Backend implementation (Objective 3.3) must precede frontend development (Objective 3.4)
- Authentication system required before RBAC and payment integration
- Database schema finalization blocks controller development
- Deployment configuration needed before UAT execution
- Documentation concurrent with development to avoid last-minute rush

**Concurrent Activities:**
- Frontend and backend teams can work in parallel after API contracts defined
- Literature review continues during early implementation phases
- Unit testing concurrent with feature development
- Technical documentation written alongside code commits

Detailed Gantt chart with task dependencies, resource allocation, and milestone deadlines provided in **Appendix A**.

---

## 6. Initial References

Aldiab, A., Chowdhury, H., Kootsookos, A., Alam, F. and Allhibi, H. (2019) 'Utilization of Learning Management Systems (LMSs) in higher education system: A case review for Saudi Arabia', *Energy Procedia*, 160, pp. 731-737.

Association for Computing Machinery (2018) *ACM Code of Ethics and Professional Conduct*. New York: ACM. Available at: https://www.acm.org/code-of-ethics (Accessed: 6 November 2025).

British Computer Society (2022) *Code of Conduct for BCS Members*. Swindon: BCS. Available at: https://www.bcs.org/membership-and-registrations/become-a-member/bcs-code-of-conduct/ (Accessed: 6 November 2025).

Coates, H., James, R. and Baldwin, G. (2005) 'A critical examination of the effects of learning management systems on university teaching and learning', *Tertiary Education and Management*, 11(1), pp. 19-36.

Dobre, I. (2015) 'Learning Management Systems for higher education: An overview of available options for Higher Education Organizations', *Procedia - Social and Behavioral Sciences*, 180, pp. 313-320.

European Union (2016) *Regulation (EU) 2016/679 on the Protection of Natural Persons with Regard to the Processing of Personal Data (General Data Protection Regulation)*. Brussels: European Parliament and Council.

Fielding, R.T. (2000) *Architectural Styles and the Design of Network-based Software Architectures*. Doctoral dissertation. University of California, Irvine.

Hardt, D. (ed.) (2012) *The OAuth 2.0 Authorization Framework (RFC 6749)*. Internet Engineering Task Force. Available at: https://tools.ietf.org/html/rfc6749 (Accessed: 6 November 2025).

Jones, M., Bradley, J. and Sakimura, N. (2015) *JSON Web Token (JWT) (RFC 7519)*. Internet Engineering Task Force. Available at: https://tools.ietf.org/html/rfc7519 (Accessed: 6 November 2025).

Krasner, G.E. and Pope, S.T. (1988) 'A cookbook for using the model-view controller user interface paradigm in Smalltalk-80', *Journal of Object-Oriented Programming*, 1(3), pp. 26-49.

OWASP (2021) *OWASP Top Ten 2021*. Open Web Application Security Project. Available at: https://owasp.org/Top10/ (Accessed: 6 November 2025).

PCI Security Standards Council (2022) *Payment Card Industry Data Security Standard (PCI DSS) v4.0*. Available at: https://www.pcisecuritystandards.org/ (Accessed: 6 November 2025).

Richardson, L. and Ruby, S. (2007) *RESTful Web Services*. Sebastopol: O'Reilly Media.

Stripe (2023) *Stripe API Documentation*. San Francisco: Stripe, Inc. Available at: https://stripe.com/docs/api (Accessed: 6 November 2025).

UNESCO (2020) *COVID-19 Educational Disruption and Response*. Paris: United Nations Educational, Scientific and Cultural Organization. Available at: https://en.unesco.org/covid19/educationresponse (Accessed: 6 November 2025).

---

# APPENDIX A - SCHEDULE OF WORK

## Project Timeline: January 2025 - November 2025 (40 weeks)

### Phase 1: Research and Planning (Weeks 1-6)
**Weeks 1-2:** Literature review on LMS evolution, web architectures, authentication mechanisms  
**Weeks 3-4:** Competitive analysis of Moodle, Canvas, Udemy, Google Classroom  
**Week 5:** Requirements gathering (stakeholder interviews, use cases)  
**Week 6:** System design initiation (architecture diagrams, database schema drafting)  
**Milestone:** Requirements specification document approved by supervisor

### Phase 2: Design (Weeks 7-13)
**Weeks 7-8:** MVC architecture design and Firebase schema finalization (21 collections)  
**Weeks 9-10:** RESTful API endpoint definitions (19 routes with request/response formats)  
**Weeks 11-12:** UI/UX wireframes and mockups (Figma/Adobe XD)  
**Week 13:** Security architecture planning (RBAC, JWT, OWASP compliance)  
**Milestone:** Design review presentation; architecture blueprint approved

### Phase 3: Backend Development (Weeks 14-24)
**Week 14:** Development environment setup (Node.js, Express, Firebase, ESLint)  
**Weeks 15-16:** Authentication implementation (JWT, Google OAuth 2.0, bcrypt)  
**Weeks 17-19:** Firestore models and controllers (Users, Courses, Lessons, Enrollments)  
**Weeks 20-21:** Stripe payment integration with webhooks  
**Week 22:** Cloudinary media upload integration  
**Weeks 23-24:** Certificate generation and RBAC middleware  
**Milestone:** Backend API functional with 80% endpoint coverage

### Phase 4: Frontend Development (Weeks 25-33)
**Weeks 25-26:** EJS templates and Tailwind CSS setup; layout components  
**Weeks 27-28:** Student dashboard with enrollment and progress tracking  
**Weeks 29-30:** Teacher course management interface (create, edit, publish)  
**Weeks 31-32:** Quiz interface with timer and automated grading  
**Week 33:** Payment UI, community features (study groups, leaderboard), dark mode  
**Milestone:** Full-stack integration complete; demo-ready prototype

### Phase 5: Testing and Debugging (Weeks 34-37)
**Week 34:** Unit testing (Jest) for controllers and models; target 80% coverage  
**Week 35:** Integration testing with Firebase emulator; security testing (OWASP)  
**Week 36:** Performance testing (Apache Bench 100+ users), cross-browser compatibility  
**Week 37:** User Acceptance Testing with 15 participants; SUS score evaluation  
**Milestone:** All critical bugs resolved; production-ready system

### Phase 6: Deployment (Weeks 38-39)
**Week 38:** Vercel deployment configuration; environment variables setup  
**Week 39:** Production Firebase, Stripe, Cloudinary configuration; HTTPS enforcement  
**Milestone:** Live deployment at https://unilearn.vercel.app

### Phase 7: Documentation and Finalization (Weeks 39-40)
**Weeks 39-40 (Concurrent):** Dissertation writing (9 chapters), technical docs, user manuals  
**Week 40:** Video demonstration, presentation slides, final proofreading  
**Final Deadline:** November 2025 submission

---

## Gantt Chart Summary

| **Objective**                  | **Weeks** | **Jan** | **Feb** | **Mar** | **Apr** | **May** | **Jun** | **Jul** | **Aug** | **Sep** | **Oct** | **Nov** |
|--------------------------------|-----------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|
| 3.1 Investigation & Requirements | 1-6       | ███████ | ███     |         |         |         |         |         |         |         |         |         |
| 3.2 Design                      | 7-13      |         | ███████ | ███████ |         |         |         |         |         |         |         |         |
| 3.3 Backend Development         | 14-24     |         |         | ███████ | ███████ | ███████ | ██      |         |         |         |         |         |
| 3.4 Frontend Development        | 25-33     |         |         |         |         |     ████| ███████ | ███████ | ██      |         |         |         |
| 3.5 Testing                     | 34-37     |         |         |         |         |         |         |         | ███████ | ██      |         |         |
| 3.6 Deployment                  | 38-39     |         |         |         |         |         |         |         |         | ███████ |         |         |
| 3.7 Documentation               | 39-40     |         |         |         |         |         |         |         |         |     ████| ███████ | ███     |

---

## Risk Management

| **Risk**                         | **Probability** | **Impact** | **Mitigation Strategy**                                   |
|----------------------------------|-----------------|------------|-----------------------------------------------------------|
| Firebase free tier limits exceeded | Medium          | High       | Monitor usage; implement caching; upgrade to paid plan    |
| Stripe API integration issues    | Low             | High       | Use test mode extensively; consult documentation early    |
| Scope creep (feature additions)  | High            | Medium     | Strict MoSCoW prioritization; MVP focus; defer nice-to-haves |
| Authentication vulnerabilities    | Low             | Critical   | OWASP testing; security audit; bcrypt + JWT best practices|
| Deployment configuration errors  | Medium          | Medium     | Staging environment; deployment checklist; rollback plan  |
| Time management (dissertation)   | Medium          | High       | Concurrent documentation; weekly writing targets (500 words)|

---

**Total Estimated Effort:** 40 weeks (January - November 2025)  
**Supervisor:** Huynh Tan Canh  
**Institution:** University of Greenwich  
**Programme:** BSc (Hons) Computer Science  
**Submission Date:** November 2025

note làm ngắn gọn như 4 trang trong proposalexample thôi
