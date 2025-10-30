# Project Documentation: "Project Rubber Ducky Executioner"

## 1. Project Overview

**Project "Rubber Ducky Executioner" is a modern, web-based, role-driven management and invoicing platform designed to serve as a sophisticated frontend layer over a legacy transport management system (e.g., iCabbi).**

It solves critical business challenges by providing a unified, data-rich "control tower" for administrative staff, a streamlined, mobile-first portal for drivers, and a transparent onboarding experience for new applicants. The platform reads core operational data (drivers, vehicles, bookings) from the underlying system but implements its own powerful, custom-built financial engine to handle complex commission schemes and invoicing, pushing the final, calculated figures back to the source of truth.

### 2. User Roles & Personas

The application is built around three distinct user roles, each with a tailored experience:

1.  **Staff (Admin, Operations, Accounts):** The primary users of the system. They operate from the "Control Tower" dashboard. Their goal is to manage the entire fleet, oversee compliance, run finances, and handle customer/account relations with maximum efficiency.
2.  **Driver (Contractor):** The mobile workforce. They interact with the system via a simplified, mobile-first "Driver Portal." Their goal is to track earnings, view statements, manage their compliance documents, and interact with company promotions with minimal friction.
3.  **Applicant (Prospective Driver):** A temporary role for individuals in the onboarding pipeline. They use the "Applicant Portal" to submit their initial application and track its progress through to approval.

### 3. Core Features by Portal

#### 3.1. Staff Control Tower

*   **Unified Dashboard:** Real-time KPIs, booking trends, driver status overview, and an AI-powered insights panel.
*   **Operations Management:** Full CRUD (Create, Read, Update, Delete) capabilities for Drivers, Vehicles, Bookings, Customers, and Business Accounts.
*   **Financial Engine:**
    *   **Commission Scheme Builder:** A flexible interface to create and manage complex, tiered commission structures, including fixed charges like vehicle rent and insurance.
    *   **Invoicing Workflow:** A step-by-step process to ingest raw booking data, apply adjustments, and process weekly/monthly invoices for both drivers and business accounts.
*   **Administration & Configuration:**
    *   **Staff Management:** Granular, template-based permission system to control staff access to every part of the application.
    *   **System Configuration:** Management of company details, site offices, system attributes, and messaging templates.
*   **AI Command Palette:** A natural language interface (e.g., "Show me drivers with expiring badges") to query data and get quick reports, powered by the Gemini API.

#### 3.2. Driver Portal

*   **Financial Dashboard:** A clear overview of current balance (credit/debt), recent earnings charts, and latest invoice summaries.
*   **Self-Service Profile:** Allows drivers to view their personal and compliance information and submit updates for documents (e.g., new driving license photo and expiry date) for staff approval.
*   **Rewards & Promotions:** A hub for viewing and opting into company-run reward schemes and partner offers.
*   **Invoice History:** A complete, accessible archive of all past statements.

#### 3.3. Applicant Onboarding Portal

*   **Multi-Step Application Form:** An intuitive sign-up form that adapts based on whether the applicant is already a licensed driver.
*   **Secure Portal Access:** Applicants create a password to log in and track the status of their application via a visual timeline.
*   **Information Updates:** Allows applicants to provide additional information or updated documents as requested by staff during the review process.

### 4. Technical Architecture

*   **Frontend:** A Single Page Application (SPA) built with **React 19** and **TypeScript**.
*   **Styling:** Styled with **TailwindCSS** and a custom, multi-theme system that supports both light and dark modes across various color palettes.
*   **State Management:** Primarily uses React Hooks (`useState`, `useEffect`, `useMemo`) for local and component-level state. Browser `sessionStorage` and `localStorage` are used for persisting user sessions and preferences.
*   **Backend Strategy:** The application is designed to function as a **Backend-for-Frontend (BFF)**.
    *   It will communicate with the underlying transport system's API (e.g., iCabbi) to read/write core operational data.
    *   It will communicate with its own custom backend service that houses the financial engine, commission scheme definitions, and other business logic not supported by the legacy system.
*   **Data:** Currently implemented with a comprehensive set of mock data and TypeScript interfaces, providing a robust, type-safe foundation for future API integration.