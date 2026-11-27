import { Pool } from 'pg'
import { randomBytes } from 'crypto'
import type { FuelKind } from './driveCost'

// Gas price alert subscribers, kept in our own database
// (scripts/create_gas_alert_subscribers_table.sql).
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 5,
  idleTimeoutMillis: 30000,
})

export interface Subscriber {
  id: number
  email: string
  state: string
  fuel: FuelKind
  efficiency: number
  weekly_miles: number
  unsubscribe_token: string
  status: string
}

export async function upsertSubscriber(input: {
  email: string; state: string; fuel: FuelKind; efficiency: number; weeklyMiles: number
  source?: string | null; country?: string | null; referrer?: string | null
}): Promise<{ sub: Subscriber; isNew: boolean }> {
  const token = randomBytes(24).toString('base64url')
  const { rows } = await pool.query(
    `INSERT INTO gas_alert_subscribers (email, state, fuel, efficiency, weekly_miles, source, unsubscribe_token, country, referrer)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (email) DO UPDATE SET
       state = EXCLUDED.state, fuel = EXCLUDED.fuel, efficiency = EXCLUDED.efficiency,
       weekly_miles = EXCLUDED.weekly_miles, status = 'active', unsubscribed_at = NULL, updated_at = NOW()
     RETURNING id, email, state, fuel, efficiency::float AS efficiency, weekly_miles, unsubscribe_token, status,
               (xmax = 0) AS is_new`,
    [input.email.trim().toLowerCase(), input.state, input.fuel, input.efficiency, input.weeklyMiles,
      input.source?.slice(0, 120) ?? null, token, input.country ?? null, input.referrer?.slice(0, 500) ?? null],
  )
  const { is_new, ...sub } = rows[0]
  return { sub: sub as Subscriber, isNew: Boolean(is_new) }
}

export async function setWelcomeMessageId(id: number, messageId: string | null) {
  await pool.query('UPDATE gas_alert_subscribers SET welcome_message_id = $2, last_sent_at = NOW() WHERE id = $1', [id, messageId]).catch(() => {})
}

export async function unsubscribe(token: string): Promise<string | null> {
  const { rows } = await pool.query(
    `UPDATE gas_alert_subscribers SET status = 'unsubscribed', unsubscribed_at = NOW(), updated_at = NOW()
     WHERE unsubscribe_token = $1 RETURNING email`,
    [token],
  )
  return rows[0]?.email ?? null
}
