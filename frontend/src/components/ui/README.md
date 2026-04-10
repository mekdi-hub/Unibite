# UI Components - Brand Color System

This folder contains reusable UI components that automatically use your brand colors (red-500 to red-600 gradient).

## Components

### 1. Button Component
General purpose button for forms, CTAs, and actions.

#### Usage
```jsx
import { Button } from './components/ui'

// Primary button (default)
<Button onClick={handleClick}>Click Me</Button>

// With icon
<Button icon={<FaUser />}>Profile</Button>

// Loading state
<Button loading>Submitting...</Button>

// Different variants
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Delete</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Full width
<Button fullWidth>Full Width Button</Button>
```

#### Props
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
- `size`: 'sm' | 'md' | 'lg'
- `fullWidth`: boolean
- `disabled`: boolean
- `loading`: boolean
- `icon`: React element
- `iconPosition`: 'left' | 'right'
- `onClick`: function
- `type`: 'button' | 'submit' | 'reset'

---

### 2. IconButton Component
Icon-only buttons for navigation, toolbars, and compact actions.

#### Usage
```jsx
import { IconButton } from './components/ui'

// Primary icon button
<IconButton>
  <FaUser className="w-5 h-5" />
</IconButton>

// Different variants
<IconButton variant="ghost">
  <FaSearch className="w-5 h-5" />
</IconButton>

// Different sizes
<IconButton size="sm">
  <FaEdit className="w-4 h-4" />
</IconButton>

// Rounded styles
<IconButton rounded="full">
  <FaPlus className="w-5 h-5" />
</IconButton>
```

#### Props
- `variant`: 'primary' | 'secondary' | 'ghost' | 'outline'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `rounded`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
- `disabled`: boolean
- `onClick`: function

---

### 3. NavButton Component
Specialized button for sidebar navigation with active states.

#### Usage
```jsx
import { NavButton } from './components/ui'

// Active navigation item
<NavButton 
  active={true}
  icon={<FaHome className="w-5 h-5" />}
  onClick={() => navigate('/dashboard')}
>
  Dashboard
</NavButton>

// With badge
<NavButton 
  icon={<FaBell className="w-5 h-5" />}
  badge={5}
  onClick={() => navigate('/notifications')}
>
  Notifications
</NavButton>

// Inactive item
<NavButton 
  icon={<FaUsers className="w-5 h-5" />}
  onClick={() => navigate('/users')}
>
  Users
</NavButton>
```

#### Props
- `active`: boolean
- `icon`: React element
- `badge`: number | string
- `onClick`: function

---

## Migration Examples

### Before (Old Style)
```jsx
<button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-md">
  Sign Up
</button>
```

### After (New Style)
```jsx
import { Button } from './components/ui'

<Button>Sign Up</Button>
```

---

### Before (Navigation)
```jsx
<button 
  onClick={() => navigate('/dashboard')}
  className="group w-full flex items-center space-x-3 px-4 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium shadow-lg"
>
  <span className="text-xl">📊</span>
  <span>Dashboard</span>
</button>
```

### After (Navigation)
```jsx
import { NavButton } from './components/ui'

<NavButton 
  active={true}
  icon={<FaChartBar className="w-5 h-5" />}
  onClick={() => navigate('/dashboard')}
>
  Dashboard
</NavButton>
```

---

## Brand Colors Reference

All components automatically use these brand colors:

- **Primary Gradient**: `from-red-500 to-red-600`
- **Hover Gradient**: `from-red-600 to-red-700`
- **Text**: `text-red-600`
- **Border**: `border-red-500`
- **Background**: `bg-red-50`, `bg-red-100`
- **Shadow**: `shadow-red-200`

---

## Benefits

1. **Consistency**: All buttons use the same brand colors
2. **Maintainability**: Update colors in one place
3. **Accessibility**: Built-in focus states and disabled states
4. **Performance**: Optimized with Tailwind classes
5. **Developer Experience**: Simple, intuitive API
6. **Type Safety**: Can be extended with TypeScript

---

## Next Steps

To migrate existing pages:

1. Import the components: `import { Button, IconButton, NavButton } from './components/ui'`
2. Replace old button elements with new components
3. Remove inline Tailwind classes
4. Test functionality

Example pages to update:
- Home.jsx
- Login.jsx
- Register.jsx
- AdminDashboard.jsx
- RestaurantDashboard.jsx
- And all other pages with buttons
