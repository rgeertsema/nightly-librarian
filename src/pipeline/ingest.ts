import fs from 'fs/promises';
import path from 'path';

export class IngestionService {
    private inboxPath = path.resolve(process.cwd(), 'inbox');

    async ensureInbox() {
        try { await fs.access(this.inboxPath); }
        catch { await fs.mkdir(this.inboxPath, { recursive: true }); }
    }

    async getDailyMaterial(date: string): Promise<any[]> {
        const filePath = path.join(this.inboxPath, `${date}.json`);
        try {
            const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
            if (!Array.isArray(data)) return [];
            const all = data.map((item: any) => ({ ...item, text: item._was_edited ? item.text : (item.text || '') }));
            const accepted = all.filter((item: any) => item._review !== 'rejected');
            accepted.forEach((item: any) => { if (!item._review || item._review === 'pending') item._flagged_unreviewed = true; });
            const rejected = all.length - accepted.length;
            const flagged  = accepted.filter((i: any) => i._flagged_unreviewed).length;
            if (rejected > 0) console.log(`[review] Skipped ${rejected} rejected item(s).`);
            if (flagged  > 0) console.warn(`[review] ⚠ ${flagged} item(s) unreviewed — flagged but included.`);
            return accepted;
        } catch {
            console.warn(`No inbox file for ${date}.`);
            return [];
        }
    }
}
