import {
  BRACBankOutlet,
  UserProfile,
  AdminAccount,
  WorkSubmission,
  AuditLog,
  StationMailMessage,
  StationNotification,
  ChequeCardEntry,
  LoanAccountRecord,
  PasswordResetRequest,
  AfoTransferRecord
} from '../types';

/**
 * Production Clean Slate: Completely free of dummy / hardcoded / demo data.
 * All application records are fetched and persisted live via Supabase.
 */
export const INITIAL_OUTLETS: BRACBankOutlet[] = [];

export const INITIAL_ADMINS: AdminAccount[] = [];

export const INITIAL_USERS: UserProfile[] = [];

export const INITIAL_SUBMISSIONS: WorkSubmission[] = [];

export const INITIAL_CHEQUE_CARD_ENTRIES: ChequeCardEntry[] = [];

export const INITIAL_LOAN_RECORDS: LoanAccountRecord[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_MAIL_MESSAGES: StationMailMessage[] = [];

export const INITIAL_NOTIFICATIONS: StationNotification[] = [];

export const INITIAL_RESET_REQUESTS: PasswordResetRequest[] = [];

export const INITIAL_AFO_TRANSFERS: AfoTransferRecord[] = [];
