export type AeonObjectProjectionKind = 'document' | 'app' | 'agent' | 'stream';
export type AeonAppProjectionKind = 'panel' | 'window';
export type AeonAgentProjectionKind = 'kernel-daemon' | 'session-agent';
export type AeonStreamProjectionKind = 'flow' | 'http-bridge';
export interface AeonProjectionBootstrap {
    href: string;
}
export interface AeonObjectIdentity {
    objectKind: string;
    canonicalAddress: string;
    worldAlias?: string;
    nodeId?: string;
    graphCid?: string;
    lineage?: string[];
}
export interface AeonObjectAuthority {
    contract: string;
    requiredCapabilities: string[];
}
export interface AeonObjectWitness {
    source: string;
    status: string;
    generatedAt?: number;
    snapshotRoot?: string;
    cacheTtlMs: number;
    sourceBadge: string;
    proofAvailable?: boolean;
}
export interface AeonObjectStorage {
    scope: string;
    worldAlias?: string;
    snapshotRoot?: string;
}
export interface AeonObjectReplication {
    ladder: string[];
    selected: string;
    httpFallback: boolean;
}
export interface AeonObjectViews {
    aeon: string;
    did?: string;
    https?: string;
    chamber?: string;
}
export interface AeonDocumentProjection<TContent = unknown> {
    href: string;
    mimeType: string;
    title?: string;
    content?: TContent;
}
export interface AeonAppProjection {
    kind: AeonAppProjectionKind;
    title: string;
    bootstrap: AeonProjectionBootstrap;
    storageNamespace: string;
    requestedCapabilities: string[];
    routes?: string[];
    href?: string;
    panelId?: string;
    manifestId?: string;
}
export interface AeonAgentProjection {
    kind: AeonAgentProjectionKind;
    entrypoint: string;
    storageNamespace: string;
    requestedCapabilities: string[];
    eventChannel?: string;
    daemonId?: string;
    capabilityScope?: string;
}
export interface AeonStreamProjection {
    kind: AeonStreamProjectionKind;
    endpoint: string;
    protocol: string;
    framing: string;
    requestedCapabilities: string[];
}
export interface AeonObjectProjections<TDocument = unknown> {
    document?: AeonDocumentProjection<TDocument>;
    app?: AeonAppProjection;
    agent?: AeonAgentProjection;
    stream?: AeonStreamProjection;
}
export interface AeonObjectEnvelope<TDocument = unknown> {
    version: 'aeon-object/v1';
    source: string;
    resolvedAt: number;
    selectedProjection: AeonObjectProjectionKind;
    identity: AeonObjectIdentity;
    authority: AeonObjectAuthority;
    witness: AeonObjectWitness;
    storage: AeonObjectStorage;
    replication: AeonObjectReplication;
    views: AeonObjectViews;
    projections: AeonObjectProjections<TDocument>;
}
