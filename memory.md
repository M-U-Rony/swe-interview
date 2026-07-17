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
   - Redesigned the Resumes manager page at [page.tsx (resumes)](file:///e:/web%20dev/localProjects/swe-interview/app/dashboard/resumes/page.tsx) to be a Server Component. It queries the MongoDB `Resume` schema directly on page load using the cookies JWT `userId` session to retrieve the user's active resume filename.
   - Built [resumesClient.tsx](file:///e:/web%20dev/localProjects/swe-interview/app/dashboard/resumes/resumesClient.tsx) as the client wrapper. It displays the active resume filename on the right-side card, dynamically updates the state on successful form posts, and shows "Resume not uploaded yet" if no file is present. Includes drag-and-drop zones and parse loaders.
   - Created [profileOptions.tsx](file:///e:/web%20dev/localProjects/swe-interview/components/profileOptions.tsx) slide-over settings panel displaying username, email, ID, and a mock settings modifier.
   - Hooked up routes `/signin`, `/signout` in the `app/` folder.

## Next Steps for AI Agent
1. **Resume Upload Functionality**:
   - Build a dashboard layout (`/dashboard`) that is accessible to authenticated users.
   - Implement PDF/text resume parsing and upload.
   - Save the raw text and associate it with the logged-in user in MongoDB.
2. **Interactive Mock Interview**:
   - Integrate Gemini API using `NEXT_PUBLIC_GEMINI_API_KEY` to read the resume text and generate custom experience-based interview questions.
   - Save the interview session and score the user's answers.
