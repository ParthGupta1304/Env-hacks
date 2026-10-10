import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../backend/handler';

const event = (path: string, httpMethod = 'GET', body: unknown = undefined, claims?: Record<string, string>): APIGatewayProxyEvent => ({
  path, resource: path, httpMethod, body: body === undefined ? null : JSON.stringify(body), isBase64Encoded: false,
  requestContext: { requestId: 'test-request', authorizer: claims ? { claims } : undefined },
} as APIGatewayProxyEvent);
const input = { category: 'PHONE', consent: true, safetyReviewed: true, safetyFlags: [], faults: [], responses: { powersOn: 'YES', charges: 'YES', works: 'YES', resetPossible: 'YES' } };
beforeEach(() => { vi.spyOn(console, 'info').mockImplementation(() => {}); vi.stubEnv('COGNITO_CLIENT_ID', 'expected-client'); });
describe('Lambda assessment preview', () => {
  it('runs the same rules and does not claim persistence', async () => {
    expect(JSON.parse((await handler(event('/health'))).body).persistence).toBe(false);
    const response = await handler(event('/assessments/preview', 'POST', input));
    expect(response.statusCode).toBe(200); expect(JSON.parse(response.body).outcome).toBe('REUSE');
  });
  it('honours a safety flag', async () => expect(JSON.parse((await handler(event('/assessments/preview', 'POST', { ...input, safetyFlags: ['SWELLING'] }))).body).outcome).toBe('SAFETY_REVIEW'));
  it('rejects malformed JSON and missing consent', async () => {
    expect((await handler({ ...event('/assessments/preview', 'POST'), body: '{' })).statusCode).toBe(400);
    expect((await handler(event('/assessments/preview', 'POST', { ...input, consent: false }))).statusCode).toBe(400);
  });
  it('rejects oversized bodies and unknown routes', async () => {
    expect((await handler({ ...event('/assessments/preview', 'POST'), body: 'x'.repeat(17000) })).statusCode).toBe(413);
    expect((await handler(event('/devices'))).statusCode).toBe(404);
  });
  it('logs no user body fields', async () => {
    await handler(event('/assessments/preview', 'POST', { ...input, brand: 'private label' }));
    expect(JSON.stringify(vi.mocked(console.info).mock.calls)).not.toContain('private label');
  });
});
describe('Cognito session boundary', () => {
  it('denies missing authorizer claims and unassigned users', async () => {
    expect((await handler(event('/session'))).statusCode).toBe(401);
    expect((await handler(event('/session', 'GET', undefined, { sub: 'u', aud: 'expected-client' }))).statusCode).toBe(403);
  });
  it('returns only allowed roles', async () => {
    const response = await handler(event('/session', 'GET', undefined, { sub: 'u', aud: 'expected-client', 'cognito:groups': 'ADMIN,OTHER' }));
    expect(response.statusCode).toBe(200); expect(JSON.parse(response.body)).toEqual({ roles: ['ADMIN'] });
  });
  it('denies a token from a different application client', async () => {
    expect((await handler(event('/session', 'GET', undefined, { sub: 'u', aud: 'other-client', 'cognito:groups': 'ADMIN' }))).statusCode).toBe(403);
  });
});
