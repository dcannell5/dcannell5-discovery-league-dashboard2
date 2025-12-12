A fully cloud-native member management and photo organization system for the Canadian Elite Volleyball Academy.

About
This application manages information for youth volleyball athletes (including minors under 18), their parents/guardians, and volleyball community members. Given the sensitive nature of managing data for minors, this system prioritizes privacy, security, and compliance with Canadian data protection requirements.

Project Philosophy: Strictly Cloud-Native with Google Ecosystem
pearl-people is built on a foundational principle: absolutely no local or device-specific storage or processing. Every aspect of this application—data storage, authentication, image management, member information, and processing—must operate exclusively through Google-based cloud services.

Core Requirements
No Local Storage: The application must never store data on local devices, browsers (beyond temporary session tokens), or any device-specific storage mechanism.

Google Cloud Services Only: All persistent storage, authentication, image management, and member management must use Google-based cloud services:

Firebase Authentication: For user authentication and authorization (Google's identity platform)
Firestore: For NoSQL database storage (Google's flexible, scalable database)
Google Cloud Storage / Firebase Storage: For image and file storage
Google AI Studio: For AI-powered features and image analysis
Google Cloud Platform (GCP): For any additional backend services needed
Firebase Hosting: For static web application hosting
Cross-Device Compatibility: Every feature must work seamlessly from any browser on any common device (desktop, tablet, mobile) with no local setup, installation, or device-specific configuration.

Secure Cloud Integration: All integrations must follow Google Cloud security best practices, including secure authentication, encrypted data transmission, and proper access controls.

Privacy and Data Protection for Minors: Given that the system manages data for youth athletes (under 18) in Canada, all features must:

Comply with Canadian privacy laws (PIPEDA and applicable provincial legislation)
Implement parental consent mechanisms where required
Provide robust access controls to protect minor's personal information
Enable secure sharing of athlete information only with authorized parties (coaches, parents/guardians)
Support data retention policies appropriate for youth sports organizations
Maintain audit logs for access to sensitive information
Rationale
Why Google-Based Cloud Services?
Ecosystem Integration: Google services work seamlessly together (Firebase, Firestore, Cloud Storage, AI Studio) providing a unified development experience.

Familiar Environment: Google's tools and interfaces are widely used and well-documented, making development more comfortable and efficient.

Universal Access: Users can access their data from any device, anywhere, without setup or synchronization issues.

Data Persistence: Data is never lost due to device failure, browser cache clearing, or local storage limitations.

Scalability: Google Cloud infrastructure automatically scales to handle growing data and user needs.

Collaboration: Multiple users can work with the same data simultaneously without conflicts.

Security: Google Cloud provides enterprise-grade security, backup, and disaster recovery.

Privacy Compliance: Google Cloud infrastructure supports compliance with Canadian privacy laws (PIPEDA) through data residency options, encryption, and comprehensive security controls essential for protecting youth athlete information.

Maintenance: No client-side storage management, cleanup, or migration issues.

Consistency: The application behaves identically across all devices and platforms.

Development Checklist
Before implementing any feature, developers must verify:

 No local storage: Feature does not use localStorage, IndexedDB, cookies (except session tokens), or any device storage
 Google Cloud services only: All data persistence uses Firebase, Firestore, Google Cloud Storage, or other Google Cloud Platform services
 Cross-device tested: Feature works identically on Chrome, Firefox, Safari, Edge (desktop and mobile)
 No local processing of persistent data: Any processing results are stored in Google Cloud, not locally
 No device-specific code: No platform detection or device-specific behavior (except responsive UI)
 Firebase Authentication: Uses Firebase Authentication for user auth
 Google Cloud image storage: Images are uploaded to and served from Google Cloud Storage or Firebase Storage
 No file downloads for persistence: Users don't download files to keep data; everything stays in Google Cloud
 Session-based state only: Any client-side state is temporary and session-based only
 API-first design: All operations go through Google Cloud APIs, not local processing
 Privacy protection for minors: Feature includes appropriate access controls and consent mechanisms for managing youth athlete data
 Audit logging: Sensitive operations (accessing minor's data, updating athlete information) are logged for accountability
Privacy & Security for Youth Athletes
Given that this system manages data for youth volleyball athletes (under 18), their parents/guardians, and volleyball community members in Canada, privacy and security are paramount.

Data Protection Principles
Minimal Data Collection: Only collect information necessary for volleyball academy operations
Parental Consent: Implement mechanisms to obtain and track parental/guardian consent for minors
Access Controls: Strict role-based access (athletes, parents/guardians, coaches, administrators)
Data Encryption: All data encrypted in transit (HTTPS) and at rest (Google Cloud encryption)
Audit Logging: Track access to sensitive information for accountability
Data Retention: Implement appropriate retention policies for youth sports organizations
Right to Access/Deletion: Support requests to access or delete personal information
Canadian Privacy Compliance
PIPEDA Compliance: Follow Personal Information Protection and Electronic Documents Act requirements
Provincial Laws: Be aware of provincial privacy legislation (e.g., Quebec's Law 25)
Data Residency: Consider using Google Cloud's Canadian regions (e.g., northamerica-northeast1 in Montreal, northamerica-northeast2 in Toronto) for data storage
Consent Management: Maintain records of consent for data collection and usage
Breach Notification: Implement procedures for breach detection and notification as required by law
Security Best Practices
Firebase Security Rules: Implement granular security rules to protect athlete data
Authentication: Require strong authentication for all users (multi-factor authentication for administrators)
Photo Permissions: Separate consent mechanism for photo storage and usage
Secure Sharing: Control who can view athlete information and photos (parents, coaches, authorized staff only)
Session Management: Automatic logout after inactivity, secure session tokens only
Technology Stack
Required Google Cloud Services
Firebase Authentication: User authentication and authorization using Google's identity platform
Firestore: NoSQL database for member data and metadata (Google's flexible database solution)
Configure appropriate security rules to protect minor's data
Implement role-based access control (athletes, parents/guardians, coaches, administrators)
Firebase Storage / Google Cloud Storage: Image and file storage with Google Cloud infrastructure
Store athlete photos and documents with proper access controls
Consider Canadian data residency requirements
Google AI Studio: AI-powered features (image analysis, recommendations, etc.)
Firebase Hosting: Static web application hosting (optional but recommended)
Google Cloud Platform: Additional services as needed (Cloud Functions, Cloud Run, etc.)
Cloud Functions for serverless backend logic (consent workflows, access validation)
Cloud Logging for audit trails
Recommended Frontend
Modern JavaScript framework (React, Vue, or vanilla JS)
Responsive CSS framework for cross-device compatibility
Firebase SDK for Google Cloud integrations
Google Sign-In for streamlined authentication
Getting Started
Prerequisites
Node.js and npm
Firebase CLI (npm install -g firebase-tools)
A Google account for Firebase
Quick Start
Clone the repository

git clone https://github.com/dcannell5/pearl-people.git
cd pearl-people
Set up Firebase project

Follow the detailed instructions in FIREBASE_SETUP.md
Create a Firebase project in the Firebase Console
Enable Authentication, Firestore, and Cloud Storage
Choose a Canadian region (Montreal or Toronto) for data residency
Configure the application

CRITICAL: Replace Firebase configuration placeholders with your actual values
See DEPLOYMENT_CHECKLIST.md for complete pre-deployment checklist
Update Firebase config in these files:
public/app.js (in the firebaseConfig section near the top)
public/athletes.html (in the Firebase initialization script)
public/consents.html (in the Firebase initialization script)
public/photos.html (in the Firebase initialization script)
public/levels.html (in the Firebase initialization script)
Deploy security rules

firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
Create initial administrator

Add your first user through Firebase Console
Manually create a user document in Firestore with role: "administrator"
Deploy the application

firebase login
firebase deploy
Access the application

Navigate to your Firebase Hosting URL
Sign in with the administrator account
Begin setting up users and athletes
For detailed setup instructions, see FIREBASE_SETUP.md. For pre-deployment verification, see DEPLOYMENT_CHECKLIST.md.

Project Structure
pearl-people/
├── .github/
│   └── ISSUE_TEMPLATE/
│       └── cloud-checklist.md    # Required PR checklist
├── public/
│   ├── index.html                # Main application UI
│   ├── app.js                    # Application logic and Firebase integration
│   ├── athletes.html             # Athlete profile management interface
│   ├── athlete-manager.js        # Athlete CRUD operations class
│   ├── consents.html             # Parental consent workflow interface
│   ├── consent-manager.js        # Consent operations class
│   ├── photos.html               # Photo management interface
│   ├── photo-manager.js          # Photo operations class
│   ├── levels.html               # Level management system interface
│   ├── level-manager.js          # Level operations and placement evaluation class
│   └── firebase-config.js        # Firebase configuration template
├── firebase.json                 # Firebase Hosting and Storage configuration
├── .firebaserc                   # Firebase project configuration
├── firestore.rules               # Firestore security rules for youth data protection
├── firestore.indexes.json        # Database indexes
├── storage.rules                 # Cloud Storage security rules
├── FIREBASE_SETUP.md             # Detailed setup guide
├── DEPLOYMENT_CHECKLIST.md       # Pre-deployment verification checklist
├── APPLICATION_OVERVIEW.md       # Feature documentation
├── README.md                     # This file
└── LICENSE                       # MIT License
Contributing
All contributions must adhere to the Google Cloud-based philosophy. Before submitting a PR:

Review the Development Checklist above
Create an issue using the Cloud-Native Checklist template
Ensure your feature works across all common browsers and devices
Verify no local or device-specific storage is used
Confirm all data operations use Google Cloud services
See .github/ISSUE_TEMPLATE/cloud-checklist.md for the required checklist.

Development History
This section documents the key development steps as the project progresses, maintaining a record of how the project has moved forward.

November 18, 2025 - Project Initialization & Firebase Implementation
Established Core Philosophy: Defined strict cloud-native architecture using exclusively Google-based services
Created Project Guidelines:
Documented that all storage, authentication, and processing must use Google Cloud Platform services
Specified Firebase Authentication, Firestore, Google Cloud Storage, and Google AI Studio as required services
Established cross-device compatibility requirement (any browser, any device, no local setup)
Added Development Framework:
Created comprehensive development checklist with 12 verification points
Documented rationale for Google-based cloud approach (10 key benefits)
Defined technology stack focusing on Google ecosystem
Created Issue Template: Established .github/ISSUE_TEMPLATE/cloud-checklist.md requiring contributors to verify:
No local/device storage introduced
Only Google Cloud solutions used
Cross-device functionality confirmed
Secure integrations implemented
Defined Privacy & Security Requirements: Added comprehensive privacy and security guidelines for managing youth athlete data:
Canadian privacy law compliance (PIPEDA and provincial legislation)
Parental consent mechanisms for minors
Role-based access controls (athletes, parents/guardians, coaches, administrators)
Audit logging for sensitive operations
Data residency considerations for Canadian data
Photo permissions and secure sharing controls
Implemented Firebase Project Structure:
Created Firebase Hosting configuration (firebase.json, .firebaserc)
Implemented comprehensive Firestore security rules protecting youth athlete data
Set up database indexes for efficient queries
Created web application with authentication UI (public/index.html)
Implemented role-based access control in application logic (public/app.js)
Added audit logging for compliance tracking
Configured security headers (X-Frame-Options, X-Content-Type-Options, etc.)
Created detailed setup guide (FIREBASE_SETUP.md)
Security Features Implemented:
Four-tier role-based access (administrator, coach, parent_guardian, athlete)
Firestore security rules enforce role-based permissions at database level
Audit logging for all user authentication and sensitive operations
Parental consent tracking in dedicated collection
Photo access controls with authorized viewer lists
Immutable audit logs (cannot be modified or deleted)
Next Steps:
Deploy to Firebase Hosting
Test authentication flow with all user roles
Implement athlete profile management ✅ COMPLETED
Add parental consent workflow UI ✅ COMPLETED
Implement photo upload and management with permissions ✅ COMPLETED
Add level management system with criteria-based placement
Set up Cloud Functions for automated tasks (email notifications, consent reminders)
Implement reporting and analytics dashboard
November 18, 2025 (continued) - Athlete Profile Management Implementation
Implemented Athlete Profile Management:
Created athlete-manager.js class for CRUD operations
Built athletes.html with comprehensive profile form
Added level placement tracking (Rising Star, NexGen, Basic/Basic+, Intermediate, Advanced, ELITE 1)
Included experience tracking (years, previous experience, sessions completed)
Emergency contact information fields
Medical information storage (confidential)
Integration with Firestore security rules
Audit logging for all athlete data operations
Mobile-responsive design
Updated Dashboard:
Replaced "Team Management" with "Level Management" to match academy structure
Added routing from dashboard cards to athlete management page
Updated role-based dashboards for all user types
Level System Defined:
Rising Star (Grades 3-6): Beginners, no experience required
NexGen (Grades 6-8): New to volleyball, basic athletics
Basic+ (Grades 6-8): Some experience, 5+ NexGen sessions
Basic (Grades 7-10): 1+ year organized volleyball
Intermediate (Grades 9-10): Solid fundamentals, club preferred
Advanced (Grades 10-12): 2+ years HS/club, 10+ sessions
ELITE 1 (Ages 15-18): Provincial/club elite, selection required
Data Fields Implemented:
Basic info: Name, DOB, grade, contact information
Level placement: Current level, experience, sessions
Emergency contacts: Name, phone, relationship
Medical information: Conditions, allergies (confidential access)
Additional notes field for coaches/admins
November 18, 2025 (continued) - Parental Consent Workflow Implementation
Implemented Parental Consent Management:
Created consent-manager.js class for consent operations (9,895 characters)
Built consents.html with comprehensive consent workflow (31,538 characters)
4 consent types: General Participation, Photo Release, Medical Treatment, Travel
Consent status tracking: granted, revoked, expired
Automatic expiry date calculation based on consent type
Missing required consents detection
Expiring consents notification system
Consent Types:
General Participation (Required, Annual): Academy activity participation
Photo and Media Release (Optional, Annual): Photo/video usage
Emergency Medical Treatment (Required, Annual): Emergency medical care
Travel and Transportation (Optional, Per Event): Travel for events
Features Implemented:
Parent/Guardian view: Manage consents for their children
Admin/Coach view: View all consents, monitor compliance
Grant consent workflow with confirmation checkbox
Revoke consent with reason tracking
Consent detail view with full history
Expiring consents alerts (30-day warning)
Integration with athlete profiles
Audit logging for all consent operations
Security & Compliance:
Only parents/guardians can grant consent for their children
Firestore security rules enforce access control
All consent actions logged to audit_logs
Legally binding confirmation required
PIPEDA compliant consent management
Consents stored securely in Google Cloud
November 18, 2025 (continued) - Photo Management with Cloud Storage Implementation
Implemented Photo Management System:
Created photo-manager.js class for photo operations (12,806 characters)
Built photos.html with upload and gallery interface (24,285 characters)
Created storage.rules for Firebase Storage security (1,584 characters)
Upload photos directly to Google Cloud Storage
Photo consent verification (requires active Photo Release consent)
Approval workflow (pending → approved/rejected)
Permission-based access control
Photo Upload Features:
Drag-and-drop upload interface
File type validation (JPEG, PNG, GIF, WebP)
File size limit (10MB maximum)
Image preview before upload
Caption and public/private settings
Automatic consent check before upload
Photo Management Features:
Photo gallery with grid layout
Full-size photo modal view
Status tracking: pending_approval, approved, rejected
Admin/Coach approval workflow
Delete functionality (admin only)
Photo metadata (caption, upload date, file size)
Authorized viewer lists
Public/private photo settings
Access Control:
Athletes: View photos uploaded for them
Parents/Guardians: View photos of their children
Coaches: View all photos, approve/reject uploads
Administrators: Full access, approve/reject, delete
Firebase Storage rules enforce access at storage level
Firestore rules control photo metadata access
Security & Storage:
Photos stored in Google Cloud Storage
Unique filename generation (timestamp + sanitized name)
Organized by athlete: athletes/{athleteId}/
Secure download URLs from Firebase Storage
Storage security rules match Firestore permissions
All photo operations logged to audit_logs
Integration with Photo Release consent system
November 18, 2025 (continued) - Level Management System Implementation
Implemented Level Management System:
Created level-manager.js class for level operations (15,542 characters)
Built levels.html with comprehensive level management interface (32,874 characters)
Defined all 7 academy levels with complete criteria
Criteria-based placement evaluation system
One-level-above rule enforcement
Athlete assignment and roster management
Level statistics and analytics
7-Tier Level System:
Rising Star (Grades 3-6, Open): New to sports, foundational skills
NexGen (Grades 6-8, Open): New to volleyball, basic athletics
Basic+ (Grades 6-8, Open): Some experience, 5+ NexGen or 1 season/camp
Basic (Grades 7-10, Open): 1+ year organized volleyball
Intermediate (Grades 9-10, Open): Solid fundamentals, club preferred
Advanced (Grades 10-12, Open): 2+ years HS/club, 10+ sessions
ELITE 1 (Ages 15-18, Restricted): Provincial/club/HS elite, selection required
Level Management Features:
Level overview dashboard with all criteria displayed
Athlete placement evaluation tool with detailed eligibility feedback
Automatic eligibility calculation based on age, grade, and experience
One-level-above rule validation
Level assignment workflow for admins/coaches
Athlete rosters by level with sorting and filtering
Level statistics (athlete counts, averages)
Color-coded status badges (open/restricted)
Placement Criteria Evaluation:
Grade range eligibility checking
Age requirement validation
Experience requirement assessment
Academy sessions completed tracking
One-level-above rule enforcement
Detailed reasoning for eligibility/ineligibility
Warning messages for conditional eligibility
Selection requirements for restricted levels (ELITE 1)
Features Implemented:
Evaluate any athlete for all 7 levels simultaneously
Recommended level suggestions based on criteria
Assign athletes to appropriate levels
Override capability with justification (admins)
View athlete rosters for each level
Track level assignment history
Audit logging for all level changes
Integration with athlete profile system
Access Control:
Administrators: Full access, can assign levels, modify criteria
Coaches: View all levels, assign athletes to appropriate levels
Parents/Guardians: View level information, see their children's eligibility
Athletes: View level information, see their own eligibility and placement
Firestore security rules ensure only admins can modify level definitions
All 4 Core Features Now Complete! 🎉

✅ Athlete Profile Management
✅ Parental Consent Workflow
✅ Photo Management with Cloud Storage
✅ Level Management System
License
MIT License - see LICENSE file for details.