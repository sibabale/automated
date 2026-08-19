#!/usr/bin/env node

const { execFileSync } = require("node:child_process");

const REQUIRED_FILES = ["CHANGELOG.md", "versions.json"];
const VERSION_SENSITIVE_PATTERNS = [
  /^backend\/src\/app\.ts$/,
  /^backend\/src\/domain\/services\/investment-analysis-ruleset\//,
  /^backend\/src\/presentation\/controllers\/automation\/run-investment-pass\//,
  /^backend\/src\/presentation\/controllers\/overview\//,
  /^backend\/src\/presentation\/routes\/create-api-router\.ts$/,
  /^frontend\/app\/api\/\[version\]\//,
  /^frontend\/lib\/api-version\.ts$/,
];

function readStagedFiles() {
  const output = execFileSync("git", ["diff", "--cached", "--name-only"], {
    encoding: "utf8",
  });

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isVersionSensitiveFile(filePath) {
  return VERSION_SENSITIVE_PATTERNS.some((pattern) => pattern.test(filePath));
}

try {
  const stagedFiles = readStagedFiles();
  const touchedVersioningLogic = stagedFiles.some(isVersionSensitiveFile);

  if (!touchedVersioningLogic) {
    process.exit(0);
  }

  const missingFiles = REQUIRED_FILES.filter((requiredFile) => !stagedFiles.includes(requiredFile));

  if (missingFiles.length === 0) {
    process.exit(0);
  }

  console.error("Version-sensitive changes require the version artifacts to be staged together.");
  console.error(`Missing staged file(s): ${missingFiles.join(", ")}`);
  console.error("Stage the changelog and version manifest, or split the change into a different commit.");
  process.exit(1);
} catch (error) {
  console.error("Failed to validate version artifacts.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
