# BookMaru Color System

This document explains how to customize colors in the BookMaru website.

## 🎨 Available Themes

The website comes with 6 predefined color themes:

### 1. **Forest Green** (Default)

- Primary: `#118b50` (Dark Green)
- Secondary: `#5db996` (Light Green)
- Background: `#fffdf0` (Cream)
- Perfect for: Nature, reading, calm environments

### 2. **Ocean Blue**

- Primary: `#2b6cb0` (Blue)
- Secondary: `#63b3ed` (Light Blue)
- Background: `#f7fafc` (Light Gray)
- Perfect for: Professional, clean, modern look

### 3. **Sunset Orange**

- Primary: `#dd6b20` (Orange)
- Secondary: `#f6ad55` (Light Orange)
- Background: `#fffaf0` (Warm White)
- Perfect for: Creative, energetic, warm feeling

### 4. **Creative Purple**

- Primary: `#805ad5` (Purple)
- Secondary: `#b794f6` (Light Purple)
- Background: `#faf5ff` (Lavender)
- Perfect for: Creative, artistic, unique

### 5. **Dark Mode**

- Primary: `#68d391` (Green)
- Secondary: `#9ae6b4` (Light Green)
- Background: `#1a202c` (Dark)
- Perfect for: Night reading, modern, sleek

### 6. **Minimal Gray**

- Primary: `#4a5568` (Gray)
- Secondary: `#718096` (Light Gray)
- Background: `#ffffff` (White)
- Perfect for: Clean, minimal, professional

## 🔧 How to Change Colors

### Method 1: Using the Theme Selector (Easiest)

1. Look for the color picker in the top-right corner of the website
2. Click on it to see all available themes
3. Select your preferred theme
4. The colors will change instantly and be saved for future visits

### Method 2: Programmatically

```typescript
import { applyTheme } from '$lib/colors';

// Apply a specific theme
applyTheme('ocean'); // Changes to Ocean Blue theme
applyTheme('dark'); // Changes to Dark Mode theme
```

### Method 3: Create Custom Themes

Edit `src/lib/colors.ts` to add your own themes:

```typescript
export const colorThemes: Record<string, ColorTheme> = {
	// Add your custom theme
	myCustomTheme: {
		name: 'myCustomTheme',
		displayName: 'My Custom Theme',
		colors: {
			primary: '#your-color',
			secondary: '#your-secondary-color',
			background: '#your-background',
			text: '#your-text-color',
			textSecondary: '#your-secondary-text',
			accent: '#your-accent',
			success: '#48bb78',
			warning: '#ed8936',
			error: '#f56565',
			border: '#e2e8f0',
			hover: '#4a5568'
		}
	}
};
```

## 🎯 Color Variables

The system uses CSS custom properties that can be overridden:

```css
:root {
	--color-brand-primary: #118b50; /* Main brand color */
	--color-brand-secondary: #5db996; /* Secondary brand color */
	--color-background: #fffdf0; /* Page background */
	--color-text: #2d3748; /* Main text color */
	--color-text-secondary: #718096; /* Secondary text */
	--color-accent: #38a169; /* Accent color */
	--color-success: #48bb78; /* Success states */
	--color-warning: #ed8936; /* Warning states */
	--color-error: #f56565; /* Error states */
	--color-border: #e2e8f0; /* Border color */
	--color-hover: #4a5568; /* Hover states */
}
```

## 🚀 Usage in Components

Use the color variables in your Svelte components:

```svelte
<style>
	.my-component {
		background-color: var(--color-brand-primary);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.my-component:hover {
		background-color: var(--color-hover);
	}
</style>
```

## 📱 Responsive Design

The theme selector is responsive:

- On mobile: Shows only the color dot
- On desktop: Shows color dot + theme name
- Dropdown works on all screen sizes

## 💾 Persistence

- Theme selection is automatically saved to localStorage
- Users' theme preference persists across browser sessions
- Default theme is "Forest Green" for new users

## 🔄 Theme Switching

Themes can be switched:

1. **Instantly** - No page reload required
2. **Smoothly** - CSS transitions for better UX
3. **Persistently** - Choice is remembered

## 🎨 Design Guidelines

When creating custom themes, consider:

1. **Contrast**: Ensure good readability
2. **Accessibility**: Meet WCAG guidelines
3. **Brand consistency**: Align with your brand
4. **User experience**: Test on different devices
5. **Color harmony**: Use complementary colors

## 🛠️ Technical Details

- **Framework**: Svelte with TypeScript
- **Storage**: localStorage for persistence
- **CSS**: Custom properties for theming
- **Components**: Modular theme selector
- **Performance**: No external dependencies

## 📝 Examples

### Quick Theme Change

```javascript
// In browser console
localStorage.setItem('bookmaru-theme', 'ocean');
location.reload();
```

### Custom CSS Override

```css
/* Override specific colors */
:root {
	--color-brand-primary: #your-custom-color;
}
```

This color system makes it easy to maintain brand consistency while providing flexibility for different use cases and user preferences.
