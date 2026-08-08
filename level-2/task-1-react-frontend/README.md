# Codveda Level 2 — Task 1

## React Frontend

### Overview

Product Showcase is a responsive React dashboard that retrieves products from a public REST API and lets users search by title or filter by category. It presents dedicated loading, error, empty, and success states.

### Internship Requirement

This project fulfills Codveda Full-Stack Internship Level 2 Task 1 by building a frontend with a modern JavaScript framework. It demonstrates React functional components, reusable UI components, state management with `useState`, side effects through a custom hook, REST API integration with Axios, and responsive design.

### Features

- Products loaded from the Fake Store API
- Search by product title
- Categories derived from API data
- Responsive product grid
- Reusable product cards
- Loading skeletons
- Friendly error state with in-page retry
- Empty state for searches and filters with no matches
- Stock indicators and USD price formatting

### Technologies

- React
- React DOM
- Vite
- JavaScript
- Axios
- CSS

### Architecture

- `productService` owns the endpoint, Axios request, response validation, and normalization.
- `useProducts` owns remote product state, request status, initial loading, errors, and refetching.
- `ProductsPage` owns search/category UI state, derives filtered data, and selects the visible state.
- Presentational components render controls, cards, and feedback without knowing how data is fetched.

### Folder Structure

```text
src/
├── assets/
├── components/
├── context/
├── hooks/
│   └── useProducts.js
├── layouts/
│   └── MainLayout.jsx
├── pages/
│   └── ProductsPage.jsx
├── services/
│   └── productService.js
├── styles/
│   ├── app.css
│   └── index.css
├── utils/
├── App.jsx
└── main.jsx
```

### Data Flow

```text
Fake Store API
        ↓
productService
        ↓
useProducts
        ↓
ProductsPage
        ↓
Presentational Components
```

API data is validated and normalized before the custom hook stores it. The page derives categories and filtered results, then passes products and callbacks to focused presentational components.

### Installation

```bash
npm install
```

### Running the Project

```bash
npm run dev
```

Open the local address printed by Vite in a browser.

### Production Build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

### API Used

Product data comes from the public [Fake Store API](https://fakestoreapi.com/products). It requires no API key or credentials. The `inStock` field is derived in the service layer because the API does not provide inventory status.

### Accessibility

The interface uses semantic page structure, labeled form controls, real buttons, visible keyboard focus indicators, `aria-pressed` category states, meaningful image alternatives, a loading status, and an error alert.

### Responsive Design

The product grid adapts from three columns on desktop to two on tablets and one on mobile. Controls remain usable at narrow widths, and category buttons scroll horizontally when necessary.

### Screenshots

Screenshots are not included in this repository. Run the project locally to view the current responsive interface.

### What I Learned

- Separating HTTP and normalization logic from UI components
- Encapsulating remote-data state and side effects in a focused custom hook
- Building reusable, prop-driven functional components
- Deriving filtered values instead of duplicating state
- Designing accessible loading, error, empty, and success experiences
- Creating responsive layouts with plain CSS
