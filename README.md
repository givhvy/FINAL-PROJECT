# 🎓 UniLearn - E-Learning Platform

A full-stack e-learning platform built with **Node.js**, **Express**, **Firebase**, and **EJS templates** following the **MVC architecture pattern**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Firebase account
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Codemaster-3

# Install dependencies
npm install

# Setup environment variables
# Create .env file with your Firebase credentials
# See .env.example for required variables

# Start the server
npm start
# or
node server.js
```

**Server will run on:** http://localhost:7000

---

## 📁 Project Structure

```
Codemaster-3/
├── views/                      # VIEW LAYER (MVC)
│   ├── layouts/               # Layout templates
│   ├── partials/              # Reusable components
│   └── pages/                 # Page templates (19 pages)
│
├── public/                     # Static assets
│   ├── css/                   # Stylesheets
│   ├── js/                    # Client-side JavaScript
│   └── images/                # Images
│
├── server/                     # BACKEND (MVC)
│   ├── models/                # Data models
│   ├── controllers/           # Business logic
│   ├── routes/                # API routes
│   ├── middleware/            # Custom middleware
│   ├── services/              # External services
│   └── config/                # Configuration files
│
├── docs/                       # Documentation
├── server.js                   # Main application entry
├── package.json               # Dependencies
└── .env                       # Environment variables
```

---

## 🎯 Features

### For Students
- 📚 Browse and enroll in courses
- 📝 Take quizzes and track grades
- 💬 Participate in community discussions
- 📰 Read educational blog posts
- 🎓 Generate certificates upon completion

### For Teachers
- 📖 Create and manage courses
- 🎯 Create quizzes and questions
- 📊 Track student progress
- 📝 Manage lessons and content

### For Admins
- 👥 User management
- 📈 Analytics and reporting
- 💳 Payment and order management
- 🎨 Content moderation

---

## 🏗️ Architecture

This project follows the **MVC (Model-View-Controller)** pattern:

### Model Layer (`server/models/`)
- User, Course, Lesson, Quiz, Question
- Order, Payment, Certificate
- Firebase Firestore integration

### View Layer (`views/`)
- EJS templating engine
- Reusable partials (header, footer)
- 19 responsive pages

### Controller Layer (`server/controllers/`)
- Authentication (login, signup, password reset)
- Course and lesson management
- Quiz and grading system
- Payment processing

---

## 🔧 Tech Stack

**Backend:**
- Node.js
- Express.js
- Firebase Admin SDK
- EJS (Embedded JavaScript templates)

**Frontend:**
- TailwindCSS
- Vanilla JavaScript
- Font Awesome icons

**Database:**
- Firebase Firestore

**Authentication:**
- JWT (JSON Web Tokens)
- Firebase Auth

---

## 📚 API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `POST /api/quizzes` - Create quiz
- `POST /api/grades` - Submit quiz answers

*See full API documentation in [docs/](docs/) folder*

---

## 🌐 Pages

### Public Pages
- `/` - Homepage
- `/login` - Login page
- `/signup` - Sign up page
- `/courses` - Browse courses
- `/community` - Community forum
- `/blog` - Blog posts

### Dashboard Pages
- `/admin` - Admin dashboard
- `/teacher` - Teacher dashboard
- `/student` - Student dashboard

### User Pages
- `/profile` - User profile
- `/account` - Account settings

### Learning Pages
- `/quiz` - Take quizzes
- `/lesson-management` - Manage lessons
- `/quiz-management` - Manage quizzes
- `/certificate` - Generate certificates

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=7000

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Or use JSON string
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Optional
NODE_ENV=development
```

---

## 📖 Documentation

Comprehensive documentation available in the `docs/` folder:

- [MVC_STRUCTURE.md](docs/MVC_STRUCTURE.md) - MVC architecture guide
- [MIGRATION_COMPLETE.md](docs/MIGRATION_COMPLETE.md) - Migration summary
- [REFACTORING_PLAN.md](docs/REFACTORING_PLAN.md) - Refactoring guide
- [CLEANUP_COMPLETE.md](docs/CLEANUP_COMPLETE.md) - Cleanup report
- [URL_MIGRATION_REPORT.md](docs/URL_MIGRATION_REPORT.md) - URL migration details

---

## 🧪 Testing

```bash
# Start the server
npm start

# Test pages
http://localhost:7000/login
http://localhost:7000/courses
http://localhost:7000/community
```

---

## 🚀 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard

See [DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md) for detailed instructions.

---

## 📝 Development

### Project Status
✅ **Production Ready**

- MVC architecture fully implemented
- 19 pages converted to EJS templates
- Clean and optimized codebase
- All routes working
- Documentation complete

### Future Improvements
- [ ] Implement real-time notifications
- [ ] Add video streaming for lessons
- [ ] Implement social login (Google, Facebook)
- [ ] Add mobile app (React Native)
- [ ] Implement advanced analytics

---

## 👥 Contributors

- Your Name - *Initial work*

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- TailwindCSS for the UI framework
- Firebase for backend services
- Express.js for the server framework
- Font Awesome for icons

---

## 📞 Support

For support, email support@unilearn.com or join our Slack channel.

---

**Built with ❤️ for education**

---

## 🎯 Quick Links

- **Server**: http://localhost:7000
- **Documentation**: [docs/](docs/)
- **Admin Panel**: http://localhost:7000/admin
- **API Docs**: [docs/API.md](docs/API.md)

---

*Last updated: 2025-11-03*
