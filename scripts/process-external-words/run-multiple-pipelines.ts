#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Получаем количество запусков из аргументов командной строки
const args = process.argv.slice(2);
const numRuns = args.length > 0 ? parseInt(args[0]) : 10;

// Валидация аргумента
if (isNaN(numRuns) || numRuns <= 0) {
    console.error(
        '❌ Invalid number of runs. Please provide a positive integer.',
    );
    console.log('Usage: node run-multiple-pipelines.ts [number_of_runs]');
    console.log('Default: 10 runs');
    process.exit(1);
}

console.log(`🚀 Starting ${numRuns} pipeline runs...`);
console.log('');

// Функция для запуска одного пайплайна
function runPipeline(runNumber: number): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log(`\n🏃 Starting pipeline run ${runNumber}/${numRuns}`);
        console.log('═'.repeat(50));

        const pipelineScript = path.join(__dirname, 'run-full-pipeline.sh');
        const child = spawn('bash', [pipelineScript], {
            stdio: 'inherit',
            cwd: __dirname,
        });

        child.on('close', code => {
            if (code === 0) {
                console.log(
                    `✅ Pipeline run ${runNumber}/${numRuns} completed successfully`,
                );
                resolve();
            } else {
                console.error(
                    `❌ Pipeline run ${runNumber}/${numRuns} failed with exit code ${code}`,
                );
                reject(new Error(`Pipeline failed with exit code ${code}`));
            }
        });

        child.on('error', error => {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(
                `❌ Error running pipeline ${runNumber}/${numRuns}:`,
                errorMessage,
            );
            reject(error);
        });
    });
}

// Функция для задержки
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Основная функция
async function main(): Promise<void> {
    try {
        for (let i = 1; i <= numRuns; i++) {
            await runPipeline(i);

            // Добавляем задержку между запусками (кроме последнего)
            if (i < numRuns) {
                console.log(`⏳ Waiting 30 seconds before next run...`);
                await delay(30000); // 30 секунд
            }
        }

        console.log('\n🎉 All pipeline runs completed successfully!');
        console.log(`📊 Processed ${numRuns} words through the pipeline`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('\n💥 Pipeline execution failed:', errorMessage);
        process.exit(1);
    }
}

// Запускаем
main();
