# Modern Analytics Dashboard - Frontend

A premium enterprise analytics dashboard built with React, Next.js, Tailwind CSS, and modern UI components.

## Features

✅ **Modern Design System**

- Clean, professional UI with enterprise-level aesthetics
- Responsive design optimized for all screen sizes
- Dark mode ready with smooth transitions
- Beautiful animations and micro-interactions

✅ **Complete Dashboard Pages**

- **Dashboard**: Overview with KPI cards, revenue trends, and sales charts
- **Sales Analytics**: Regional sales breakdown, conversion funnels, and trends
- **Customers**: Customer directory with detailed profiles and segments
- **Products**: Product performance tracking with revenue and growth metrics
- **Regions**: Regional analytics with performance metrics
- **Forecast**: AI-powered revenue forecasts with confidence levels
- **Settings**: User preferences and account management

✅ **Components & Layouts**

- Responsive Sidebar navigation with collapsible menus
- Sticky header with search, notifications, and user profile
- KPI Cards with trend indicators
- Interactive data tables with pagination
- Revenue and sales charts (Area, Bar, Pie charts)
- Custom UI components (Button, Card, Input, Badge)

✅ **Responsive & Mobile-First**

- Mobile sidebar with smooth animations
- Touch-friendly interface
- Breakpoint optimized layouts
- Smooth transitions and hover effects

✅ **Production Ready**

- Type-safe TypeScript components
- Reusable component architecture
- Mock data with realistic analytics
- Custom hooks for common patterns
- Utility functions for formatting and calculations

## Project Structure

```
/src
  /components
    /layout          # Main layout components (Sidebar, Header, MainLayout)
    /dashboard       # Dashboard-specific components (KPICard, Charts, Table)
    /ui             # Reusable UI components (Button, Card, Input, Badge)
  /pages
    dashboard.tsx   # Dashboard overview page
    sales.tsx       # Sales analytics page
    customers.tsx   # Customers page
    products.tsx    # Products page
    regions.tsx     # Regions page
    forecast.tsx    # Forecast page
    settings.tsx    # Settings page
  /data
    mockData.ts     # Realistic mock data for all pages
  /types
    index.ts        # TypeScript types and interfaces
  /utils
    helpers.ts      # Utility functions (formatting, calculations)
  /hooks
    index.ts        # Custom React hooks
  /styles
    globals.css     # Global Tailwind styles and animations
```

## Tech Stack

- **React 19** - UI framework
- **Next.js 16** - React framework with server-side features
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **Recharts** - Data visualization library
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **date-fns** - Date utilities
- **Zustand** - State management

## Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Run the development server:**

```bash
npm run dev
```

3. **Open browser:**
   Navigate to `http://localhost:6060`

## Key Components

### Layout Components

**MainLayout**

- Wraps all pages
- Manages mobile menu state
- Integrates Header and Sidebar

**Sidebar**

- Navigation with active state highlighting
- Collapsible submenu support
- Badges for notifications
- Mobile-responsive with overlay

**Header**

- Search bar
- Theme toggle (dark/light mode)
- Notification dropdown
- User profile dropdown
- Mobile menu trigger

### Dashboard Components

**KPICard**

- Displays key metrics
- Trend indicators (up/down/stable)
- Customizable icons
- Clickable for navigation

**RevenueChart**

- Area chart showing revenue trends
- Gradient fill with smooth animation
- Responsive sizing

**SalesChart**

- Bar chart for sales data
- Pie chart option for category distribution
- Interactive tooltips

**DataTable**

- Responsive table with hover effects
- Custom column rendering
- Pagination controls

## Customization

### Theme Colors

Edit `tailwind.config.mjs` to customize the color palette:

```javascript
colors: {
  primary: '#3b82f6',    // Change primary blue
  success: '#10b981',    // Change success green
  warning: '#f59e0b',    // Change warning amber
  error: '#ef4444',      // Change error red
}
```

### Mock Data

Update `src/data/mockData.ts` to use real API data:

```typescript
// Replace mock data with API calls
const data = await fetchAnalytics();
```

### Add New Pages

1. Create page in `src/pages/newpage.tsx`
2. Import MainLayout
3. Add to Sidebar navigation
4. Update routing

## Features to Add

- **Real Data Integration**: Connect to your backend APIs
- **User Authentication**: Add login/logout flows
- **Export Functionality**: PDF/CSV exports for reports
- **Advanced Filters**: Date ranges, custom filters
- **Real-time Updates**: WebSocket connections for live data
- **Multi-user Support**: Role-based access control
- **API Documentation**: Swagger/OpenAPI integration

## Performance Optimizations

- Code splitting with Next.js
- Image optimization
- Lazy loading for charts
- Memoized components
- Efficient re-renders with React hooks

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Run Tests

```bash
npm run test
```

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Lint Code

```bash
npm run lint
```

## API Integration

Replace mock data with real API calls:

```typescript
// In your component
const { data, loading, error } = useFetch("/api/analytics");

// Or use custom hooks
const [data, setData] = useState(null);
useEffect(() => {
  fetch("/api/analytics")
    .then((res) => res.json())
    .then((data) => setData(data));
}, []);
```

## Contributing

1. Follow the existing component structure
2. Use TypeScript for type safety
3. Create reusable components
4. Document complex logic
5. Test responsive design

## License

MIT

## Support

For issues and questions, please refer to the documentation or create an issue in the repository.

---

**Built with ❤️ for modern analytics**
