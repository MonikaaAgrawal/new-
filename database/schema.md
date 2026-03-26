# Database Schema — AcadPlace

## Collection: users
| Field            | Type    | Description                        |
|------------------|---------|------------------------------------|
| name             | String  | Full name                          |
| email            | String  | Unique login email                 |
| password         | String  | Bcrypt hashed                      |
| role             | String  | admin / tpo / student              |
| enrollmentNumber | String  | Links to Student (students only)   |
| isActive         | Boolean | Soft disable                       |

## Collection: students
| Field                   | Type     | Description                            |
|-------------------------|----------|----------------------------------------|
| enrollmentNumber        | String   | Primary ID e.g. IT21001                |
| name                    | String   | Full name                              |
| email                   | String   | College email                          |
| phone                   | String   | 10-digit mobile                        |
| branch                  | String   | Default: Information Technology        |
| division                | String   | A / B / C / D                          |
| batch                   | String   | e.g. 2021-2025                         |
| semester                | Number   | 1-8                                    |
| cgpa                    | Number   | 0.00-10.00                             |
| semesterResults[]       | Array    | { semester, sgpa, backlogs }           |
| totalBacklogs           | Number   | Sum of all backlogs                    |
| activeBacklogs          | Number   | Current active backlogs                |
| technicalSkills[]       | [String] | e.g. React, Node.js                    |
| softSkills[]            | [String] | e.g. Leadership                        |
| programmingLanguages[]  | [String] | e.g. Python, Java                      |
| projects[]              | Array    | { title, type, techStack, github }     |
| certifications[]        | Array    | { title, issuedBy, issueDate }         |
| internships[]           | Array    | { company, role, stipend, completed }  |
| achievements[]          | [String] | Free text achievements                 |
| placementStatus         | String   | not_started/in_process/placed/etc      |
| placedCompany           | String   | Company name if placed                 |
| placedPackage           | Number   | CTC in LPA                             |
| placementReadinessScore | Number   | 0-100 AI score                         |
| skillGaps[]             | [String] | AI-identified missing skills           |
| suggestedSkills[]       | [String] | Top 3 recommendations                  |

## Collection: placementdrives
| Field             | Type   | Description                         |
|-------------------|--------|-------------------------------------|
| companyName       | String | Visiting company                    |
| jobRole           | String | Role offered                        |
| driveDate         | Date   | Date of drive                       |
| package           | Number | CTC in LPA                          |
| eligibilityCGPA   | Number | Minimum CGPA required               |
| requiredSkills[]  | Array  | Skills required                     |
| jobType           | String | full_time / internship / ppo        |
| applicants[]      | Array  | { student ref, status, appliedAt }  |
| isCompleted       | Boolean| Drive finished?                     |