# Leaderboard Fix Documentation

## Issue Summary
The leaderboard was displaying incorrect data - all users showed "0 courses completed" and "0 pts" even though users had completed courses visible in the "My Progress" section.

## Root Cause
The leaderboard was using `Progress.getUserOverallProgress()` which queries the `enrollments` collection to find user courses. However, the system stores course purchases in the `orders` collection, not `enrollments`. This mismatch resulted in:
- `getUserOverallProgress()` returned empty arrays (no enrollments found)
- Empty arrays → 0 completed courses → 0 points for all users

## Solution Implemented
Changed the leaderboard to use the same data source as the "My Progress" section.

### File Modified
`server/controllers/communityController.js` - `getLeaderboard()` function (lines 91-172)

### New Logic
1. **Data Source**: Uses `Order.findByUserId(userId)` to get all courses purchased by each user
2. **Progress Calculation**: For each course, queries `user_progress` collection to count completed lessons
3. **Completion Percentage**: Calculates `(completedLessons / totalLessons) * 100`
4. **Completed Courses**: Only counts courses with 100% completion
5. **Points Calculation**: Simple formula - `completedCourses * 100` (100 points per completed course)

### Edge Case Handling
Added special handling for data inconsistencies (lines 137-146):
- **Courses with 0 lessons**: If user has progress records, count as 100% complete
- **More completed than total**: Caps percentage at 100% even if `completedLessons > totalLessons`

## Result
The leaderboard now shows accurate real-time data from Firebase:
- Matches the "My Progress" section exactly
- 100 points awarded per completed course
- Handles edge cases and data inconsistencies gracefully

## Example
User "huy student":
- Has completed 2 courses ("Full Stack Web Development" and "Code for beginner")
- Leaderboard displays: "2 courses completed, 200 pts"
- Matches "My Progress" card: "2/9 courses, 200 Study Points"

## Technical Details
- Uses the same `Order` model as `/api/users/:id/progress` endpoint
- Queries `user_progress` collection with filters: `user_id`, `course_id`, `progress_type: 'lesson_completed'`
- Processes all student users and sorts by points (descending)
- Returns top 10 users for leaderboard display
