import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { assess, assessmentSchema, RULES_VERSION } from '../shared/assessment';

const reply = (statusCode: number, data: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json', 'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? 'http://127.0.0.1:5173',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff',
  }, body: JSON.stringify(data),
});

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const requestId = event.requestContext?.requestId ?? 'local';
  // Never log request bodies, photos, label text, contact details, or tokens.
  console.info(JSON.stringify({ requestId, method: event.httpMethod, route: event.resource ?? event.path }));
  if (event.httpMethod === 'OPTIONS') return reply(204, null);
  if (event.httpMethod === 'GET' && event.path === '/health') {
    return reply(200, { service: 'rebootroute', status: 'ok', rulesVersion: RULES_VERSION, persistence: false, aiMode: 'manual' });
  }
  if (event.httpMethod === 'GET' && event.path === '/session') {
    // Claims must come from API Gateway's Cognito authorizer, never browser headers/body.
    const claims = event.requestContext?.authorizer?.claims;
    if (!claims?.sub) return reply(401, { message: 'Sign in to continue.' });
    if (process.env.COGNITO_CLIENT_ID && claims.aud !== process.env.COGNITO_CLIENT_ID) return reply(403, { message: 'Access denied.' });
    const groups = typeof claims['cognito:groups'] === 'string' ? claims['cognito:groups'].split(',').map((value: string) => value.replace(/[\[\]\s]/g, '')) : [];
    const roles = groups.filter((group: string) => ['ADMIN', 'VOLUNTEER', 'PARTNER'].includes(group));
    if (!roles.length) return reply(403, { message: 'Access denied.' });
    return reply(200, { roles });
  }
  if (event.httpMethod === 'POST' && event.path === '/assessments/preview') {
    const body = event.isBase64Encoded ? Buffer.from(event.body ?? '', 'base64').toString('utf8') : event.body ?? '';
    if (Buffer.byteLength(body, 'utf8') > 16_384) return reply(413, { message: 'Assessment is too large.' });
    let data: unknown;
    try { data = JSON.parse(body); } catch { return reply(400, { message: 'Send a valid JSON assessment.' }); }
    const parsed = assessmentSchema.safeParse(data);
    if (!parsed.success) return reply(400, { message: 'Check the assessment answers.', fields: parsed.error.issues.map(issue => ({ path: issue.path.join('.'), message: issue.message })) });
    return reply(200, assess(parsed.data));
  }
  return reply(404, { message: 'Route not found.' });
}
