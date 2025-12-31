#!/usr/bin/env tsx
/**
 * Generate Parity Certification Document
 * 
 * This script generates the PARITY_CERTIFICATION.md document based on
 * actual parity validation results from running the exhaustive validator.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import {
  createCertificationGenerator,
} from '../src/testing/certificationGenerator.js';
import {
  createExhaustiveParityValidator,
} from '../src/testing/exhaustiveParityValidator.js';

/**
 * Check if Z-Machine is available for validation
 * Requirements: 5.3
 */
async function checkZMachineAvailability(): Promise<boolean> {
  const validator = createExhaustiveParityValidator();
  return await validator.initialize();
}

/**
 * Run actual parity validation and return results
 * Requirements: 5.1, 5.2
 */
async function runActualValidation() {
  const validator = createExhaustiveParityValidator({
    commandsPerSeed: 100, // Use fewer commands for faster certification generation
  });

  // Load default command sequences
  validator.loadDefaultSequences();

  // Initialize Z-Machine recorder
  const zmAvailable = await validator.initialize();
  if (!zmAvailable) {
    return null;
  }

  // Run validation with all configured seeds
  const results = await validator.runWithSeeds();
  return results;
}

async function main(): Promise<void> {
  console.log('Generating Parity Certification...\n');

  // Check Z-Machine availability first (Requirement 5.3)
  console.log('Checking Z-Machine availability...');
  const zmAvailable = await checkZMachineAvailability();
  
  if (!zmAvailable) {
    console.error('\n❌ ERROR: Z-Machine interpreter is not available.');
    console.error('Certification cannot be generated without Z-Machine comparison.');
    console.error('\nTo fix this:');
    console.error('  1. Install dfrotz: brew install frotz (macOS) or apt install frotz (Linux)');
    console.error('  2. Set ZORK_INTERPRETER_PATH environment variable to your interpreter path');
    console.error('  3. Ensure reference/COMPILED/zork1.z3 exists in the project root');
    process.exit(1);
  }

  console.log('✓ Z-Machine available\n');

  // Run actual validation (Requirements 5.1, 5.2)
  console.log('Running parity validation...');
  console.log('This may take a few minutes...\n');
  
  const results = await runActualValidation();
  
  if (!results) {
    console.error('\n❌ ERROR: Failed to run parity validation.');
    console.error('Z-Machine became unavailable during validation.');
    process.exit(1);
  }

  // Create certification generator with custom options
  const generator = createCertificationGenerator({
    title: 'Zork I TypeScript Implementation - Parity Certification',
    notes: [
      'This certification is based on actual parity validation results.',
      'All differences have been classified as RNG, state divergence, or logic differences.',
      'The TypeScript implementation aims for functionally equivalent gameplay to the original Zork I.',
    ],
    includeDetailedResults: true,
    includeSampleDifferences: true,
    maxSampleDifferences: 5,
  });

  // Generate certification from real results (Requirements 5.4, 5.5)
  const certification = generator.generate(results);

  // Write to file
  await generator.writeToFile(certification, 'PARITY_CERTIFICATION.md');

  console.log('Certification generated successfully!');
  console.log('Output: PARITY_CERTIFICATION.md\n');

  // Print summary
  console.log('Summary:');
  console.log(`  Total Seeds Tested: ${results.totalTests}`);
  console.log(`  Overall Parity: ${results.overallParityPercentage.toFixed(2)}%`);
  console.log(`  Total Differences: ${results.totalDifferences}`);
  console.log(`    - RNG Differences: ${results.rngDifferences}`);
  console.log(`    - State Divergences: ${results.stateDivergences}`);
  console.log(`    - Logic Differences: ${results.logicDifferences}`);
  console.log(`  Status: ${results.passed ? 'PASSED ✓' : 'FAILED ✗'}`);
  
  if (results.passed) {
    console.log('\n✓ 100% LOGIC PARITY CERTIFIED');
  } else {
    console.log(`\n⚠ ${results.logicDifferences} logic difference(s) detected`);
    console.log('Review the certification document for details.');
  }
}

main().catch((error) => {
  console.error('Error generating certification:', error);
  process.exit(1);
});
