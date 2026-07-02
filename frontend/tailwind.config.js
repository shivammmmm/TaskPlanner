const withOpacity = (variableName) => {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `color-mix(in srgb, var(${variableName}) calc(${opacityValue} * 100%), transparent)`;
    }
    return `var(${variableName})`;
  };
};

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: withOpacity('--background'),
  			foreground: withOpacity('--foreground'),
  			card: {
  				DEFAULT: withOpacity('--card'),
  				foreground: withOpacity('--card-foreground')
  			},
  			popover: {
  				DEFAULT: withOpacity('--popover'),
  				foreground: withOpacity('--popover-foreground')
  			},
  			primary: {
  				DEFAULT: withOpacity('--primary'),
  				foreground: withOpacity('--primary-foreground')
  			},
  			secondary: {
  				DEFAULT: withOpacity('--secondary'),
  				foreground: withOpacity('--secondary-foreground')
  			},
  			muted: {
  				DEFAULT: withOpacity('--muted'),
  				foreground: withOpacity('--muted-foreground')
  			},
  			accent: {
  				DEFAULT: withOpacity('--accent'),
  				foreground: withOpacity('--accent-foreground')
  			},
  			destructive: {
  				DEFAULT: withOpacity('--destructive'),
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: withOpacity('--border'),
  			input: withOpacity('--input'),
  			ring: withOpacity('--ring'),
  			chart: {
  				'1': withOpacity('--chart-1'),
  				'2': withOpacity('--chart-2'),
  				'3': withOpacity('--chart-3'),
  				'4': withOpacity('--chart-4'),
  				'5': withOpacity('--chart-5')
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: withOpacity('--sidebar-foreground'),
  				primary: withOpacity('--sidebar-primary'),
  				'primary-foreground': withOpacity('--sidebar-primary-foreground'),
  				accent: withOpacity('--sidebar-accent'),
  				'accent-foreground': withOpacity('--sidebar-accent-foreground'),
  				border: withOpacity('--sidebar-border'),
  				ring: withOpacity('--sidebar-ring')
  			}
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			mono: ['var(--font-mono)']
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
