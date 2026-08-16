// [ SCRIPTS > NEW METRIC ] ###########################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { parseArgs, scaffoldMetric } from './new-metric-lib.mjs';
// 1.2. END ..........................................................................................

// 1.3. CLI ..........................................................................................
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

async function main() {
    try {
        const options = parseArgs(process.argv.slice(2));
        const result = await scaffoldMetric(repoRoot, options);

        const modeLabel = options.dryRun ? 'Would scaffold' : 'Scaffolded';
        const lines = [
            `${modeLabel} metric "${result.context.slug}" (${result.context.label}).`,
            '',
            'Created files:',
            ...result.created.map((filePath) => `- ${filePath}`),
        ];

        if (result.updated.length > 0) {
            lines.push('', 'Updated files:', ...result.updated.map((filePath) => `- ${filePath}`));
        }

        lines.push(
            '',
            'Next manual steps:',
            '- replace the TODO copy and placeholder values in the registry entry;',
            '- implement the backend domain/repository/service/controller logic;',
            '- wire the backend route and any live frontend mapping once the metric inputs are known.',
            '',
            result.agentBrief,
        );

        process.stdout.write(`${lines.join('\n')}\n`);
    } catch (error) {
        process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
        process.exitCode = 1;
    }
}

await main();
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
