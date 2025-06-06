/**
 * This is a minimal config.
 *
 * If you need the full config, get it from here:
 * https://unpkg.com/browse/tailwindcss@latest/stubs/defaultConfig.stub.js
 */

module.exports = {
  darkMode: ["class"],
  content: [
    /**
     * HTML. Paths to Django template files that will contain Tailwind CSS classes.
     */

    /*  Templates within theme app (<tailwind_app_name>/templates), e.g. base.html. */
    "../templates/**/*.html",

    /*
     * Main templates directory of the project (BASE_DIR/templates).
     * Adjust the following line to match your project structure.
     */
    "../../templates/**/*.html",

    /*
     * Templates in other django apps (BASE_DIR/<any_app_name>/templates).
     * Adjust the following line to match your project structure.
     */
    "../../**/templates/**/*.html",

    /**
     * Python files. Paths to Django form files that will contain Tailwind CSS classes.
     */
    "../../**/forms.py",

    /**
     * JS: If you use Tailwind CSS in JavaScript, uncomment the following lines and make sure
     * patterns match your project structure.
     */
    /* JS 1: Ignore any JavaScript in node_modules folder. */
    // '!../../**/node_modules',
    /* JS 2: Process all JavaScript files in the project. */
    // '../../**/*.js',

    /**
     * Python: If you use Tailwind CSS classes in Python, uncomment the following line
     * and make sure the pattern below matches your project structure.
     */
    // '../../**/*.py'
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./usercomponents/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        archivo: [
          'Archivo',
          'sans-serif'
        ],
        pilcrow: [
          'Pilcrow Rounded"',
          'sans-serif'
        ],
      },
      fontSize: {
        title: [
          '34px',
          '40px'
        ],
        h1: [
          '28px',
          '36px'
        ],
        h2: [
          '24px',
          '32px'
        ],
        h3: [
          '20px',
          '24px'
        ],
        h4: [
          '18px',
          '24px'
        ],
        'button-primary': [
          '16px',
          '18px'
        ],
        'button-secondary': [
          '14px',
          '16px'
        ],
        body: [
          '16px',
          '20px'
        ],
        quote: [
          '16px',
          '18px'
        ],
        subtitle: [
          '14px',
          '16px'
        ],
        small: [
          '12px',
          '14px'
        ]
      },
      colors: {
        primary: {
          '100': 'oklch(0.42 0.287415 264.3072)',
          '200': 'oklch(0.17 0.1144 269.85)',
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          '100': 'oklch(0.71 0.1925 44.04)',
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        darkColor: 'oklch(0.15 0 0)',
        whiteColor: 'oklch(0.99 0.0026 286.35)',
        greyColor: 'oklch(0.64 0 0)',
        success: 'oklch(0.61 0.1507 154.1)',
        error: 'oklch(0.6 0.1898 28.87)',
        warning: 'oklch(0.81 0.166182 82.7023)',
        info: 'oklch(0.63 0.18 259.96)',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [
    require("tailwindcss-animate")
  ],
};
