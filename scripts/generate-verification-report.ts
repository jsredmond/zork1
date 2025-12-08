#!/usr/bin/env tsx

/**
 * HTML Verification Report Generator
 * 
 * Generates visual comparison reports with charts and statistics.
 * 
 * Usage:
 *   npx tsx scripts/generate-verification-report.ts <summary-json>
 *   npx tsx scripts/generate-verification-report.ts --run-and-generate
 */

import * as fs from 'fs';
import * as path from 'path';

interface Difference {
  commandIndex: number;
  command: string;
  expected: string;
  actual: string;
  expectedNormalized: string;
  actualNormalized: string;
  similarity: number;
  exactMatch: boolean;
  category: 'text' | 'state' | 'error';
  severity: 'critical' | 'major' | 'minor';
}

interface StateError {
  commandIndex: number;
  command: string;
  check: any;
  actualValue: any;
  message: string;
}

interface ComparisonResult {
  transcriptId: string;
  name: string;
  category: string;
  priority: string;
  passed: boolean;
  totalCommands: number;
  matchedCommands: number;
  exactMatches?: number;
  averageSimilarity: number;
  differences: Difference[];
  stateErrors?: StateError[];
  executionTime: number;
}

interface CategoryStats {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  averageSimilarity: number;
}

interface SummaryReport {
  totalTranscripts: number;
  passedTranscripts: number;
  failedTranscripts: number;
  totalCommands: number;
  matchedCommands: number;
  overallPassRate: number;
  averageSimilarity: number;
  byCategory: Record<string, CategoryStats>;
  byPriority: Record<string, CategoryStats>;
  results: ComparisonResult[];
  executionTime: number;
}

class HTMLReportGenerator {
  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Generate CSS styles
   */
  private generateStyles(): string {
    return `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f5f5f5;
          padding: 20px;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        h1 {
          color: #2c3e50;
          margin-bottom: 10px;
          font-size: 2.5em;
        }

        h2 {
          color: #34495e;
          margin-top: 40px;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #3498db;
        }

        h3 {
          color: #34495e;
          margin-top: 30px;
          margin-bottom: 15px;
        }

        .timestamp {
          color: #7f8c8d;
          font-size: 0.9em;
          margin-bottom: 30px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .stat-card.success {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }

        .stat-card.warning {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .stat-card.info {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .stat-label {
          font-size: 0.9em;
          opacity: 0.9;
          margin-bottom: 5px;
        }

        .stat-value {
          font-size: 2.5em;
          font-weight: bold;
        }

        .stat-subtext {
          font-size: 0.85em;
          opacity: 0.8;
          margin-top: 5px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: white;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        th {
          background: #3498db;
          color: white;
          font-weight: 600;
        }

        tr:hover {
          background: #f8f9fa;
        }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.85em;
          font-weight: 600;
        }

        .badge.passed {
          background: #d4edda;
          color: #155724;
        }

        .badge.failed {
          background: #f8d7da;
          color: #721c24;
        }

        .badge.critical {
          background: #f8d7da;
          color: #721c24;
        }

        .badge.high {
          background: #fff3cd;
          color: #856404;
        }

        .badge.medium {
          background: #d1ecf1;
          color: #0c5460;
        }

        .badge.low {
          background: #e2e3e5;
          color: #383d41;
        }

        .progress-bar {
          width: 100%;
          height: 30px;
          background: #ecf0f1;
          border-radius: 15px;
          overflow: hidden;
          margin: 10px 0;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.9em;
          transition: width 0.3s ease;
        }

        .difference-card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .difference-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 15px;
        }

        .comparison-panel {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
          border-left: 4px solid #3498db;
        }

        .comparison-panel.expected {
          border-left-color: #27ae60;
        }

        .comparison-panel.actual {
          border-left-color: #e74c3c;
        }

        .comparison-label {
          font-weight: 600;
          margin-bottom: 10px;
          color: #555;
        }

        .comparison-text {
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          white-space: pre-wrap;
          word-break: break-word;
          background: white;
          padding: 10px;
          border-radius: 4px;
          max-height: 300px;
          overflow-y: auto;
        }

        .chart-container {
          margin: 30px 0;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .bar-chart {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .bar-item {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .bar-label {
          min-width: 120px;
          font-weight: 600;
          color: #555;
        }

        .bar-visual {
          flex: 1;
          height: 30px;
          background: #ecf0f1;
          border-radius: 15px;
          overflow: hidden;
          position: relative;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          padding-left: 10px;
          color: white;
          font-size: 0.85em;
          font-weight: 600;
        }

        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #7f8c8d;
          font-size: 0.9em;
        }

        @media print {
          body {
            background: white;
            padding: 0;
          }
          .container {
            box-shadow: none;
          }
        }
      </style>
    `;
  }

