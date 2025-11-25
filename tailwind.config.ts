import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--colors-background) / <alpha-value>)',
				foreground: 'hsl(var(--colors-foreground) / <alpha-value>)',
				card: {
					DEFAULT: 'hsl(var(--colors-card) / <alpha-value>)',
					foreground: 'hsl(var(--colors-card-foreground) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'hsl(var(--colors-popover) / <alpha-value>)',
					foreground: 'hsl(var(--colors-popover-foreground) / <alpha-value>)'
				},
				primary: {
					DEFAULT: 'hsl(var(--colors-primary) / <alpha-value>)',
					foreground: 'hsl(var(--colors-primary-foreground) / <alpha-value>)'
				},
				secondary: {
					DEFAULT: 'hsl(var(--colors-secondary) / <alpha-value>)',
					foreground: 'hsl(var(--colors-secondary-foreground) / <alpha-value>)'
				},
				muted: {
					DEFAULT: 'hsl(var(--colors-muted) / <alpha-value>)',
					foreground: 'hsl(var(--colors-muted-foreground) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'hsl(var(--colors-accent) / <alpha-value>)',
					foreground: 'hsl(var(--colors-accent-foreground) / <alpha-value>)'
				},
				destructive: {
					DEFAULT: 'hsl(var(--colors-destructive) / <alpha-value>)',
					foreground: 'hsl(var(--colors-destructive-foreground) / <alpha-value>)'
				},
				border: 'hsl(var(--colors-border) / <alpha-value>)',
				input: 'hsl(var(--colors-input) / <alpha-value>)',
				ring: 'hsl(var(--colors-ring) / <alpha-value>)',
				milky: 'hsl(var(--colors-milky) / <alpha-value>)',
				'dark-green': 'hsl(var(--colors-dark-green) / <alpha-value>)',
				sidebar: {
					DEFAULT: 'hsl(var(--colors-sidebar) / <alpha-value>)',
					foreground: 'hsl(var(--colors-sidebar-foreground) / <alpha-value>)',
					primary: {
						DEFAULT: 'hsl(var(--colors-sidebar-primary) / <alpha-value>)',
						foreground: 'hsl(var(--colors-sidebar-primary-foreground) / <alpha-value>)'
					},
					accent: {
						DEFAULT: 'hsl(var(--colors-sidebar-accent) / <alpha-value>)',
						foreground: 'hsl(var(--colors-sidebar-accent-foreground) / <alpha-value>)'
					},
					border: 'hsl(var(--colors-sidebar-border) / <alpha-value>)',
					ring: 'hsl(var(--colors-sidebar-ring) / <alpha-value>)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	darkMode: 'class',
	plugins: []
} satisfies Config;
