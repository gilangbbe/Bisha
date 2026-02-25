-- Supabase SQL: Run this in the Supabase SQL Editor
-- Creates the concepts table for the Differentiation-First Learning Tool

CREATE TABLE IF NOT EXISTS concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('PRODUCT', 'PROCESS', 'ROLE', 'POLICY', 'OTHER')),
  purpose TEXT NOT NULL,
  used_when TEXT NOT NULL DEFAULT '',
  key_characteristics TEXT[] NOT NULL DEFAULT '{}',
  key_difference TEXT NOT NULL,
  exam_memory_hook TEXT NOT NULL,
  exam_trap_alert TEXT,
  confused_with UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (allow all for anon key in MVP)
ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON concepts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for fast category filtering
CREATE INDEX IF NOT EXISTS idx_concepts_category ON concepts(category);

-- Index for text search on title
CREATE INDEX IF NOT EXISTS idx_concepts_title ON concepts USING gin(to_tsvector('english', title));

-- Seed data: sample banking concepts
INSERT INTO concepts (id, title, category, purpose, used_when, key_characteristics, key_difference, exam_memory_hook, exam_trap_alert, confused_with)
VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Savings Account',
    'PRODUCT',
    'A deposit account that earns interest while keeping funds accessible for the customer.',
    'When a customer wants to save money safely with modest returns and maintain liquidity.',
    ARRAY['Earns interest on deposits', 'FDIC/LPS insured', 'Limited withdrawal frequency'],
    'Unlike fixed deposits, savings accounts allow withdrawals anytime but offer lower interest rates.',
    'Savings = Safety + Small returns. Think "piggy bank with interest."',
    'Don''t confuse with money market accounts — savings accounts typically have lower minimums and fewer check-writing privileges.',
    ARRAY['b2c3d4e5-f6a7-8901-bcde-f12345678901']::UUID[]
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Fixed Deposit (Time Deposit)',
    'PRODUCT',
    'A deposit product where funds are locked for a fixed period at a guaranteed interest rate.',
    'When a customer has surplus funds they won''t need immediately and wants higher guaranteed returns.',
    ARRAY['Fixed tenure (1 month to 5 years)', 'Higher interest than savings', 'Early withdrawal penalty'],
    'Unlike savings accounts, funds are locked — you trade liquidity for higher returns.',
    'Fixed Deposit = Fixed time, Fixed rate. "Lock it to earn it."',
    'Watch out: some exams test whether FD interest is simple or compound — it varies by bank policy.',
    ARRAY['a1b2c3d4-e5f6-7890-abcd-ef1234567890']::UUID[]
  ),
  (
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'KYC Process',
    'PROCESS',
    'Know Your Customer — the mandatory process of verifying a customer''s identity before opening an account or providing services.',
    'When onboarding new customers, conducting periodic reviews, or when suspicious activity is detected.',
    ARRAY['Identity verification (ID, photo)', 'Address verification', 'Risk categorization (low/medium/high)'],
    'KYC is about IDENTITY verification; AML is about TRANSACTION monitoring. KYC feeds into AML but they are distinct processes.',
    'KYC = "Know" before you "go." No KYC, no account.',
    'Exams often mix up KYC with CDD (Customer Due Diligence). CDD is a component of KYC, not a synonym.',
    ARRAY['d4e5f6a7-b8c9-0123-defa-234567890123']::UUID[]
  ),
  (
    'd4e5f6a7-b8c9-0123-defa-234567890123',
    'AML (Anti-Money Laundering)',
    'PROCESS',
    'The set of procedures and controls to detect, prevent, and report money laundering activities.',
    'Ongoing — applied to all transactions, with enhanced scrutiny for high-risk customers or unusual patterns.',
    ARRAY['Transaction monitoring', 'Suspicious Activity Reports (SAR)', 'Regulatory compliance requirement'],
    'AML monitors TRANSACTIONS for suspicious patterns; KYC verifies IDENTITY at onboarding. AML is ongoing, KYC is periodic.',
    'AML = Always Monitoring Laundering. Think "watching the money flow."',
    'Don''t assume AML only applies to large transactions. Structuring (splitting deposits) is a key red flag.',
    ARRAY['c3d4e5f6-a7b8-9012-cdef-123456789012']::UUID[]
  ),
  (
    'e5f6a7b8-c9d0-1234-efab-345678901234',
    'Relationship Manager (RM)',
    'ROLE',
    'The primary point of contact for high-value or priority banking customers, responsible for managing the overall relationship.',
    'When dealing with priority/wealth customers who need personalized service and cross-selling of products.',
    ARRAY['Manages portfolio of clients', 'Cross-sells products', 'Responsible for retention & growth'],
    'An RM focuses on RELATIONSHIP and holistic needs; a Product Specialist focuses on one specific product area.',
    'RM = "Relationship" is the keyword. They own the client, not the product.',
    'Exams may ask about RM vs. Financial Advisor — RM is bank-side relationship, FA gives investment advice (may need certification).',
    ARRAY[]::UUID[]
  );

