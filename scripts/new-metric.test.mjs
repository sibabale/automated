// [ SCRIPTS > NEW METRIC > TESTS ] ###################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
    addRegistryEntry,
    buildMetricContext,
    buildRemoteAgentBrief,
    parseArgs,
    renderFiles,
    scaffoldMetric,
} from './new-metric-lib.mjs';
// 1.2. END ..........................................................................................

// 1.3. FIXTURES .....................................................................................
const tempRoots = [];

async function createRepoRoot() {
    const repoRoot = await mkdtemp(path.join(os.tmpdir(), 'new-metric-'));
    tempRoots.push(repoRoot);
    await mkdir(path.join(repoRoot, 'frontend/data'), { recursive: true });

    await writeFile(
        path.join(repoRoot, 'frontend/data/financial-metrics.ts'),
        `export const financialMetrics = [
    {
        slug: 'return-on-equity',
        label: 'Return on Equity',
        value: '156.1%',
        description: 'Buffett Target: > 15%',
    },
];

export const getFinancialMetric = (slug) =>
    financialMetrics.find((metric) => metric.slug === slug);
`,
        'utf8',
    );

    return repoRoot;
}

after(async () => {
    await Promise.all(tempRoots.map((tempRoot) => rm(tempRoot, { recursive: true, force: true })));
});
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe('new-metric generator', () => {
    it('parses required and optional CLI arguments', () => {
        const options = parseArgs([
            '--slug', 'return-on-invested-capital',
            '--label', 'Return on Invested Capital',
            '--metric-abbreviation', 'ROIC',
            '--dry-run',
        ]);

        assert.equal(options.slug, 'return-on-invested-capital');
        assert.equal(options.label, 'Return on Invested Capital');
        assert.equal(options['metric-abbreviation'], 'ROIC');
        assert.equal(options.dryRun, true);
    });

    it('renders the full scaffold manifest for a metric', () => {
        const context = buildMetricContext({
            slug: 'gross-margin',
            label: 'Gross Margin',
        });

        const files = renderFiles(context);

        assert.equal(files.length, 12);
        assert.ok(files.some((file) => file.path === 'backend/src/application/services/gross-margin/index.ts'));
        assert.ok(files.some((file) => file.path === 'frontend/redux/slices/gross-margin.slice.ts'));
    });

    it('adds a placeholder registry entry for the new metric', () => {
        const updated = addRegistryEntry(
            `export const financialMetrics = [
    {
        slug: 'return-on-equity',
        label: 'Return on Equity',
        value: '156.1%',
        description: 'Buffett Target: > 15%',
    },
];

export const getFinancialMetric = (slug) =>
    financialMetrics.find((metric) => metric.slug === slug);
`,
            buildMetricContext({
                slug: 'gross-margin',
                label: 'Gross Margin',
                'live-ticker': 'RDDT',
                'live-company': 'Reddit, Inc.',
            }),
        );

        assert.match(updated, /slug: 'gross-margin'/);
        assert.match(updated, /liveTicker: 'RDDT'/);
        assert.match(updated, /definitionTitle: 'What Is Gross Margin\?'/);
    });

    it('builds a remote-agent brief with the required repo context', () => {
        const brief = buildRemoteAgentBrief(buildMetricContext({
            slug: 'gross-margin',
            label: 'Gross Margin',
        }));

        assert.match(brief, /remote-metric-delivery/);
        assert.match(brief, /free-cash-flow/);
        assert.match(brief, /frontend\/app\/details\/\[metric\]\/page\.tsx/);
        assert.match(brief, /coverage:gate/);
        assert.match(brief, /\/details\/gross-margin/);
    });

    it('writes the scaffold files and updates the registry', async () => {
        const repoRoot = await createRepoRoot();

        const result = await scaffoldMetric(repoRoot, {
            slug: 'gross-margin',
            label: 'Gross Margin',
            'metric-abbreviation': 'GM',
            'live-ticker': 'RDDT',
            'live-company': 'Reddit, Inc.',
        });

        const serviceSource = await readFile(
            path.join(repoRoot, 'backend/src/application/services/gross-margin/index.ts'),
            'utf8',
        );
        const registrySource = await readFile(
            path.join(repoRoot, 'frontend/data/financial-metrics.ts'),
            'utf8',
        );

        assert.equal(result.created.length, 12);
        assert.match(serviceSource, /analyseGrossMargin/);
        assert.match(registrySource, /slug: 'gross-margin'/);
        assert.match(result.agentBrief, /Remote agent kickoff for "Gross Margin"/);
    });

    it('supports dry runs without writing files', async () => {
        const repoRoot = await createRepoRoot();

        const result = await scaffoldMetric(repoRoot, {
            slug: 'operating-margin',
            label: 'Operating Margin',
            dryRun: true,
        });

        assert.equal(result.created.length, 12);

        await assert.rejects(
            () => readFile(path.join(repoRoot, 'backend/src/application/services/operating-margin/index.ts'), 'utf8'),
            /ENOENT/,
        );
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
