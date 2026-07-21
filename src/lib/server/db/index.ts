import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
// $env/static/private: auth CLI cannot resolve $app/env/private yet (alias collision).
import { DATABASE_URL } from '$env/static/private';
import * as schema from './schema';

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = neon(DATABASE_URL);

export const db = drizzle(client, { schema });
