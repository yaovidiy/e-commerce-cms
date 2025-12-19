import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			animation: {
				// Fade animations
				'fade-in': 'fadeIn 0.3s ease-in',
				'fade-out': 'fadeOut 0.3s ease-out',
				'fade-in-up': 'fadeInUp 0.4s ease-out',
				'fade-in-down': 'fadeInDown 0.4s ease-out',
				'fade-in-left': 'fadeInLeft 0.4s ease-out',
				'fade-in-right': 'fadeInRight 0.4s ease-out',

				// Scale animations
				'scale-in': 'scaleIn 0.3s ease-out',
				'scale-out': 'scaleOut 0.3s ease-in',
				'scale-up': 'scaleUp 0.4s ease-out',
				'scale-down': 'scaleDown 0.4s ease-in',

				// Slide animations
				'slide-in-up': 'slideInUp 0.4s ease-out',
				'slide-in-down': 'slideInDown 0.4s ease-out',
				'slide-in-left': 'slideInLeft 0.4s ease-out',
				'slide-in-right': 'slideInRight 0.4s ease-out',
				'slide-out-up': 'slideOutUp 0.3s ease-in',
				'slide-out-down': 'slideOutDown 0.3s ease-in',
				'slide-out-left': 'slideOutLeft 0.3s ease-in',
				'slide-out-right': 'slideOutRight 0.3s ease-in',

				// Bounce & pulse animations
				'bounce-slow': 'bounce 2s infinite',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',

				// Rotate animations
				'spin-slow': 'spin 3s linear infinite',
				'spin-fast': 'spin 0.5s linear infinite',

				// Flip animations
				'flip-x': 'flipX 0.6s ease-in-out',
				'flip-y': 'flipY 0.6s ease-in-out',

				// Shimmer animation
				shimmer: 'shimmer 2s infinite',

				// Wiggle animation
				wiggle: 'wiggle 0.5s ease-in-out'
			},
			keyframes: {
				// Fade keyframes
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				fadeOut: {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' }
				},
				fadeInUp: {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				fadeInDown: {
					'0%': { opacity: '0', transform: 'translateY(-10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				fadeInLeft: {
					'0%': { opacity: '0', transform: 'translateX(-10px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				fadeInRight: {
					'0%': { opacity: '0', transform: 'translateX(10px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},

				// Scale keyframes
				scaleIn: {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				scaleOut: {
					'0%': { opacity: '1', transform: 'scale(1)' },
					'100%': { opacity: '0', transform: 'scale(0.9)' }
				},
				scaleUp: {
					'0%': { transform: 'scale(0.95)' },
					'100%': { transform: 'scale(1)' }
				},
				scaleDown: {
					'0%': { transform: 'scale(1)' },
					'100%': { transform: 'scale(0.95)' }
				},

				// Slide keyframes
				slideInUp: {
					'0%': { transform: 'translateY(100%)' },
					'100%': { transform: 'translateY(0)' }
				},
				slideInDown: {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(0)' }
				},
				slideInLeft: {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				slideInRight: {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				slideOutUp: {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(-100%)' }
				},
				slideOutDown: {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(100%)' }
				},
				slideOutLeft: {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-100%)' }
				},
				slideOutRight: {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(100%)' }
				},

				// Flip keyframes
				flipX: {
					'0%': { transform: 'rotateY(0deg)' },
					'100%': { transform: 'rotateY(360deg)' }
				},
				flipY: {
					'0%': { transform: 'rotateX(0deg)' },
					'100%': { transform: 'rotateX(360deg)' }
				},

				// Shimmer keyframes
				shimmer: {
					'0%': { backgroundPosition: '-1000px 0' },
					'100%': { backgroundPosition: '1000px 0' }
				},

				// Wiggle keyframes
				wiggle: {
					'0%, 100%': { transform: 'rotate(-1deg)' },
					'50%': { transform: 'rotate(1deg)' }
				}
			},
			colors: {
				milky: {
					DEFAULT: 'var(--custom)',
					background: 'var(--custom-background)'
				},
				'dark-green': {
					DEFAULT: 'var(--custom-dark-green)',
					foreground: 'var(--primary-foreground)'
				}
			}
		}
	},
	plugins: []
} satisfies Config;
