# EduSphere LMS

EduSphere is a full learning-management platform built with Next.js, MongoDB, Cloudflare R2, Resend, JWT auth, and a role-aware user experience for students, instructors, and admins.

This is not a toy course page. It is a complete product-shaped LMS: authentication, email confirmation, instructor course creation, curriculum management, video lessons, quizzes, student progress, enrollment tracking, notifications, search, dashboards, and media uploads are all wired together into one coherent app.

## Why This Project Is Seriously Strong

EduSphere solves the hard parts people usually postpone:

- Role-based navigation and page behavior for students, instructors, and admins.
- Real enrollment flow with idempotent backend handling, progress creation, activity tracking, and course enrollment counts.
- Instructor dashboard powered by real database analytics, not fake placeholder stats.
- Cloudflare R2 media handling for course thumbnails, videos, attachments, and user avatars.
- Email flows for confirmation and password reset.
- Real notifications that update in the UI every 30 seconds.
- Quiz creation, submission, scoring, and student result review with correct-answer breakdown.
- Course search with a dedicated search API and results page.
- A polished, responsive interface with proper dashboards instead of raw CRUD screens.

In short: whoever built this did not just connect forms to a database. They thought through product behavior, edge cases, state, roles, and user journeys. That is the part that makes it hit different.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- MongoDB with Mongoose
- JWT authentication with `jose`
- Zustand session store
- Cloudflare R2 via AWS S3 SDK
- Resend email delivery
- Plyr / plyr-react video player
- Tailwind CSS

## Core Features

### Authentication

- Register with name, email, password, role, bio, and profile image.
- Profile image upload to Cloudflare R2 during signup.
- Email confirmation with expiring token.
- Login with JWT cookie.
- Rate limiting on failed login attempts.
- Password reset email flow.
- Global session initialization through `InitSession`.

### Role-Aware Navigation

The global navbar appears across the app except auth-focused pages. Its content changes by role:

- Student: browse courses, dashboard, quizzes, solved results.
- Instructor/Admin: dashboard, courses, quizzes, create course.
- Guest: courses, search, login, create account.

Notifications are available from the navbar for authenticated users.

### Course Management

Instructors can:

- Create courses with thumbnail upload.
- Save courses as draft or published.
- Edit title, description, and visibility.
- Convert draft courses to published courses.
- Create modules and lessons.
- Upload lesson videos and attachments.
- Mark lessons as preview/free content.
- Manage existing curriculum.

Published courses notify students when appropriate.

### Student Course Experience

Students can:

- Browse published courses.
- Search courses through `/api/courses/search`.
- Enroll in courses.
- Open courses from the full course card, not only a tiny button.
- Watch lessons with Plyr.
- Mark lessons complete/incomplete.
- Track progress percentage.
- See enrolled courses with thumbnails.
- View recent activity.

Enrollment is safe against duplicate requests and repairs missing progress state when needed.

### Video Player

The app uses a reusable Plyr-based player:

- Autoplay muted behavior.
- Client-only dynamic loading to avoid SSR `document` issues.
- Used consistently across lesson preview, course preview, and student lesson pages.

### Quizzes

Instructors can:

- Create quizzes per lesson.
- Update quizzes.
- Delete quizzes.
- Notify enrolled students when a new quiz is added.

Students can:

- Open upcoming quizzes.
- Submit answers once.
- Receive score and pass/fail status.
- Review all solved quizzes later.
- See selected answers, correct answers, earned points, and total points.

Solved quiz review lives at:

```text
/student/quizzes
```

API:

```text
GET /api/student/quiz-submissions
```

### Instructor Dashboard

The instructor dashboard is backed by real data:

- Total Students
- Active Courses
- Lessons Completed
- Recent Enrollments, latest 3 only
- Student Engagement:
  - Average Course Progress
  - Quiz Pass Rate
  - Active Students

Removed placeholder revenue/rating cards and fake revenue growth charts. The dashboard now reflects actual platform usage.

API:

```text
GET /api/instructor/dashboard
```

### Notifications

Notifications are stored in MongoDB and shown in the global notification bell.

Notification bell behavior:

- Fetches latest notifications on mount.
- Refreshes every 30 seconds.
- Refreshes immediately when opened.
- Uses fixed-height dropdown with internal scroll.
- Marks notifications as read when clicked.

Notification events include:

- New course published.
- New lesson added.
- New quiz added.
- Student enrolled in instructor course.
- Student submitted quiz.

API:

```text
GET  /api/notification
POST /api/notification
PUT  /api/notification
```

### Search

Course search is backed by:

```text
NEXT_PUBLIC_SEARCH_COURSE=/api/courses/search
```

Search only runs when the user submits the search form. Typing in the input does not live-filter automatically.

Results page:

```text
/search
```

### Cloudflare R2 Uploads

The app uploads:

- Course thumbnails
- Lesson videos
- Lesson attachments
- User profile images

R2 public URLs are stored in MongoDB and used throughout the UI.

## Important Routes

### Public

