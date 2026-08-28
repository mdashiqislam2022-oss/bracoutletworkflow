export type Role = 'USER' | 'ADMIN' | 'DELEGATED_ADMIN';

export interface BRACBankOutlet {
  id: string;
  name: string;
  code: string;
  zone: string;
  district: string;
  division: string;
  managerName: string;
  contactNumber: string;
  address: string;
  isActive: boolean;
  isSuspended?: boolean;
  status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  suspendedAt?: string;
  suspendedReason?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedReason?: string;
  imageUrl?: string;
  email?: string;
  operatingHours?: string;
  establishedYear?: string;
  notes?: string;
}

export interface AfoTransferRecord {
  id: string;
  userId?: string;
  userName?: string;
  userEmployeeId?: string;
  userAvatarUrl?: string;
  userEmail?: string;
  userPhone?: string;
  fromOutletId: string;
  fromOutletName: string;
  fromOutletCode?: string;
  fromOutletAddress?: string;
  toOutletId: string;
  toOutletName: string;
  toOutletCode?: string;
  toOutletAddress?: string;
  transferredAt: string;
  transferredBy: string;
  revokePreviousOutletAccess: boolean;
  adminNote?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  password?: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  outletId: string;
  outletName: string;
  outletCode?: string;
  outletLocation: string;
  employeeId: string;
  designation: string;
  yearsOfService: number;
  bio: string;
  bloodGroup: string;
  emergencyContact: string;
  emergencyPhone?: string;
  supervisorName: string;
  supervisor?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  role: Role;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  needsResetLoginNotice?: boolean;
  previousOutletIds?: string[];
  previousOutletAccessRevoked?: boolean;
  lastTransferDate?: string;
  transferHistory?: AfoTransferRecord[];
  createdAt: string;
  lastLoginAt: string;
  isOnline?: boolean;
    lastSeenAt?: string;
}

export interface PasswordResetRequest {
  id: string;
  userId?: string;
  fullName: string;
  emailOrPhone: string;
  outletId?: string;
  outletName?: string;
  outletCode?: string;
  userNote?: string;
  requestedUsername?: string;
  requestedPassword?: string;
  requestedAvatarUrl?: string;
  requestedAt: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED' | 'CANCELLED';
  resolvedAt?: string;
  resolvedBy?: string;
  assignedUsername?: string;
  adminNote?: string;
}

export interface StationMailMessage {
  id: string;
  senderName: string;
  senderRole: 'ADMIN' | 'HEAD_OFFICE' | 'SYSTEM' | 'USER';
  senderEmail: string;
  recipientUserId?: string; // specific user ID or 'ALL'
  recipientOutletId?: string; // specific outlet ID or 'ALL'
  subject: string;
  content: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  category: 'CIRCULAR' | 'OPERATION_UPDATE' | 'AUDIT_NOTICE' | 'DIRECT_MEMO';
  isRead: boolean;
  timestamp: string;
}

export interface StationNotification {
  id: string;
  title: string;
  message: string;
  type: 'ADMIN_NOTE' | 'APPROVAL' | 'SYNC' | 'ALERT' | 'INFO';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  targetUserId?: string; // specific user ID or 'ALL'
  targetOutletId?: string; // specific outlet ID or 'ALL'
  targetAudience?: 'ADMIN_ONLY' | 'USER_ONLY' | 'ALL';
  isRead: boolean;
  timestamp: string;
  linkTab?: string;
}

export interface AdminAccount {
  id: string;
  email: string;
  phone?: string;
  username: string;
  pinHash: string; // 4-digit PIN representation
  password?: string;
  fullName: string;
  avatarUrl: string;
  isMainAdmin: boolean;
  delegatedBy?: string;
  delegatedAt?: string;
  permissions: AdminPermission[];
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  lastLoginAt: string;
}

export type AdminPermission = 
  | 'VIEW_ALL'
  | 'MANAGE_USERS'
  | 'DELEGATE_ADMINS'
  | 'EXPORT_DATA'
  | 'MODIFY_OUTLETS'
  | 'AUDIT_LOGS'
  | 'SYSTEM_CONFIG';

export type ServiceCategory = 
  | 'CHEQUE_BOOK_DISPATCH'
  | 'DEBIT_CREDIT_CARD'
  | 'ACCOUNT_OPENING_DOCS'
  | 'LOAN_KYC_VERIFICATION'
  | 'REMITTANCE_CLEARANCE'
  | 'MERCHANT_POS_SERVICES';

