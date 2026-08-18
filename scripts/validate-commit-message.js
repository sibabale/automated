#!/usr/bin/env node

const fs = require("node:fs");

const commitMessageFile = process.argv[2];

if (!commitMessageFile) {
  console.error("Commit message file path is required.");
  process.exit(1);
}

const rawMessage = fs.readFileSync(commitMessageFile, "utf8");
const lines = rawMessage
  .split(/\r?\n/)
  .filter((line) => !line.startsWith("#"));

while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
  lines.pop();
}

const [header = "", ...bodyLines] = lines;
const conventionalHeader =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9-]+\))?!?: .+/;

if (!conventionalHeader.test(header.trim())) {
  console.error("Commit message title must follow Conventional Commits.");
  console.error("Example: feat(portfolio): add paper trading endpoint");
  process.exit(1);
}

const bodyContent = bodyLines.join("\n").trim();
if (!bodyContent) {
  console.error("Commit message body is required.");
  console.error("Include at least two bullet points explaining why and what changed.");
  process.exit(1);
}

const bulletLines = bodyLines.filter((line) => /^- /.test(line.trim()));
if (bulletLines.length < 2) {
  console.error("Commit message body must contain at least two bullet points.");
  console.error("Include bullets that explain why the change was needed and what changed.");
  process.exit(1);
}
