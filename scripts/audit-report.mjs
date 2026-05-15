/**
 * audit-report.mjs
 * Reads Playwright JSON results + scans test files for workflow annotations.
 * Writes test-results/coverage-map.json for the /audit skill.
 * Usage: node scripts/audit-report.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const RESULTS_PATH = 'test-results/results.json';
const STEPS_PATH = 'tests/e2e/workflows/steps.json';
const TESTS_DIR = 'tests/e2e';
const OUTPUT_PATH = 'test-results/coverage-map.json';

function fileExists(p) {
  try { statSync(p); return true; } catch { return false; }
}

if (!fileExists(RESULTS_PATH)) {
  console.error(`No results at ${RESULTS_PATH}. Run "npm run audit:workflows" first.`);
  process.exit(1);
}

const results = JSON.parse(readFileSync(RESULTS_PATH, 'utf8'));
const stepsRegistry = JSON.parse(readFileSync(STEPS_PATH, 'utf8'));

function extractTests(suites, path = '') {
  const tests = [];
  for (const suite of suites ?? []) {
    const suitePath = path ? `${path} > ${suite.title}` : suite.title;
    tests.push(...extractTests(suite.suites, suitePath));
    for (const spec of suite.specs ?? []) {
      // annotations live on spec.tests[0], not on spec itself
      const testRun = spec.tests?.[0];
      const workflowSteps = (testRun?.annotations ?? [])
        .filter(a => a.type === 'workflow')
        .map(a => a.description);
      const lastResult = testRun?.results?.[testRun.results.length - 1];
      const errorMsg = lastResult?.errors?.[0]?.message ?? lastResult?.error?.message ?? null;
      tests.push({
        title: spec.title,
        path: `${suitePath} > ${spec.title}`,
        status: lastResult?.status ?? testRun?.status ?? 'unknown',
        workflowSteps,
        error: errorMsg?.split('\n')[0] ?? null,
      });
    }
  }
  return tests;
}

const allTests = extractTests(results.suites ?? []);
const stepCoverage = {};
const failures = [];

for (const t of allTests) {
  if (t.status === 'failed' || t.status === 'timedOut') {
    failures.push({ title: t.title, path: t.path, workflowSteps: t.workflowSteps, error: t.error, status: t.status });
  }
  for (const step of t.workflowSteps) {
    if (!stepCoverage[step]) stepCoverage[step] = { coveredByRun: true, passed: false, tests: [], errors: [] };
    stepCoverage[step].tests.push(t.title);
    if (t.status === 'passed') stepCoverage[step].passed = true;
    if (t.error) stepCoverage[step].errors.push(t.error);
  }
}

// Static scan of all spec files for annotations not covered by this run
function findSpecFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...findSpecFiles(full));
    else if (entry.endsWith('.spec.ts')) files.push(full);
  }
  return files;
}

const ANNOTATION_PATTERN = /description:\s*['"]([A-Z]+\d+:[a-z]+\d+)['"]/g;

for (const file of findSpecFiles(TESTS_DIR)) {
  const content = readFileSync(file, 'utf8');
  for (const match of content.matchAll(ANNOTATION_PATTERN)) {
    const step = match[1];
    if (!stepCoverage[step]) {
      stepCoverage[step] = {
        coveredByRun: false,
        coveredByStaticAnnotation: true,
        passed: null,
        tests: [],
        errors: [],
        sourceFile: relative('.', file),
      };
    }
  }
}

const gaps = [];
for (const [wfId, wf] of Object.entries(stepsRegistry)) {
  for (const [stepId, description] of Object.entries(wf.steps)) {
    if (!stepCoverage[stepId]) {
      gaps.push({ stepId, workflow: wfId, workflowName: wf.name, description, type: 'coverage-gap' });
    }
  }
}

const coverageMap = {
  runDate: new Date().toISOString().split('T')[0],
  runTimestamp: new Date().toISOString(),
  summary: {
    totalTests: allTests.length,
    passed: allTests.filter(t => t.status === 'passed').length,
    failed: allTests.filter(t => t.status === 'failed' || t.status === 'timedOut').length,
    skipped: allTests.filter(t => t.status === 'skipped').length,
  },
  stepCoverage,
  failures,
  gaps,
};

writeFileSync(OUTPUT_PATH, JSON.stringify(coverageMap, null, 2));
console.log(`Coverage map written to ${OUTPUT_PATH}`);
console.log(`  Tests: ${coverageMap.summary.totalTests} | Passed: ${coverageMap.summary.passed} | Failed: ${coverageMap.summary.failed} | Gaps: ${gaps.length}`);
