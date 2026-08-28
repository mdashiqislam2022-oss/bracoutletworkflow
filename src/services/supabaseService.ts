import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  UserProfile,
  AdminAccount,
  BRACBankOutlet,
  WorkSubmission,
  AuditLog,
  StationMailMessage,
  StationNotification,
  ChequeCardEntry,
  ChequeBookRecord,
  DebitCardRecord,
  LoanAccountRecord,
  PasswordResetRequest,
  AfoTransferRecord,
  PortalGovernanceSettings
} from '../types';

/**
 * Maps database snake_case or JSON record to TypeScript ChequeCardEntry
 */
export const mapDbToChequeCardEntry = (row: any): ChequeCardEntry => {
  return {
    id: row.id,
    type: row.type || 'CHEQUE',
    accountNumber: row.account_number || '',
    mobileNumber: row.mobile_number || '',
    receivedDate: row.received_date || '',
    status: row.status || 'RECEIVED',
    outletId: row.outlet_id || '',
    outletName: row.outlet_name || '',
    userId: row.user_id,
    userName: row.user_name,
    deliveryDate: row.delivery_date || undefined,
    deliveredAt: row.delivered_at || undefined,
    deliveredToName: row.delivered_to_name || undefined,
    deliveredToPhone: row.delivered_to_phone || undefined,
    deliveredToRelation: row.delivered_to_relation || undefined,
    notes: row.notes || undefined,
    destroyedAt: row.destroyed_at || undefined,
    destructionReason: row.destruction_reason || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    isLocked: row.is_locked || false,
    
    // Cheque-specific
    accountTitle: row.account_title || '',
    leafCount: row.leaf_count || 25,
    startCchNumber: row.start_cch_number || '',
    endCchNumber: row.end_cch_number || '',
    
    // Card-specific
    cardName: row.card_name || '',
    cardType: row.card_type || 'VISA Debit'
  } as ChequeCardEntry;
};

/**
 * Maps ChequeCardEntry to DB snake_case row
 */
export const mapChequeCardEntryToDb = (entry: ChequeCardEntry) => {
  const isCheque = entry.type === 'CHEQUE';
  const anyEntry = entry as any;
  return {
    id: entry.id,
    type: entry.type,
    account_number: entry.accountNumber,
    mobile_number: entry.mobileNumber,
    received_date: entry.receivedDate,
    status: entry.status,
    outlet_id: entry.outletId,
    outlet_name: entry.outletName,
    user_id: entry.userId,
    user_name: entry.userName,
    delivery_date: anyEntry.deliveryDate || entry.deliveredAt || null,
    delivered_at: entry.deliveredAt || null,
    delivered_to_name: anyEntry.deliveredToName || null,
    delivered_to_phone: anyEntry.deliveredToPhone || null,
    delivered_to_relation: anyEntry.deliveredToRelation || null,
    notes: entry.notes || null,
    destroyed_at: entry.destroyedAt || null,
    destruction_reason: entry.destructionReason || null,
    is_locked: anyEntry.isLocked || false,
    
    // Cheque specific
    account_title: isCheque ? (entry as ChequeBookRecord).accountTitle : null,
    leaf_count: isCheque ? (entry as ChequeBookRecord).leafCount : null,
    start_cch_number: isCheque ? (entry as ChequeBookRecord).startCchNumber : null,
    end_cch_number: isCheque ? (entry as ChequeBookRecord).endCchNumber : null,
    
    // Card specific
    card_name: !isCheque ? (entry as DebitCardRecord).cardName : null,
    card_type: !isCheque ? (entry as DebitCardRecord).cardType : null,
    
    updated_at: new Date().toISOString()
  };
};

/**
 * Maps DB row to LoanAccountRecord
 */
