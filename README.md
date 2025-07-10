
**README**


APSPitchPro is a Software-as-a-Service application designed to help job seekers craft professional job application “pitches” with the assistance of AI, for the Australian Public Service. The platform guides an end-user through a structured multi-step form to input their job role details and relevant experience. It then uses an AI workflow (Prompt Layer) to generate a tailored pitch based on the user’s inputs. The goal is to streamline the creation of well-structured, effective pitches for Australian Public Service job applications by combining user-provided details with AI-generated content. 

Key capabilities include an interactive pitch-building wizard, an AI “guidance” feature that provides suggestions/tips as the user fills out the form, and the generation of a final pitch document. Users can save multiple pitches, edit or refine the AI-generated content, and export the results for use in their job applications. 

## Technology Stack and Architecture

**Tech Stack:** The application is built with a modern full-stack JavaScript approach. On the frontend, it uses Next.js 13 (React framework) with the new App Router and React Server Components architecture. Styling is done with Tailwind CSS and the Shadcn UI component library for a consistent design system, plus Framer Motion for animations. For icons, Lucide React is used in the UI. The backend logic runs within the Next.js app using,Node.js/TypeScript . Data is stored in a PostgreSQL database (via Supabase), and database access is handled through the Drizzle ORM for type-safe queries. Authentication is handled by Clerk (auth service), and payments via Stripe. For AI capabilities, the app integrates with PromptLayer, using HTTP API calls.

**Key Features**

**Authentication & User Profiles:** 

The app uses Clerk for user authentication and management. Upon signup, a profile record is created in the database for the user (via a Clerk webhook) with a default free membership, initial credits, etc.  Authentication middleware ensures that only logged-in users can access the pitch dashboard and related APIs. 

**Pitch Wizard (Multi-Step Form)**: 

The heart of the application is a multi-step wizard that guides users through creating a pitch.  The wizard collects all necessary inputs, such as the role name and level , organization, a summary of the user’s experience, and one or more STAR examples describing specific situations and outcomes.  A custom hook (`useWizard`) manages the wizard’s state: current step, navigation (Next/Back), form data persistence, and triggers for saving or submitting the pitch. All interim data is stored in state (with validation via Zod schemas) and can be saved as a “draft” in the database so users can resume later. 

**AI Guidance Feature:** 

At a the "AI Guidance Step", the application offers AI-generated guidance to help the user improve their inputs. When the user reaches this step, the system automatically sends the user’s job description and experience to an AI service to fetch guidance tips. This is handled by a custom React hook (`useAiGuidance`) that calls an API route for guidance generation and then polls for results. The guidance typically includes suggestions on what to highlight, how to frame STAR examples, and other tips (displayed in the UI, e.g. as an expandable “Tips for this step” section) to ensure the content the user provides is relevant and compelling /dashboard/new/components/steps/guidance-step.tsx#L176-L184. The Guidance module is interconnected with the wizard: when the AI returns guidance text, it is injected into the form (stored in a field like `albertGuidance`) so the user can refer to it. This feature improves the quality of user input before the final pitch is generated.

**Pitch Generation (AI Content Creation):** 

Once the user has entered all required information through the wizard, they can trigger the AI pitch generation. This backend module packages the user’s inputs (role details, experience, STAR example data, desired word count, etc.) and sends a request to an external AI service. In this project, the external integration is via PromptLayer, which orchestrates a predefined “workflow” (an AI agent) to compile the final pitch. The application uses the pitch’s unique ID as a correlation key (execution ID) for this workflow. The request to PromptLayer includes a callback URL, so when the AI processing is done, PromptLayer will callback the app’s API with the generated content. In the meantime, the user’s front-end may show a loading state (e.g. a spinner or progress indicator in the Review step) and periodically poll the database to see if the pitch has been received and saved, before pulling it out of the database and displaying it to the user.

**Dashboard and Pitch Management:** 

The user dashboard is the logged-in area where all created pitches are listed and managed. It fetches the list of pitches for the authenticated user from the database (via a server action) and displays them in a table or list format. Each pitch entry shows key info (role title, organization, status, dates) and lets the user filter or search through them. From the dashboard, the user can click “New Pitch” to start the wizard, or select an existing pitch to view/edit it. Each pitch has a status (`draft` while being edited or AI in progress, `final` when AI content is generated, or `submitted` if the user marks it as such). If a user opens a pitch that is still a draft, the app will redirect them into the wizard to continue where they left off; if the pitch is completed, it opens in an editor view. The Pitch Editor module allows users to make manual tweaks to the AI-generated pitch content. It loads the saved pitch content (which is stored as HTML or rich text in the database) and displays it in an editable rich text field for fine-tuning. This editor ensures users are not locked into the AI output – they can adjust wording or fix any details before using the pitch.

**Payments System:** Stripe payments, free users are provided two credits initially, each credit is equal to one generated pitch. Users can purchase extra credits if required.

**Marketing Pages & Blog:** In addition to the core app functionality, the repository contains a marketing website section, which holds the design for the landing page. There is also a  blog module for content publishing.


