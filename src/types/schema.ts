
export type ArtifactType = "Note"|"Insight"|"Framework"|"Playbook"|"Decision"|"Draft"|"ClientCase"|"Question"|"DailyDigest";
export type ArtifactStatus = "seed"|"draft"|"stable"|"published"|"archived";
export type EntityKind = "Org"|"Place"|"Product"|"Person"|"Work"|"Other";
export type SourceKind = "chatgpt"|"doc"|"notion"|"email"|"web"|"other";
export interface ArtifactEntity { kind: EntityKind; name: string; }
export interface EmbeddedDecision { id: `D-${string}`; text: string; }
export interface EmbeddedQuestion { id: `Q-${string}`; text: string; }
export interface ArtifactSource { kind: SourceKind; thread_id?: string; url?: string; excerpt?: string; }
export interface ArtifactScores { confidence: number; reuse: number; specificity: number; novelty: number; }
export interface Artifact {
    id: `A-${string}`; type: ArtifactType; title: string; date: string; status: ArtifactStatus;
    summary: string; core_claims?: string[]; decisions?: EmbeddedDecision[]; open_questions?: EmbeddedQuestion[];
    next_actions?: string[]; domains: string[]; projects?: `P-${string}`[]; concepts?: `C-${string}`[];
    entities?: ArtifactEntity[]; tags: string[]; source: ArtifactSource; scores: ArtifactScores; text?: string;
}
export type NodeType = "Artifact"|"Concept"|"Project"|"Domain"|"Entity"|"Person"|"Decision"|"Question";
export type EdgeType = "MENTIONS"|"ABOUT"|"PART_OF"|"DERIVES_FROM"|"ELABORATES"|"CONTRADICTS"|"ANSWERS"|"RAISES"|"DECIDES"|"NEXT_STEP";
export interface GraphLink { from: string; rel: EdgeType; to: string; weight?: number; }
export interface GraphData {
    concepts?: { id: string; name: string }[]; projects?: { id: string; name: string }[];
    domains?: { name: string }[]; entities?: ArtifactEntity[]; links: GraphLink[];
}
