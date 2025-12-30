#!/usr/bin/env tsx

/**
 * Script to run comprehensive parity validation
 */

import { ParityValidationFramework } from '../src/testing/parityValidationFramework.js';

async function main() {
  console.log('Starting comprehensive parity validation...');
  
  const framework = new ParityValidationFramework();
  
  try {
    const report = await framework.runValidation({
      includeSpotTest: true,
      spotTestCommands: 50,
      verbose: true
    });
    
    console.log('\n' + framework.generateDetailedReport(report));
    
    const stats = framework.getSummaryStats(report);
    console.log('\nSUMMARY STATISTICS:');
    console.log(`Parity Score: ${stats.parityScore.toFixed(1)}%`);
    console.log(`Fixed Issues: ${stats.fixedIssues}/${stats.totalIssues}`);
    console.log(`Critical Issues: ${stats.criticalIssues}`);
    console.log(`Regression Issues: ${stats.regressionIssues}`);
    if (stats.spotTestParity) {
      console.log(`Spot Test Parity: ${stats.spotTestParity.toFixed(1)}%`);
    }
    
    // Exit with appropriate code
    const success = stats.parityScore >= 95 && stats.criticalIssues === 0;
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('Error running parity validation:', error);
    process.exit(2);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(2);
});