export const mapDbToLoanRecord = (row: any): LoanAccountRecord => {
  return {
    id: row.id,
    accountTitle: row.account_title || '',
    customerName: row.customer_name || '',
    mobileNumber: row.mobile_number || '',
    loanAccountNumber: row.loan_account_number || '',
    loanAmount: Number(row.loan_amount || 0),
    monthlyInstallment: Number(row.monthly_installment || 0),
    disbursementDate: row.disbursement_date || '',
    interestRate: Number(row.interest_rate || 0),
    loanTenureYears: Number(row.loan_tenure_years || 0),
    loanStatus: row.loan_status || 'ACTIVE',
    outletId: row.outlet_id || '',
    outletName: row.outlet_name || '',
    userId: row.user_id,
    userName: row.user_name,
    notes: row.notes || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || undefined
  };
};

/**
 * Maps LoanAccountRecord to DB row
 */
export const mapLoanRecordToDb = (record: LoanAccountRecord) => {
  return {
    id: record.id,
    account_title: record.accountTitle,
    customer_name: record.customerName,
    mobile_number: record.mobileNumber,
    loan_account_number: record.loanAccountNumber,
    loan_amount: record.loanAmount,
    monthly_installment: record.monthlyInstallment,
    disbursement_date: record.disbursementDate,
    interest_rate: record.interestRate,
    loan_tenure_years: record.loanTenureYears,
    loan_status: record.loanStatus,
    outlet_id: record.outletId,
    outlet_name: record.outletName,
    user_id: record.userId,
    user_name: record.userName,
    notes: record.notes || null,
    is_locked: (record as any).isLocked || false,
    updated_at: new Date().toISOString()
  };
};

/**
 * Maps DB row to WorkSubmission
 */
export const mapDbToSubmission = (row: any): WorkSubmission => {
  return {
    id: row.id,
    trackingNo: row.tracking_no || '',
    userId: row.user_id || '',
    userName: row.user_name || '',
    userEmail: row.user_email || '',
    employeeId: row.employee_id || '',
    outletId: row.outlet_id || '',
    outletName: row.outlet_name || '',
    customerName: row.customer_name || '',
    customerPhone: row.customer_phone || '',
    customerNid: row.customer_nid || '',
    accountOrCardNumber: row.account_or_card_number || '',
    serviceCategory: row.service_category || 'CHEQUE_BOOK_DISPATCH',
    status: row.status || 'RECEIVED_AT_OUTLET',
    chequeLeafCount: row.cheque_leaf_count,
    chequeSerialStart: row.cheque_serial_start,
    chequeSerialEnd: row.cheque_serial_end,
    cardLast4Digits: row.card_last_4_digits,
    cardType: row.card_type,
    deliveryAcknowledgmentSigned: row.delivery_acknowledgment_signed || false,
    priorityLevel: row.priority_level || 'NORMAL',
    notes: row.notes,
    submittedAt: row.submitted_at || row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    processedBy: row.processed_by
  };
};

/**
 * Maps WorkSubmission to DB row
 */
export const mapSubmissionToDb = (sub: WorkSubmission) => {
  return {
    id: sub.id,
    tracking_no: sub.trackingNo,
    user_id: sub.userId,
    user_name: sub.userName,
    user_email: sub.userEmail,
    employee_id: sub.employeeId,
    outlet_id: sub.outletId,
    outlet_name: sub.outletName,
    customer_name: sub.customerName,
    customer_phone: sub.customerPhone,
    customer_nid: sub.customerNid,
    account_or_card_number: sub.accountOrCardNumber,
    service_category: sub.serviceCategory,
    status: sub.status,
    cheque_leaf_count: sub.chequeLeafCount || null,
    cheque_serial_start: sub.chequeSerialStart || null,
    cheque_serial_end: sub.chequeSerialEnd || null,
    card_last_4_digits: sub.cardLast4Digits || null,
    card_type: sub.cardType || null,
    delivery_acknowledgment_signed: sub.deliveryAcknowledgmentSigned || false,
    priority_level: sub.priorityLevel || 'NORMAL',
    notes: sub.notes || null,
    processed_by: sub.processedBy || null,
    is_locked: (sub as any).isLocked || false,
    updated_at: new Date().toISOString()
  };
};

/**
 * Maps BRACBankOutlet to DB row
 */
