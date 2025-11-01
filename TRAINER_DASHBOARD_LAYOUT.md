# Trainer Dashboard Layout Architecture

## Overview
The Trainer Dashboard uses a **dynamic flexbox-based layout system** that maintains a consistent 70/30 split across all screen sizes. This architecture was finalized after extensive testing for tablet and desktop compatibility.

## 🚨 CRITICAL: DO NOT MODIFY WITHOUT GOOD REASON
This layout system works across multiple screen sizes and has been tested extensively. Any changes should be thoroughly tested and documented.

## Layout Structure

```
trainer-dashboard-container (flex column)
├── trainer-header (fixed height)
└── trainer-main-content (flex: 1)
    └── dashboard-layout (flex column)
        ├── dashboard-top-section (flex: 0 0 70%) ← MAIN CONTENT AREA
        │   ├── quick-tools-sidebar (180px fixed width)
        │   └── content-container (flex: 1)
        │       └── router-content-area (Routes)
        └── core-tools-workspace (flex: 0 0 30%) ← TOOLS AREA
            ├── tools-selector (fixed height ~3rem)
            └── workspace-content (flex: 1)
                └── workspace-content-uniform
                    └── tool-cards-grid (2x2 grid)
```

## Key CSS Classes and Their Purpose

### Container Structure
- **`.trainer-dashboard-container`**: Root flex container (column direction)
- **`.trainer-main-content`**: Main flex container that takes all available space after header
- **`.dashboard-layout`**: Primary layout container with 1rem gap and padding

### 70/30 Split Implementation
- **`.dashboard-top-section`**: `flex: 0 0 70%` - Main content area (calendar, programs, etc.)
- **`.core-tools-workspace`**: `flex: 0 0 30%` - Tools workspace area (Smart Scheduling cards)

### Content Areas
- **`.quick-tools-sidebar`**: Fixed 180px width left navigation
- **`.content-container`**: Flexible content area for router views
- **`.workspace-content`**: Scrollable content area within tools workspace

## Critical Flex Properties

### DO NOT CHANGE THESE VALUES:
```css
.trainer-main-content {
  flex: 1;                    /* Takes all space after header */
  display: flex;
  flex-direction: column;
  min-height: 0;             /* Allows flexbox shrinking */
  overflow: hidden;
}

.dashboard-top-section {
  flex: 0 0 70%;             /* Exactly 70% - CRITICAL */
  display: flex;
  flex-direction: row;
  gap: 1rem;
  min-height: 0;
  align-items: stretch;
}

.core-tools-workspace {
  flex: 0 0 30%;             /* Exactly 30% - CRITICAL */
  display: flex;
  flex-direction: column;
  min-height: 200px;         /* Minimum for functionality */
  background-color: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}
```

## Why This Layout Works

### 1. Dynamic Sizing
- Uses `flex-basis` percentages instead of fixed heights
- Scales proportionally across all screen sizes
- No viewport height (`vh`) dependencies that break on different screens

### 2. Content Preservation
- 70% ensures main content (calendar) has adequate space
- 30% provides sufficient space for 2x2 tool card grid
- `min-height: 200px` on workspace prevents cards from being unusable

### 3. Responsive Behavior
- Layout maintains proportions on tablets (699px+) and desktops
- Sidebar collapses to bottom navigation on mobile (<699px)
- Tool cards remain accessible and properly sized

## Tool Cards Grid System

The workspace uses a **uniform card system** to prevent layout shifts:

```css
.tool-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;    /* 2 columns */
  grid-template-rows: 1fr 1fr;       /* 2 rows */
  gap: 0.4rem;
  flex: 1;
  overflow: visible;
}

.tool-card {
  min-height: 70px;
  max-height: 90px;
  /* Compact but functional sizing */
}
```

## Common Pitfalls to Avoid

### ❌ DON'T DO THIS:
- Using `height: 25vh`, `height: 45vh`, or any viewport-based heights
- Setting `max-height` constraints on main sections
- Using `overflow: hidden` on workspace content
- Changing flex-basis percentages without extensive testing

### ✅ DO THIS INSTEAD:
- Use `flex: 0 0 [percentage]` for predictable sizing
- Use `min-height` for minimum usability requirements
- Use `overflow: auto` for scrollable content areas
- Test changes across multiple screen sizes

## Testing Requirements

Before making ANY layout changes, test on:
- ✅ Desktop (1920x1080+)
- ✅ Large tablets (1024x768)
- ✅ Android tablets (800x600 with Chrome UI reduction)
- ✅ Vertical orientation
- ✅ Browser zoom levels (90%, 100%, 110%)

## Browser-Specific Considerations

### Android Chrome
- Published specs: 800px width
- Actual available width: ~711px (due to browser UI)
- Breakpoint set to 699px to account for this

### Tablet Detection
- Uses custom `useResponsive` hook
- Breakpoint: `width >= 699px` triggers tablet layout
- Mobile users automatically redirect to main dashboard

## Future Modifications

If layout changes are absolutely necessary:

1. **Document the reason** in this file
2. **Test extensively** across all target devices
3. **Maintain the 70/30 principle** unless there's compelling UX evidence
4. **Update JSDoc comments** in affected components
5. **Consider backwards compatibility** with existing user workflows

## Performance Considerations

- Uses `transform3d` for hardware acceleration on hover effects
- Gradient backgrounds are GPU-accelerated
- Card transitions use `transform` instead of layout-affecting properties
- `will-change` property avoided to prevent unnecessary layer creation

## Maintenance Notes

**Last Updated**: November 1, 2025
**Stability**: Production-ready across all target devices
**Performance**: Optimized for 60fps interactions
**Accessibility**: Proper ARIA labels and keyboard navigation support

---

**Remember**: This layout system took extensive debugging to perfect. Changes should be made cautiously and with thorough testing.