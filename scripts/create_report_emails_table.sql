-- Every email address someone gives us (today: the Fuel Savings Calculator's
-- "email me my report"), kept in our own database so the list never depends
-- on the email provider. One row per send.
CREATE TABLE IF NOT EXISTS report_emails (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'fuel_savings_report',
    vehicle1 TEXT,
    vehicle2 TEXT,
    annual_mileage INTEGER,
    annual_savings NUMERIC(10, 2),
    report JSONB,
    status TEXT NOT NULL DEFAULT 'pending',
    error TEXT,
    brevo_message_id TEXT UNIQUE,
    country TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS report_emails_email_idx ON report_emails (LOWER(email));
CREATE INDEX IF NOT EXISTS report_emails_created_idx ON report_emails (created_at);