export const mapOutletToDb = (outlet: BRACBankOutlet) => {
  return {
    id: outlet.id,
    code: outlet.code,
    name: outlet.name,
    district: outlet.district,
    division: outlet.division,
    zone: outlet.zone,
    manager_name: outlet.managerName,
    manager_phone: outlet.contactNumber || (outlet as any).managerPhone || null,
    contact_number: outlet.contactNumber || (outlet as any).managerPhone || null,
    contact_email: (outlet as any).contactEmail || null,
    address: outlet.address,
    is_active: outlet.isActive !== false,
    is_suspended: (outlet as any).isSuspended || false,
    is_deleted: (outlet as any).isDeleted || false,
    status: (outlet as any).status || (outlet.isActive ? 'ACTIVE' : 'INACTIVE'),
    suspended_at: (outlet as any).suspendedAt || null,
    suspended_reason: (outlet as any).suspendedReason || null,
    deleted_at: (outlet as any).deletedAt || null,
    deleted_reason: (outlet as any).deletedReason || null,
    updated_at: new Date().toISOString()
  };
};

/**
 * Maps DB row to BRACBankOutlet
 */
export const mapDbToOutlet = (row: any): BRACBankOutlet => {
  return {
    id: row.id,
    code: row.code || '',
    name: row.name || '',
    district: row.district || 'Dhaka',
    division: row.division || 'Dhaka',
    zone: row.zone || 'Operations Zone',
    managerName: row.manager_name || 'Outlet Manager',
    contactNumber: row.contact_number || row.manager_phone || '+880 1700-000000',
    address: row.address || '',
    isActive: row.is_active !== false && !row.is_deleted && !row.is_suspended
  };
};

/**
 * Supabase DB Service API
 */
