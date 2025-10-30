# Product Requirements Document (PRD)

## 1. Introduction

### 1.1. Problem

The current operational and financial management of the fleet is hampered by fragmented, legacy software. Staff lack a unified view of the business, leading to inefficiencies. The driver experience is poor, with opaque payment calculations and cumbersome processes for managing compliance. This results in high administrative overhead, frequent driver disputes, and difficulty in making data-driven decisions.

### 1.2. Solution

"Project Rubber Ducky Executioner" is a modern management platform that provides a single source of truth and tailored interfaces for staff, drivers, and applicants. By layering a superior user experience and a powerful custom financial engine on top of the existing dispatch system, we can streamline workflows, empower our driver fleet, and unlock new operational insights without replacing the entire core infrastructure.

### 1.3. Goals

*   **Increase Staff Efficiency:** Reduce time spent on invoicing and driver management by 30%.
*   **Improve Driver Satisfaction:** Reduce driver payment-related support queries by 50% and improve driver retention.
*   **Enhance Financial Accuracy:** Eliminate manual errors in commission and invoice calculations.
*   **Enable Data-Driven Decisions:** Provide real-time dashboards and AI-powered reports for management.

## 2. User Stories & Feature Requirements

### Epic: Staff Control Tower

| User Story                                                                                                                     | Feature                                        | Acceptance Criteria                                                                                                                              |
| :----------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| As an Ops Manager, I want a central dashboard to see live KPIs (bookings, revenue, driver status) so I can monitor daily health. | **Home Dashboard**                             | - Displays key stats for a selectable date range.<br>- Shows a real-time pie chart of driver statuses.<br>- Includes an activity feed of recent events. |
| As an Accounts Clerk, I need to define complex commission schemes so that drivers are paid accurately according to their terms.    | **Commission Scheme Management**               | - Supports multiple scheme types (%, Fixed, Tiered, etc.).<br>- Allows setting fixed charges like rent.<br>- Schemes are versioned and auditable.     |
| As an Accounts Clerk, I want a guided workflow to process weekly driver invoices so I can ensure a fast and accurate pay run.      | **Driver Invoicing Page**                      | - Allows uploading raw booking/rejection data.<br>- Supports manual adjustments (credits/debits).<br>- Filters drivers and processes invoices in bulk. |
| As an Admin, I need to manage staff user accounts with granular permissions so I can control access and maintain security.        | **Staff Management & Permissions**             | - Supports creating/editing permission templates.<br>- Each part of the UI can be set to Hidden, View, or Edit.<br>- Staff are assigned a single template. |
| As an Ops Manager, I want to ask natural language questions (e.g., "drivers with low ratings") to get quick insights.              | **"Ask AI" Command Palette**                   | - Accessible via `Cmd+K`.<br>- Integrates with Gemini API.<br>- Can parse queries and return formatted data lists or summary reports.          |
| As a Staff Member, I need to manage all aspects of a Driver, Vehicle, Customer, and Business Account from a single place.         | **CRUD Management Pages**                      | - Each entity has a searchable, sortable, and filterable list view.<br>- A detailed edit modal exists for every entity.<br>- All data from `types.ts` is viewable and editable according to permissions. |

### Epic: Driver Portal

| User Story                                                                                                                             | Feature                                    | Acceptance Criteria                                                                                                                                           |
| :------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| As a Driver, I want to see my current balance and a chart of my recent earnings so I can easily track my finances on my phone.          | **Driver Dashboard**                       | - Mobile-first design.<br>- Prominently displays credit/debt balance.<br>- Provides options to pay debt or withdraw credit.<br>- Shows interactive earnings chart. |
| As a Driver, I want to upload a new photo of my badge and update its expiry date so I can remain compliant without visiting the office. | **Self-Service Profile & Document Updates**  | - Displays all personal and compliance data.<br>- Allows submitting changes for staff approval.<br>- Shows "Pending Approval" status for submitted changes.    |
| As a Driver, I want to view and download all my past statements so I have a complete record of my earnings and deductions.              | **Invoice History**                        | - A chronological list of all past invoices.<br>- Each invoice can be previewed in-app or downloaded as a PDF.                                            |

### Epic: Applicant Onboarding

| User Story                                                                                                                  | Feature                               | Acceptance Criteria                                                                                                                                  |
| :-------------------------------------------------------------------------------------------------------------------------- | :------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| As a prospective driver, I want a simple online form to submit my application so the process is quick and convenient.         | **Driver Sign Up Form**               | - Collects basic personal and contact info.<br>- Conditionally shows fields for existing license/vehicle details if the user indicates they have them. |
| As an applicant, I want to create a password after applying so I can securely track my application's progress.               | **Secure Applicant Portal**           | - Guides user to create a strong password.<br>- Provides a login area separate from the main driver/staff login.                                     |
| As an applicant, I want to see a visual timeline of my application status so I know exactly where I am in the hiring process. | **Application Status Tracker**        | - Displays steps like "Submitted," "Under Review," "Approved."<br>- Highlights the current stage of the application.                                   |

## 3. Success Metrics

*   **Time to Process Invoices:** Measured in hours, from start of data import to completion of the pay run. Target: 75% reduction.
*   **Driver Satisfaction (NPS):** Quarterly survey sent to drivers. Target: Increase NPS score by 20 points within 6 months.
*   **Driver Support Tickets:** Volume of tickets related to payments and document updates. Target: 50% reduction.
*   **Admin Error Rate:** Number of manual corrections required after an invoice run. Target: Reduce to near-zero.