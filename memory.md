# Project Memory

## Project State Snapshot
We have successfully implemented the landing page, the unified Sign In / Sign Up interface, and the Sign Out flow, and integrated them with a lightweight native JWT session authorization system.

### Key Modifications
1. **Theme and Styles**:
   - Integrated the Google Poppins font in [layout.tsx](file:///e:/web%20dev/localProjects/swe-interview/app/layout.tsx).
   - Configured custom theme variables under `@theme` inside [globals.css](file:///e:/web%20dev/localProjects/swe-interview/app/globals.css) corresponding to the prescribed light/dark mode color palettes.
   - Added `@custom-variant dark (&:where(.dark, .dark *));` in [globals.css](file:///e:/web%20dev/localProjects/swe-interview/app/globals.css) to enforce class-based dark mode in Tailwind v4 instead of system media preferences (resolving contrast mismatch issues).
2. **Backend API Fixes**:
   - Modified [signin/route.ts](file:///e:/web%20dev/localProjects/swe-interview/app/api/signin/route.ts) and [signup/route.ts](file:///e:/web%20dev/localProjects/swe-interview/app/api/signup/route.ts): fixed incorrect lowercase `user` model references, missing `await` statements on database requests, and incorrect zod import.
   - Hashed user password using `bcryptjs` during account registration ([signup/route.ts](file:///e:/web%20dev/localProjects/swe-interview/app/api/signup/route.ts)) and compared password using `bcrypt.compare` during sign-in ([signin/route.ts](file:///e:/web%20dev/localProjects/swe-interview/app/api/signin/route.ts)).
   - Integrated `jsonwebtoken` directly into the sign-in ([signin/route.ts](file:///e:/web%20dev/localProjects/swe-interview/app/api/signin/route.ts)) and check-session ([me/route.ts](file:///e:/web%20dev/localProjects/swe-interview/app/api/me/route.ts)) routes to handle JWT signature and verification directly.
   - Deleted the temporary `/lib` folder and `jwt.ts` helper since they were no longer needed.
   - Implemented [signout/route.ts](file:///e:/web%20dev/localProjects/swe-interview/app/api/signout/route.ts) to clean user session cookies.
   - Implemented [me/route.ts](file:///e:/web%20dev/localProjects/swe-interview/app/api/me/route.ts) to query session state from the frontend.
 3. **Frontend Components**:
   - Created a glassmorphic and responsive [navbar.tsx](file:///e:/web%20dev/localProjects/swe-interview/components/navbar.tsx) that checks user auth dynamically and supports a manual dark mode toggler. Optimized color contrast in light mode by using dark brand colors for hover and primary actions.
   - Created a modern [footer.tsx](file:///e:/web%20dev/localProjects/swe-interview/components/footer.tsx).
   - Created [landingPage.tsx](file:///e:/web%20dev/localProjects/swe-interview/components/landingPage.tsx) featuring a premium hero section, console window demo, feature grids, and process flows. Adjusted light mode text, buttons, icon containers, and timeline cards to dark brand highlights for perfect legibility.
   - Created a dynamic [signin.tsx](file:///e:/web%20dev/localProjects/swe-interview/components/signin.tsx) form supporting both Sign In and Sign Up. Fixed contrast by using opaque input background, dark brand button backgrounds, and higher contrast text. Updated user redirect to `/dashboard` upon successful login.
   - Built a server-protected dashboard route at [layout.tsx (dashboard)](file:///e:/web%20dev/localProjects/swe-interview/app/dashboard/layout.tsx) that checks cookie JWT verification.
   - Implemented [dashboardShell.tsx](file:///e:/web%20dev/localProjects/swe-interview/app/dashboard/dashboardShell.tsx) providing a collapsible navigation Sidebar and top Navbar with a dark mode toggler.
   - Built the main dashboard welcome screen in [page.tsx (dashboard)](file:///e:/web%20dev/localProjects/swe-interview/app/dashboard/page.tsx) and placeholder views for resumes, interview starter, and history pages.
   - Refactored [page.tsx (interview)](file:///e:/web%20dev/localProjects/swe-interview/app/dashboard/interview/page.tsx) to be a Server Component. It queries the MongoDB database for the user's active resume. If found, it renders `InterviewClient`. If not, it redirects them to the resume upload page.
   - Refactored [page.tsx (start)](file:///e:/web%20dev/localProjects/swe-interview/app/dashboard/interview/start/page.tsx) to be a Server Component that queries the database for the active user's parsed resume text (`rawText`) and renders the client-side `<InterviewStartClient />`.
   - Created [interviewStartClient.tsx](file:///e:/web%20dev/localProjects/swe-interview/app/dashboard/interview/start/interviewStartClient.tsx) to host the client context provider and widened the container width to fit side-by-side panels.
   - Updated [conversation.tsx](file:///e:/web%20dev/localProjects/swe-interview/components/conversation.tsx) to render a two-panel grid layout (left for AI Recruiter Marcus, right for Candidate User). Integrates dynamic speaking status checks (`conversation.isSpeaking`) to toggle responsive soundwave keyframe animations for the active speaker.
   - Configured soundwave keyframe bounce animations in [globals.css](file:///e:/web%20dev/localProjects/swe-interview/app/globals.css) to support voice volume mockups.
   - Refactored [interviewClient.tsx](file:///e:/web%20dev/localProjects/swe-interview/components/interviewClient.tsx) Client Component to serve as the gateway launcher. Clicking the "Start Mock Interview" button routes the user directly to the voice session route at `/dashboard/interview/start` where the ElevenLabs conversation controls are located.
   - Added `Profile` Mongoose model in [model.ts](file:///e:/web%20dev/localProjects/swe-interview/models/model.ts) with `fullName`, `targetRole`, `experienceLevel`, `bio`, and `profileImage` fields.
   - Created profile controller API at [route.ts (profile)](file:///e:/web%20dev/localProjects/swe-interview/app/api/profile/route.ts) storing uploads to local `/uploads` directory at the project root, using `node:fs` streams.
   - Created dynamic asset serving endpoint at [route.ts (uploads)](file:///e:/web%20dev/localProjects/swe-interview/app/api/uploads/%5Bfilename%5D/route.ts) to map local `/uploads/*` assets safely to browser media requests.
   - Configured [.gitignore](file:///e:/web%20dev/localProjects/swe-interview/.gitignore) to exclude local `/uploads` directory.
   - Created dashboard profile route at [page.tsx (profile)](file:///e:/web%20dev/localProjects/swe-interview/app/dashboard/profile/page.tsx) and built the form compiler in [profileClient.tsx](file:///e:/web%20dev/localProjects/swe-interview/app/dashboard/profile/profileClient.tsx).
   - Created transcript retrieval API at [route.ts (get-transcript)](file:///e:/web%20dev/localProjects/swe-interview/app/api/get-transcript/route.ts) that fetches conversation data from ElevenLabs. It intelligently handles the 'processing' status fallback by parsing the dynamic variable `system__conversation_history` JSON string when standard transcripts are not yet generated.
   - Created [setup-agent](file:///e:/web%20dev/localProjects/swe-interview/app/api/setup-agent/route.ts) endpoint that programmatically patches settings on ElevenLabs (configuring `interview_feedback` and `interview_score` variables) securely on the server.
   - Refactored [conversation.tsx](file:///e:/web%20dev/localProjects/swe-interview/components/conversation.tsx) to hoist the setup API fetch `getSummary()` above the `startConversation` callback, triggering the configuration patch securely on each session initialization.
   - Refactored [page.tsx (result)](file:///e:/web%20dev/localProjects/swe-interview/app/dashboard/interview/%5Bid%5D/result/page.tsx) to be a Server Component. It issues a POST request to `/api/get-summary` carrying the raw transcript, parses the evaluated score and feedback from the Gemini API response, and binds them to the page's score gauge and summary cards.
   - Created client-side helper [pollResults.tsx](file:///e:/web%20dev/localProjects/swe-interview/components/pollResults.tsx) running dynamic client checks against `/api/get-summary` at 3-second intervals, cleaning up automatically on unmount.
   - Refactored [get-summary](file:///e:/web%20dev/localProjects/swe-interview/app/api/get-summary/route.ts) route handler to securely fetch finalized analysis from ElevenLabs, parse extracted criteria scores/feedback, and commit them directly to MongoDB `Interview` and `AiFeedback` collections.
   - Created [auth.ts](file:///e:/web%20dev/localProjects/swe-interview/lib/auth.ts) containing shared authentication helpers `getUserId` and `getUserSession` to avoid duplicate JWT cookie parsing across Next.js Server Components and API Routes. Refactored `/api/profile`, `/api/parse-pdf`, `/api/me`, and `/api/get-transcript` to utilize these helpers.
   - Refactored [layout.tsx (dashboard)](file:///e:/web%20dev/localProjects/swe-interview/app/dashboard/layout.tsx) and [dashboardShell.tsx](file:///e:/web%20dev/localProjects/swe-interview/app/dashboard/dashboardShell.tsx) to query Mongoose Profile details on page load and display the candidate's actual full name and uploaded avatar image in the sidebar and top navbar, resolving dynamic updates.
   - Redesigned the Resumes manager page at [page.tsx (resumes)](file:///e:/web%20dev/localProjects/swe-interview/app/dashboard/resumes/page.tsx) to be a Server Component. It queries the MongoDB `Resume` schema directly on page load using the cookies JWT `userId` session to retrieve the user's active resume filename.
   - Refactored [dbConnection.ts](file:///e:/web%20dev/localProjects/swe-interview/utils/dbConnection.ts) to implement a global Mongoose caching mechanism (using `global.mongoose`), preventing multiple redundant database connections in Next.js development and production.
   - Built [resumesClient.tsx](file:///e:/web%20dev/localProjects/swe-interview/app/dashboard/resumes/resumesClient.tsx) as the client wrapper. It displays the active resume filename on the right-side card, dynamically updates the state on successful form posts, and shows "Resume not uploaded yet" if no file is present. Includes drag-and-drop zones and parse loaders.
   - Created [profileOptions.tsx](file:///e:/web%20dev/localProjects/swe-interview/components/profileOptions.tsx) slide-over settings panel displaying username, email, ID, and a mock settings modifier.
   - Hooked up routes `/signin`, `/signout` in the `app/` folder.
   - Refactored [page.tsx (history)](file:///e:/web%20dev/localProjects/swe-interview/app/dashboard/history/page.tsx) to be a Server Component. It queries the MongoDB `Interview` and `AiFeedback` collections for the active authenticated candidate, renders collapsible dialogue accordions natively with `<details>`/`<summary>`, and displays feedback summaries alongside score status badges.

## Next Steps for AI Agent
1. **Resume Upload Functionality**:
   - Build a dashboard layout (`/dashboard`) that is accessible to authenticated users.
   - Implement PDF/text resume parsing and upload.
   - Save the raw text and associate it with the logged-in user in MongoDB.
2. **Interactive Mock Interview**:
   - Integrate Gemini API using `NEXT_PUBLIC_GEMINI_API_KEY` to read the resume text and generate custom experience-based interview questions.
   - Save the interview session and score the user's answers.