export const SupabaseService = {
  // Check availability
  isAvailable: () => isSupabaseConfigured && !!supabase,
    // Upload a profile picture to Supabase Storage and return its public URL
  async uploadAvatar(file: File, ownerId: string): Promise<string | null> {
    if (!this.isAvailable() || !supabase) return null;
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${ownerId}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true, cacheControl: '3600' });

      if (uploadError) {
        console.warn('Error uploading avatar to Supabase Storage:', uploadError);
        return null;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return data?.publicUrl || null;
    } catch (err) {
      console.warn('Error uploading avatar:', err);
      return null;
    }
  },

  // Fetch all initial data
  async fetchAllData() {
    if (!this.isAvailable() || !supabase) return null;

    try {
      const [
        outletsRes,
        usersRes,
        adminsRes,
        submissionsRes,
        chequeCardRes,
        loanRes,
        mailsRes,
        notifsRes,
        resetRequestsRes,
        transfersRes,
        auditLogsRes,
        governanceRes
      ] = await Promise.all([
        supabase.from('outlets').select('*').order('name', { ascending: true }),
        supabase.from('user_profiles').select('*'),
        supabase.from('admin_accounts').select('*'),
        supabase.from('work_submissions').select('*').order('submitted_at', { ascending: false }),
        supabase.from('cheque_card_registry').select('*').order('created_at', { ascending: false }),
        supabase.from('loan_records').select('*').order('created_at', { ascending: false }),
        supabase.from('station_mail_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('station_notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('password_reset_requests').select('*').order('requested_at', { ascending: false }),
        supabase.from('afo_transfers').select('*').order('transferred_at', { ascending: false }),
        supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(100),
        supabase.from('portal_governance').select('*').limit(1)
      ]);

      return {
        outlets: (outletsRes.data || []).map(mapDbToOutlet),
        users: (usersRes.data || []).map((u: any) => ({
          id: u.id,
          email: u.email,
          username: u.username,
          password: u.password,
          fullName: u.full_name,
          phone: u.phone,
          avatarUrl: u.avatar_url,
          outletId: u.outlet_id,
          outletName: u.outlet_name,
          outletCode: u.outlet_code,
          outletLocation: u.outlet_location,
          employeeId: u.employee_id,
          designation: u.designation,
          yearsOfService: Number(u.years_of_service || 0),
          bio: u.bio,
          bloodGroup: u.blood_group,
          emergencyContact: u.emergency_contact,
          supervisorName: u.supervisor_name,
          facebook: u.facebook,
          instagram: u.instagram,
          whatsapp: u.whatsapp,
          role: u.role || 'USER',
          status: u.status || 'ACTIVE',
          previousOutletIds: u.previous_outlet_ids || [],
          previousOutletAccessRevoked: u.previous_outlet_access_revoked || false,
          needsResetLoginNotice: u.needs_reset_login_notice || false,
          createdAt: u.created_at,
          lastLoginAt: u.last_login_at,
                    isOnline: u.is_online || false,
          lastSeenAt: u.last_seen_at
        })),
        admins: (adminsRes.data || []).map((a: any) => ({
          id: a.id,
          email: a.email,
          phone: a.phone,
          username: a.username,
          pinHash: a.pin_hash,
          password: a.password || a.pin_hash,
          fullName: a.full_name,
          avatarUrl: a.avatar_url,
          isMainAdmin: a.is_main_admin,
          delegatedBy: a.delegated_by,
          delegatedAt: a.delegated_at,
          permissions: a.permissions || ['VIEW_ALL', 'MANAGE_USERS'],
          status: a.status || 'ACTIVE',
          createdAt: a.created_at,
          lastLoginAt: a.last_login_at
        })),
        submissions: (submissionsRes.data || []).map(mapDbToSubmission),
        chequeCardEntries: (chequeCardRes.data || []).map(mapDbToChequeCardEntry),
        loanRecords: (loanRes.data || []).map(mapDbToLoanRecord),
        mailMessages: (mailsRes.data || []).map((m: any) => ({
          id: m.id,
          senderName: m.sender_name || 'Central Operations',
          senderRole: m.sender_role || 'ADMIN',
          senderEmail: m.sender_email || 'admin@bracbank.com',
          senderOutletId: m.sender_outlet_id,
          senderOutletName: m.sender_outlet_name,
          recipientUserId: m.recipient_user_id || 'ALL',
          recipientOutletId: m.recipient_outlet_id || 'ALL',
          subject: m.subject || '',
          content: m.content || '',
          priority: m.priority || 'NORMAL',
          category: m.category || 'DIRECT_MEMO',
          isRead: m.is_read || false,
          timestamp: m.created_at || m.timestamp || new Date().toISOString()
        })),
        notifications: (notifsRes.data || []).map((n: any) => ({
          id: n.id,
          title: n.title || '',
          message: n.message || '',
          type: n.type || 'INFO',
          priority: n.priority || 'MEDIUM',
          targetUserId: n.target_user_id || 'ALL',
          targetOutletId: n.target_outlet_id || 'ALL',
          targetAudience: n.target_audience || 'ALL',
          linkTab: n.link_tab || 'dashboard',
          isRead: n.is_read || false,
          timestamp: n.created_at || n.timestamp || new Date().toISOString()
        })),
        passwordResetRequests: (resetRequestsRes.data || []).map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          fullName: r.full_name,
          emailOrPhone: r.email_or_phone,
          outletId: r.outlet_id,
          outletName: r.outlet_name,
          outletCode: r.outlet_code,
          userNote: r.user_note,
          requestedAt: r.requested_at,
          status: r.status,
          resolvedAt: r.resolved_at,
          resolvedBy: r.resolved_by,
          adminNote: r.admin_note
        })),
        afoTransfers: (transfersRes.data || []).map((t: any) => ({
          id: t.id,
          userId: t.user_id,
          userName: t.user_name,
          userEmployeeId: t.user_employee_id,
          userAvatarUrl: t.user_avatar_url,
          userEmail: t.user_email,
          userPhone: t.user_phone,
          fromOutletId: t.from_outlet_id,
          fromOutletName: t.from_outlet_name,
          fromOutletCode: t.from_outlet_code,
          fromOutletAddress: t.from_outlet_address,
          toOutletId: t.to_outlet_id,
          toOutletName: t.to_outlet_name,
          toOutletCode: t.to_outlet_code,
          toOutletAddress: t.to_outlet_address,
          transferredAt: t.transferred_at,
          transferredBy: t.transferred_by,
          revokePreviousOutletAccess: t.revoke_previous_outlet_access !== false,
          adminNote: t.admin_note
        })),
        auditLogs: (auditLogsRes.data || []).map((l: any) => ({
          id: l.id,
          actorEmail: l.actor_email,
          actorName: l.actor_name,
          actorRole: l.actor_role,
          action: l.action,
          details: l.details,
          outletName: l.outlet_name,
          ipAddress: l.ip_address,
          timestamp: l.timestamp
        })),
        governanceSettings: governanceRes?.data?.[0]?.settings as PortalGovernanceSettings | null
      };
    } catch (err) {
      console.warn('Supabase fetch error:', err);
      return null;
    }
  },

  // Save/Upsert Outlet
  async saveOutlet(outlet: BRACBankOutlet) {
    if (!this.isAvailable() || !supabase) return;
    try {
      const dbRow = mapOutletToDb(outlet);
      await supabase.from('outlets').upsert(dbRow);
    } catch (err) {
      console.warn('Error saving outlet to Supabase:', err);
    }
  },

  // Delete Outlet
  async deleteOutlet(id: string) {
    if (!this.isAvailable() || !supabase) return;
    try {
      await supabase.from('outlets').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting outlet from Supabase:', err);
    }
  },

  // Save/Upsert Cheque/Card Entry
  async saveChequeCardEntry(entry: ChequeCardEntry) {
    if (!this.isAvailable() || !supabase) return;
    try {
      const dbRow = mapChequeCardEntryToDb(entry);
      await supabase.from('cheque_card_registry').upsert(dbRow);
    } catch (err) {
      console.warn('Error saving cheque card to Supabase:', err);
    }
  },

  // Delete Cheque/Card Entry
  async deleteChequeCardEntry(id: string) {
    if (!this.isAvailable() || !supabase) return;
    try {
      await supabase.from('cheque_card_registry').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting cheque card from Supabase:', err);
    }
  },

  // Save/Upsert Loan Record
  async saveLoanRecord(record: LoanAccountRecord) {
    if (!this.isAvailable() || !supabase) return;
    try {
      const dbRow = mapLoanRecordToDb(record);
      await supabase.from('loan_records').upsert(dbRow);
    } catch (err) {
      console.warn('Error saving loan record to Supabase:', err);
    }
  },

  // Delete Loan Record
  async deleteLoanRecord(id: string) {
    if (!this.isAvailable() || !supabase) return;
    try {
      await supabase.from('loan_records').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting loan record from Supabase:', err);
    }
  },

  // Save/Upsert Work Submission
  async saveSubmission(sub: WorkSubmission) {
    if (!this.isAvailable() || !supabase) return;
    try {
      const dbRow = mapSubmissionToDb(sub);
      await supabase.from('work_submissions').upsert(dbRow);
    } catch (err) {
      console.warn('Error saving submission to Supabase:', err);
    }
  },

  // Delete Work Submission
  async deleteSubmission(id: string) {
    if (!this.isAvailable() || !supabase) return;
    try {
      await supabase.from('work_submissions').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting submission from Supabase:', err);
    }
  },

  // Save/Upsert User Profile
  async saveUserProfile(user: UserProfile) {
    if (!this.isAvailable() || !supabase) return;
    try {
      const dbRow = {
        id: user.id,
        email: user.email,
        username: user.username,
        password: user.password,
        full_name: user.fullName,
        phone: user.phone,
        avatar_url: user.avatarUrl,
        outlet_id: user.outletId,
        outlet_name: user.outletName,
        outlet_code: user.outletCode,
        outlet_location: user.outletLocation,
        employee_id: user.employeeId,
        designation: user.designation,
        years_of_service: user.yearsOfService,
        bio: user.bio,
        blood_group: user.bloodGroup,
        emergency_contact: user.emergencyContact,
        supervisor_name: user.supervisorName,
        facebook: user.facebook,
        instagram: user.instagram,
        whatsapp: user.whatsapp,
        role: user.role,
        status: user.status,
        previous_outlet_ids: user.previousOutletIds || [],
        previous_outlet_access_revoked: user.previousOutletAccessRevoked || false,
        needs_reset_login_notice: user.needsResetLoginNotice || false,
        updated_at: new Date().toISOString(),
        last_login_at: user.lastLoginAt,
                is_online: user.isOnline || false,
        last_seen_at: user.lastSeenAt || new Date().toISOString()
      };
      await supabase.from('user_profiles').upsert(dbRow);
    } catch (err) {
      console.warn('Error saving user profile to Supabase:', err);
    }
  },
    // Lightweight heartbeat - only updates last_seen_at + is_online, doesn't touch other fields
  async updateHeartbeat(userId: string) {
    if (!this.isAvailable() || !supabase) return;
    try {
      await supabase
        .from('user_profiles')
        .update({ last_seen_at: new Date().toISOString(), is_online: true })
        .eq('id', userId);
    } catch (err) {
      console.warn('Error sending heartbeat:', err);
    }
  },
  
  // Real-time single-session check: onno kono tab/browser e ekhon active ase kina
  async checkUserActiveSession(userId: string): Promise<{ isActive: boolean }> {
    if (!this.isAvailable() || !supabase) return { isActive: false };
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_online, last_seen_at')
        .eq('id', userId)
        .single();
      if (error || !data) return { isActive: false };
      const lastSeenTime = data.last_seen_at ? new Date(data.last_seen_at).getTime() : 0;
      const secondsSinceLastSeen = (Date.now() - lastSeenTime) / 1000;
      const isActive = !!data.is_online && secondsSinceLastSeen < 35;
      return { isActive };
    } catch (err) {
      console.warn('Error checking active session:', err);
      return { isActive: false };
    }
  },

  // =========================================================
