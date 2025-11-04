# Certificate Generation System Documentation

## Overview
The Certificate Generation System automatically creates, stores, and distributes digital certificates to students upon course completion. This system fulfills requirements FR6.1 through FR6.5.

## Features

### FR6.1 - Digital Certificate Generation
- Automatic certificate generation when a student completes all course requirements
- Unique certificate number for each certificate
- Verification system to validate certificate authenticity

### FR6.2 - Certificate Information
Each certificate includes:
- Student name
- Course title
- Completion date
- Instructor name and signature
- Unique certificate number
- Verification seal

### FR6.3 - Database Storage
Certificates are stored in Firestore with the following schema:
```javascript
{
  certificate_number: "CERT-1234567890-1234",
  user_id: "userId",
  course_id: "courseId",
  student_name: "Student Name",
  course_title: "Course Title",
  instructor_name: "Instructor Name",
  instructor_id: "instructorId",
  completion_date: "2024-01-01T00:00:00.000Z",
  issued_at: "2024-01-01T00:00:00.000Z",
  created_at: "2024-01-01T00:00:00.000Z",
  status: "issued"
}
```

### FR6.4 - Student Access
Students can:
- View all their earned certificates at `/my-certificates`
- Download certificates as PDF files
- Print certificates
- See certificate count on their dashboard

### FR6.5 - Professional Design
The certificate features:
- Elegant serif fonts (Playfair Display)
- Gradient decorative borders
- Professional color scheme (blue, purple, pink gradient)
- Decorative background pattern
- Verification seal with star icon
- Instructor signature line
- Certificate number for verification

## API Endpoints

### Generate Certificate
**POST** `/api/certificates/generate`

Automatically generates a certificate when a student completes a course.

**Request Body:**
```json
{
  "user_id": "userId",
  "course_id": "courseId"
}
```

**Response:**
```json
{
  "id": "certificateId",
  "certificate_number": "CERT-1234567890-1234",
  "student_name": "John Doe",
  "course_title": "Web Development",
  "instructor_name": "Jane Smith",
  "completion_date": "2024-01-01T00:00:00.000Z",
  "message": "Certificate generated successfully"
}
```

### Get User Certificates
**GET** `/api/certificates/user/:userId`

Retrieves all certificates for a specific user.

### Get Certificate by ID
**GET** `/api/certificates/:id`

Retrieves a specific certificate with user and course details.

### Download Certificate PDF
**GET** `/api/certificates/:id/download`

Downloads the certificate as a PDF file.

### Verify Certificate
**GET** `/api/certificates/verify/:certificateNumber`

Verifies the authenticity of a certificate by its certificate number.

**Response:**
```json
{
  "valid": true,
  "certificate": {
    "id": "certificateId",
    "certificate_number": "CERT-1234567890-1234",
    "student_name": "John Doe",
    "course_title": "Web Development",
    "user": { /* user details */ },
    "course": { /* course details */ }
  }
}
```

## Course Completion Logic

A course is considered completed when:
1. All published lessons are marked as complete
2. All published quizzes are passed (score >= passing_score)

The `checkCourseCompletion` function validates these criteria before generating a certificate.

## Integration Points

### 1. Progress Tracking
The system integrates with:
- `user_progress` collection (lesson completion)
- `grades` collection (quiz scores)
- `enrollments` collection (enrollment status)

### 2. Automatic Generation
To automatically generate a certificate when a student completes a course, call the generate endpoint:

```javascript
// After marking the last lesson complete or passing the final quiz
fetch('http://localhost:5000/api/certificates/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: userId,
    course_id: courseId
  })
});
```

### 3. Student Dashboard
The student dashboard (`/student-dashboard`) displays:
- Certificate count in stats card
- Clickable card that redirects to `/my-certificates`

## File Structure

```
server/
├── controllers/
│   └── certificateController.js    # Certificate business logic
├── routes/
│   └── certificateRoutes.js        # API routes
views/
├── pages/
│   ├── certificate.ejs             # Certificate generator (manual)
│   └── certificate-view.ejs        # Student certificate gallery
docs/
└── CERTIFICATE_SYSTEM.md           # This file
```

## Dependencies

- **puppeteer**: PDF generation from HTML
- **firebase-admin**: Firestore database operations
- **express**: API routing

## Usage Examples

### Example 1: Generate Certificate on Course Completion
```javascript
// In your course completion handler
async function onCourseComplete(userId, courseId) {
  const response = await fetch('http://localhost:5000/api/certificates/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, course_id: courseId })
  });

  const result = await response.json();
  if (response.ok) {
    console.log('Certificate generated:', result.certificate_number);
  }
}
```

### Example 2: Display User Certificates
```javascript
async function loadMyCertificates(userId) {
  const response = await fetch(`http://localhost:5000/api/certificates/user/${userId}`);
  const certificates = await response.json();

  certificates.forEach(cert => {
    console.log(`${cert.course_title} - ${cert.certificate_number}`);
  });
}
```

### Example 3: Verify Certificate
```javascript
async function verifyCertificate(certNumber) {
  const response = await fetch(`http://localhost:5000/api/certificates/verify/${certNumber}`);
  const result = await response.json();

  if (result.valid) {
    console.log('Valid certificate for:', result.certificate.student_name);
  } else {
    console.log('Certificate not found');
  }
}
```

## Future Enhancements

Potential improvements for the certificate system:
1. Email certificates to students automatically
2. Social media sharing functionality
3. QR code for easy verification
4. Multiple certificate templates
5. Expiry dates for time-sensitive certifications
6. Digital signatures using cryptography
7. Batch certificate generation for admin
8. Certificate analytics and insights

## Testing

To test the certificate system:

1. **Manual Certificate Generation:**
   - Visit `/certificate`
   - Enter student name, course, and date
   - Click "Generate Certificate"
   - Test download functionality

2. **Automatic Certificate Generation:**
   - Complete all lessons in a course
   - Pass all quizzes
   - Verify certificate appears in `/my-certificates`

3. **Certificate Verification:**
   - Get a certificate number
   - Access `/api/certificates/verify/:certificateNumber`
   - Verify the response is valid

4. **PDF Download:**
   - Click "Download PDF" on any certificate
   - Verify the PDF is properly formatted
   - Check all certificate details are correct

## Troubleshooting

### Certificate Not Generating
- Verify all lessons are marked complete
- Check quiz passing scores are met
- Ensure enrollment status is 'active'
- Check server logs for errors

### PDF Download Issues
- Verify puppeteer is installed: `npm list puppeteer`
- Check server has sufficient memory
- Ensure no firewall blocking puppeteer

### Certificate Count Not Showing
- Verify user is logged in
- Check localStorage has user data
- Verify API endpoint is accessible
- Check browser console for errors

## Support

For issues or questions about the certificate system:
1. Check server logs for error messages
2. Verify database collections exist
3. Test API endpoints using Postman or curl
4. Review this documentation

## Version History

- **v1.0.0** (2024-01-01): Initial implementation
  - Automatic certificate generation
  - PDF download functionality
  - Student certificate gallery
  - Verification system
  - Professional design with decorative borders