export type ChequeLeafCount = 10 | 20 | 25 | 50 | 100;

export type LoanStatus = 'ACTIVE' | 'CLOSED' | 'OVERDUE' | 'DEFAULTED';

export interface LoanAccountRecord {
  id: string;
  accountTitle: string; // Only alphabetic/word characters
  customerName: string;
  mobileNumber: string; // Only numbers
  loanAccountNumber: string; // Only numbers
  loanAmount: number; // Principal loan amount (Taka)
  monthlyInstallment: number; // Monthly EMI amount (Taka)
  disbursementDate: string; // Date loan taken (YYYY-MM-DD)
  interestRate: number; // Interest percentage %
  loanTenureYears: number; // Duration in years
  loanStatus: LoanStatus;
  outletId: string;
  outletName: string;
  userId: string;
  userName: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChequeBookRecord {
  id: string;
  type: 'CHEQUE';
  accountTitle: string;
  accountNumber: string;
  mobileNumber: string;
  receivedDate: string; // YYYY-MM-DD
  leafCount: ChequeLeafCount;
  startCchNumber: string;
  endCchNumber: string;
  outletId: string;
  outletName: string;
  userId: string;
  userName: string;
  status: 'RECEIVED' | 'DELIVERED_TO_CUSTOMER' | 'RETURNED' | 'DESTROYED_EXPIRED';
  deliveredAt?: string;
  destroyedAt?: string;
  destructionReason?: string;
  notes?: string;
  createdAt: string;
}

export interface DebitCardRecord {
  id: string;
  type: 'CARD';
  cardName: string;
  accountNumber: string;
  mobileNumber: string;
  receivedDate: string; // YYYY-MM-DD
  cardType?: string;
  outletId: string;
  outletName: string;
  userId: string;
  userName: string;
  status: 'RECEIVED' | 'DELIVERED_TO_CUSTOMER' | 'RETURNED' | 'DESTROYED_EXPIRED';
  deliveredAt?: string;
  destroyedAt?: string;
  destructionReason?: string;
  notes?: string;
  createdAt: string;
}

export type ChequeCardEntry = ChequeBookRecord | DebitCardRecord;

export type SubmissionStatus = 
  | 'RECEIVED_AT_OUTLET'
  | 'VERIFIED_AND_APPROVED'
  | 'DELIVERED_TO_CUSTOMER'
  | 'IN_TRANSIT_TO_HUB'
  | 'REJECTED_ACTION_REQUIRED';

export interface WorkSubmission {
  id: string;
  trackingNo: string;
  userId: string;
  userName: string;
  userEmail: string;
  employeeId: string;
  outletId: string;
  outletName: string;
  customerName: string;
  customerPhone: string;
  customerNid: string;
  accountOrCardNumber: string;
  serviceCategory: ServiceCategory;
  status: SubmissionStatus;
  
  // Specific category details
  chequeLeafCount?: number;
  chequeSerialStart?: string;
  chequeSerialEnd?: string;
  cardLast4Digits?: string;
  cardType?: 'VISA_DEBIT' | 'MASTERCARD_DEBIT' | 'CREDIT_GOLD' | 'CREDIT_PLATINUM' | 'UNIONPAY';
  
  deliveryAcknowledgmentSigned: boolean;
  priorityLevel: 'NORMAL' | 'URGENT' | 'HIGH_VALUE';
  notes: string;
  submittedAt: string;
  updatedAt: string;
  processedBy?: string;
}

export interface AuditLog {
  id: string;
  actorEmail: string;
  actorName: string;
  actorRole: Role;
  action: string;
  details: string;
  outletName?: string;
  ipAddress: string;
  timestamp: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'bn';
  emailNotifications: boolean;
  smsAlerts: boolean;
  soundEffects: boolean;
  compactView: boolean;
}

export interface PortalGovernanceSettings {
  allowSelfRegistration: boolean;
  requirePinAuth: boolean;
  allowOfficerProfileEdit: boolean;
  requireOutletOnSignup: boolean;
  systemBroadcastNotice: string;
  systemBroadcastType: 'INFO' | 'WARNING' | 'ALERT';
  enableBroadcastBanner: boolean;
}
