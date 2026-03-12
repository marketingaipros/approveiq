-- USE THIS SCRIPT TO SEED THE INITIAL MULTI-BUREAU REQUIREMENTS
-- Run this in your Supabase SQL Editor AFTER applying multi-bureau-schema.sql

-- Clear existing data just in case this is re-run during setup
DELETE FROM dynamic_requirements;
DELETE FROM bureaus;

-- ==========================================
-- 0. SEED ACTIVE BUREAUS
-- ==========================================
INSERT INTO bureaus (name, description) VALUES 
('Equifax', 'Consumer and commercial credit reporting.'),
('Experian', 'Global information services and credit reporting.'),
('D&B', 'Dun & Bradstreet commercial data and insights.'),
('SBFE', 'Small Business Financial Exchange trade data.'),
('Creditsafe', 'Global business intelligence and credit checks.');

INSERT INTO dynamic_requirements (bureau_name, field_key, field_label, field_type, options, is_required, display_order) VALUES
-- ==========================================
-- 1. GLOBAL / FLEX LAYER (Applied to all)
-- ==========================================
('Global', 'industry', 'Industry', 'select', '["Banking", "Auto", "Service", "Consulting", "Other"]', true, 10),
('Global', 'account_types', 'Account Types', 'select', '["Loans", "Lines of Credit", "Leases", "Consulting Services", "Other"]', true, 20),
('Global', 'product_structure', 'Product Structure', 'select', '["Revolving", "Installment", "Secured", "Other"]', true, 30),
('Global', 'repayment_duration', 'Repayment Terms (Duration)', 'text', null, true, 40),
('Global', 'repayment_method', 'Repayment Method', 'select', '["Credit", "ACH", "Debit", "Other"]', true, 50),
('Global', 'expected_records', 'Volume Declaration (Currently Expected Records)', 'number', null, true, 60),
('Global', 'growth_projections', '12/24 Month Growth Projections', 'text', null, true, 70),

-- ==========================================
-- 2. BUREAU-SPECIFIC INJECTIONS
-- ==========================================

-- EQUIFAX
('Equifax', 'equifax_dispute_summary', 'Summarize Dispute Process', 'text', null, true, 10),
('Equifax', 'equifax_dispute_pdf', 'Upload Documented Dispute Procedures', 'file', null, true, 20),
('Equifax', 'equifax_member_number', 'Equifax Member Number', 'text', null, false, 30),

-- D&B (Dun & Bradstreet)
('D&B', 'dnb_duns', 'Enter D-U-N-S Number', 'text', null, true, 10),
('D&B', 'dnb_trade_references', 'Identify 3 Trade References', 'text', null, true, 20),

-- EXPERIAN
('Experian', 'experian_naics', 'Input NAICS/SIC Industry Code', 'text', null, true, 10),

-- SBFE (Small Business Financial Exchange)
('SBFE', 'sbfe_credit_utilization', 'Confirm Credit Utilization reporting capability', 'select', '["Yes", "No"]', true, 10),

-- CREDITSAFE
('Creditsafe', 'creditsafe_intl_ops', 'International Operations (Global Data)', 'select', '["Yes", "No"]', true, 10);
