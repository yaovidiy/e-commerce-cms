<script lang="ts">
	/**
	 * Web Vitals Tracker
	 * 
	 * Monitors Core Web Vitals:
	 * - LCP (Largest Contentful Paint)
	 * - FID (First Input Delay) 
	 * - CLS (Cumulative Layout Shift)
	 * - FCP (First Contentful Paint)
	 * - TTFB (Time to First Byte)
	 */
	
	import { onMount } from 'svelte';
	
	interface WebVitalsMetric {
		name: string;
		value: number;
		rating: 'good' | 'needs-improvement' | 'poor';
		delta: number;
		id: string;
	}
	
	let metrics = $state<WebVitalsMetric[]>([]);
	
	onMount(() => {
		// Check if browser supports Performance API
		if (typeof window === 'undefined' || !window.performance) {
			return;
		}
		
		// Track metrics using PerformanceObserver
		trackWebVitals();
	});
	
	function trackWebVitals() {
		// LCP - Largest Contentful Paint
		if ('PerformanceObserver' in window) {
			try {
				const lcpObserver = new PerformanceObserver((list) => {
					const entries = list.getEntries();
					const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
					
					const value = lastEntry.renderTime || lastEntry.loadTime || 0;
					
					recordMetric({
						name: 'LCP',
						value,
						rating: value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor',
						delta: value,
						id: lastEntry.entryType
					});
				});
				
				lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
			} catch (e) {
				console.warn('LCP observation failed:', e);
			}
			
			// FCP - First Contentful Paint
			try {
				const fcpObserver = new PerformanceObserver((list) => {
					const entries = list.getEntries();
					for (const entry of entries) {
						if (entry.name === 'first-contentful-paint') {
							recordMetric({
								name: 'FCP',
								value: entry.startTime,
								rating: entry.startTime <= 1800 ? 'good' : entry.startTime <= 3000 ? 'needs-improvement' : 'poor',
								delta: entry.startTime,
								id: entry.entryType
							});
						}
					}
				});
				
				fcpObserver.observe({ type: 'paint', buffered: true });
			} catch (e) {
				console.warn('FCP observation failed:', e);
			}
			
			// CLS - Cumulative Layout Shift
			try {
				let clsValue = 0;
				const clsObserver = new PerformanceObserver((list) => {
					for (const entry of list.getEntries()) {
						if ((entry as LayoutShift).hadRecentInput) continue;
						clsValue += (entry as LayoutShift).value;
					}
					
					recordMetric({
						name: 'CLS',
						value: clsValue,
						rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor',
						delta: clsValue,
						id: 'layout-shift'
					});
				});
				
				clsObserver.observe({ type: 'layout-shift', buffered: true });
			} catch (e) {
				console.warn('CLS observation failed:', e);
			}
			
			// FID - First Input Delay
			try {
				const fidObserver = new PerformanceObserver((list) => {
					const entries = list.getEntries();
					const firstInput = entries[0] as PerformanceEventTiming;
					
					if (firstInput) {
						const value = firstInput.processingStart - firstInput.startTime;
						
						recordMetric({
							name: 'FID',
							value,
							rating: value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor',
							delta: value,
							id: firstInput.entryType
						});
					}
				});
				
				fidObserver.observe({ type: 'first-input', buffered: true });
			} catch (e) {
				console.warn('FID observation failed:', e);
			}
		}
		
		// TTFB - Time to First Byte (using Navigation Timing)
		if (window.performance && window.performance.timing) {
			const navTiming = window.performance.timing;
			const ttfb = navTiming.responseStart - navTiming.requestStart;
			
			if (ttfb > 0) {
				recordMetric({
					name: 'TTFB',
					value: ttfb,
					rating: ttfb <= 800 ? 'good' : ttfb <= 1800 ? 'needs-improvement' : 'poor',
					delta: ttfb,
					id: 'navigation'
				});
			}
		}
	}
	
	function recordMetric(metric: WebVitalsMetric) {
		// Update or add metric
		const existingIndex = metrics.findIndex(m => m.name === metric.name);
		
		if (existingIndex >= 0) {
			metrics[existingIndex] = metric;
		} else {
			metrics.push(metric);
		}
		
		// Log to console in development
		if (import.meta.env.DEV) {
			console.log(`[Web Vital] ${metric.name}:`, {
				value: `${Math.round(metric.value)}ms`,
				rating: metric.rating
			});
		}
		
		// Send to analytics (optional - implement based on your analytics provider)
		sendToAnalytics(metric);
	}
	
	function sendToAnalytics(metric: WebVitalsMetric) {
		// Example: Send to Google Analytics
		if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
			(window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', metric.name, {
				value: Math.round(metric.value),
				metric_rating: metric.rating,
				metric_delta: Math.round(metric.delta)
			});
		}
		
		// Example: Send to your own analytics endpoint
		if (import.meta.env.PROD) {
			fetch('/api/analytics/web-vitals', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(metric)
			}).catch(() => {
				// Silently fail - analytics shouldn't break the app
			});
		}
	}
	
	function getRatingColor(rating: string): string {
		switch (rating) {
			case 'good': return 'text-green-600';
			case 'needs-improvement': return 'text-yellow-600';
			case 'poor': return 'text-red-600';
			default: return 'text-gray-600';
		}
	}
	
	interface LayoutShift extends PerformanceEntry {
		value: number;
		hadRecentInput: boolean;
	}
</script>

<!-- Only show in development -->
{#if import.meta.env.DEV && metrics.length > 0}
	<div class="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
		<h3 class="text-sm font-bold mb-2">Web Vitals</h3>
		<div class="space-y-2 text-xs">
			{#each metrics as metric}
				<div class="flex justify-between items-center">
					<span class="font-medium">{metric.name}:</span>
					<span class={getRatingColor(metric.rating)}>
						{Math.round(metric.value)}{metric.name === 'CLS' ? '' : 'ms'}
						({metric.rating})
					</span>
				</div>
			{/each}
		</div>
	</div>
{/if}
