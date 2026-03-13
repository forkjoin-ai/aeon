import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

interface StageRequest {
  readonly chunkId: number;
  readonly tokenCount: number;
  readonly payload: string;
}

interface StageResponse {
  readonly chunkId: number;
  readonly stage: number;
  readonly tokenCount: number;
  readonly checksum: number;
}

interface WorkerOptions {
  readonly stageIndex: number;
  readonly serviceMsPerToken: number;
  readonly host: string;
  readonly port: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of request) {
    if (typeof chunk === 'string') {
      chunks.push(Buffer.from(chunk));
    } else {
      chunks.push(chunk);
    }
  }
  return Buffer.concat(chunks).toString('utf8');
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json');
  response.end(JSON.stringify(payload));
}

function parseInteger(value: string, flag: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid integer for ${flag}: ${value}`);
  }
  return parsed;
}

function parseNumber(value: string, flag: string): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid number for ${flag}: ${value}`);
  }
  return parsed;
}

function parseCli(argv: readonly string[]): WorkerOptions {
  let stageIndex: number | null = null;
  let serviceMsPerToken = 0.15;
  let host = '0.0.0.0';
  let port: number | null = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--stage') {
      const next = argv[++i];
      if (!next) throw new Error('Missing value for --stage');
      stageIndex = parseInteger(next, '--stage');
      continue;
    }
    if (arg === '--service-ms-per-token') {
      const next = argv[++i];
      if (!next) throw new Error('Missing value for --service-ms-per-token');
      serviceMsPerToken = parseNumber(next, '--service-ms-per-token');
      continue;
    }
    if (arg === '--host') {
      const next = argv[++i];
      if (!next) throw new Error('Missing value for --host');
      host = next;
      continue;
    }
    if (arg === '--port') {
      const next = argv[++i];
      if (!next) throw new Error('Missing value for --port');
      port = parseInteger(next, '--port');
      continue;
    }
    throw new Error(`Unknown flag: ${arg}`);
  }

  if (stageIndex === null || stageIndex < 0) {
    throw new Error('Expected --stage <non-negative integer>');
  }
  if (port === null || port <= 0) {
    throw new Error('Expected --port <positive integer>');
  }
  if (serviceMsPerToken < 0) {
    throw new Error('Expected --service-ms-per-token >= 0');
  }

  return {
    stageIndex,
    serviceMsPerToken,
    host,
    port,
  };
}

async function handler(
  options: WorkerOptions,
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  if (request.method !== 'POST' || request.url !== '/stage') {
    sendJson(response, 404, { error: 'not-found' });
    return;
  }

  let parsed: StageRequest;
  try {
    parsed = JSON.parse(await readBody(request)) as StageRequest;
  } catch {
    sendJson(response, 400, { error: 'invalid-json' });
    return;
  }

  const computeDelayMs = parsed.tokenCount * options.serviceMsPerToken;
  if (computeDelayMs > 0) {
    await sleep(computeDelayMs);
  }

  let checksum = 2166136261 >>> 0;
  checksum = Math.imul(checksum ^ parsed.chunkId, 16777619) >>> 0;
  checksum = Math.imul(checksum ^ parsed.tokenCount, 16777619) >>> 0;
  checksum = Math.imul(checksum ^ parsed.payload.length, 16777619) >>> 0;
  checksum = Math.imul(checksum ^ options.stageIndex, 16777619) >>> 0;

  const result: StageResponse = {
    chunkId: parsed.chunkId,
    stage: options.stageIndex,
    tokenCount: parsed.tokenCount,
    checksum,
  };

  sendJson(response, 200, result);
}

function main(): void {
  const options = parseCli(process.argv.slice(2));
  const server = createServer((request, response) => {
    void handler(options, request, response);
  });

  server.listen(options.port, options.host, () => {
    process.stdout.write(
      `gate1-stage-worker ready stage=${options.stageIndex} endpoint=http://${options.host}:${options.port}/stage serviceMsPerToken=${options.serviceMsPerToken}\n`,
    );
  });

  const shutdown = (): void => {
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
