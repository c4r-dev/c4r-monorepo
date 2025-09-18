#!/usr/bin/env node

// Random 5 activities test (API-driven)
// Usage: node test-random-5-from-api.js [--baseurl=http://localhost:3333] [--timeout=12000] [--headless]

const puppeteer = require('puppeteer');
const logger = require('../packages/logging/logger.js');

async function fetchActivities(baseUrl) {
  const res = await fetch(`${baseUrl}/api/activities`);
  if (!res.ok) throw new Error(`Failed to fetch activities: ${res.status}`);
  return await res.json();
}

function pickRandomN(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

async function main() {
  const args = process.argv.slice(2);
  const baseUrl = args.find(a => a.startsWith('--baseurl='))?.split('=')[1] || 'http://localhost:3333';
  const timeout = parseInt(args.find(a => a.startsWith('--timeout='))?.split('=')[1]) || 12000;
  const headless = args.includes('--headless') || true;

  logger.app.info('🧪 Random 5 Activities Test (API-driven)');
  logger.app.info(`Base URL: ${baseUrl}`);

  let activities = [];
  try {
    activities = await fetchActivities(baseUrl);
  } catch (e) {
    logger.app.error(`❌ Could not load activities from API: ${e.message}`);
    process.exit(1);
  }

  if (!Array.isArray(activities) || activities.length === 0) {
    logger.app.error('❌ No activities returned by API');
    process.exit(1);
  }

  const sample = pickRandomN(activities, Math.min(5, activities.length));
  const browser = await puppeteer.launch({ headless, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  let pass = 0;
  for (let i = 0; i < sample.length; i++) {
    const a = sample[i];
    const url = a.url || `${baseUrl}${a.route}`;
    logger.app.info(`[${i + 1}/${sample.length}] ${a.route}`);
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
      const status = resp?.status?.() || 0;
      const title = await page.title();
      logger.app.info(`   ✅ status=${status} title="${title}"`);
      pass++;
    } catch (err) {
      logger.app.info(`   ❌ ${err.message}`);
    }
  }

  await browser.close();
  logger.app.info(`\n🎯 Passed ${pass}/${sample.length}`);
  process.exit(pass === sample.length ? 0 : 1);
}

main().catch(err => {
  logger.app.error('💥 Runner failed:', err);
  process.exit(1);
});

