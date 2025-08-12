#!/usr/bin/env node

/**
 * Full Development Token Counter
 * 
 * This script analyzes both input (existing) and output (generated) code
 * to estimate the full development token usage and costs for AI-assisted development.
 * 
 * Usage:
 *   npm run full-token-count
 *   npm run full-token-count -- --verbose
 *   npx ts-node scripts/full-development-token-counter.ts --path ./src
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { program } from 'commander';

interface DevelopmentOptions {
  verbose?: boolean;
  projectPath?: string;
}

interface FileAnalysis {
  file: string;
  tokens: number;
  chars: number;
  lines: number;
}

interface DevelopmentStats {
  input: {
    fileCount: number;
    totalTokens: number;
    totalCharacters: number;
    totalLines: number;
    files: FileAnalysis[];
  };
  output: {
    fileCount: number;
    totalTokens: number;
    totalCharacters: number;
    totalLines: number;
    files: FileAnalysis[];
  };
  combined: {
    fileCount: number;
    totalTokens: number;
    totalCharacters: number;
    totalLines: number;
  };
}

// Simple token estimation function
function estimateTokens(text: string): number {
  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const lineCount = text.split('\n').length;
  
  const charBasedTokens = Math.floor(charCount / 3.5);
  const wordBasedTokens = Math.floor(wordCount * 1.3);
  const lineBasedTokens = Math.floor(lineCount * 8);
  
  return Math.max(charBasedTokens, wordBasedTokens, lineBasedTokens);
}

function analyzeProject(projectPath: string = '.', options: DevelopmentOptions = {}): DevelopmentStats {
  const inputPatterns = [
    '**/*.ts', '**/*.js', '**/*.feature', '**/*.md', '**/*.json', '**/*.yml', '**/*.yaml'
  ];
  
  const excludePatterns = [
    'node_modules/**', '.git/**', 'dist/**', 'build/**', '**/generated/**', '**/output/**'
  ];
  
  const outputPatterns = [
    '**/generated/**/*.ts', '**/generated/**/*.js', '**/output/**/*.ts', '**/output/**/*.js',
    '**/*-generated.ts', '**/*-generated.js', '**/*.generated.ts', '**/*.generated.js'
  ];

  console.log('🔍 Analyzing INPUT tokens (your existing code)...');
  console.log('🤖 Analyzing OUTPUT tokens (AI-generated code)...');
  console.log(`📁 Project Path: ${path.resolve(projectPath)}`);
  console.log('');
  
  const stats: DevelopmentStats = {
    input: { fileCount: 0, totalTokens: 0, totalCharacters: 0, totalLines: 0, files: [] },
    output: { fileCount: 0, totalTokens: 0, totalCharacters: 0, totalLines: 0, files: [] },
    combined: { fileCount: 0, totalTokens: 0, totalCharacters: 0, totalLines: 0 }
  };

  // Analyze INPUT files
  const inputFiles = glob.sync(inputPatterns, { 
    cwd: projectPath,
    ignore: excludePatterns 
  });
  
  inputFiles.forEach(file => {
    try {
      const filePath = path.join(projectPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const tokens = estimateTokens(content);
      const chars = content.length;
      const lines = content.split('\n').length;
      
      stats.input.fileCount++;
      stats.input.totalTokens += tokens;
      stats.input.totalCharacters += chars;
      stats.input.totalLines += lines;
      
      stats.input.files.push({ file, tokens, chars, lines });
      
      if (options.verbose) {
        console.log(`📄 INPUT: ${file}: ${tokens.toLocaleString()} tokens`);
      }
    } catch (error: any) {
      console.error(`❌ Error reading INPUT file ${file}:`, error.message);
    }
  });

  // Analyze OUTPUT files (generated/AI-created)
  const outputFiles = glob.sync(outputPatterns, { cwd: projectPath });
  
  outputFiles.forEach(file => {
    try {
      const filePath = path.join(projectPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const tokens = estimateTokens(content);
      const chars = content.length;
      const lines = content.split('\n').length;
      
      stats.output.fileCount++;
      stats.output.totalTokens += tokens;
      stats.output.totalCharacters += chars;
      stats.output.totalLines += lines;
      
      stats.output.files.push({ file, tokens, chars, lines });
      
      if (options.verbose) {
        console.log(`🤖 OUTPUT: ${file}: ${tokens.toLocaleString()} tokens`);
      }
    } catch (error: any) {
      console.error(`❌ Error reading OUTPUT file ${file}:`, error.message);
    }
  });

  // Calculate combined stats
  stats.combined.fileCount = stats.input.fileCount + stats.output.fileCount;
  stats.combined.totalTokens = stats.input.totalTokens + stats.output.totalTokens;
  stats.combined.totalCharacters = stats.input.totalCharacters + stats.output.totalCharacters;
  stats.combined.totalLines = stats.input.totalLines + stats.output.totalLines;

  return stats;
}

function formatDevelopmentStats(stats: DevelopmentStats, options: DevelopmentOptions = {}): void {
  console.log('\n🚀 FULL DEVELOPMENT TOKEN ANALYSIS');
  console.log('==================================');
  
  console.log(`\n📊 INPUT ANALYSIS (Your Existing Code):`);
  console.log(`   Files: ${stats.input.fileCount.toLocaleString()}`);
  console.log(`   Tokens: ${stats.input.totalTokens.toLocaleString()}`);
  console.log(`   Characters: ${stats.input.totalCharacters.toLocaleString()}`);
  console.log(`   Lines: ${stats.input.totalLines.toLocaleString()}`);
  
  console.log(`\n🤖 OUTPUT ANALYSIS (AI-Generated Code):`);
  console.log(`   Files: ${stats.output.fileCount.toLocaleString()}`);
  console.log(`   Tokens: ${stats.output.totalTokens.toLocaleString()}`);
  console.log(`   Characters: ${stats.output.totalCharacters.toLocaleString()}`);
  console.log(`   Lines: ${stats.output.totalLines.toLocaleString()}`);
  
  console.log(`\n📈 COMBINED TOTALS:`);
  console.log(`   Total files: ${stats.combined.fileCount.toLocaleString()}`);
  console.log(`   Total tokens: ${stats.combined.totalTokens.toLocaleString()}`);
  console.log(`   Total characters: ${stats.combined.totalCharacters.toLocaleString()}`);
  console.log(`   Total lines: ${stats.combined.totalLines.toLocaleString()}`);
  
  // Development efficiency metrics
  if (stats.input.totalTokens > 0 && stats.output.totalTokens > 0) {
    const generationRatio = (stats.output.totalTokens / stats.input.totalTokens);
    console.log(`\n⚡ DEVELOPMENT EFFICIENCY:`);
    console.log(`   AI Generation Ratio: ${generationRatio.toFixed(2)}x`);
    console.log(`   Input vs Output: ${(stats.input.totalTokens / stats.combined.totalTokens * 100).toFixed(1)}% input, ${(stats.output.totalTokens / stats.combined.totalTokens * 100).toFixed(1)}% generated`);
  }
  
  // Cost analysis
  console.log(`\n💰 ESTIMATED DEVELOPMENT COSTS:`);
  
  console.log(`\n   INPUT COSTS (Context + Analysis):`);
  console.log(`     GPT-4 processing: $${((stats.input.totalTokens / 1000) * 0.03).toFixed(3)}`);
  console.log(`     Claude-3 processing: $${((stats.input.totalTokens / 1000) * 0.015).toFixed(3)}`);
  
  console.log(`\n   OUTPUT COSTS (Code Generation):`);
  console.log(`     GPT-4 generation: $${((stats.output.totalTokens / 1000) * 0.06).toFixed(3)}`);
  console.log(`     Claude-3 generation: $${((stats.output.totalTokens / 1000) * 0.075).toFixed(3)}`);
  
  console.log(`\n   TOTAL PROJECT COSTS:`);
  const totalGpt4Cost = ((stats.input.totalTokens / 1000) * 0.03) + ((stats.output.totalTokens / 1000) * 0.06);
  const totalClaudeCost = ((stats.input.totalTokens / 1000) * 0.015) + ((stats.output.totalTokens / 1000) * 0.075);
  console.log(`     GPT-4 total: $${totalGpt4Cost.toFixed(3)}`);
  console.log(`     Claude-3 total: $${totalClaudeCost.toFixed(3)}`);
  
  // Context analysis
  console.log(`\n🔍 CONTEXT WINDOW ANALYSIS:`);
  const gpt4Context = 128000;
  const claudeContext = 200000;
  console.log(`   GPT-4 context usage: ${((stats.combined.totalTokens / gpt4Context) * 100).toFixed(1)}%`);
  console.log(`   Claude-3 context usage: ${((stats.combined.totalTokens / claudeContext) * 100).toFixed(1)}%`);
  
  if (options.verbose && (stats.input.files.length > 0 || stats.output.files.length > 0)) {
    console.log(`\n📁 TOP FILES BY TOKEN COUNT:`);
    
    const allFiles = [...stats.input.files.map(f => ({...f, type: 'INPUT'})), 
                     ...stats.output.files.map(f => ({...f, type: 'OUTPUT'}))];
    const topFiles = allFiles.sort((a, b) => b.tokens - a.tokens).slice(0, 15);
    
    topFiles.forEach((file, index) => {
      const icon = file.type === 'INPUT' ? '📄' : '🤖';
      console.log(`   ${index + 1}. ${icon} ${file.file}: ${file.tokens.toLocaleString()} tokens`);
    });
  }
  
  console.log(`\n🎯 DEVELOPMENT INSIGHTS:`);
  if (stats.output.totalTokens > stats.input.totalTokens * 2) {
    console.log(`   ✨ High AI productivity - Generated ${(stats.output.totalTokens / stats.input.totalTokens).toFixed(1)}x more code than input`);
  }
  if (stats.combined.totalTokens > 100000) {
    console.log(`   📋 Large-scale project - Consider chunked development approach`);
  }
  if (stats.output.fileCount > stats.input.fileCount) {
    console.log(`   🏗️  Expansion project - AI generated more files than original codebase`);
  }
  
  console.log(`\n📌 Note: Token and cost estimates are approximate. Actual usage may vary based on model, prompt complexity, and interaction patterns.\n`);
}

// CLI setup
program
  .name('full-development-token-counter')
  .description('Analyze full development token usage including input and AI-generated output')
  .version('1.0.0')
  .option('-v, --verbose', 'show detailed file breakdown')
  .option('--path <path>', 'project path to analyze', '.')
  .action((options) => {
    console.log('🚀 Starting full development token analysis...');
    
    const stats = analyzeProject(options.path, {
      verbose: options.verbose,
      projectPath: options.path
    });
    
    formatDevelopmentStats(stats, options);
  });

if (require.main === module) {
  program.parse();
}

export { analyzeProject, estimateTokens, DevelopmentStats, FileAnalysis };
