import { runTier1Tests, type TestResult } from '../tests/tier1-feature-coverage';
import { runTier2Tests } from '../tests/tier2-boundary-corner';
import { runTier3Tests } from '../tests/tier3-cross-feature';
import { runTier4Tests } from '../tests/tier4-real-world';
import { execSync } from 'child_process';

console.log('\n====================================================================');
console.log('            KALORI CAFE - AUTOMATED E2E TEST SUITE RUNNER           ');
console.log('====================================================================\n');

let buildStatus = { passed: false, output: '', error: '' };
let lintStatus = { passed: false, output: '', error: '' };

// 1. Build Verification Integration
console.log('▶ Running Build Check (`npm run build`)...');
try {
  const buildOut = execSync('npm run build', { encoding: 'utf-8', cwd: process.cwd() });
  buildStatus.passed = true;
  buildStatus.output = buildOut.trim();
  console.log('  ✅ BUILD PASSED (derivation: tsc -b && vite build executed cleanly)\n');
} catch (err: any) {
  buildStatus.passed = false;
  buildStatus.error = err.stdout || err.stderr || err.message;
  console.log('  ❌ BUILD FAILED\n');
}

// 2. Lint Verification Integration
console.log('▶ Running Lint Check (`npm run lint`)...');
try {
  const lintOut = execSync('npm run lint', { encoding: 'utf-8', cwd: process.cwd() });
  lintStatus.passed = true;
  lintStatus.output = lintOut.trim();
  console.log('  ✅ LINT PASSED (oxlint executed cleanly)\n');
} catch (err: any) {
  lintStatus.passed = false;
  lintStatus.error = err.stdout || err.stderr || err.message;
  console.log('  ⚠️ LINT REPORTED VIOLATIONS (oxlint flagged issues)\n');
}

// 3. Execute Tiers 1-4 Test Suites
console.log('▶ Executing Tier 1-4 Test Cases...\n');

const tier1Results = runTier1Tests();
const tier2Results = runTier2Tests();
const tier3Results = runTier3Tests();
const tier4Results = runTier4Tests();

const allResults: TestResult[] = [
  ...tier1Results,
  ...tier2Results,
  ...tier3Results,
  ...tier4Results
];

const tiers = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];

let totalPassed = 0;
let totalFailed = 0;

tiers.forEach(tier => {
  const tierCases = allResults.filter(r => r.tier === tier);
  const passedCount = tierCases.filter(r => r.passed).length;
  const failedCount = tierCases.filter(r => !r.passed).length;
  totalPassed += passedCount;
  totalFailed += failedCount;

  console.log(`--------------------------------------------------------------------`);
  console.log(` SUMMARY: ${tier.toUpperCase()} (${passedCount}/${tierCases.length} Passed)`);
  console.log(`--------------------------------------------------------------------`);

  tierCases.forEach((t, idx) => {
    const status = t.passed ? '✅ PASS' : '❌ FAIL';
    console.log(` [${status}] ${idx + 1}. ${t.name}`);
    if (t.details && t.passed) {
      console.log(`        ↳ ${t.details}`);
    }
    if (t.error && !t.passed) {
      console.log(`        ↳ ERROR: ${t.error}`);
    }
  });
  console.log('');
});

// Final Summary Matrix
console.log('====================================================================');
console.log('                      TEST RUN EXECUTION MATRIX                     ');
console.log('====================================================================');
console.log(`  Build Command (npm run build) : ${buildStatus.passed ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`  Lint Command  (npm run lint)  : ${lintStatus.passed ? '✅ PASSED' : '⚠️ LINT DEFECTS DETECTED'}`);
console.log(`  Tier 1 (Feature Coverage)    : ${tier1Results.filter(r => r.passed).length}/${tier1Results.length} Passed`);
console.log(`  Tier 2 (Boundary & Corner)   : ${tier2Results.filter(r => r.passed).length}/${tier2Results.length} Passed`);
console.log(`  Tier 3 (Cross-Feature)       : ${tier3Results.filter(r => r.passed).length}/${tier3Results.length} Passed`);
console.log(`  Tier 4 (Real-World Scenarios): ${tier4Results.filter(r => r.passed).length}/${tier4Results.length} Passed`);
console.log('--------------------------------------------------------------------');
console.log(`  TOTAL TEST CASES EXECUTED   : ${allResults.length}`);
console.log(`  TOTAL PASSED                : ${totalPassed}`);
console.log(`  TOTAL FAILED                : ${totalFailed}`);
console.log(`  PASS RATE                   : ${((totalPassed / allResults.length) * 100).toFixed(1)}%`);
console.log('====================================================================\n');

if (totalFailed > 0 || !buildStatus.passed) {
  console.error('❌ E2E TEST RUNNER FINISHED WITH FAILURES.');
  process.exit(1);
} else {
  console.log('🎉 ALL E2E TEST SUITES PASSED SUCCESSFULLY!');
  process.exit(0);
}