-- ═══════════════════════════════════════════════════════════
-- Process Visualization Module
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  process_type TEXT NOT NULL CHECK (process_type IN ('LINEAR', 'DECISION', 'CYCLICAL')),
  trigger TEXT NOT NULL DEFAULT '',
  outcome TEXT NOT NULL DEFAULT '',
  steps JSONB NOT NULL DEFAULT '[]',
  exam_trap_alert TEXT,
  confused_with UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE processes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access on processes" ON processes
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_processes_type ON processes(process_type);

-- Seed data: sample banking processes
INSERT INTO processes (id, title, process_type, trigger, outcome, steps, exam_trap_alert, confused_with)
VALUES
  (
    'f1a2b3c4-d5e6-7890-abcd-111111111111',
    'Loan Approval Process (Retail)',
    'DECISION',
    'Customer submits a retail loan application at the branch or online.',
    'Loan is either approved and disbursed, or rejected with documented reasons.',
    '[
      {"id": "s1", "order": 1, "action": "Customer submits loan application with required documents.", "actor": "Customer"},
      {"id": "s2", "order": 2, "action": "Branch officer verifies KYC and document completeness.", "actor": "Branch Officer"},
      {"id": "s3", "order": 3, "action": "Credit check performed against bureau records.", "actor": "Credit Analyst", "decision": {"question": "Does credit score meet minimum threshold?", "options": [
        {"id": "o1", "label": "Yes — Approved", "steps": [
          {"id": "s4", "order": 1, "action": "Risk assessment and collateral evaluation completed.", "actor": "Risk Officer"},
          {"id": "s5", "order": 2, "action": "Loan approved and funds disbursed to customer account.", "actor": "Branch Manager", "notes": "Approval authority depends on loan amount tier."}
        ]},
        {"id": "o2", "label": "No — Rejected", "steps": [
          {"id": "s6", "order": 1, "action": "Application rejected with formal rejection letter.", "actor": "Branch Officer", "notes": "Customer may re-apply after 6 months with improved score."}
        ]}
      ]}}
    ]'::JSONB,
    'Exams often ask who has final approval authority — it depends on loan amount tiers, not always the branch manager.',
    ARRAY['f1a2b3c4-d5e6-7890-abcd-222222222222']::UUID[]
  ),
  (
    'f1a2b3c4-d5e6-7890-abcd-222222222222',
    'Credit Card Issuance',
    'LINEAR',
    'Customer applies for a credit card via branch, online, or pre-approved offer.',
    'Credit card is issued, activated, and delivered to the customer.',
    '[
      {"id": "s1", "order": 1, "action": "Customer fills credit card application form.", "actor": "Customer"},
      {"id": "s2", "order": 2, "action": "Income verification and employment check performed.", "actor": "Verification Team"},
      {"id": "s3", "order": 3, "action": "Credit limit determined based on income and bureau score.", "actor": "Credit Analyst", "notes": "Pre-approved customers may skip this step."},
      {"id": "s4", "order": 4, "action": "Card manufactured and shipped to branch or customer address.", "actor": "Card Operations"},
      {"id": "s5", "order": 5, "action": "Customer activates card via phone or online banking.", "actor": "Customer"}
    ]'::JSONB,
    'Don''t confuse credit card issuance with loan approval — credit cards are revolving credit with no fixed tenure.',
    ARRAY['f1a2b3c4-d5e6-7890-abcd-111111111111']::UUID[]
  );