  /**
   * Generate summary section HTML
   */
  private generateSummarySection(summary: SummaryReport): string {
    const passRate = (summary.overallPassRate * 100).toFixed(1);
    const avgSimilarity = (summary.averageSimilarity * 100).toFixed(1);
    const commandMatchRate = summary.totalCommands > 0 
      ? ((summary.matchedCommands / summary.totalCommands) * 100).toFixed(1)
      : '0.0';

    return `
      <h2>📊 Overall Summary</h2>
      <div class="summary-grid">
        <div class="stat-card ${summary.failedTranscripts === 0 ? 'success' : 'warning'}">
          <div class="stat-label">Pass Rate</div>
          <div class="stat-value">${passRate}%</div>
          <div class="stat-subtext">${summary.passedTranscripts} of ${summary.totalTranscripts} transcripts</div>
        </div>
        
        <div class="stat-card info">
          <div class="stat-label">Average Similarity</div>
          <div class="stat-value">${avgSimilarity}%</div>
          <div class="stat-subtext">Across all commands</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Commands Tested</div>
          <div class="stat-value">${summary.totalCommands}</div>
          <div class="stat-subtext">${summary.matchedCommands} matched (${commandMatchRate}%)</div>
        </div>
        
        <div class="stat-card info">
          <div class="stat-label">Execution Time</div>
          <div class="stat-value">${(summary.executionTime / 1000).toFixed(1)}s</div>
          <div class="stat-subtext">Total verification time</div>
        </div>
      </div>

      <h3>Progress Overview</h3>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${passRate}%">
          ${passRate}% Complete
        </div>
      </div>
    `;
  }

  /**
   * Generate category breakdown HTML
   */
  private generateCategoryBreakdown(summary: SummaryReport): string {
    let html = '<h2>📁 Results by Category</h2>';
    html += '<div class="chart-container"><div class="bar-chart">';

    for (const [category, stats] of Object.entries(summary.byCategory)) {
      const passRate = (stats.passRate * 100).toFixed(1);
      const avgSim = (stats.averageSimilarity * 100).toFixed(1);
      
      html += `
        <div class="bar-item">
          <div class="bar-label">${category}</div>
          <div class="bar-visual">
            <div class="bar-fill" style="width: ${passRate}%">
              ${stats.passed}/${stats.total} (${passRate}%) - ${avgSim}% similarity
            </div>
          </div>
        </div>
      `;
    }

    html += '</div></div>';
    return html;
  }

  /**
   * Generate priority breakdown HTML
   */
  private generatePriorityBreakdown(summary: SummaryReport): string {
    let html = '<h2>⚡ Results by Priority</h2>';
    html += '<div class="chart-container"><div class="bar-chart">';

    const priorityOrder = ['critical', 'high', 'medium', 'low'];
    for (const priority of priorityOrder) {
      const stats = summary.byPriority[priority];
      if (!stats) continue;

      const passRate = (stats.passRate * 100).toFixed(1);
      const avgSim = (stats.averageSimilarity * 100).toFixed(1);
      
      html += `
        <div class="bar-item">
          <div class="bar-label">${priority}</div>
          <div class="bar-visual">
            <div class="bar-fill" style="width: ${passRate}%">
              ${stats.passed}/${stats.total} (${passRate}%) - ${avgSim}% similarity
            </div>
          </div>
        </div>
      `;
    }

    html += '</div></div>';
    return html;
  }

  /**
   * Generate transcript results table HTML
   */
  private generateResultsTable(summary: SummaryReport): string {
    let html = '<h2>📝 Transcript Results</h2>';
    html += `
      <table>
        <thead>
          <tr>
            <th>Transcript</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Commands</th>
            <th>Matched</th>
            <th>Similarity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (const result of summary.results) {
      const similarity = (result.averageSimilarity * 100).toFixed(1);
      const statusBadge = result.passed 
        ? '<span class="badge passed">✓ Passed</span>'
        : '<span class="badge failed">✗ Failed</span>';
      
      html += `
        <tr>
          <td><strong>${this.escapeHtml(result.name)}</strong><br><small>${result.transcriptId}</small></td>
          <td>${result.category}</td>
          <td><span class="badge ${result.priority}">${result.priority}</span></td>
          <td>${result.totalCommands}</td>
          <td>${result.matchedCommands}</td>
          <td>${similarity}%</td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }

