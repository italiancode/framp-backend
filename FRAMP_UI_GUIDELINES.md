# Framp Admin UI Guidelines

This document outlines the UI standards and guidelines for developing new pages in the Framp admin dashboard. Following these guidelines will ensure consistency across the platform and make future maintenance easier.

## Table of Contents

1. [Layout Structure](#layout-structure)
2. [Color Scheme](#color-scheme)
3. [Typography](#typography)
4. [Components](#components)
5. [Responsiveness](#responsiveness)
6. [Dark Mode Support](#dark-mode-support)
7. [Code Structure](#code-structure)

## Layout Structure

All admin pages should follow this consistent layout structure:

```jsx
export default function AdminPage() {
  return (
    <Layout>
      <div className="relative min-h-screen bg-white dark:bg-background py-6 px-4 sm:px-6 lg:px-8">
        <BackgroundElements />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Page content goes here */}
          
          {/* Header section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            {/* Title and description */}
            {/* Navigation buttons */}
          </div>
          
          {/* Stats cards */}
          {/* Search and filters */}
          {/* View tabs */}
          {/* Main content (table/cards) */}
        </div>
      </div>
    </Layout>
  );
}
```

Key components:
- Wrap with `Layout` component
- Include `BackgroundElements` for visual appeal
- Set maximum width constraint with `max-w-7xl`
- Use a consistent structure for headers, stats, filters, and content

## Color Scheme

Use these color tokens throughout the application:

### Primary Colors
- Primary Brand: `#7b77b9` (indigo/purple) 
- Light variant: `#a5a1ff`
- Dark variant: `#5d5a99`

### Text Colors
- Light mode text: `text-black` or with opacity `text-black/70` for secondary text
- Dark mode text: `text-white` or with opacity `text-white/70` for secondary text

### UI Element Colors
- Light backgrounds: `bg-white` or `bg-black/5` (for secondary/cards)
- Dark backgrounds: `bg-background` or `bg-background/50` with `backdrop-blur-md`
- Borders: `border-black/10 dark:border-white/10`
- Hover states: `hover:bg-black/5 dark:hover:bg-white/5`

### Status Colors
- Confirmed/Success: `bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`
- Pending/Warning: `bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300`
- Failed/Error: `bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`

## Typography

- Headings: Use font-bold for headings with appropriate text sizes
  - Page title: `text-3xl font-bold`
  - Section headers: `text-xl font-bold`
  - Card titles: `text-lg font-medium`
  
- Body text:
  - Primary text: `text-sm` 
  - Secondary/metadata: `text-xs text-black/60 dark:text-white/60`
  
- Use consistent letter spacing, especially for tables:
  - Table headers: `uppercase tracking-wider text-xs font-medium text-black/70 dark:text-white/70`

## Components

### Buttons

Standard button:
```jsx
<button
  onClick={handleAction}
  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-black/30 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
>
  <Icon size={16} /> Button Text
</button>
```

Primary button (for important actions):
```jsx
<button
  onClick={handleAction}
  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-[#7b77b9] text-white hover:bg-[#7b77b9]/80 transition-colors"
>
  <Icon size={16} /> Primary Action
</button>
```

Small button (for inline actions):
```jsx
<button
  onClick={handleAction}
  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
>
  Action
</button>
```

### Cards

```jsx
<div className="bg-white dark:bg-background/50 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-sm p-4">
  <p className="text-sm font-medium text-black/60 dark:text-white/60">
    Card Title
  </p>
  <p className="text-2xl font-bold text-black dark:text-white mt-1">
    {content}
  </p>
</div>
```

### Tables

```jsx
<div className="bg-white dark:bg-background/50 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-sm overflow-hidden">
  <table className="min-w-full divide-y divide-black/10 dark:divide-white/10">
    <thead className="bg-black/5 dark:bg-white/5">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-black/70 dark:text-white/70 uppercase tracking-wider">
          Column Header
        </th>
        {/* More headers */}
      </tr>
    </thead>
    <tbody className="bg-white dark:bg-transparent divide-y divide-black/10 dark:divide-white/10">
      {items.map((item) => (
        <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5">
          <td className="px-6 py-4 text-sm text-black dark:text-white">
            {item.content}
          </td>
          {/* More cells */}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### Status Badges

```jsx
<span
  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    status === "confirmed"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      : status === "pending"
      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  }`}
>
  {status === "confirmed" && <CheckCircle size={12} className="mr-1" />}
  {status === "pending" && <Clock size={12} className="mr-1" />}
  {status}
</span>
```

### Search and Filters

```jsx
<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
  <div className="relative w-full md:w-72">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search size={16} className="text-black/50 dark:text-white/50" />
    </div>
    <input
      type="search"
      placeholder="Search..."
      className="pl-10 w-full py-2 px-3 border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-black/30 text-black dark:text-white placeholder-black/50 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7b77b9]"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>
  
  <div className="flex items-center gap-2 w-full md:w-auto">
    {/* Filter buttons */}
  </div>
</div>
```

### View Toggle Tabs

```jsx
<div className="flex border-b border-black/10 dark:border-white/10 mb-6">
  <button
    onClick={() => setActiveView("table")}
    className={`px-4 py-2 text-sm font-medium ${
      activeView === "table"
        ? "border-b-2 border-[#7b77b9] text-[#7b77b9] dark:text-[#a5a1ff]"
        : "text-black/70 dark:text-white/70 hover:text-black hover:dark:text-white"
    }`}
  >
    Table View
  </button>
  <button
    onClick={() => setActiveView("cards")}
    className={`px-4 py-2 text-sm font-medium ${
      activeView === "cards"
        ? "border-b-2 border-[#7b77b9] text-[#7b77b9] dark:text-[#a5a1ff]"
        : "text-black/70 dark:text-white/70 hover:text-black hover:dark:text-white"
    }`}
  >
    Card View
  </button>
</div>
```

## Responsiveness

- Always design for mobile-first, then adapt for larger screens
- Use flex-col on mobile and flex-row on desktop for layout changes:
  ```jsx
  <div className="flex flex-col md:flex-row">
  ```
- Use responsive width adjustments:
  ```jsx
  <div className="w-full md:w-72">
  ```
- Hide elements on mobile when needed:
  ```jsx
  <button className="hidden md:flex">Desktop Only</button>
  <button className="md:hidden flex">Mobile Only</button>
  ```
- Use grid with responsive columns:
  ```jsx
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  ```

## Dark Mode Support

All UI elements must support dark mode. Follow these patterns:

- Text colors: `text-black dark:text-white`
- Background colors: `bg-white dark:bg-background`
- Opacity for secondary elements:
  - Text: `text-black/70 dark:text-white/70`
  - Backgrounds: `bg-black/5 dark:bg-white/5`
- Border colors: `border-black/10 dark:border-white/10`
- Hover states: `hover:bg-black/5 dark:hover:bg-white/5`

Add the `backdrop-blur-md` class to elements over the background to enhance readability.

## Code Structure

- Keep component functions at the top of the file
- Group related state variables together
- Place utility functions before the return statement
- Add appropriate comments for complex logic
- Group JSX by logical sections with comment headers:
  ```jsx
  {/* Header */}
  <div className="...">
    ...
  </div>
  
  {/* Table View */}
  ...
  
  {/* Card View */}
  ...
  ```

## Best Practices

1. Always provide visual feedback for loading states using skeleton loaders
2. Include empty states for tables and card views
3. Support accessibility with appropriate contrast ratios and ARIA attributes
4. Ensure consistent spacing throughout the UI
5. Maintain a clean hierarchy of information
6. Use opacity variants for secondary information instead of fixed colors

By following these guidelines, we maintain a consistent, accessible, and beautiful UI across the Framp admin dashboard. 