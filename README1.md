# Bankr for Polymarket (Chrome/Edge Extension)

A Manifest V3 browser extension that integrates the Bankr API for real-time Polymarket monitoring and fast trading.

## Features
- Real-time positions with PnL tracking
- Wallet balances (Polygon USDC/USDT)
- Trending markets + search
- One-click trades with optional stop loss / take profit
- Notifications for position updates and settlement
- Local caching and 2-second polling while popup is open

## Setup
1. Install dependencies:

```bash
npm install
```

2. Build the extension:

```bash
npm run build
```

3. Load in Chrome/Edge:
- Open `chrome://extensions/`
- Enable **Developer mode**
- Click **Load unpacked**
- Select the `dist/` folder

## Configure API Key
Open the extension popup, paste your Bankr API key, and click **Save API Key**.

## Notes on Security
The API key is stored encrypted using Web Crypto (AES-GCM). The encryption key is generated and stored locally in extension storage. This provides encryption-at-rest inside extension storage but is not equivalent to hardware-backed secrets.

## Development
```bash
npm run dev
```

## Testing
```bash
npm run test
```

## Project Structure
See `src/` for popup UI, background service worker, and utilities.
