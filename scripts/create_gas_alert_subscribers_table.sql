-- Weekly "what gas costs you" email alerts (app/components/GasAlertSignup.tsx).
-- One row per email address; re-subscribing updates the row.
CREATE TABLE IF NOT EXISTS gas_alert_subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    state CHAR(2) NOT NULL,
    fuel TEXT NOT NULL DEFAULT 'gas' CHECK (fuel IN ('gas', 'ev')),
    efficiency NUMERIC(6, 2) NOT NULL,          -- MPG (gas) or miles per kWh (EV)
    weekly_miles INTEGER NOT NULL,
    source TEXT,                                -- page/placement that collected it
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
    unsubscribe_token TEXT NOT NULL UNIQUE,
    country TEXT,
    referrer TEXT,
    welcome_message_id TEXT,
    last_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS gas_alert_subscribers_email_uidx ON gas_alert_subscribers (email); -- stored lowercased
CREATE INDEX IF NOT EXISTS gas_alert_subscribers_status_idx ON gas_alert_subscribers (status);