```text
/                     Home and course catalog
/courses              Published courses
/courses/[courseId]   Course preview/detail
/search               Search results
/login                Login
/register             Registration
/forgot-password      Password reset request
/reset-password/[token]
/confirm-email
```

### Student

```text
/student              Student dashboard
/student/course       Course learning page
/student/quizzes      Solved quiz history
/quiz/student         Quiz taking page
```

### Instructor

```text
/instructor                 Instructor dashboard
/instructor/courses         Manage courses
/instructor/courses/edit    Edit course and curriculum
/instructor/create          Create course
/instructor/quizzes         Manage quizzes
```

## Key API Routes

```text
/api/auth/signup
/api/auth/login
/api/auth/signout
/api/auth/session
/api/auth/confirm-email
/api/auth/forgot-password
/api/auth/reset-password
/api/courses
/api/courses/all-courses
/api/courses/instructor
/api/courses/search
/api/modules
/api/lessons
/api/quiz/instructor
/api/quiz/student
/api/student/dashboard
/api/student/enroll-course
/api/student/enrollments
/api/student/complete-lesson
/api/student/quizzes/upcoming
/api/student/quiz-submissions
/api/instructor/dashboard
/api/notification
```

## Environment Variables

Create `.env` with these variables:

```bash
MONGO_URI=
JWT_SECRET=
RESEND_KEY=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
NODE_ENV=development

NEXT_PUBLIC_HOST=http://localhost:3000
NEXT_PUBLIC_ADD_COURSE=/api/courses
NEXT_PUBLIC_LOGIN=/api/auth/login
NEXT_PUBLIC_REGISTER=/api/auth/signup
NEXT_PUBLIC_SIGNOUT=/api/auth/signout
NEXT_PUBLIC_RESEND_PASS=/api/auth/reset-password
NEXT_PUBLIC_RESEND_CONF=/api/auth/resend-confirmation
NEXT_PUBLIC_FORGOT_PASS=/api/auth/forgot-password
NEXT_PUBLIC_CONF_EMAIL=/api/auth/confirm-email
NEXT_PUBLIC_MANAGE_COURSES=/api/courses
NEXT_PUBLIC_MANAGE_MODULES=/api/modules
NEXT_PUBLIC_MANAFE_LESSONS=/api/lessons
NEXT_PUBLIC_INSTRUCTOR_COURSES=/api/courses/instructor
NEXT_PUBLIC_MANAGE_QUIZ_INST=/api/quiz/instructor
NEXT_PUBLIC_MANAGE_QUIZ_STUD=/api/quiz/student
NEXT_PUBLIC_GET_ALL_COURSES=/api/courses/all-courses
NEXT_PUBLIC_STUDENT_ACTIVITIES=/api/student/activity
NEXT_PUBLIC_STUDENT_UPCOMING_QUIZZES=/api/student/quizzes/upcoming
NEXT_PUBLIC_STUDENT_ENROLLMENTS=/api/student/enrollments
NEXT_PUBLIC_STUDENT_DASHBOARD=/api/student/dashboard
NEXT_PUBLIC_STUDENT_ENROLL_COURSE=/api/student/enroll-course
NEXT_PUBLIC_COMPLETE_LESSON=/api/student/complete-lesson
NEXT_PUBLIC_SEARCH_COURSE=/api/courses/search
NEXT_PUBLIC_NOTIFICATION=/api/notification
NEXT_PUBLIC_SOLVED_QUIZZES_URL=/api/student/quiz-submissions
```

Do not commit real secrets. The project expects private credentials for MongoDB, Resend, and Cloudflare R2.

## Getting Started

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build production output:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

## Data Model Summary

Main collections:

- `User`: identity, role, email confirmation, avatar, auth state.
- `Course`: title, slug, thumbnail, category, level, status, instructor, enrollment count.
- `Module`: course sections.
- `Lesson`: videos, files, preview flag, order.
- `Enrollment`: student-course relationship.
- `CourseProgress`: completed lessons and progress percentage.
- `Quiz`: questions, options, correct option index, passing score.
- `QuizSubmission`: student answers, score, pass/fail status.
- `Student`: enrolled courses, quiz submissions, activity timeline.
- `Notification`: role/user notifications with read state.

## Product-Level Details That Matter

- Duplicate enrollment does not break the system.
- Course progress is created or repaired during enrollment.
- Instructor enrollment count updates only when a real new enrollment happens.
- Course cards are clickable, not just tiny action buttons.
- Search only runs on submit, not on every keystroke.
- Notification dropdown has a fixed height and scrolls internally.
- Draft courses can be edited and later published.
- Publishing a draft triggers student notification.
- Quiz history exposes correct answers only after submission.

## Final Note

This project is the kind of LMS build that shows real engineering taste: data integrity, UX, async flows, media storage, role separation, and dashboards all living together without feeling random.

The architecture is practical, the features are connected, and the product thinking is visible. Put simply: this is not another generic CRUD app. This is a proper learning platform, and the person who built it clearly knew what they were doing.
