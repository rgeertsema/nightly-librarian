import { callLLM } from '../lib/llm';
import { NIGHTLY_CONSOLIDATION_PROMPT, MANUAL_PROMOTION_PROMPT } from '../prompts';
import { Artifact, GraphData } from '../types/schema';

interface PromotionResult {
    promoted: { artifact: Artifact; graph: GraphData; evidence: any; }[];
    daily_digest: Artifact;
    morning_brief: any;
}

export class PromotionEngine {
    async runNightlyConsolidation(date: string, dailyMaterial: any[], maxPromotions = 5): Promise<PromotionResult> {
        const response = await callLLM(NIGHTLY_CONSOLIDATION_PROMPT, JSON.stringify({ today_date: date, daily_material: dailyMaterial, max_promotions: maxPromotions }, null, 2));
        if (!response.promoted || !response.daily_digest) throw new Error('Invalid response from Nightly Consolidation LLM');
        return response as PromotionResult;
    }

    async runManualPromotion(date: string, excerpt: string, promoteTitle: string): Promise<{ artifact: Artifact; graph: GraphData }> {
        const response = await callLLM(MANUAL_PROMOTION_PROMPT, JSON.stringify({ today_date: date, promote_title: promoteTitle, excerpt }, null, 2));
        if (!response.artifact || !response.graph) throw new Error('Invalid response from Manual Promotion LLM');
        return response as { artifact: Artifact; graph: GraphData };
    }
}
