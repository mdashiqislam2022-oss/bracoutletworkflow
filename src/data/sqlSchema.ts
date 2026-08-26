export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- BRAC BANK OUTLET WORK DATA - SUPABASE / POSTGRESQL MULTI-TENANT SCHEMA & RLS
-- Outlet-Based Data Scoping, Shared Station History & Live Real-Time Architecture
-- ==============================================================================

-- 1. EXTENSIONS & CUSTOM ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('USER', 'ADMIN', 'DELEGATED_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE registry_item_type AS ENUM ('CHEQUE', 'CARD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE registry_status_enum AS ENUM (
        'RECEIVED',
        'DELIVERED_TO_CUSTOMER',
        'RETURNED',
        'DESTROYED_EXPIRED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE loan_status_enum AS ENUM (
        'ACTIVE',
        'CLOSED',
        'OVERDUE',
        'IN_VERIFICATION'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_category_enum AS ENUM (
        'CHEQUE_BOOK_DISPATCH',
        'DEBIT_CREDIT_CARD',
        'ACCOUNT_OPENING_DOCS',
        'LOAN_KYC_VERIFICATION',
        'REMITTANCE_CLEARANCE',
        'MERCHANT_POS_SERVICES'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE submission_status_enum AS ENUM (
        'RECEIVED_AT_OUTLET',
        'VERIFIED_AND_APPROVED',
        'DELIVERED_TO_CUSTOMER',
        'IN_TRANSIT_TO_HUB',
        'REJECTED_ACTION_REQUIRED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. OUTLETS TABLE
CREATE TABLE IF NOT EXISTS public.outlets (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    zone VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    division VARCHAR(100) NOT NULL,
    manager_name VARCHAR(150),
    contact_number VARCHAR(50),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER PROFILES (AFOs) TABLE
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    outlet_id VARCHAR(50) REFERENCES public.outlets(id) ON DELETE SET NULL,
    outlet_name VARCHAR(255) NOT NULL,
    outlet_code VARCHAR(50),
    outlet_location VARCHAR(255),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    designation VARCHAR(150) DEFAULT 'Assistant Field Officer (AFO)',
    years_of_service NUMERIC(4,1) DEFAULT 0,
    bio TEXT,
    blood_group VARCHAR(10),
    emergency_contact VARCHAR(100),
    supervisor_name VARCHAR(150),
    facebook VARCHAR(255),
    instagram VARCHAR(255),
    whatsapp VARCHAR(50),
    role user_role_enum DEFAULT 'USER',
    status user_status_enum DEFAULT 'ACTIVE',
    previous_outlet_ids JSONB DEFAULT '[]'::jsonb,
    previous_outlet_access_revoked BOOLEAN DEFAULT FALSE,
    needs_reset_login_notice BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ADMIN ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.admin_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    username VARCHAR(100) UNIQUE NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    is_main_admin BOOLEAN DEFAULT FALSE,
    delegated_by VARCHAR(255),
    delegated_at TIMESTAMPTZ,
    permissions JSONB DEFAULT '["VIEW_ALL", "MANAGE_USERS"]'::jsonb,
    status user_status_enum DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CHEQUE BOOK & DEBIT CARD REGISTRY TABLE (Outlet-Scoped Multi-Tenant)
CREATE TABLE IF NOT EXISTS public.cheque_card_registry (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('REG-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTR(MD5(RANDOM()::TEXT), 1, 6)),
    type registry_item_type NOT NULL DEFAULT 'CHEQUE',
    account_number VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(50) NOT NULL,
    received_date DATE NOT NULL,
    status registry_status_enum DEFAULT 'RECEIVED',
    outlet_id VARCHAR(50) NOT NULL REFERENCES public.outlets(id) ON DELETE RESTRICT,
    outlet_name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    delivery_date DATE,
    delivered_at TIMESTAMPTZ,
    delivered_to_name VARCHAR(255),
    delivered_to_phone VARCHAR(50),
    delivered_to_relation VARCHAR(100),
    notes TEXT,
    destroyed_at DATE,
    destruction_reason TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    
    -- Cheque-specific
    account_title VARCHAR(255),
    leaf_count INTEGER DEFAULT 25,
    start_cch_number VARCHAR(50),
    end_cch_number VARCHAR(50),
    
    -- Card-specific
    card_name VARCHAR(255),
    card_type VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LOAN ACCOUNTS REGISTRY TABLE (Outlet-Scoped Multi-Tenant)
CREATE TABLE IF NOT EXISTS public.loan_records (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('LN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTR(MD5(RANDOM()::TEXT), 1, 6)),
    account_title VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(50) NOT NULL,
    loan_account_number VARCHAR(100) NOT NULL,
    loan_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    monthly_installment NUMERIC(15, 2) NOT NULL DEFAULT 0,
    disbursement_date DATE NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL DEFAULT 9.00,
    loan_tenure_years NUMERIC(4, 1) NOT NULL DEFAULT 1.0,
    loan_status loan_status_enum DEFAULT 'ACTIVE',
    outlet_id VARCHAR(50) NOT NULL REFERENCES public.outlets(id) ON DELETE RESTRICT,
    outlet_name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    notes TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. WORK SUBMISSIONS TABLE (Outlet-Scoped Multi-Tenant)
CREATE TABLE IF NOT EXISTS public.work_submissions (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('SUB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTR(MD5(RANDOM()::TEXT), 1, 6)),
    tracking_no VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    outlet_id VARCHAR(50) NOT NULL REFERENCES public.outlets(id) ON DELETE RESTRICT,
    outlet_name VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_nid VARCHAR(50) NOT NULL,
    account_or_card_number VARCHAR(100) NOT NULL,
    service_category service_category_enum NOT NULL,
    status submission_status_enum DEFAULT 'RECEIVED_AT_OUTLET',
    cheque_leaf_count INTEGER DEFAULT 0,
    cheque_serial_start VARCHAR(50),
    cheque_serial_end VARCHAR(50),
    card_last_4_digits VARCHAR(4),
    card_type VARCHAR(50),
    delivery_acknowledgment_signed BOOLEAN DEFAULT FALSE,
    priority_level VARCHAR(20) DEFAULT 'NORMAL',
    notes TEXT,
    processed_by VARCHAR(255),
    is_locked BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. STATION MAIL, NOTIFICATIONS & AUDIT TABLES
CREATE TABLE IF NOT EXISTS public.station_mail_messages (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('MAIL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTR(MD5(RANDOM()::TEXT), 1, 6)),
    sender_id VARCHAR(50) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(50) NOT NULL,
    sender_outlet_id VARCHAR(50),
    sender_outlet_name VARCHAR(255),
    recipient_user_id VARCHAR(50),
    recipient_outlet_id VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'NORMAL',
    category VARCHAR(50) DEFAULT 'OPERATION_UPDATE',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.station_notifications (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('NOTIF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTR(MD5(RANDOM()::TEXT), 1, 6)),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    target_user_id VARCHAR(50),
    target_outlet_id VARCHAR(50),
    target_audience VARCHAR(50) DEFAULT 'ALL',
    link_tab VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.password_reset_requests (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('REQ-RST-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTR(MD5(RANDOM()::TEXT), 1, 6)),
    user_id VARCHAR(50),
    full_name VARCHAR(255) NOT NULL,
    email_or_phone VARCHAR(255) NOT NULL,
    outlet_id VARCHAR(50),
    outlet_name VARCHAR(255),
    outlet_code VARCHAR(50),
    user_note TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'PENDING',
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(255),
    admin_note TEXT
);

CREATE TABLE IF NOT EXISTS public.afo_transfers (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('TRF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTR(MD5(RANDOM()::TEXT), 1, 6)),
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_employee_id VARCHAR(50) NOT NULL,
    user_avatar_url TEXT,
    user_email VARCHAR(255),
    user_phone VARCHAR(50),
    from_outlet_id VARCHAR(50) NOT NULL,
    from_outlet_name VARCHAR(255) NOT NULL,
    from_outlet_code VARCHAR(50),
    from_outlet_address TEXT,
    to_outlet_id VARCHAR(50) NOT NULL,
    to_outlet_name VARCHAR(255) NOT NULL,
    to_outlet_code VARCHAR(50),
    to_outlet_address TEXT,
    transferred_at TIMESTAMPTZ DEFAULT NOW(),
    transferred_by VARCHAR(255) NOT NULL,
    revoke_previous_outlet_access BOOLEAN DEFAULT TRUE,
    admin_note TEXT
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('LOG-' || EXTRACT(EPOCH FROM NOW())::BIGINT),
    actor_email VARCHAR(255) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role user_role_enum NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    outlet_name VARCHAR(255),
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Multi-Tenancy by Outlet
-- Shared Station History: New AFOs get full access to all historical outlet records
-- Unlocked Row Updates: Users can only update unlocked items in their own outlet
-- Super Admin Master Access: Global SELECT, INSERT, UPDATE, DELETE nationwide
-- ==============================================================================

-- Enable RLS on all tables
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

-- Helper Function: Check if caller is active Administrator
CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_accounts
    WHERE (email = auth.jwt() ->> 'email' OR user_id = auth.uid())
      AND status = 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function: Get caller's assigned Outlet ID
CREATE OR REPLACE FUNCTION public.get_current_user_outlet_id()
RETURNS VARCHAR AS $$
BEGIN
  RETURN (SELECT outlet_id FROM public.user_profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- A. OUTLETS POLICIES
CREATE POLICY "Authenticated users view active outlets or Admin view all" 
ON public.outlets FOR SELECT 
TO authenticated 
USING (is_active = TRUE OR public.is_active_admin());

CREATE POLICY "Admin manage outlets" 
ON public.outlets FOR ALL 
TO authenticated 
USING (public.is_active_admin());

-- B. USER PROFILES POLICIES
CREATE POLICY "User read own profile or station peers or Admin read all" 
ON public.user_profiles FOR SELECT 
TO authenticated 
USING (
  id = auth.uid() 
  OR outlet_id = public.get_current_user_outlet_id()
  OR public.is_active_admin()
);

CREATE POLICY "User insert own profile on signup" 
ON public.user_profiles FOR INSERT 
TO authenticated 
WITH CHECK (id = auth.uid() OR public.is_active_admin());

CREATE POLICY "User update own profile details" 
ON public.user_profiles FOR UPDATE 
TO authenticated 
USING (id = auth.uid() OR public.is_active_admin())
WITH CHECK (id = auth.uid() OR public.is_active_admin());

-- C. ADMIN ACCOUNTS POLICIES
CREATE POLICY "Admin view admin list" 
ON public.admin_accounts FOR SELECT 
TO authenticated 
USING (public.is_active_admin());

CREATE POLICY "Main admin manage admin accounts" 
ON public.admin_accounts FOR ALL 
TO authenticated 
USING (public.is_active_admin());

-- D. CHEQUE & CARD REGISTRY POLICIES (Outlet-Scoped Multi-Tenancy & History)
-- SELECT: Users see ALL past and present entries belonging to their assigned outlet; Admin sees all
CREATE POLICY "Outlet-scoped registry SELECT" 
ON public.cheque_card_registry FOR SELECT 
TO authenticated 
USING (
  outlet_id = public.get_current_user_outlet_id() 
  OR public.is_active_admin()
);

-- INSERT: Users can insert entries for their assigned outlet; Admin can insert for any
CREATE POLICY "Outlet-scoped registry INSERT" 
ON public.cheque_card_registry FOR INSERT 
TO authenticated 
WITH CHECK (
  outlet_id = public.get_current_user_outlet_id() 
  OR public.is_active_admin()
);

-- UPDATE: Users can ONLY update UNLOCKED rows within their own outlet; Admin can update all
CREATE POLICY "Outlet-scoped unlocked registry UPDATE" 
ON public.cheque_card_registry FOR UPDATE 
TO authenticated 
USING (
  (outlet_id = public.get_current_user_outlet_id() AND is_locked = FALSE)
  OR public.is_active_admin()
);

-- DELETE: Only Admin can delete registry records
CREATE POLICY "Admin delete registry records" 
ON public.cheque_card_registry FOR DELETE 
TO authenticated 
USING (public.is_active_admin());

-- E. LOAN RECORDS POLICIES (Outlet-Scoped Multi-Tenancy & History)
CREATE POLICY "Outlet-scoped loan SELECT" 
ON public.loan_records FOR SELECT 
TO authenticated 
USING (
  outlet_id = public.get_current_user_outlet_id() 
  OR public.is_active_admin()
);

CREATE POLICY "Outlet-scoped loan INSERT" 
ON public.loan_records FOR INSERT 
TO authenticated 
WITH CHECK (
  outlet_id = public.get_current_user_outlet_id() 
  OR public.is_active_admin()
);

CREATE POLICY "Outlet-scoped unlocked loan UPDATE" 
ON public.loan_records FOR UPDATE 
TO authenticated 
USING (
  (outlet_id = public.get_current_user_outlet_id() AND is_locked = FALSE)
  OR public.is_active_admin()
);

CREATE POLICY "Admin delete loan records" 
ON public.loan_records FOR DELETE 
TO authenticated 
USING (public.is_active_admin());

-- F. WORK SUBMISSIONS POLICIES (Outlet-Scoped Multi-Tenancy & History)
CREATE POLICY "Outlet-scoped submission SELECT" 
ON public.work_submissions FOR SELECT 
TO authenticated 
USING (
  outlet_id = public.get_current_user_outlet_id() 
  OR public.is_active_admin()
);

CREATE POLICY "Outlet-scoped submission INSERT" 
ON public.work_submissions FOR INSERT 
TO authenticated 
WITH CHECK (
  outlet_id = public.get_current_user_outlet_id() 
  OR public.is_active_admin()
);

CREATE POLICY "Outlet-scoped unlocked submission UPDATE" 
ON public.work_submissions FOR UPDATE 
TO authenticated 
USING (
  (outlet_id = public.get_current_user_outlet_id() AND is_locked = FALSE)
  OR public.is_active_admin()
);

CREATE POLICY "Admin delete submissions" 
ON public.work_submissions FOR DELETE 
TO authenticated 
USING (public.is_active_admin());

-- G. AUDIT LOGS POLICIES
CREATE POLICY "Insert audit logs" 
ON public.audit_logs FOR INSERT 
TO authenticated 
WITH CHECK (TRUE);

CREATE POLICY "Admin view audit logs" 
ON public.audit_logs FOR SELECT 
TO authenticated 
USING (public.is_active_admin());

-- ==============================================================================
-- REAL-TIME SUBSCRIPTIONS REPLICATION
-- Automatically streams inserts and updates to Admin Dashboard and Outlet Portals
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE 
  public.cheque_card_registry, 
  public.loan_records, 
  public.work_submissions, 
  public.outlets, 
  public.user_profiles, 
  public.station_mail_messages, 
  public.station_notifications, 
  public.password_reset_requests, 
  public.audit_logs;
`;

export const supabaseSqlSchema = SUPABASE_SQL_SCHEMA;

export const supabaseRlsExplanation = [
  {
    title: 'Outlet-Based Multi-Tenancy',
    description: 'Data is strictly isolated by Outlet ID. Any new AFO registered under an outlet automatically gains full access to all historical cheques, cards, loans, and work submissions of that outlet.'
  },
  {
    title: 'Locked Row Security Protection',
    description: 'Field officers can only update unlocked records within their assigned station. Once marked as locked or delivered/dispatched, changes require elevated Admin authorization.'
  },
  {
    title: 'Admin Master Real-time View',
    description: 'Central administrators have full nationwide access across all outlets with live Supabase Real-Time streaming subscriptions for instant sync.'
  }
];
