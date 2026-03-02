import cron from 'node-cron';
import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { EmailService } from './lib/email';
dotenv.config();

const NIGHTLY = process.env.LIBRARIAN_CRON        ?? '0 2 * * *';
const REVIEW  = process.env.LIBRARIAN_REVIEW_CRON ?? '30 5 * * *';
const ROOT = path.resolve(__dirname, '..');
const TZ   = Intl.DateTimeFormat().resolvedOptions().timeZone;
const stamp = () => new Date().toISOString();

async function sendReviewReminder() {
    const today = new Date().toISOString().split('T')[0];
    try {
        const p = path.join(ROOT, 'inbox', `${today}.json`);
        if (!fs.existsSync(p)) { console.log(`No inbox for ${today}.`); return; }
        const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
        const count = Array.isArray(data) ? data.length : 0;
        if (!count) return;
        spawn('npx', ['ts-node', path.join(ROOT, 'src/review-server.ts')], { cwd: ROOT, detached: true, stdio: 'ignore' }).unref();
        await new EmailService().sendReviewReminder(today, count);
    } catch (e: any) { console.error('Review reminder failed:', e.message); }
}

function runNightly() {
    console.log(`[${stamp()}] ▶ Nightly run...`);
    try {
        console.log(execSync(`npx ts-node ${path.join(ROOT, 'src/index.ts')} nightly`, { cwd: ROOT, encoding: 'utf8' }));
        console.log(`[${stamp()}] ✅ Done.`);
    } catch (e: any) { console.error(`[${stamp()}] ❌ FAILED:`, e.stderr ?? e.message); }
}

for (const [n, expr] of [['nightly', NIGHTLY], ['review', REVIEW]]) {
    if (!cron.validate(expr as string)) { console.error(`Invalid cron for ${n}: ${expr}`); process.exit(1); }
}

console.log(`[${stamp()}] 🕑 Scheduler | Nightly: ${NIGHTLY} | Review: ${REVIEW} | TZ: ${TZ}`);
cron.schedule(REVIEW,  sendReviewReminder, { timezone: TZ });
cron.schedule(NIGHTLY, runNightly,         { timezone: TZ });
