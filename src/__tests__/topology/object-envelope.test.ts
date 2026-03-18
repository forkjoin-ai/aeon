import { describe, expect, it } from 'vitest';
import type { AeonObjectEnvelope } from '../../topology/object';

describe('aeon object envelope', () => {
  it('supports document, app, agent, and stream projections on one object', () => {
    const envelope: AeonObjectEnvelope<{ html: string }> = {
      version: 'aeon-object/v1',
      source: 'local',
      resolvedAt: 1_710_000_000_000,
      selectedProjection: 'app',
      identity: {
        objectKind: 'rhizome-node',
        canonicalAddress: 'aeon://rhizome/default/n/focus-node',
        worldAlias: 'default',
        nodeId: 'focus-node',
        graphCid: 'node:focus',
        lineage: ['seed-default', '0xsnapshot'],
      },
      authority: {
        contract: 'ucan+effects',
        requiredCapabilities: ['rhizome/read'],
      },
      witness: {
        source: 'local',
        status: 'local',
        generatedAt: 1_710_000_000_000,
        snapshotRoot: '0xsnapshot',
        cacheTtlMs: 15_000,
        sourceBadge: 'local snapshot',
        proofAvailable: true,
      },
      storage: {
        scope: 'world,node,profile',
        worldAlias: 'default',
        snapshotRoot: '0xsnapshot',
      },
      replication: {
        ladder: ['local', 'cache', 'peer', 'server', 'http'],
        selected: 'local',
        httpFallback: true,
      },
      views: {
        aeon: 'aeon://rhizome/default/n/focus-node',
        did: 'did:aeon:rhizome:default:focus-node',
      },
      projections: {
        document: {
          href: 'aeon://rhizome/default/n/focus-node',
          mimeType: 'text/html; charset=utf-8',
          title: 'Focus Node',
          content: {
            html: '<article>focus</article>',
          },
        },
        app: {
          kind: 'panel',
          title: 'Focus Node',
          bootstrap: {
            href: 'aeon://rhizome/default/n/focus-node?projection=app',
          },
          storageNamespace: 'default:focus-node:app',
          requestedCapabilities: ['rhizome/read'],
          routes: ['aeon://rhizome/default/n/focus-node'],
        },
        agent: {
          kind: 'session-agent',
          entrypoint: 'aeon://rhizome/default/n/focus-node?projection=agent',
          storageNamespace: 'default:focus-node:agent',
          requestedCapabilities: ['rhizome/read'],
          eventChannel: 'aeon.object.focus-node',
        },
        stream: {
          kind: 'flow',
          endpoint: 'aeon://rhizome/default/n/focus-node?projection=stream',
          protocol: 'aeon-object',
          framing: '10-byte-frame',
          requestedCapabilities: ['flow.open'],
        },
      },
    };

    expect(envelope.projections.app?.bootstrap.href).toContain('projection=app');
    expect(envelope.projections.agent?.entrypoint).toContain('projection=agent');
    expect(envelope.projections.stream?.framing).toBe('10-byte-frame');
  });
});
