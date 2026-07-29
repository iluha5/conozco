import net from 'net';
import os from 'os';
import path from 'path';
import { spawn, type ChildProcess } from 'child_process';
import { loadMigrationEnv } from './load-env';

export interface SshTunnelConfig {
    host: string;
    user: string;
    keyPath: string;
    localPort: number;
    remoteHost: string;
    remotePort: number;
}

export interface SshTunnelHandle {
    close: () => Promise<void>;
    startedByUs: boolean;
}

const PORT_READY_TIMEOUT_MS = 15_000;
const PORT_POLL_INTERVAL_MS = 200;

function expandHome(filePath: string): string {
    if (filePath.startsWith('~/')) {
        return path.join(os.homedir(), filePath.slice(2));
    }
    return filePath;
}

function getRequiredEnv(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function getRequiredPort(name: string): number {
    const rawValue = getRequiredEnv(name);
    const port = Number.parseInt(rawValue, 10);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid port in ${name}: ${rawValue}`);
    }
    return port;
}

export function loadSshTunnelConfigFromEnv(): SshTunnelConfig {
    loadMigrationEnv();

    return {
        host: getRequiredEnv('MIGRATION_SSH_HOST'),
        user: getRequiredEnv('MIGRATION_SSH_USER'),
        keyPath: expandHome(getRequiredEnv('MIGRATION_SSH_KEY_PATH')),
        localPort: getRequiredPort('MIGRATION_SSH_LOCAL_PORT'),
        remoteHost:
            process.env.MIGRATION_SSH_REMOTE_HOST?.trim() || '127.0.0.1',
        remotePort: process.env.MIGRATION_SSH_REMOTE_PORT
            ? getRequiredPort('MIGRATION_SSH_REMOTE_PORT')
            : 5433,
    };
}

export function isLocalPortOpen(
    port: number,
    host = '127.0.0.1',
): Promise<boolean> {
    return new Promise(resolve => {
        const socket = net.createConnection({ port, host });
        socket.setTimeout(1000);

        socket.once('connect', () => {
            socket.destroy();
            resolve(true);
        });

        socket.once('timeout', () => {
            socket.destroy();
            resolve(false);
        });

        socket.once('error', () => {
            resolve(false);
        });
    });
}

async function waitForLocalPort(
    port: number,
    timeoutMs: number,
): Promise<void> {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        if (await isLocalPortOpen(port)) {
            return;
        }
        await new Promise(resolve =>
            setTimeout(resolve, PORT_POLL_INTERVAL_MS),
        );
    }

    throw new Error(
        `SSH tunnel did not open local port ${port} within ${timeoutMs}ms`,
    );
}

function spawnSshTunnel(config: SshTunnelConfig): ChildProcess {
    const forwardSpec = `${config.localPort}:${config.remoteHost}:${config.remotePort}`;
    const sshArgs = [
        '-i',
        config.keyPath,
        '-L',
        forwardSpec,
        '-N',
        '-o',
        'ExitOnForwardFailure=yes',
        '-o',
        'BatchMode=yes',
        '-o',
        'StrictHostKeyChecking=accept-new',
        `${config.user}@${config.host}`,
    ];

    console.log(
        `Starting SSH tunnel: localhost:${config.localPort} -> ${config.remoteHost}:${config.remotePort} via ${config.user}@${config.host}`,
    );

    const sshProcess = spawn('ssh', sshArgs, {
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    sshProcess.stderr?.on('data', data => {
        const message = data.toString().trim();
        if (message) {
            console.error(`[ssh] ${message}`);
        }
    });

    sshProcess.on('error', error => {
        console.error(`Failed to start ssh: ${error.message}`);
    });

    return sshProcess;
}

export async function ensureSshTunnel(options: {
    skipTunnel?: boolean;
}): Promise<SshTunnelHandle> {
    const config = loadSshTunnelConfigFromEnv();
    const portAlreadyOpen = await isLocalPortOpen(config.localPort);

    if (portAlreadyOpen) {
        console.log(`Reusing existing tunnel on localhost:${config.localPort}`);
        return {
            startedByUs: false,
            close: async () => {},
        };
    }

    if (options.skipTunnel) {
        throw new Error(
            `Port ${config.localPort} is not open and --no-tunnel was passed. ` +
                'Start the tunnel manually or remove --no-tunnel.',
        );
    }

    const sshProcess = spawnSshTunnel(config);

    const earlyExit = new Promise<never>((_, reject) => {
        sshProcess.once('exit', code => {
            reject(
                new Error(
                    `SSH tunnel exited before port ${config.localPort} was ready (code=${code ?? 'unknown'})`,
                ),
            );
        });
    });

    try {
        await Promise.race([
            waitForLocalPort(config.localPort, PORT_READY_TIMEOUT_MS),
            earlyExit,
        ]);
    } catch (error) {
        sshProcess.kill('SIGTERM');
        throw error;
    }

    console.log(`SSH tunnel ready on localhost:${config.localPort}`);

    return {
        startedByUs: true,
        close: async () => {
            if (sshProcess.killed || sshProcess.exitCode !== null) {
                return;
            }

            console.log('Closing SSH tunnel...');
            sshProcess.kill('SIGTERM');

            await new Promise<void>(resolve => {
                const timeout = setTimeout(() => {
                    sshProcess.kill('SIGKILL');
                    resolve();
                }, 3000);

                sshProcess.once('exit', () => {
                    clearTimeout(timeout);
                    resolve();
                });
            });
        },
    };
}

export async function runTunnelOnly(): Promise<void> {
    const handle = await ensureSshTunnel({ skipTunnel: false });
    if (!handle.startedByUs) {
        console.log('Tunnel already running. Press Ctrl+C to exit.');
    } else {
        console.log('Tunnel running. Press Ctrl+C to close.');
    }

    await new Promise<void>(resolve => {
        const onSignal = () => {
            void handle.close().finally(resolve);
        };
        process.on('SIGINT', onSignal);
        process.on('SIGTERM', onSignal);
    });
}
