import { IngestionService } from './pipeline/ingest';
import { PromotionEngine } from './pipeline/promote';
import { SupabaseAdapter } from './storage/supabase';
import { WeaviateAdapter } from './storage/weaviate';
import { FileSystemAdapter } from './storage/fs-artifacts';
import { EmailService } from './lib/email';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const mode = process.argv[2];
    const today = new Date().toISOString().split('T')[0];
    const fsAdapter = new FileSystemAdapter('artifacts');
    const supabase  = new SupabaseAdapter();
    const weaviate  = new WeaviateAdapter();
    const email     = new EmailService();
    await fsAdapter.init();

    try {
        if (mode === 'setup') {
            await weaviate.initSchema();
            console.log('Setup complete.');
        } else if (mode === 'nightly') {
            const ingest = new IngestionService();
            await ingest.ensureInbox();
            const material = await ingest.getDailyMaterial(today);
            if (!material.length) { console.log('No material for today.'); return; }
            const result = await new PromotionEngine().runNightlyConsolidation(today, material);
            for (const item of result.promoted) {
                await fsAdapter.saveArtifact(item.artifact);
                await supabase.upsertArtifactGraph(item.artifact, item.graph);
                await weaviate.storeArtifact(item.artifact);
            }
            if (result.daily_digest) {
                await fsAdapter.saveArtifact(result.daily_digest);
                await weaviate.storeArtifact(result.daily_digest);
            }
            if (result.morning_brief) await email.sendMorningBrief(today, result.morning_brief);
        } else if (mode === 'manual') {
            console.log('Manual mode — stub.');
        } else {
            console.log('Usage: ts-node src/index.ts [setup|nightly|manual]');
        }
    } catch (e) { console.error('FATAL:', e); }
}

main();
