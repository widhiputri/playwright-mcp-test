#!/usr/bin/env node

/**
 * Token Counter Utility
 * 
 * This script analyzes the project to estimate token usage for AI model interactions.
 * Useful for understanding context size requirements and costs.
 * 
 * Usage:
 *   npm run token-count
 *   npm run token-count -- --include-output
 *   npx ts-node scripts/token-counter.ts --verbose
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { program } from 'commander';

interface AnalysisOptions {
  includeOutput?: boolean;
  verbose?: boolean;
  projectPath?: string;
}

interface TokenStats {
  fileCount: number;
  totalTokens: number;
  totalCharacters: number;
  totalLines: number;
  fileBreakdown: Array<{
    file: string;
    tokens: number;
    chars: number;
    lines: number;
  }>;
}

// Simple token estimation function
function estimateTokens(text: string): number {
  // Multiple estimation methods
  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const lineCount = text.split('\n').length;
  
  // Different estimation approaches
  const charBasedTokens = Math.floor(charCount / 3.5); // ~3.5 chars per token for code
  const wordBasedTokens = Math.floor(wordCount * 1.3); // Code has more tokens per word
  const lineBasedTokens = Math.floor(lineCount * 8);   // ~8 tokens per line of code
  
  // Use the highest estimate for safety
  return Math.max(charBasedTokens, wordBasedTokens, lineBasedTokens);
}

function analyzeProject(projectPath: string = '.', options: AnalysisOptions = {}): TokenStats {
  const inputPatterns = [
    '**/*.ts',
    '**/*.js', 
    '**/*.feature',
    '**/*.md',
    '**/*.json',
    '**/*.yml',
    '**/*.yaml'
  ];
  
  const excludePatterns = [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    '**/generated/**',
    '**/output/**'
  ];
  
  const outputPatterns = [
    '**/generated/**/*.ts',
    '**/generated/**/*.js',
    '**/output/**/*.ts',
    '**/output/**/*.js',
    '**/*-generated.ts',
    '**/*-generated.js',
    '**/playwright-report/**',
    '**/test-results/**'
  ];

  // Build file patterns to include
  const patternsToInclude = inputPatterns;
  if (options.includeOutput) {
    patternsToInclude.push(...outputPatterns);
  }

  const stats: TokenStats = {
    fileCount: 0,
    totalTokens: 0,
    totalCharacters: 0,
    totalLines: 0,
    fileBreakdown: []
  };

  const globOptions = {
    cwd: projectPath,
    ignore: excludePatterns,
    absolute: true
  };

  for (const pattern of patternsToInclude) {
    const files = glob.sync(pattern, globOptions);
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const tokens = estimateTokens(content);
        const chars = content.length;
        const lines = content.split('\n').length;
        
        stats.fileCount++;
        stats.totalTokens += tokens;
        stats.totalCharacters += chars;
        stats.totalLines += lines;
        
        const relativePath = path.relative(projectPath, file);
        stats.fileBreakdown.push({
          file: relativePath,
          tokens,
          chars,
          lines
        });
        
        if (options.verbose) {
          console.log(`📄 ${relativePath}: ${tokens.toLocaleString()} tokens`);
        }
      } catch (error: any) {
        console.error(`❌ Error reading ${file}:`, error.message);
      }
    }
  }

  return stats;
}

function formatStats(stats: TokenStats, options: AnalysisOptions = {}): void {
  console.log('\n🔢 Token Analysis Report');
  console.log('========================');
  
  console.log(`📊 Project Statistics:`);
  console.log(`   Files analyzed: ${stats.fileCount.toLocaleString()}`);
  console.log(`   Total tokens: ${stats.totalTokens.toLocaleString()}`);
  console.log(`   Total characters: ${stats.totalCharacters.toLocaleString()}`);
  console.log(`   Total lines: ${stats.totalLines.toLocaleString()}`);
  
  const avgTokensPerFile = stats.fileCount > 0 ? Math.round(stats.totalTokens / stats.fileCount) : 0;
  console.log(`   Average tokens/file: ${avgTokensPerFile.toLocaleString()}`);
  
  console.log(`\n💰 Estimated Costs (approximate):`);
  console.log(`   OpenAI GPT-4 input: $${((stats.totalTokens / 1000) * 0.03).toFixed(3)}`);
  console.log(`   OpenAI GPT-4 output: $${((stats.totalTokens / 1000) * 0.06).toFixed(3)}`);
  console.log(`   Claude-3 Opus: $${((stats.totalTokens / 1000) * 0.015).toFixed(3)}`);
  
  console.log(`\n🔍 Context Window Analysis:`);
  const gpt4Context = 128000;
  const claudeContext = 200000;
  console.log(`   GPT-4 context usage: ${((stats.totalTokens / gpt4Context) * 100).toFixed(1)}%`);
  console.log(`   Claude-3 context usage: ${((stats.totalTokens / claudeContext) * 100).toFixed(1)}%`);
  
  if (options.verbose) {
    console.log(`\n📁 Top 10 Files by Token Count:`);
    const sorted = stats.fileBreakdown
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 10);
    
    sorted.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.file}: ${file.tokens.toLocaleString()} tokens`);
    });
  }
  
  console.log(`\n💡 Recommendations:`);
  if (stats.totalTokens > 50000) {
    console.log(`   ⚠️  Large project - consider chunking for AI interactions`);
  }
  if (stats.totalTokens > 100000) {
    console.log(`   ⚠️  Very large project - use semantic search for focused analysis`);
  }
  if (stats.fileCount > 100) {
    console.log(`   💡 Many files - use file filtering for targeted analysis`);
  }
  
  console.log('\n📌 Note: Token estimates are approximate. Actual usage may vary.\n');
}

// CLI setup
program
  .name('token-counter')
  .description('Analyze project token usage for AI model interactions')
  .version('1.0.0')
  .option('--include-output', 'include generated/output files in analysis')
  .option('-v, --verbose', 'show detailed file breakdown')
  .option('--path <path>', 'project path to analyze', '.')
  .action((options) => {
    console.log('🚀 Starting project token analysis...');
    
    const stats = analyzeProject(options.path, {
      includeOutput: options.includeOutput,
      verbose: options.verbose,
      projectPath: options.path
    });
    
    formatStats(stats, options);
  });

if (require.main === module) {
  program.parse();
}

export { analyzeProject, estimateTokens, TokenStats };
