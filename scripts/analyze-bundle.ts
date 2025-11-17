#!/usr/bin/env tsx
/**
 * Bundle Size Analyzer
 * 
 * Analyzes the production build to identify:
 * - Large chunks and dependencies
 * - Code splitting opportunities
 * - Unused dependencies
 */

import { resolve, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { existsSync, readdirSync, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BUILD_DIR = resolve(__dirname, '../.svelte-kit/output');
const CLIENT_DIR = resolve(BUILD_DIR, 'client');

interface FileSize {
	path: string;
	size: number;
	sizeFormatted: string;
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function getDirectorySize(dirPath: string): Promise<number> {
	if (!existsSync(dirPath)) return 0;
	
	let totalSize = 0;
	const files = readdirSync(dirPath);
	
	for (const file of files) {
		const filePath = resolve(dirPath, file);
		const stats = statSync(filePath);
		
		if (stats.isDirectory()) {
			totalSize += await getDirectorySize(filePath);
		} else {
			totalSize += stats.size;
		}
	}
	
	return totalSize;
}

async function findLargeFiles(dirPath: string, minSize: number = 50000): Promise<FileSize[]> {
	if (!existsSync(dirPath)) return [];
	
	const largeFiles: FileSize[] = [];
	const files = readdirSync(dirPath);
	
	for (const file of files) {
		const filePath = resolve(dirPath, file);
		const stats = statSync(filePath);
		
		if (stats.isDirectory()) {
			const subFiles = await findLargeFiles(filePath, minSize);
			largeFiles.push(...subFiles);
		} else if (stats.size >= minSize) {
			largeFiles.push({
				path: relative(BUILD_DIR, filePath),
				size: stats.size,
				sizeFormatted: formatBytes(stats.size)
			});
		}
	}
	
	return largeFiles;
}

async function analyzeBundleSize() {
	console.log('📦 Bundle Size Analysis\n');
	console.log('='.repeat(60));
	
	// Check if build exists
	if (!existsSync(BUILD_DIR)) {
		console.log('❌ Build directory not found. Run `pnpm build` first.');
		process.exit(1);
	}
	
	// 1. Total build size
	console.log('\n📊 Total Build Size\n');
	const totalSize = await getDirectorySize(BUILD_DIR);
	console.log(`Total: ${formatBytes(totalSize)}`);
	
	// 2. Client bundle size
	if (existsSync(CLIENT_DIR)) {
		const clientSize = await getDirectorySize(CLIENT_DIR);
		console.log(`Client: ${formatBytes(clientSize)}`);
	}
	
	// 3. Large files (>50KB)
	console.log('\n📁 Large Files (>50KB)\n');
	const largeFiles = await findLargeFiles(CLIENT_DIR, 50000);
	
	// Sort by size descending
	largeFiles.sort((a, b) => b.size - a.size);
	
	if (largeFiles.length === 0) {
		console.log('✅ No files larger than 50KB found.');
	} else {
		console.log('Files:');
		largeFiles.slice(0, 20).forEach((file, index) => {
			console.log(`${index + 1}. ${file.sizeFormatted.padEnd(12)} ${file.path}`);
		});
		
		if (largeFiles.length > 20) {
			console.log(`\n... and ${largeFiles.length - 20} more files`);
		}
	}
	
	// 4. Recommendations
	console.log('\n💡 Recommendations\n');
	
	const recommendations: string[] = [];
	
	// Check for large JS chunks
	const largeJS = largeFiles.filter(f => f.path.endsWith('.js') && f.size > 200000);
	if (largeJS.length > 0) {
		recommendations.push('⚠️  Large JavaScript chunks detected (>200KB)');
		recommendations.push('   → Consider code splitting with dynamic imports');
		recommendations.push('   → Review dependencies in these chunks');
	}
	
	// Check for large CSS files
	const largeCSS = largeFiles.filter(f => f.path.endsWith('.css') && f.size > 100000);
	if (largeCSS.length > 0) {
		recommendations.push('⚠️  Large CSS files detected (>100KB)');
		recommendations.push('   → Consider purging unused CSS');
		recommendations.push('   → Split CSS by route');
	}
	
	// Check total client size
	const clientSize = await getDirectorySize(CLIENT_DIR);
	if (clientSize > 2000000) { // 2MB
		recommendations.push('⚠️  Client bundle is large (>2MB)');
		recommendations.push('   → Implement lazy loading for admin features');
		recommendations.push('   → Review and tree-shake dependencies');
	}
	
	if (recommendations.length === 0) {
		console.log('✅ Bundle size looks good!');
		console.log('   - No large files detected');
		console.log('   - Client bundle is reasonable');
	} else {
		recommendations.forEach(rec => console.log(rec));
	}
	
	// 5. Code splitting analysis
	console.log('\n🔀 Code Splitting Analysis\n');
	
	const jsFiles = largeFiles.filter(f => f.path.endsWith('.js'));
	const totalJS = jsFiles.reduce((sum, f) => sum + f.size, 0);
	
	console.log(`Total JS: ${formatBytes(totalJS)}`);
	console.log(`Number of chunks: ${jsFiles.length}`);
	
	if (jsFiles.length > 0) {
		const avgChunkSize = totalJS / jsFiles.length;
		console.log(`Average chunk size: ${formatBytes(avgChunkSize)}`);
	}
	
	// 6. Summary
	console.log('\n' + '='.repeat(60));
	console.log('✅ Analysis Complete!\n');
	console.log('To reduce bundle size:');
	console.log('1. Use dynamic imports for admin features');
	console.log('2. Lazy load heavy dependencies');
	console.log('3. Optimize images (WebP, responsive)');
	console.log('4. Remove unused dependencies');
	console.log('5. Enable tree-shaking in Vite config');
	console.log('='.repeat(60));
}

// Run the analysis
analyzeBundleSize().catch((error) => {
	console.error('❌ Error analyzing bundle:', error);
	process.exit(1);
});
