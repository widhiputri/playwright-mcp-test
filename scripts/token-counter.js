#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { program } = require('commander');

// Simple token estimation function
function estimateTokens(text) {
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

function analyzeProject(projectPath = '.', options = {}) {
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
    '**/*.generated.ts',
    '**/*.generated.js'
  ];
  
  
  console.log('🔍 Analyzing INPUT tokens (your existing code)...');
  console.log('🤖 Analyzing OUTPUT tokens (AI-generated code)...');
  console.log(`📁 Project Path: ${path.resolve(projectPath)}`);
  console.log('');
  
  // Analyze INPUT files (your existing code)
  const inputFiles = glob.sync(inputPatterns, { 
    cwd: projectPath,
    ignore: excludePatterns 
  });
  const inputAnalysis = [];
  let totalInputTokens = 0;
  
  inputFiles.forEach(file => {
    try {
      const filePath = path.join(projectPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const tokens = estimateTokens(content);
      totalInputTokens += tokens;
      
      const fileInfo = {
        name: path.basename(file),
        relativePath: file,
        lines: content.split('\n').length,
        characters: content.length,
        estimatedTokens: tokens,
        fileType: path.extname(file),
        tokenType: 'INPUT'
      };
      
      inputAnalysis.push(fileInfo);
      
      if (options.verbose && tokens > 1000) {
        console.log(`📄 INPUT ${fileInfo.name}: ${tokens.toLocaleString()} tokens`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not analyze INPUT file: ${file}`);
    }
  });

  // Analyze OUTPUT files (AI-generated code)
  const outputFiles = glob.sync(outputPatterns, { 
    cwd: projectPath,
    ignore: ['node_modules/**']
  });
  const outputAnalysis = [];
  let totalOutputTokens = 0;
  
  outputFiles.forEach(file => {
    try {
      const filePath = path.join(projectPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const tokens = estimateTokens(content);
      totalOutputTokens += tokens;
      
      const fileInfo = {
        name: path.basename(file),
        relativePath: file,
        lines: content.split('\n').length,
        characters: content.length,
        estimatedTokens: tokens,
        fileType: path.extname(file),
        tokenType: 'OUTPUT'
      };
      
      outputAnalysis.push(fileInfo);
      
      if (options.verbose && tokens > 500) {
        console.log(`🤖 OUTPUT ${fileInfo.name}: ${tokens.toLocaleString()} tokens`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not analyze OUTPUT file: ${file}`);
    }
  });
  
  const allAnalysis = [...inputAnalysis, ...outputAnalysis];
  
  return {
    totalInputTokens,
    totalOutputTokens,
    totalTokens: totalInputTokens + totalOutputTokens,
    inputFileCount: inputAnalysis.length,
    outputFileCount: outputAnalysis.length,
    fileCount: allAnalysis.length,
    inputAnalysis: inputAnalysis.sort((a, b) => b.estimatedTokens - a.estimatedTokens),
    outputAnalysis: outputAnalysis.sort((a, b) => b.estimatedTokens - a.estimatedTokens),
    analysis: allAnalysis.sort((a, b) => b.estimatedTokens - a.estimatedTokens)
  };
}

function generateReport(results, options = {}) {
  const { 
    totalInputTokens, 
    totalOutputTokens, 
    totalTokens, 
    inputFileCount, 
    outputFileCount, 
    fileCount, 
    inputAnalysis, 
    outputAnalysis, 
    analysis 
  } = results;
  
  console.log('🧮 INPUT/OUTPUT TOKEN ANALYSIS');
  console.log('===============================');
  console.log('');
  
  // INPUT/OUTPUT Summary
  console.log('📊 TOKEN BREAKDOWN:');
  console.log(`  📄 INPUT Tokens (your existing code): ${totalInputTokens.toLocaleString()} (${inputFileCount} files)`);
  console.log(`  🤖 OUTPUT Tokens (AI-generated code): ${totalOutputTokens.toLocaleString()} (${outputFileCount} files)`);
  console.log(`  📈 TOTAL Project Tokens: ${totalTokens.toLocaleString()} (${fileCount} files)`);
  console.log('');

  // Cost Estimation  
  const inputCostPer1k = 0.01;  // Example: $0.01 per 1k input tokens
  const outputCostPer1k = 0.03; // Example: $0.03 per 1k output tokens (typically 2-3x higher)
  
  const estimatedInputCost = (totalInputTokens / 1000) * inputCostPer1k;
  const estimatedOutputCost = (totalOutputTokens / 1000) * outputCostPer1k;
  const totalEstimatedCost = estimatedInputCost + estimatedOutputCost;
  
  console.log('💰 ESTIMATED COSTS (GPT-4 example rates):');
  console.log(`  📄 INPUT Cost: $${estimatedInputCost.toFixed(4)} (${totalInputTokens.toLocaleString()} × $0.01/1k)`);
  console.log(`  🤖 OUTPUT Cost: $${estimatedOutputCost.toFixed(4)} (${totalOutputTokens.toLocaleString()} × $0.03/1k)`);
  console.log(`  💸 TOTAL Session Cost: $${totalEstimatedCost.toFixed(4)}`);
  console.log('');
  
  // INPUT file breakdown
  if (inputAnalysis.length > 0) {
    const inputByType = inputAnalysis.reduce((acc, file) => {
      const type = file.fileType || 'no-extension';
      if (!acc[type]) acc[type] = { count: 0, tokens: 0 };
      acc[type].count++;
      acc[type].tokens += file.estimatedTokens;
      return acc;
    }, {});
    
    console.log('📄 INPUT FILES BY TYPE:');
    Object.entries(inputByType)
      .sort((a, b) => b[1].tokens - a[1].tokens)
      .forEach(([type, data]) => {
        console.log(`  ${type}: ${data.count} files, ${data.tokens.toLocaleString()} tokens`);
      });
    console.log('');
  }

  // OUTPUT file breakdown  
  if (outputAnalysis.length > 0) {
    const outputByType = outputAnalysis.reduce((acc, file) => {
      const type = file.fileType || 'no-extension';
      if (!acc[type]) acc[type] = { count: 0, tokens: 0 };
      acc[type].count++;
      acc[type].tokens += file.estimatedTokens;
      return acc;
    }, {});
    
    console.log('🤖 OUTPUT FILES BY TYPE (AI-Generated):');
    Object.entries(outputByType)
      .sort((a, b) => b[1].tokens - a[1].tokens)
      .forEach(([type, data]) => {
        console.log(`  ${type}: ${data.count} files, ${data.tokens.toLocaleString()} tokens`);
      });
    console.log('');
  }
  
  console.log('🔥 TOP 10 TOKEN-HEAVY FILES:');
  analysis.slice(0, 10).forEach(file => {
    const typeIcon = file.tokenType === 'INPUT' ? '📄' : '🤖';
    console.log(`  ${typeIcon} ${file.name}: ${file.estimatedTokens.toLocaleString()} tokens (${file.lines} lines)`);
  });
  console.log('');
  
  if (options.detailed) {
    console.log('📋 DETAILED FILE ANALYSIS:');
    console.log('📄 INPUT FILES (Your Existing Code):');
    inputAnalysis.forEach(file => {
      console.log(`  ${file.relativePath}`);
      console.log(`    Lines: ${file.lines.toLocaleString()} | Characters: ${file.characters.toLocaleString()} | Tokens: ${file.estimatedTokens.toLocaleString()}`);
    });
    
    if (outputAnalysis.length > 0) {
      console.log('');
      console.log('🤖 OUTPUT FILES (AI-Generated Code):');
      outputAnalysis.forEach(file => {
        console.log(`  ${file.relativePath}`);
        console.log(`    Lines: ${file.lines.toLocaleString()} | Characters: ${file.characters.toLocaleString()} | Tokens: ${file.estimatedTokens.toLocaleString()}`);
      });
    }
    console.log('');
  }
  
  console.log('💡 TOKEN USAGE NOTES:');
  console.log('  📄 INPUT tokens = Content you send TO the AI (your existing code)');
  console.log('  🤖 OUTPUT tokens = Content AI sends back (generated code, explanations)');
  console.log('  💰 OUTPUT tokens typically cost 2-3x more than INPUT tokens');
  console.log('  📊 Use for session planning and budget estimation');
}

// CLI setup
program
  .name('token-counter')
  .description('Count INPUT and OUTPUT tokens in your project (helps estimate AI session costs)')
  .option('-p, --path <path>', 'Project path to analyze', '.')
  .option('-d, --detailed', 'Show detailed file analysis')
  .option('-v, --verbose', 'Show verbose output during analysis')
  .option('-o, --output <file>', 'Save results to JSON file');

program.parse();

const options = program.opts();
const results = analyzeProject(options.path, options);
generateReport(results, options);

if (options.output) {
  const report = {
    timestamp: new Date().toISOString(),
    projectPath: path.resolve(options.path),
    summary: {
      totalFiles: results.fileCount,
      inputFiles: results.inputFileCount,
      outputFiles: results.outputFileCount,
      totalTokens: results.totalTokens,
      inputTokens: results.totalInputTokens,
      outputTokens: results.totalOutputTokens,
      estimatedCost: {
        inputCost: (results.totalInputTokens / 1000) * 0.01,
        outputCost: (results.totalOutputTokens / 1000) * 0.03,
        totalCost: ((results.totalInputTokens / 1000) * 0.01) + ((results.totalOutputTokens / 1000) * 0.03)
      }
    },
    inputFiles: results.inputAnalysis,
    outputFiles: results.outputAnalysis,
    allFiles: results.analysis
  };
  
  fs.writeFileSync(options.output, JSON.stringify(report, null, 2));
  console.log(`📄 Results saved to: ${options.output}`);
}