// AFO SINGLE ACTIVE SESSION FUNCTIONS
// =========================================================

/**
 * Try to acquire the single active session for an AFO user.
 * Returns false when another browser/tab already owns the session.
 */
async acquireAfoSession(userId: string, sessionId: string): Promise<{
  success: boolean;
  alreadyLoggedIn?: boolean;
  message?: string;
}> {
  if (!this.isAvailable() || !supabase) {
    return {
      success: false,
      message: 'Supabase is not available.'
    };
  }

  try {
    const { data, error } = await supabase.rpc('acquire_afo_session', {
      p_user_id: userId,
      p_session_id: sessionId
    });

    if (error) {
      console.error('Error acquiring AFO session:', error);
      return {
        success: false,
        message: 'Unable to verify the active session.'
      };
    }

    return {
      success: !!data?.success,
      alreadyLoggedIn: !!data?.already_logged_in,
      message: data?.message
    };
  } catch (err) {
    console.error('Error acquiring AFO session:', err);

    return {
      success: false,
      message: 'Unable to verify the active session.'
    };
  }
},

/**
 * Keep the current AFO session alive.
 */
async heartbeatAfoSession(userId: string, sessionId: string): Promise<boolean> {
  if (!this.isAvailable() || !supabase) return false;

  try {
    const { data, error } = await supabase.rpc('heartbeat_afo_session', {
      p_user_id: userId,
      p_session_id: sessionId
    });

    if (error) {
      console.warn('Error sending AFO session heartbeat:', error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.warn('Error sending AFO session heartbeat:', err);
    return false;
  }
},

/**
 * Release the active AFO session during logout.
 */
async releaseAfoSession(userId: string, sessionId: string): Promise<boolean> {
  if (!this.isAvailable() || !supabase) return false;

  try {
    const { data, error } = await supabase.rpc('release_afo_session', {
      p_user_id: userId,
      p_session_id: sessionId
    });

    if (error) {
      console.warn('Error releasing AFO session:', error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.warn('Error releasing AFO session:', err);
    return false;
  }
},
  // Explicitly mark user offline (used on logout)
  async setUserOffline(userId: string) {
    if (!this.isAvailable() || !supabase) return;
    try {
      await supabase
        .from('user_profiles')
        .update({ is_online: false })
        .eq('id', userId);
    } catch (err) {
      console.warn('Error setting user offline:', err);
    }
  },
    // Beacon-safe offline signal — fires reliably even when the tab/browser is closing
  setUserOfflineBeacon(userId: string) {
    try {
      const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
      const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
      if (!supabaseUrl || !supabaseAnonKey) return;

      fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}`, {
        method: 'PATCH',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ is_online: false })
      }).catch(() => {});
    } catch (err) {
      console.warn('Error sending offline beacon:', err);
    }
  },

  // Delete User Profile
  async deleteUserProfile(id: string) {
    if (!this.isAvailable() || !supabase) return;
    try {
      await supabase.from('user_profiles').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting user from Supabase:', err);
    }
  },

  // Save/Upsert Admin Account
  async saveAdminAccount(admin: AdminAccount) {
    if (!this.isAvailable() || !supabase) return;
    try {
      const dbRow = {
        id: admin.id,
        email: admin.email,
        phone: admin.phone,
        username: admin.username,
        pin_hash: admin.pinHash,
        password: admin.password,
        full_name: admin.fullName,
        avatar_url: admin.avatarUrl,
        is_main_admin: admin.isMainAdmin,
        delegated_by: admin.delegatedBy,
        delegated_at: admin.delegatedAt,
        permissions: admin.permissions,
        status: admin.status,
        last_login_at: admin.lastLoginAt
      };
      await supabase.from('admin_accounts').upsert(dbRow);
    } catch (err) {
      console.warn('Error saving admin account to Supabase:', err);
    }
  },

  // Delete Admin Account
  async deleteAdminAccount(id: string) {
    if (!this.isAvailable() || !supabase) return;
    try {
      await supabase.from('admin_accounts').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting admin from Supabase:', err);
    }
  },

  // Save Audit Log
  async saveAuditLog(log: AuditLog) {
    if (!this.isAvailable() || !supabase) return;
    try {
      const dbRow = {
        id: log.id,
        actor_email: log.actorEmail,
        actor_name: log.actorName,
        actor_role: log.actorRole,
        action: log.action,
        details: log.details,
        outlet_name: log.outletName,
        ip_address: log.ipAddress,
        timestamp: log.timestamp
      };
      await supabase.from('audit_logs').insert(dbRow);
    } catch (err) {
      console.warn('Error saving audit log to Supabase:', err);
    }
  },

  // Save Station Mail Message
  async saveMailMessage(msg: StationMailMessage) {
    if (!this.isAvailable() || !supabase) return;
    try {
      const dbRow = {
        id: msg.id,
        sender_name: msg.senderName,
        sender_role: msg.senderRole,
        sender_email: msg.senderEmail,
        recipient_user_id: msg.recipientUserId,
        recipient_outlet_id: msg.recipientOutletId,
        subject: msg.subject,
        content: msg.content,
        priority: msg.priority,
        category: msg.category,
        is_read: msg.isRead,
        created_at: msg.timestamp || new Date().toISOString()
      };
      await supabase.from('station_mail_messages').upsert(dbRow);
    } catch (err) {
      console.warn('Error saving mail message to Supabase:', err);
    }
  },

  // Delete Station Mail Message
  async deleteMailMessage(id: string) {
    if (!this.isAvailable() || !supabase) return;
    try {
      await supabase.from('station_mail_messages').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting mail message from Supabase:', err);
    }
  },

  // Save Station Notification
  async saveNotification(notif: StationNotification) {
    if (!this.isAvailable() || !supabase) return;
    try {
      const dbRow = {
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        priority: notif.priority,
        target_user_id: notif.targetUserId,
        target_outlet_id: notif.targetOutletId,
        target_audience: notif.targetAudience,
        link_tab: notif.linkTab,
        is_read: notif.isRead,
        created_at: notif.timestamp || new Date().toISOString()
      };
      await supabase.from('station_notifications').upsert(dbRow);
    } catch (err) {
      console.warn('Error saving notification to Supabase:', err);
    }
  },
    // Delete Station Notification
  async deleteNotification(id: string) {
    if (!this.isAvailable() || !supabase) return;
    try {
      await supabase.from('station_notifications').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting notification from Supabase:', err);
    }
  },

  // Save Password Reset Request
  async savePasswordResetRequest(req: PasswordResetRequest) {
    if (!this.isAvailable() || !supabase) return;
    try {
      const dbRow = {
        id: req.id,
        user_id: req.userId || null,
        full_name: req.fullName,
        email_or_phone: req.emailOrPhone,
        outlet_id: req.outletId || null,
        outlet_name: req.outletName || null,
        outlet_code: req.outletCode || null,
        user_note: req.userNote,
        requested_at: req.requestedAt,
        status: req.status,
        resolved_at: req.resolvedAt || null,
        resolved_by: req.resolvedBy || null,
        admin_note: req.adminNote || null
      };
      await supabase.from('password_reset_requests').upsert(dbRow);
    } catch (err) {
      console.warn('Error saving password reset request to Supabase:', err);
    }
  },

  // Save AFO Transfer Record
  async saveTransfer(trf: AfoTransferRecord) {
    if (!this.isAvailable() || !supabase) return;
    try {
      const dbRow = {
        id: trf.id,
        user_id: trf.userId,
        user_name: trf.userName,
        user_employee_id: trf.userEmployeeId,
        user_avatar_url: trf.userAvatarUrl,
        user_email: trf.userEmail,
        user_phone: trf.userPhone,
        from_outlet_id: trf.fromOutletId,
        from_outlet_name: trf.fromOutletName,
        from_outlet_code: trf.fromOutletCode,
        from_outlet_address: trf.fromOutletAddress,
        to_outlet_id: trf.toOutletId,
        to_outlet_name: trf.toOutletName,
        to_outlet_code: trf.toOutletCode,
        to_outlet_address: trf.toOutletAddress,
        transferred_at: trf.transferredAt,
        transferred_by: trf.transferredBy,
        revoke_previous_outlet_access: trf.revokePreviousOutletAccess,
        admin_note: trf.adminNote
      };
      await supabase.from('afo_transfers').upsert(dbRow);
    } catch (err) {
      console.warn('Error saving transfer to Supabase:', err);
    }
  },

  // Save Governance Settings
  async saveGovernanceSettings(settings: PortalGovernanceSettings) {
    if (!this.isAvailable() || !supabase) return;
    try {
      await supabase.from('portal_governance').upsert({
        id: 'global_governance',
        settings,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error saving governance settings to Supabase:', err);
    }
  },

  // Realtime Subscriptions for live updates (Admin & Outlet sync)
  subscribeToChanges(callbacks: {
    onChequeCardChange?: (payload: any) => void;
    onLoanChange?: (payload: any) => void;
    onSubmissionChange?: (payload: any) => void;
    onUserChange?: (payload: any) => void;
    onAdminChange?: (payload: any) => void;
    onOutletChange?: (payload: any) => void;
    onNotificationChange?: (payload: any) => void;
    onMailChange?: (payload: any) => void;
    onResetRequestChange?: (payload: any) => void;
    onTransferChange?: (payload: any) => void;
  }) {
    if (!this.isAvailable() || !supabase) return () => {};

    const channel = supabase
      .channel('brac_live_outlet_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cheque_card_registry' },
        (payload) => callbacks.onChequeCardChange?.(payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loan_records' },
        (payload) => callbacks.onLoanChange?.(payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'work_submissions' },
        (payload) => callbacks.onSubmissionChange?.(payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_profiles' },
        (payload) => callbacks.onUserChange?.(payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_accounts' },
        (payload) => callbacks.onAdminChange?.(payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'outlets' },
        (payload) => callbacks.onOutletChange?.(payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'station_notifications' },
        (payload) => callbacks.onNotificationChange?.(payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'station_mail_messages' },
        (payload) => callbacks.onMailChange?.(payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'password_reset_requests' },
        (payload) => callbacks.onResetRequestChange?.(payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'afo_transfers' },
        (payload) => callbacks.onTransferChange?.(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
