#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { program } = require('commander');

// Simple token estimation function
function estimateTokens(text) {
  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const lineCount = text.split('\n').length;
  
  const charBasedTokens = Math.floor(charCount / 3.5);
  const wordBasedTokens = Math.floor(wordCount * 1.3);
  const lineBasedTokens = Math.floor(lineCount * 8);
  
  return Math.max(charBasedTokens, wordBasedTokens, lineBasedTokens);
}

function analyzeProject(projectPath = '.', options = {}) {
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
  
  // Analyze INPUT files
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

  // Analyze OUTPUT files
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

function generateFullDevelopmentReport(results, options = {}) {
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
  
  console.log('🧮 FULL DEVELOPMENT COST ANALYSIS');
  console.log('==================================');
  console.log('');
  
  // Current deliverable tokens
  console.log('📊 DELIVERABLE TOKENS (What you have now):');
  console.log(`  📄 INPUT Tokens: ${totalInputTokens.toLocaleString()} (${inputFileCount} files)`);
  console.log(`  🤖 OUTPUT Tokens: ${totalOutputTokens.toLocaleString()} (${outputFileCount} files)`);
  console.log(`  📈 Total Deliverable: ${totalTokens.toLocaleString()} tokens`);
  console.log('');

  // Estimate full development effort
  const estimatedConversationTokens = totalTokens * 3.5; // Conversation usually 3-4x the final code
  const estimatedDebuggingTokens = totalTokens * 1.5;     // Debugging ~1.5x the final code  
  const estimatedIterationTokens = totalTokens * 2.0;     // Multiple versions ~2x final code
  const estimatedDocumentationTokens = totalTokens * 0.8; // Docs/guides ~0.8x final code

  const totalDevelopmentTokens = totalTokens + estimatedConversationTokens + 
                                estimatedDebuggingTokens + estimatedIterationTokens + 
                                estimatedDocumentationTokens;

  console.log('🔧 ESTIMATED FULL DEVELOPMENT EFFORT:');
  console.log(`  📄 Final Deliverable: ${totalTokens.toLocaleString()} tokens`);
  console.log(`  🗣️  Conversation Tokens: ${estimatedConversationTokens.toLocaleString()} tokens (discussions, Q&A)`);
  console.log(`  🐛 Debugging Tokens: ${estimatedDebuggingTokens.toLocaleString()} tokens (fixes, retries)`);
  console.log(`  🔄 Iteration Tokens: ${estimatedIterationTokens.toLocaleString()} tokens (multiple versions)`);
  console.log(`  📝 Documentation Tokens: ${estimatedDocumentationTokens.toLocaleString()} tokens (guides, demos)`);
  console.log('');
  console.log(`  🎯 TOTAL DEVELOPMENT EFFORT: ${totalDevelopmentTokens.toLocaleString()} tokens`);
  console.log('');

  // Cost breakdown
  const inputCostPer1k = 0.01;
  const outputCostPer1k = 0.03;
  
  // Deliverable costs
  const deliverableInputCost = (totalInputTokens / 1000) * inputCostPer1k;
  const deliverableOutputCost = (totalOutputTokens / 1000) * outputCostPer1k;
  const deliverableTotalCost = deliverableInputCost + deliverableOutputCost;
  
  // Full development costs (assuming mix of input/output)
  const fullDevelopmentCost = (totalDevelopmentTokens / 1000) * ((inputCostPer1k + outputCostPer1k) / 2);
  
  console.log('💰 COST COMPARISON:');
  console.log(`  📦 Deliverable Cost (future sessions): $${deliverableTotalCost.toFixed(4)}`);
  console.log(`  🔨 Full Development Cost (what it took to build): $${fullDevelopmentCost.toFixed(4)}`);
  console.log(`  📈 Development Multiplier: ${(fullDevelopmentCost / deliverableTotalCost).toFixed(1)}x more expensive to build than to use`);
  console.log('');

  console.log('🎯 DEVELOPMENT INSIGHTS:');
  console.log(`  • Building this project likely cost $${fullDevelopmentCost.toFixed(2)} in AI tokens`);
  console.log(`  • Using this project for future work costs ~$${deliverableTotalCost.toFixed(2)} per session`);
  console.log(`  • ROI Breakeven: After ~${Math.ceil(fullDevelopmentCost / deliverableTotalCost)} uses, the tool pays for itself`);
  console.log(`  • Development effort was ${(fullDevelopmentCost / deliverableTotalCost).toFixed(1)}x the final deliverable size`);
  console.log('');

  // Standard deliverable breakdown
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
  
  console.log('💡 FULL DEVELOPMENT ANALYSIS NOTES:');
  console.log('  📦 Deliverable tokens = What you send to AI for future work');
  console.log('  🔨 Development tokens = Estimated full effort (conversations, debugging, iterations)');
  console.log('  💰 Development costs are typically 5-10x higher than deliverable size');
  console.log('  🎯 This analysis helps understand true AI development ROI');
}

// CLI setup
program
  .name('full-development-token-counter')
  .description('Count FULL development effort tokens (conversations, debugging, iterations) vs just deliverable')
  .option('-p, --path <path>', 'Project path to analyze', '.')
  .option('-d, --detailed', 'Show detailed file analysis')
  .option('-v, --verbose', 'Show verbose output during analysis')
  .option('-o, --output <file>', 'Save results to JSON file');

program.parse();

const options = program.opts();
const results = analyzeProject(options.path, options);
generateFullDevelopmentReport(results, options);

if (options.output) {
  const estimatedConversationTokens = results.totalTokens * 3.5;
  const estimatedDebuggingTokens = results.totalTokens * 1.5;
  const estimatedIterationTokens = results.totalTokens * 2.0;
  const estimatedDocumentationTokens = results.totalTokens * 0.8;
  const totalDevelopmentTokens = results.totalTokens + estimatedConversationTokens + 
                                estimatedDebuggingTokens + estimatedIterationTokens + 
                                estimatedDocumentationTokens;

  const report = {
    timestamp: new Date().toISOString(),
    projectPath: path.resolve(options.path),
    deliverable: {
      totalFiles: results.fileCount,
      inputFiles: results.inputFileCount,
      outputFiles: results.outputFileCount,
      totalTokens: results.totalTokens,
      inputTokens: results.totalInputTokens,
      outputTokens: results.totalOutputTokens,
      estimatedUsageCost: ((results.totalInputTokens / 1000) * 0.01) + ((results.totalOutputTokens / 1000) * 0.03)
    },
    fullDevelopment: {
      conversationTokens: estimatedConversationTokens,
      debuggingTokens: estimatedDebuggingTokens,
      iterationTokens: estimatedIterationTokens,
      documentationTokens: estimatedDocumentationTokens,
      totalDevelopmentTokens: totalDevelopmentTokens,
      estimatedDevelopmentCost: (totalDevelopmentTokens / 1000) * 0.02,
      developmentMultiplier: totalDevelopmentTokens / results.totalTokens
    },
    inputFiles: results.inputAnalysis,
    outputFiles: results.outputAnalysis,
    allFiles: results.analysis
  };
  
  fs.writeFileSync(options.output, JSON.stringify(report, null, 2));
  console.log(`📄 Full development analysis saved to: ${options.output}`);
}
