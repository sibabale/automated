/**
 * Stryker configuration for mutation testing the backend.
 * Run with: npx stryker run
 */

module.exports = {
  mutate: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/server.ts'
  ],
  tsconfigFile: 'tsconfig.json',
  packageManager: 'npm',
  reporters: ['html', 'progress', 'json'],
  testRunner: 'command',
  commandRunner: {
    // Invoke the tsx binary directly instead of `pnpm test` so each mutant
    // skips pnpm's per-invocation resolution overhead (paid 380+ times).
    command: "./node_modules/.bin/tsx --test 'src/**/*.test.ts'"
  },
  // Performance and stability tuning
  // Use most of the 10 cores; leave 2 free for the OS and the parent process.
  concurrency: 8,
  // Baseline suite runs in ~1.5s, so a mutant that hangs is an infinite loop.
  // 15s is generous headroom and kills timeout-mutants ~20x faster than 5min.
  timeoutMS: 15000,
  coverageAnalysis: 'off',
  htmlReporter: {
    baseDir: 'reports/mutation'
  },
  // Write the JSON report OUTSIDE htmlReporter.baseDir. The HTML reporter wipes
  // its baseDir on every run, and the JSON reporter's default path is
  // `reports/mutation/mutation.json` — inside it — so the two collide and the
  // JSON is deleted right after it is written. A sibling path keeps both.
  jsonReporter: {
    fileName: 'reports/mutation.json'
  },
  thresholds: {
    break: 60,
    high: 80,
    low: 60
  }
};
