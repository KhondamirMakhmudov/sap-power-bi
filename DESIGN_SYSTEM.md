# 🎨 Analytics Dashboard - Visual Guide

## Color Palette

### Primary Colors

```
Blue (Primary)     #3b82f6  ████████
Green (Success)    #10b981  ████████
Amber (Warning)    #f59e0b  ████████
Red (Error)        #ef4444  ████████
Cyan (Info)        #0ea5e9  ████████
```

### Neutral Colors

```
Gray 50            #f9fafb  (Light backgrounds)
Gray 100           #f3f4f6  (Hover states)
Gray 200           #e5e7eb  (Borders)
Gray 600           #4b5563  (Secondary text)
Gray 900           #111827  (Primary text)
```

## Typography

### Font Sizes

- XS (12px) - Labels, captions
- SM (14px) - Small text, breadcrumbs
- Base (16px) - Body text
- LG (18px) - Subheadings
- XL (20px) - Headings
- 2XL (24px) - Large headings
- 3XL (30px) - Page titles

### Font Weights

- Light (300) - Disabled text
- Normal (400) - Body text
- Medium (500) - Buttons, labels
- Semibold (600) - Headings
- Bold (700) - Emphasis
- Black (900) - Strong emphasis

## Spacing Scale

```
2px   - xs
4px   - sm
6px   - md
8px   - lg
12px  - xl
16px  - 2xl
24px  - 3xl
32px  - 4xl
```

## Component Examples

### KPI Card

```
┌─────────────────────────────┐
│ Total Revenue               │
│ $1,250,000                  │
│ ↑ 12.5% vs last month       │
└─────────────────────────────┘
```

### Navigation Item

```
┌─ Dashboard
├─ Sales →
├─ Customers →
├─ Products →
├─ Regions →
├─ Forecast →
└─ Settings →
```

### Chart Example

```
Revenue Trend
      │
  50K │     ╱╲
      │    ╱  ╲╱╲
  25K │   ╱      ╲   ╱
      │  ╱        ╲ ╱
   0K │──────────────────
      Jan  Feb  Mar  Apr
```

## Layout Structure

### Desktop View

```
┌─────────────────────────────────────┐
│  Menu      Notifications  Profile    │
├──────────┬─────────────────────────┐
│          │                         │
│ Sidebar  │   Main Content          │
│          │                         │
│          │   (Page Content Here)   │
│          │                         │
└──────────┴─────────────────────────┘
```

### Mobile View

```
┌──────────────────────┐
│ ☰  Search  🔔   👤   │
├──────────────────────┤
│                      │
│   Main Content       │
│   (Full Width)       │
│                      │
│                      │
└──────────────────────┘

(Sidebar as overlay)
```

## Interactive States

### Button States

```
Normal    │ Hover      │ Active    │ Disabled
────────────────────────────────────────────
Blue BG   │ Darker BG  │ Pressed   │ Faded
White TX  │ White TX   │ White TX  │ White TX
```

### Link States

```
Normal     │ Hover      │ Active
───────────────────────────────────
Gray Text  │ Blue Text  │ Blue + Underline
Underline  │ Underline  │ Underline
```

## Animations

### Fade In (300ms)

```
Opacity: 0 → 1
Transform: translateY(10px) → 0
```

### Slide Left (400ms)

```
Opacity: 0 → 1
Transform: translateX(-20px) → 0
```

### Slide Right (400ms)

```
Opacity: 0 → 1
Transform: translateX(20px) → 0
```

## Shadow System

### Soft (Card hover)

```
0 4px 12px rgba(0, 0, 0, 0.08)
```

### Medium

```
0 8px 24px rgba(0, 0, 0, 0.12)
```

### Large (Modal, Dropdowns)

```
0 12px 32px rgba(0, 0, 0, 0.15)
```

## Responsive Breakpoints

- **Mobile**: 0px - 640px (320px base)
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px+

## Icon Sizes

- **XS**: 16px (inline text)
- **SM**: 20px (labels)
- **MD**: 24px (buttons)
- **LG**: 32px (headers)
- **XL**: 48px (hero)

## Border Radius

- **xs**: 2px (subtle)
- **sm**: 4px (buttons)
- **md**: 6px (inputs)
- **lg**: 8px (cards)
- **xl**: 12px (large cards)
- **full**: 9999px (pills, circles)

## Dark Mode

When dark mode is enabled:

- Backgrounds become darker
- Text becomes lighter
- Borders become lighter
- Shadows are more visible
- Overall contrast adjusted

## Accessibility

### Color Contrast

- Text on background: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### Focus States

- Blue focus ring (2px)
- Visible on all interactive elements
- Keyboard accessible

### Touch Targets

- Minimum 44x44px on mobile
- 36x36px on desktop acceptable

## Design Tokens

### Duration

- Fast: 150ms
- Normal: 300ms
- Slow: 500ms

### Easing

- Ease In: cubic-bezier(0.4, 0, 1, 1)
- Ease Out: cubic-bezier(0, 0, 0.2, 1)
- Ease In-Out: cubic-bezier(0.4, 0, 0.2, 1)

### Z-Index Scale

- Base: 0
- Dropdown: 10
- Sticky: 20
- Fixed: 30
- Modal: 40
- Tooltip: 50

## Color Usage

### Status Colors

- **Success**: Green (#10b981) - Completed, Active
- **Warning**: Amber (#f59e0b) - Pending, Alert
- **Error**: Red (#ef4444) - Failed, Error
- **Info**: Blue (#3b82f6) - Default, Info

### Background Colors

- **White**: Primary background
- **Gray 50**: Hover state, Disabled
- **Gray 100**: Secondary section
- **Dark**: Dark mode background

## Typography Scale

```
Page Title       → 3XL + Bold
Section Title    → 2XL + Semibold
Subheading       → LG + Semibold
Body             → Base + Normal
Small Text       → SM + Normal
Label            → XS + Medium
Caption          → XS + Normal
```

---

**Design System Reference for Consistency** ✨
