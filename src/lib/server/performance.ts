/**
 * Performance Monitoring Utilities
 * 
 * Track and log performance metrics:
 * - Query execution time
 * - Cache hit rates
 * - Response times
 * - Core Web Vitals (client-side)
 */

interface PerformanceMetric {
	name: string;
	duration: number;
	timestamp: number;
	metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
	private metrics: PerformanceMetric[] = [];
	private readonly maxMetrics = 1000; // Keep last 1000 metrics

	/**
	 * Measure execution time of an async function
	 */
	async measure<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, unknown>): Promise<T> {
		const start = performance.now();
		
		try {
			const result = await fn();
			const duration = performance.now() - start;
			
			this.record({
				name,
				duration,
				timestamp: Date.now(),
				metadata
			});
			
			// Log slow operations (>100ms)
			if (duration > 100) {
				console.warn(`⚠️ Slow operation: ${name} took ${duration.toFixed(2)}ms`, metadata);
			}
			
			return result;
		} catch (error) {
			const duration = performance.now() - start;
			
			this.record({
				name: `${name} (error)`,
				duration,
				timestamp: Date.now(),
				metadata: { ...metadata, error: String(error) }
			});
			
			throw error;
		}
	}

	/**
	 * Record a performance metric
	 */
	private record(metric: PerformanceMetric): void {
		this.metrics.push(metric);
		
		// Trim to max size
		if (this.metrics.length > this.maxMetrics) {
			this.metrics = this.metrics.slice(-this.maxMetrics);
		}
	}

	/**
	 * Get statistics for a specific metric name
	 */
	getStats(name: string): {
		count: number;
		min: number;
		max: number;
		avg: number;
		p50: number;
		p95: number;
		p99: number;
	} | null {
		const metrics = this.metrics.filter(m => m.name === name);
		
		if (metrics.length === 0) return null;
		
		const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
		const sum = durations.reduce((acc, d) => acc + d, 0);
		
		return {
			count: metrics.length,
			min: durations[0],
			max: durations[durations.length - 1],
			avg: sum / metrics.length,
			p50: durations[Math.floor(durations.length * 0.5)],
			p95: durations[Math.floor(durations.length * 0.95)],
			p99: durations[Math.floor(durations.length * 0.99)]
		};
	}

	/**
	 * Get all recorded metrics
	 */
	getAllMetrics(): PerformanceMetric[] {
		return [...this.metrics];
	}

	/**
	 * Get metrics for last N minutes
	 */
	getRecentMetrics(minutes: number = 5): PerformanceMetric[] {
		const cutoff = Date.now() - (minutes * 60 * 1000);
		return this.metrics.filter(m => m.timestamp >= cutoff);
	}

	/**
	 * Get summary of all operations
	 */
	getSummary(): Record<string, { count: number; avgDuration: number }> {
		const summary: Record<string, { count: number; totalDuration: number; avgDuration: number }> = {};
		
		for (const metric of this.metrics) {
			if (!summary[metric.name]) {
				summary[metric.name] = { count: 0, totalDuration: 0, avgDuration: 0 };
			}
			
			summary[metric.name].count++;
			summary[metric.name].totalDuration += metric.duration;
		}
		
		// Calculate averages
		for (const name in summary) {
			summary[name].avgDuration = summary[name].totalDuration / summary[name].count;
		}
		
		return Object.fromEntries(
			Object.entries(summary).map(([name, data]) => [
				name,
				{ count: data.count, avgDuration: data.avgDuration }
			])
		);
	}

	/**
	 * Clear all metrics
	 */
	clear(): void {
		this.metrics = [];
	}

	/**
	 * Log performance summary
	 */
	logSummary(): void {
		const summary = this.getSummary();
		const entries = Object.entries(summary);
		
		if (entries.length === 0) {
			console.log('No performance metrics recorded');
			return;
		}
		
		console.log('\n📊 Performance Summary\n');
		console.log('='.repeat(70));
		console.log('Operation'.padEnd(40) + 'Count'.padEnd(10) + 'Avg Time');
		console.log('-'.repeat(70));
		
		entries
			.sort((a, b) => b[1].avgDuration - a[1].avgDuration)
			.forEach(([name, data]) => {
				console.log(
					name.padEnd(40) + 
					String(data.count).padEnd(10) + 
					`${data.avgDuration.toFixed(2)}ms`
				);
			});
		
		console.log('='.repeat(70));
	}
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Helper function to measure database queries
 */
export async function measureQuery<T>(
	name: string,
	query: () => Promise<T>,
	metadata?: Record<string, unknown>
): Promise<T> {
	return performanceMonitor.measure(`db:${name}`, query, metadata);
}

/**
 * Helper function to measure cache operations
 */
export async function measureCache<T>(
	operation: 'get' | 'set',
	key: string,
	fn: () => Promise<T>
): Promise<T> {
	return performanceMonitor.measure(`cache:${operation}`, fn, { key });
}

/**
 * Cache statistics tracker
 */
export class CacheStatsTracker {
	private hits = 0;
	private misses = 0;
	private sets = 0;

	recordHit(): void {
		this.hits++;
	}

	recordMiss(): void {
		this.misses++;
	}

	recordSet(): void {
		this.sets++;
	}

	getHitRate(): number {
		const total = this.hits + this.misses;
		return total === 0 ? 0 : (this.hits / total) * 100;
	}

	getStats() {
		return {
			hits: this.hits,
			misses: this.misses,
			sets: this.sets,
			hitRate: this.getHitRate(),
			total: this.hits + this.misses
		};
	}

	reset(): void {
		this.hits = 0;
		this.misses = 0;
		this.sets = 0;
	}
}

// Global cache stats
export const cacheStats = new CacheStatsTracker();
