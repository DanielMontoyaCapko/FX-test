import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  apellidos: varchar("apellidos", { length: 255 }), // Last names
  telefono: varchar("telefono", { length: 50 }), // Phone number
  fechaNacimiento: varchar("fecha_nacimiento", { length: 20 }), // Birth date
  pais: varchar("pais", { length: 100 }), // Country
  direccion: text("direccion"), // Address
  role: varchar("role", { length: 50 }).notNull().default("client"), // 'client' | 'partner' | 'admin'
  sponsor: varchar("sponsor", { length: 255 }), // sponsor user for referrals
  grade: varchar("grade", { length: 50 }).default("Bronze"), // Bronze, Silver, Gold, Diamond
  verificationStatus: varchar("verification_status", { length: 50 }).default("pending"), // verified, pending
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// KYC table
export const kyc = pgTable("kyc", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  documentType: varchar("document_type", { length: 50 }).notNull(), // passport, dni, license
  documentNumber: varchar("document_number", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // approved, pending, rejected
  documentsUrls: text("documents_urls").array(), // URLs of uploaded documents
  rejectionReason: text("rejection_reason"), // Admin note when rejecting
  reviewedBy: integer("reviewed_by").references(() => users.id), // Admin who reviewed
  reviewedAt: timestamp("reviewed_at"), // When the review was completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  interestRate: varchar("interest_rate", { length: 10 }).notNull(), // stored as string like "9.00"
  termDays: integer("term_days").notNull(),
  minAmount: varchar("min_amount", { length: 20 }).notNull(), // stored as string for precision
  maxAmount: varchar("max_amount", { length: 20 }).notNull(),
  status: varchar("status", { length: 50 }).default("active"), // active, inactive
  autoRenewal: boolean("auto_renewal").default(false),
  contractTemplate: text("contract_template"), // URL or text of contract
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contracts table
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  amount: varchar("amount", { length: 20 }).notNull(), // stored as string for precision
  status: varchar("status", { length: 50 }).default("ready_to_start"), // active, ready_to_start, completed, cancelled
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  type: text("type").notNull(), // 'Asesor Financiero' | 'Inversor Particular'
  message: text("message"),
  source: text("source").notNull(), // 'download', 'contact', 'advisor'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const calculatorResults = pgTable("calculator_results", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  amount: integer("amount").notNull(),
  years: integer("years").notNull(),
  compoundInterest: boolean("compound_interest").notNull(),
  finalAmount: integer("final_amount").notNull(),
  interestGenerated: integer("interest_generated").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audit logs table for tracking admin actions
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => users.id).notNull(), // Admin who performed the action
  action: varchar("action", { length: 100 }).notNull(), // CREATE, UPDATE, DELETE
  entityType: varchar("entity_type", { length: 50 }).notNull(), // users, kyc, products, contracts
  entityId: varchar("entity_id", { length: 50 }).notNull(), // ID of the affected entity
  oldValues: text("old_values"), // JSON string of old values (for updates)
  newValues: text("new_values"), // JSON string of new values
  description: varchar("description", { length: 500 }), // Human-readable description
  ipAddress: varchar("ip_address", { length: 45 }), // IP address of admin
  userAgent: text("user_agent"), // Browser/device info
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Client activity logs table for tracking user actions (simplified for client view)
export const clientActivityLogs = pgTable("client_activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(), // User who performed the action
  action: varchar("action", { length: 200 }).notNull(), // Simple action description in Spanish
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertCalculatorResultSchema = createInsertSchema(calculatorResults).omit({
  id: true,
  createdAt: true,
});

// User schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["client", "partner", "admin"]).default("client"),
});

// New table schemas
export const insertKycSchema = createInsertSchema(kyc).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedAt: true,
});

export const updateKycSchema = z.object({
  status: z.enum(["approved", "pending", "rejected"]),
  rejectionReason: z.string().optional(),
  reviewedBy: z.number().optional(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertClientActivityLogSchema = createInsertSchema(clientActivityLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertCalculatorResult = z.infer<typeof insertCalculatorResultSchema>;
export type CalculatorResult = typeof calculatorResults.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type InsertKyc = z.infer<typeof insertKycSchema>;
export type Kyc = typeof kyc.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertClientActivityLog = z.infer<typeof insertClientActivityLogSchema>;
export type ClientActivityLog = typeof clientActivityLogs.$inferSelect;
