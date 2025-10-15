/**
 * Performance monitoring and optimization utilities
 */

interface PerformanceMetrics {
	loadTime: number;
	renderTime: number;
	searchTime: number;
	cacheHitRate: number;
}

class PerformanceMonitor {
	private metrics: PerformanceMetrics = {
		loadTime: 0,
		renderTime: 0,
		searchTime: 0,
		cacheHitRate: 0
	};

	private cacheHits = 0;
	private cacheMisses = 0;

	/**
	 * Measure function execution time
	 */
	async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
		const start = performance.now();
		try {
			const result = await fn();
			const end = performance.now();
			const duration = end - start;

			this.updateMetric(name, duration);
			this.logMetric(name, duration);

			return result;
		} catch (error) {
			const end = performance.now();
			const duration = end - start;
			console.error(`Performance error in ${name}:`, error, `(${duration.toFixed(2)}ms)`);
			throw error;
		}
	}

	/**
	 * Measure synchronous function execution time
	 */
	measureSync<T>(name: string, fn: () => T): T {
		const start = performance.now();
		try {
			const result = fn();
			const end = performance.now();
			const duration = end - start;

			this.updateMetric(name, duration);
			this.logMetric(name, duration);

			return result;
		} catch (error) {
			const end = performance.now();
			const duration = end - start;
			console.error(`Performance error in ${name}:`, error, `(${duration.toFixed(2)}ms)`);
			throw error;
		}
	}

	/**
	 * Record cache hit
	 */
	recordCacheHit(): void {
		this.cacheHits++;
		this.updateCacheHitRate();
	}

	/**
	 * Record cache miss
	 */
	recordCacheMiss(): void {
		this.cacheMisses++;
		this.updateCacheHitRate();
	}

	/**
	 * Get current metrics
	 */
	getMetrics(): PerformanceMetrics {
		return { ...this.metrics };
	}

	/**
	 * Reset all metrics
	 */
	reset(): void {
		this.metrics = {
			loadTime: 0,
			renderTime: 0,
			searchTime: 0,
			cacheHitRate: 0
		};
		this.cacheHits = 0;
		this.cacheMisses = 0;
	}

	/**
	 * Update specific metric
	 */
	private updateMetric(name: string, duration: number): void {
		switch (name) {
			case 'loadTime':
				this.metrics.loadTime = duration;
				break;
			case 'renderTime':
				this.metrics.renderTime = duration;
				break;
			case 'searchTime':
				this.metrics.searchTime = duration;
				break;
		}
	}

	/**
	 * Update cache hit rate
	 */
	private updateCacheHitRate(): void {
		const total = this.cacheHits + this.cacheMisses;
		this.metrics.cacheHitRate = total > 0 ? (this.cacheHits / total) * 100 : 0;
	}

	/**
	 * Log metric to console (only in development)
	 */
	private logMetric(name: string, duration: number): void {
		if (import.meta.env.DEV) {
			console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
		}
	}
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let inThrottle: boolean;
	return (...args: Parameters<T>) => {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
}

/**
 * Memoize function results for expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
	fn: T,
	keyGenerator?: (...args: Parameters<T>) => string
): T {
	const cache = new Map<string, ReturnType<T>>();

	return ((...args: Parameters<T>) => {
		const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

		if (cache.has(key)) {
			performanceMonitor.recordCacheHit();
			return cache.get(key);
		}

		performanceMonitor.recordCacheMiss();
		const result = fn(...args);
		cache.set(key, result);
		return result;
	}) as T;
}