    html += '</tbody></table>';
    return html;
  }

  /**
   * Generate detailed differences HTML
   */
  private generateDifferencesSection(summary: SummaryReport): string {
    const failedResults = summary.results.filter(r => !r.passed);
    
    if (failedResults.length === 0) {
      return '<h2>✅ No Differences Found</h2><p>All transcripts passed with 100% match!</p>';
    }

    let html = '<h2>🔍 Detailed Differences</h2>';

    for (const result of failedResults) {
      html += `
        <div class="difference-card">
          <div class="difference-header">
            <div>
              <h3 style="margin: 0;">${this.escapeHtml(result.name)}</h3>
              <small>${result.transcriptId} - ${result.category} - ${result.priority}</small>
            </div>
            <div>
              <span class="badge failed">${result.differences.length} differences</span>
            </div>
          </div>
      `;

      for (const diff of result.differences) {
        const similarity = (diff.similarity * 100).toFixed(1);
        
        html += `
          <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 4px;">
            <div style="margin-bottom: 10px;">
              <strong>Command ${diff.commandIndex + 1}:</strong> <code>${this.escapeHtml(diff.command)}</code>
              <span class="badge ${diff.severity}" style="margin-left: 10px;">${diff.severity}</span>
              <span style="margin-left: 10px; color: #666;">Similarity: ${similarity}%</span>
            </div>
            
            <div class="comparison-grid">
              <div class="comparison-panel expected">
                <div class="comparison-label">Expected Output</div>
                <div class="comparison-text">${this.escapeHtml(diff.expected)}</div>
              </div>
              
              <div class="comparison-panel actual">
                <div class="comparison-label">Actual Output</div>
                <div class="comparison-text">${this.escapeHtml(diff.actual)}</div>
              </div>
            </div>
          </div>
        `;
      }

      html += '</div>';
    }

    return html;
  }

  /**
   * Generate complete HTML report
   */
  public generateReport(summary: SummaryReport): string {
    const timestamp = new Date().toLocaleString();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Behavioral Parity Verification Report</title>
  ${this.generateStyles()}
</head>
<body>
  <div class="container">
    <h1>🎮 Behavioral Parity Verification Report</h1>
    <div class="timestamp">Generated: ${timestamp}</div>
    
    ${this.generateSummarySection(summary)}
    ${this.generateCategoryBreakdown(summary)}
    ${this.generatePriorityBreakdown(summary)}
    ${this.generateResultsTable(summary)}
    ${this.generateDifferencesSection(summary)}
    
    <div class="footer">
      <p>Zork I TypeScript Rewrite - Behavioral Parity Verification</p>
      <p>Report generated automatically by verify-all-transcripts.ts</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Save HTML report to file
   */
  public saveReport(summary: SummaryReport, outputPath: string): void {
    const html = this.generateReport(summary);
    const dir = path.dirname(outputPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`\n✓ HTML report saved to: ${outputPath}`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage:');
    console.log('  npx tsx scripts/generate-verification-report.ts <summary-json>');
    console.log('  npx tsx scripts/generate-verification-report.ts --run-and-generate');
    console.log('\nOptions:');
    console.log('  <summary-json>        Path to summary JSON file');
    console.log('  --run-and-generate    Run verification and generate report');
    console.log('  --help, -h            Show this help message');
    process.exit(0);
  }

  const generator = new HTMLReportGenerator();

  if (args.includes('--run-and-generate')) {
    // Run verification first
    console.log('Running transcript verification...\n');
    const { execSync } = require('child_process');
    
    try {
      execSync('npx tsx scripts/verify-all-transcripts.ts --report', {
        stdio: 'inherit'
      });
    } catch (error) {
      console.log('\nVerification completed with failures. Generating report...\n');
    }

    // Load the generated summary
    const summaryPath = path.join('.kiro', 'testing', 'transcript-verification-summary.json');
    if (!fs.existsSync(summaryPath)) {
      console.error('Error: Summary file not found. Run verification first.');
      process.exit(1);
    }

    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    const outputPath = path.join('.kiro', 'testing', 'verification-report.html');
    generator.saveReport(summary, outputPath);
    
    console.log(`\nOpen the report in your browser:`);
    console.log(`  file://${path.resolve(outputPath)}`);
    
    process.exit(0);
  }

  if (args.length === 0) {
    console.error('Error: Please provide a summary JSON file or use --run-and-generate');
    console.log('Usage: npx tsx scripts/generate-verification-report.ts <summary-json>');
    process.exit(1);
  }

  const summaryPath = args[0];
  
  if (!fs.existsSync(summaryPath)) {
    console.error(`Error: Summary file not found: ${summaryPath}`);
    process.exit(1);
  }

  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
  const outputPath = path.join('.kiro', 'testing', 'verification-report.html');
  
  generator.saveReport(summary, outputPath);
  
  console.log(`\nOpen the report in your browser:`);
  console.log(`  file://${path.resolve(outputPath)}`);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
