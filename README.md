# Product Admin Dashboard

A production-quality Next.js App Router application demonstrating robust client-side state management, advanced search and pagination patterns, and fake backend mock persistence. Built with React, Tailwind CSS, and Axios.

## 🚀 Setup & Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Login:**
   Access the app at `http://localhost:3000`. Use the following test credentials:
   - **Username:** `mayur`
   - **Password:** `12345678`

---

## 🛠 Features Completed

- [x] Next.js (App Router) + Tailwind CSS + Axios setup
- [x] Centralized Axios instance with request/response interceptors for auth & error handling
- [x] Login page with DummyJSON Auth and strict double-submit prevention
- [x] Route-protected dashboard preventing unauthenticated access
- [x] Responsive layout (Desktop Table view / Mobile Card view)
- [x] Server-side pagination mapping strictly to URL parameters (`?page=2&limit=20`)
- [x] Debounced search query input
- [x] Race-condition-safe search (utilizing `AbortController` and request IDs)
- [x] Sorting & Category Filtering
- [x] Graceful conflict handling between DummyJSON search and category endpoints
- [x] Product details view with image gallery
- [x] Add / Edit / Delete flows with client-side validation
- [x] Optimistic Client Persistence (local storage store for mock mutations)

---

## 🧠 Interview Walkthrough Guide

Here are explanations of the trickiest parts of this assignment, as requested:

### 1. Race-Condition-Safe Search (`useProducts.js`)
**The Problem:** If a user types quickly ("p", then "ph", then "pho"), three API requests are fired. If the request for "p" is delayed on the network and returns *after* the request for "pho", the UI would show stale results for "p" instead of "pho".
**The Solution:** We implemented a dual safeguard:
1. **AbortController:** Before firing a new request, we abort any in-flight requests via `abortControllerRef.current.abort()`. Axios cancels the HTTP call entirely, saving bandwidth.
2. **Request ID Tracking:** We increment a `requestIdRef` on every fetch. When a promise resolves, we verify `currentRequestId === requestIdRef.current`. Even if someone simulates a delay (e.g. `&delay=2000`) and the abort fails or is bypassed, we strictly discard the stale data, ensuring the UI always reflects the latest keystrokes.

### 2. URL State Synchronization
**The Concept:** The URL (`?page=2&q=phone&category=smartphones`) is the absolute source of truth.
**The Implementation:** In `useProducts.js`, we parse query strings aggressively on mount. When user interactions change the search string, category, or page, we call `router.replace(url)` to update the URL natively without reloading the page. 
**Edge Case Handled:** If a user modifies the URL with garbage like `?page=abc` or requests `?page=999` (beyond total items), our hook safely parses it, falls back to `page 1` if invalid, or clamps to the `maxPage` calculated from the API's `total` response.

### 3. Axios Interceptor Centralization
Instead of writing token logic and error `.catch()` blocks in every component, `services/api.js` acts as a middleman:
- **Request Interceptor:** Injects `Authorization: Bearer <token>` into every outgoing call automatically.
- **Response Interceptor:** Intercepts `401 Unauthorized` errors globally, purging the token and redirecting the user to `/login` immediately. It also normalizes deep API error messages into a flat `Error` object for UI components.

### 4. Fake API Persistence (Optimistic Updates)
**The Limitation:** DummyJSON responds with `200 OK` for Add, Edit, and Delete operations, but does not actually save the changes.
**The Fix:** We built a custom React Context (`ProductOverridesContext`) backed by `localStorage`. 
- When an item is added, it gets a local flag and is prepended to the lists.
- When edited, the altered fields are merged over the original DummyJSON response.
- When deleted, its ID is stored in a `deletedProductIds` set and filtered out before rendering.
This creates a seamless, fully-functional "fake" database experience on the frontend that survives page reloads.

### 5. API Conflict (Search vs Category)
DummyJSON does not accept simultaneous text-search and category-filter parameters.
**Our Solution:** We disabled the Category dropdown visually (with a "cursor-not-allowed" state and a tooltip explaining the limitation) whenever the user has an active search query. If the user clears the search query, the category dropdown unlocks. Conversely, selecting a category clears the text search. This removes ambiguity and matches the backend's strict capabilities seamlessly.
