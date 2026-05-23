#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const numRuns = args.length > 0 ? parseInt(args[0]) : 40;

if (isNaN(numRuns) || numRuns <= 0) {
    console.error(
        'Usage: node run-multiple-pipelines.ts [number_of_runs] (default 40)',
    );
    process.exit(1);
}

function runPipeline(runNumber: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const pipelineScript = path.join(__dirname, 'run-full-pipeline.sh');
        const child = spawn('bash', [pipelineScript], {
            stdio: 'inherit',
            cwd: __dirname,
        });

        child.on('close', code => {
            if (code === 0) {
                console.log(`[${runNumber}/${numRuns}] OK`);
                resolve();
            } else {
                console.error(`[${runNumber}/${numRuns}] FAIL (exit ${code})`);
                reject(new Error(`Pipeline failed with exit code ${code}`));
            }
        });

        child.on('error', error => {
            const message =
                error instanceof Error ? error.message : String(error);
            console.error(`[${runNumber}/${numRuns}] error:`, message);
            reject(error);
        });
    });
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
    try {
        for (let i = 1; i <= numRuns; i++) {
            await runPipeline(i);
            if (i < numRuns) {
                await delay(1000);
            }
        }
        console.log(`Done: ${numRuns} pipeline runs.`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Pipeline execution failed:', message);
        process.exit(1);
    }
}

main();
