-- ==============================================================================
-- BRAC BANK AFO WORK STATION - SUPABASE DATABASE SCHEMA
-- Multi-Tenancy by Outlet, Real-Time Sync, Categorized Reporting, and Full Cloud Data Architecture
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. OUTLETS TABLE
CREATE TABLE IF NOT EXISTS public.outlets (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    district TEXT NOT NULL DEFAULT 'Dhaka',
    division TEXT NOT NULL DEFAULT 'Dhaka',
    zone TEXT NOT NULL DEFAULT 'Operations Division',
    manager_name TEXT NOT NULL DEFAULT 'Branch Manager',
    manager_phone TEXT,
    contact_number TEXT,
    contact_email TEXT,
    address TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_suspended BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    suspended_at TIMESTAMPTZ,
    suspended_reason TEXT,
    deleted_at TIMESTAMPTZ,
    deleted_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. USER PROFILES (AFO OFFICERS) TABLE
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL DEFAULT '1234',
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    avatar_url TEXT,
    outlet_id TEXT NOT NULL,
    outlet_name TEXT NOT NULL,
    outlet_code TEXT,
    outlet_location TEXT,
    employee_id TEXT,
    designation TEXT DEFAULT 'Assistant Field Officer (AFO)',
    years_of_service NUMERIC DEFAULT 0,
    bio TEXT,
    blood_group TEXT,
    emergency_contact TEXT,
    supervisor_name TEXT,
    facebook TEXT,
    instagram TEXT,
    whatsapp TEXT,
    role TEXT NOT NULL DEFAULT 'USER',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    previous_outlet_ids TEXT[] DEFAULT '{}',
    previous_outlet_access_revoked BOOLEAN NOT NULL DEFAULT false,
    needs_reset_login_notice BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_login_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. ADMIN ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.admin_accounts (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    username TEXT NOT NULL UNIQUE,
    pin_hash TEXT NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    is_main_admin BOOLEAN NOT NULL DEFAULT false,
    delegated_by TEXT,
    delegated_at TIMESTAMPTZ,
    permissions TEXT[] NOT NULL DEFAULT ARRAY['VIEW_ALL', 'MANAGE_USERS', 'MODIFY_OUTLETS'],
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_login_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. CHEQUE & DEBIT CARD REGISTRY TABLE
CREATE TABLE IF NOT EXISTS public.cheque_card_registry (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('CHEQUE', 'CARD')),
    account_number TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    received_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'RECEIVED' CHECK (status IN ('RECEIVED', 'DELIVERED_TO_CUSTOMER', 'RETURNED', 'DESTROYED_EXPIRED')),
    outlet_id TEXT NOT NULL,
    outlet_name TEXT NOT NULL,
    user_id TEXT,
    user_name TEXT,
    delivery_date DATE,
    delivered_at TIMESTAMPTZ,
    delivered_to_name TEXT,
    delivered_to_phone TEXT,
    delivered_to_relation TEXT,
    notes TEXT,
    destroyed_at DATE,
    destruction_reason TEXT,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    
    -- Cheque-specific fields
    account_title TEXT,
    leaf_count INTEGER,
    start_cch_number TEXT,
    end_cch_number TEXT,
    
    -- Card-specific fields
    card_name TEXT,
    card_type TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. LOAN RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.loan_records (
    id TEXT PRIMARY KEY,
    account_title TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    loan_account_number TEXT NOT NULL,
    loan_amount NUMERIC NOT NULL DEFAULT 0,
    monthly_installment NUMERIC NOT NULL DEFAULT 0,
    disbursement_date DATE NOT NULL,
    interest_rate NUMERIC NOT NULL DEFAULT 9,
    loan_tenure_years NUMERIC NOT NULL DEFAULT 1,
    loan_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (loan_status IN ('ACTIVE', 'CLOSED', 'OVERDUE', 'DEFAULTED')),
    outlet_id TEXT NOT NULL,
    outlet_name TEXT NOT NULL,
    user_id TEXT,
    user_name TEXT,
    notes TEXT,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. WORK SUBMISSIONS STREAM TABLE
CREATE TABLE IF NOT EXISTS public.work_submissions (
    id TEXT PRIMARY KEY,
    tracking_no TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    employee_id TEXT,
    outlet_id TEXT NOT NULL,
    outlet_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_nid TEXT,
    account_or_card_number TEXT NOT NULL,
    service_category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'RECEIVED_AT_OUTLET',
    cheque_leaf_count INTEGER,
    cheque_serial_start TEXT,
    cheque_serial_end TEXT,
    card_last_4_digits TEXT,
    card_type TEXT,
    delivery_acknowledgment_signed BOOLEAN NOT NULL DEFAULT false,
    priority_level TEXT NOT NULL DEFAULT 'NORMAL',
    notes TEXT,
    processed_by TEXT,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. STATION MAIL & MEMOS TABLE
CREATE TABLE IF NOT EXISTS public.station_mail_messages (
    id TEXT PRIMARY KEY,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL DEFAULT 'ADMIN',
    sender_email TEXT NOT NULL,
    sender_outlet_id TEXT,
    sender_outlet_name TEXT,
    recipient_user_id TEXT NOT NULL DEFAULT 'ALL',
    recipient_outlet_id TEXT NOT NULL DEFAULT 'ALL',
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'IMPORTANT', 'URGENT')),
    category TEXT NOT NULL DEFAULT 'DIRECT_MEMO' CHECK (category IN ('CIRCULAR', 'OPERATION_UPDATE', 'AUDIT_NOTICE', 'DIRECT_MEMO')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. STATION NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.station_notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'INFO' CHECK (type IN ('ADMIN_NOTE', 'APPROVAL', 'SYNC', 'ALERT', 'INFO')),
    priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    target_user_id TEXT NOT NULL DEFAULT 'ALL',
    target_outlet_id TEXT NOT NULL DEFAULT 'ALL',
    target_audience TEXT NOT NULL DEFAULT 'ALL' CHECK (target_audience IN ('ADMIN_ONLY', 'USER_ONLY', 'ALL')),
    link_tab TEXT DEFAULT 'dashboard',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. PASSWORD RESET REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.password_reset_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    full_name TEXT NOT NULL,
    email_or_phone TEXT NOT NULL,
    outlet_id TEXT,
    outlet_name TEXT,
    outlet_code TEXT,
    user_note TEXT NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED', 'REJECTED', 'CANCELLED')),
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT,
    admin_note TEXT
);

-- 10. AFO TRANSFERS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.afo_transfers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_employee_id TEXT,
    user_avatar_url TEXT,
    user_email TEXT,
    user_phone TEXT,
    from_outlet_id TEXT NOT NULL,
    from_outlet_name TEXT NOT NULL,
    from_outlet_code TEXT,
    from_outlet_address TEXT,
    to_outlet_id TEXT NOT NULL,
    to_outlet_name TEXT NOT NULL,
    to_outlet_code TEXT,
    to_outlet_address TEXT,
    transferred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    transferred_by TEXT NOT NULL,
    revoke_previous_outlet_access BOOLEAN NOT NULL DEFAULT true,
    admin_note TEXT
);

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    actor_email TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    outlet_name TEXT NOT NULL,
    ip_address TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. PORTAL GOVERNANCE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.portal_governance (
    id TEXT PRIMARY KEY DEFAULT 'global_governance',
    settings JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE & OUTLET ISOLATION
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_cheque_card_outlet ON public.cheque_card_registry(outlet_id, status);
CREATE INDEX IF NOT EXISTS idx_cheque_card_type ON public.cheque_card_registry(type, received_date);
CREATE INDEX IF NOT EXISTS idx_loan_outlet ON public.loan_records(outlet_id, loan_status);
CREATE INDEX IF NOT EXISTS idx_work_submissions_outlet ON public.work_submissions(outlet_id, status);
CREATE INDEX IF NOT EXISTS idx_work_submissions_user ON public.work_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_outlet ON public.user_profiles(outlet_id);
CREATE INDEX IF NOT EXISTS idx_station_notifs_target ON public.station_notifications(target_user_id, target_outlet_id);
CREATE INDEX IF NOT EXISTS idx_station_mail_recipient ON public.station_mail_messages(recipient_user_id, recipient_outlet_id);

-- ==============================================================================
-- ENABLE REALTIME PUBLICATION FOR ALL OPERATIONAL TABLES
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.outlets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cheque_card_registry;
ALTER PUBLICATION supabase_realtime ADD TABLE public.loan_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.station_mail_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.station_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.password_reset_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.afo_transfers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.portal_governance;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - OPEN FOR ANONYMOUS APPLET & SECURED AT SERVICE LEVEL
-- ==============================================================================
ALTER TABLE public.outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cheque_card_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_mail_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.afo_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_governance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_outlets" ON public.outlets FOR SELECT USING (true);
CREATE POLICY "insert_outlets" ON public.outlets FOR INSERT WITH CHECK (true);
CREATE POLICY "update_outlets" ON public.outlets FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "select_user_profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "insert_user_profiles" ON public.user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "update_user_profiles" ON public.user_profiles FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "select_admin_accounts" ON public.admin_accounts FOR SELECT USING (true);
CREATE POLICY "insert_admin_accounts" ON public.admin_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "update_admin_accounts" ON public.admin_accounts FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "select_cheque_card_registry" ON public.cheque_card_registry FOR SELECT USING (true);
CREATE POLICY "insert_cheque_card_registry" ON public.cheque_card_registry FOR INSERT WITH CHECK (true);
CREATE POLICY "update_cheque_card_registry" ON public.cheque_card_registry FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "select_loan_records" ON public.loan_records FOR SELECT USING (true);
CREATE POLICY "insert_loan_records" ON public.loan_records FOR INSERT WITH CHECK (true);
CREATE POLICY "update_loan_records" ON public.loan_records FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "select_work_submissions" ON public.work_submissions FOR SELECT USING (true);
CREATE POLICY "insert_work_submissions" ON public.work_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "update_work_submissions" ON public.work_submissions FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "select_station_mail_messages" ON public.station_mail_messages FOR SELECT USING (true);
CREATE POLICY "insert_station_mail_messages" ON public.station_mail_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "update_station_mail_messages" ON public.station_mail_messages FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "select_station_notifications" ON public.station_notifications FOR SELECT USING (true);
CREATE POLICY "insert_station_notifications" ON public.station_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "update_station_notifications" ON public.station_notifications FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "select_password_reset_requests" ON public.password_reset_requests FOR SELECT USING (true);
CREATE POLICY "insert_password_reset_requests" ON public.password_reset_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "update_password_reset_requests" ON public.password_reset_requests FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "select_afo_transfers" ON public.afo_transfers FOR SELECT USING (true);
CREATE POLICY "insert_afo_transfers" ON public.afo_transfers FOR INSERT WITH CHECK (true);
CREATE POLICY "update_afo_transfers" ON public.afo_transfers FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "select_audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "insert_audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "update_audit_logs" ON public.audit_logs FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "select_portal_governance" ON public.portal_governance FOR SELECT USING (true);
CREATE POLICY "insert_portal_governance" ON public.portal_governance FOR INSERT WITH CHECK (true);
CREATE POLICY "update_portal_governance" ON public.portal_governance FOR UPDATE USING (true) WITH CHECK (true);


-- ==============================================================================
-- DENOMINATION SEGREGATION MODULE (Added separately, does not affect existing tables)
-- ==============================================================================

-- 13. CUSTOMER ACCOUNTS DIRECTORY TABLE (Savings/Current)
CREATE TABLE IF NOT EXISTS public.customer_accounts (
    id TEXT PRIMARY KEY,
    account_number TEXT NOT NULL,
    account_title TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    account_category TEXT NOT NULL DEFAULT 'SAVINGS' CHECK (account_category IN ('SAVINGS', 'CURRENT')),
    outlet_id TEXT NOT NULL,
    outlet_name TEXT NOT NULL,
    user_id TEXT,
    user_name TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. DENOMINATION SEGREGATION RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.denomination_segregations (
    id TEXT PRIMARY KEY,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('CD', 'CW', 'ID', 'LD', 'LR')),
    note_1 INTEGER NOT NULL DEFAULT 0,
    note_2 INTEGER NOT NULL DEFAULT 0,
    note_5 INTEGER NOT NULL DEFAULT 0,
    note_10 INTEGER NOT NULL DEFAULT 0,
    note_20 INTEGER NOT NULL DEFAULT 0,
    note_50 INTEGER NOT NULL DEFAULT 0,
    note_100 INTEGER NOT NULL DEFAULT 0,
    note_200 INTEGER NOT NULL DEFAULT 0,
    note_500 INTEGER NOT NULL DEFAULT 0,
    note_1000 INTEGER NOT NULL DEFAULT 0,
    total_received_amount NUMERIC NOT NULL DEFAULT 0,
    charge_applied BOOLEAN NOT NULL DEFAULT false,
    charge_amount NUMERIC NOT NULL DEFAULT 0,
    return_amount NUMERIC NOT NULL DEFAULT 0,
    actual_amount NUMERIC NOT NULL DEFAULT 0,
    linked_account_source TEXT NOT NULL CHECK (linked_account_source IN ('LOAN_ACCOUNT', 'CHEQUE_CARD', 'CUSTOMER_ACCOUNT')),
    linked_account_id TEXT,
    account_number TEXT,
    account_title TEXT,
    customer_name TEXT,
    mobile_number TEXT,
    outlet_id TEXT NOT NULL,
    outlet_name TEXT NOT NULL,
    user_id TEXT,
    user_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.customer_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.denomination_segregations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_customer_accounts" ON public.customer_accounts FOR SELECT USING (true);
CREATE POLICY "insert_customer_accounts" ON public.customer_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "update_customer_accounts" ON public.customer_accounts FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "select_denomination_segregations" ON public.denomination_segregations FOR SELECT USING (true);
CREATE POLICY "insert_denomination_segregations" ON public.denomination_segregations FOR INSERT WITH CHECK (true);
CREATE POLICY "update_denomination_segregations" ON public.denomination_segregations FOR UPDATE USING (true) WITH CHECK (true);
