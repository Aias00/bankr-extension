import { BankrJobResponse, Position, Balance, Market, BankrSnapshot } from '../types';

const BASE_URL = 'https://api.bankr.bot';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const assertOk = async (response: Response): Promise<void> => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
};

export const submitJob = async (prompt: string, apiKey: string): Promise<string> => {
  const res = await fetch(`${BASE_URL}/agent/prompt`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  });
  await assertOk(res);
  const data = (await res.json()) as BankrJobResponse;
  if (!data.jobId) throw new Error('Missing jobId');
  return data.jobId;
};

export const pollJob = async <T>(jobId: string, apiKey: string, maxWait = 80): Promise<T> => {
  const start = Date.now();
  while (Date.now() - start < maxWait * 1000) {
    const res = await fetch(`${BASE_URL}/agent/job/${jobId}`, {
      headers: { 'X-API-Key': apiKey }
    });
    await assertOk(res);
    const data = (await res.json()) as BankrJobResponse<T>;
    if (data.status === 'completed') {
      if (data.response === undefined) throw new Error('Empty response');
      return data.response;
    }
    if (data.status === 'failed') {
      throw new Error(data.error || 'Job failed');
    }
    await sleep(2000);
  }
  throw new Error('Job timeout');
};

const promptJson = (task: string, shape: string) =>
  `${task}. Return ONLY valid JSON with this shape: ${shape}. No markdown, no extra text.`;

const parseJson = <T>(raw: unknown): T => {
  try {
    if (typeof raw === 'string') {
      return JSON.parse(raw) as T;
    }
    return raw as T;
  } catch (error) {
    throw new Error(`Invalid JSON response: ${(error as Error).message}`);
  }
};

export const fetchPositions = async (apiKey: string): Promise<Position[]> => {
  const jobId = await submitJob(
    promptJson(
      'Show my Polymarket positions',
      '[{ "id": "string", "market": "string", "side": "UP|DOWN", "shares": 0, "entryPrice": 0, "currentPrice": 0, "pnlUsd": 0, "pnlPct": 0, "status": "active|settled|redeemable", "expiresAt": "ISO8601" }]'
    ),
    apiKey
  );
  return parseJson(await pollJob(jobId, apiKey));
};

export const fetchBalances = async (apiKey: string): Promise<Balance[]> => {
  const jobId = await submitJob(
    promptJson(
      'Show my wallet balances across Polygon USDC and USDT',
      '[{ "chain": "Polygon|Ethereum|Solana|Other", "symbol": "string", "amount": 0, "usdValue": 0 }]'
    ),
    apiKey
  );
  return parseJson(await pollJob(jobId, apiKey));
};

export const fetchMarkets = async (apiKey: string): Promise<Market[]> => {
  const jobId = await submitJob(
    promptJson(
      'List trending Polymarket markets',
      '[{ "id": "string", "title": "string", "priceUp": 0, "priceDown": 0, "volumeUsd": 0, "category": "string", "trend": [0,1,2] }]'
    ),
    apiKey
  );
  return parseJson(await pollJob(jobId, apiKey));
};

export const fetchSnapshot = async (apiKey: string): Promise<BankrSnapshot> => {
  const [positions, balances, markets] = await Promise.all([
    fetchPositions(apiKey),
    fetchBalances(apiKey),
    fetchMarkets(apiKey)
  ]);
  return {
    positions,
    balances,
    markets,
    lastUpdated: new Date().toISOString()
  };
};

export const submitTrade = async (apiKey: string, prompt: string): Promise<string> => {
  const jobId = await submitJob(prompt, apiKey);
  const response = await pollJob<string>(jobId, apiKey);
  return typeof response === 'string' ? response : JSON.stringify(response);
};
