import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertCalculatorResultSchema, loginSchema, registerSchema, insertKycSchema, updateKycSchema } from "@shared/schema";
import { generateToken, authMiddleware, requireRole, type AuthRequest } from "./auth";
import { auditUser, auditKyc, auditProduct, auditContract } from "./auditMiddleware";
import { z } from "zod";
import express from "express";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      const user = await storage.createUser(userData);
      const token = generateToken(user.id, user.email, user.name, user.role);

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid registration data", details: error.errors });
      }
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isValidPassword = await storage.validatePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = generateToken(user.id, user.email, user.name, user.role);

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid login data", details: error.errors });
      }
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get current user info (protected route)
  app.get("/api/me", authMiddleware, async (req: AuthRequest, res) => {
    res.json({
      success: true,
      user: req.user,
    });
  });

  // Update user profile (protected route)
  app.put("/api/me/profile", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const { nombre, apellidos, telefono, fechaNacimiento, pais, direccion } = req.body;
      
      console.log("Profile update request:", { userId, body: req.body });
      
      // Update user profile
      const updatedUser = await storage.updateUser(userId, {
        name: nombre,
        apellidos,
        telefono,
        fechaNacimiento,
        pais,
        direccion,
      });

      console.log("Profile updated successfully:", updatedUser);

      // Log activity to client_activity_logs
      await storage.logClientActivity(userId, 'Perfil actualizado');

      res.json({
        success: true,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // KYC routes
  // Get upload URL for KYC documents
  app.post("/api/kyc/upload-url", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { filename } = req.body;
      
      if (!filename || typeof filename !== 'string') {
        return res.status(400).json({ error: "Filename is required" });
      }

      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL(filename);
      
      res.json({ uploadURL });
    } catch (error) {
      console.error('Error getting upload URL:', error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // General endpoint for downloading any protected object (no auth for direct access)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectPath = `/objects/${req.params.objectPath}`;
      console.log('Download request for path:', objectPath);
      
      const { ObjectStorageService, ObjectNotFoundError } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      
      try {
        const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
        console.log('File found, downloading:', objectFile.name);
        
        // Basic ACL: Users can only access KYC files (for now, simple implementation)
        // TODO: Implement proper ACL based on file metadata
        
        await objectStorageService.downloadObject(objectFile, res);
      } catch (error) {
        if (error instanceof ObjectNotFoundError) {
          return res.status(404).json({ error: "Document not found" });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      res.status(500).json({ error: "Failed to download document" });
    }
  });

  // General download endpoint for URL parameters 
  app.get("/api/download-document", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: "URL parameter is required" });
      }
      
      // Extract the object path from the URL
      // URL format: /objects/kyc/some-file.pdf or full URL
      let objectPath = url;
      
      if (url.startsWith('http')) {
        // If it's a full URL, extract the path
        const urlObj = new URL(url);
        objectPath = urlObj.pathname;
      }
      
      if (!objectPath.startsWith('/objects/')) {
        return res.status(400).json({ error: "Invalid document URL" });
      }
      
      const { ObjectStorageService, ObjectNotFoundError } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      
      try {
        const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
        await objectStorageService.downloadObject(objectFile, res);
      } catch (error) {
        if (error instanceof ObjectNotFoundError) {
          return res.status(404).json({ error: "Document not found" });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      res.status(500).json({ error: "Failed to download document" });
    }
  });

  // Download KYC document endpoint (deprecated - kept for backwards compatibility)
  app.get("/api/kyc/download/:objectPath", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const objectPath = `/objects/${req.params.objectPath}`;
      
      const { ObjectStorageService, ObjectNotFoundError } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      
      try {
        const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
        await objectStorageService.downloadObject(objectFile, res);
      } catch (error) {
        if (error instanceof ObjectNotFoundError) {
          return res.status(404).json({ error: "Document not found" });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      res.status(500).json({ error: "Failed to download document" });
    }
  });

  app.post("/api/kyc", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const kycData = insertKycSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      // Check if user already has KYC record
      const existingKyc = await storage.getKycByUserId(req.user!.id);
      
      if (existingKyc) {
        // Update existing record (reset review status)
        const updates = {
          ...kycData,
          status: "pending",
          rejectionReason: null,
          reviewedBy: null,
          reviewedAt: null,
        };
        
        const kyc = await storage.updateKyc(existingKyc.id, updates);
        res.json({ success: true, kyc });
      } else {
        // Create new record
        const kyc = await storage.createKyc(kycData);
        res.json({ success: true, kyc });
      }
    } catch (error) {
      console.error("Error creating/updating KYC:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid KYC data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to process KYC data" });
    }
  });

  app.get("/api/kyc/me", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const kyc = await storage.getKycByUserId(req.user!.id);
      res.json({ success: true, kyc });
    } catch (error) {
      console.error("Error fetching user KYC:", error);
      res.status(500).json({ error: "Failed to fetch KYC data" });
    }
  });

  app.put("/api/kyc/me", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const existingKyc = await storage.getKycByUserId(req.user!.id);
      if (!existingKyc) {
        return res.status(404).json({ error: "KYC record not found" });
      }

      const updates = {
        ...req.body,
        status: "pending", // Reset to pending when user updates
        rejectionReason: null,
        reviewedBy: null,
        reviewedAt: null,
      };
      
      const kyc = await storage.updateKyc(existingKyc.id, updates);
      res.json({ success: true, kyc });
    } catch (error) {
      console.error("Error updating KYC:", error);
      res.status(500).json({ error: "Failed to update KYC" });
    }
  });
  // Lead creation endpoint
  app.post("/api/leads", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      res.json({ success: true, leadId: lead.id });
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(400).json({ success: false, error: "Invalid lead data" });
    }
  });

  // Calculator result endpoint
  app.post("/api/calculator-results", async (req, res) => {
    try {
      const resultData = insertCalculatorResultSchema.parse(req.body);
      const result = await storage.createCalculatorResult(resultData);
      res.json({ success: true, resultId: result.id });
    } catch (error) {
      console.error("Error saving calculator result:", error);
      res.status(400).json({ success: false, error: "Invalid calculator data" });
    }
  });

  // PDF generation endpoint for calculator results
  app.post("/api/generate-pdf", async (req, res) => {
    try {
      const { amount, years, compoundInterest, finalAmount, interestGenerated } = req.body;
      
      // In a real implementation, you would use a PDF library like puppeteer or jsPDF
      // For now, we'll return a mock PDF URL
      const pdfData = {
        filename: `investment-simulation-${Date.now()}.pdf`,
        url: `/api/download-pdf/${Date.now()}`, // Mock URL
        data: {
          amount,
          years,
          compoundInterest,
          finalAmount,
          interestGenerated,
          generatedAt: new Date().toISOString()
        }
      };
      
      res.json({ success: true, pdf: pdfData });
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ success: false, error: "Failed to generate PDF" });
    }
  });

  // Email notification endpoint for lead magnets
  app.post("/api/send-documents", async (req, res) => {
    try {
      const { leadId, email } = req.body;
      
      // In a real implementation, you would integrate with email service
      console.log(`Sending documents to ${email} for lead ${leadId}`);
      
      res.json({ success: true, message: "Documents sent successfully" });
    } catch (error) {
      console.error("Error sending documents:", error);
      res.status(500).json({ success: false, error: "Failed to send documents" });
    }
  });

  // Admin routes (require admin role)
  app.get("/api/admin/users", authMiddleware, requireRole('admin'), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ success: true, users });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/kyc", authMiddleware, requireRole('admin'), async (req, res) => {
    try {
      const kyc = await storage.getAllKyc();
      res.json({ success: true, kyc });
    } catch (error) {
      console.error("Error fetching KYC:", error);
      res.status(500).json({ error: "Failed to fetch KYC records" });
    }
  });

  app.get("/api/admin/products", authMiddleware, requireRole('admin'), async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json({ success: true, products });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/admin/contracts", authMiddleware, requireRole('admin'), async (req, res) => {
    try {
      const contracts = await storage.getAllContracts();
      res.json({ success: true, contracts });
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ error: "Failed to fetch contracts" });
    }
  });

  app.post("/api/admin/products", authMiddleware, requireRole('admin'), auditProduct.create, async (req, res) => {
    try {
      const productData = req.body;
      const product = await storage.createProduct(productData);
      res.json({ success: true, product });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Create user (admin only)
  app.post('/api/admin/users', authMiddleware, requireRole('admin'), auditUser.create, async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      const user = await storage.createUser(userData);
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Update user
  app.put('/api/admin/users/:id', authMiddleware, requireRole('admin'), auditUser.update, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      // Don't allow updating ID
      delete updates.id;
      
      const user = await storage.updateUser(userId, updates);
      res.json({ success: true, user });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  // Delete user
  app.delete('/api/admin/users/:id', authMiddleware, requireRole('admin'), auditUser.delete, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.deleteUser(userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // Update product
  app.put('/api/admin/products/:id', authMiddleware, requireRole('admin'), auditProduct.update, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const updates = req.body;
      
      // Don't allow updating ID
      delete updates.id;
      
      const product = await storage.updateProduct(productId, updates);
      res.json({ success: true, product });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  // Delete product
  app.delete('/api/admin/products/:id', authMiddleware, requireRole('admin'), auditProduct.delete, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      await storage.deleteProduct(productId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  // Update KYC status (admin review)
  app.put('/api/admin/kyc/:id', authMiddleware, requireRole('admin'), auditKyc.update, async (req: AuthRequest, res) => {
    try {
      const kycId = parseInt(req.params.id);
      const updateData = updateKycSchema.parse(req.body);
      
      const updates = {
        ...updateData,
        reviewedBy: req.user!.id,
        reviewedAt: new Date(),
      };
      
      const kyc = await storage.updateKyc(kycId, updates);
      
      // Log specific activity based on status change
      if (updateData.status) {
        let activityMessage = '';
        if (updateData.status === 'approved') {
          activityMessage = 'Verificación KYC completada';
        } else if (updateData.status === 'rejected') {
          activityMessage = 'Verificación KYC rechazada';
        }
        
        if (activityMessage) {
          // Log activity for the client whose KYC was updated
          await storage.logClientActivity(kyc.userId, activityMessage);
        }
      }
      
      res.json({ success: true, kyc });
    } catch (error) {
      console.error('Error updating KYC status:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update KYC status' });
    }
  });

  // Update contract status
  app.put('/api/admin/contracts/:id', authMiddleware, requireRole('admin'), auditContract.update, async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const { status } = req.body;
      
      const contract = await storage.updateContractStatus(contractId, status);
      res.json({ success: true, contract });
    } catch (error) {
      console.error('Error updating contract status:', error);
      res.status(500).json({ error: 'Failed to update contract status' });
    }
  });

  // Audit logs routes
  app.get('/api/admin/audit-logs', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
      const logs = await storage.getAuditLogs();
      res.json({ success: true, logs });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });

  // Financial KPIs endpoint
  app.get('/api/admin/financial-kpis', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
      const kpis = await storage.getFinancialKPIs();
      res.json({ success: true, kpis });
    } catch (error) {
      console.error('Error fetching financial KPIs:', error);
      res.status(500).json({ error: 'Failed to fetch financial KPIs' });
    }
  });

  // Get user profile data endpoint (for admin viewing client/partner profiles)
  app.get('/api/admin/user-profile/:userId', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // For admin users, return limited info
      if (user.role === 'admin') {
        return res.status(403).json({ error: 'Cannot view admin profiles' });
      }

      // Get additional profile data based on user role
      let profileData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        grade: user.grade,
        sponsor: user.sponsor,
        verificationStatus: user.verificationStatus,
        createdAt: user.createdAt,
      };

      // Add KYC data if available
      try {
        const kyc = await storage.getKycByUserId(userId);
        if (kyc) {
          profileData = {
            ...profileData,
            fullName: kyc.fullName,
            documentType: kyc.documentType,
            documentNumber: kyc.documentNumber,
            country: kyc.country,
            kycStatus: kyc.status,
            kycCreatedAt: kyc.createdAt,
          };
        }
      } catch (kycError) {
        // KYC data is optional
        console.log('KYC data not found for user:', userId);
      }

      res.json({ success: true, profile: profileData });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });

  // Client activity logs routes
  app.get('/api/client/activity-logs', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const logs = await storage.getClientActivityLogsByUserId(userId);
      res.json({ success: true, logs });
    } catch (error) {
      console.error('Error fetching client activity logs:', error);
      res.status(500).json({ error: 'Failed to fetch client activity logs' });
    }
  });

  app.post('/api/client/activity-logs', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const { action } = req.body;
      
      const activityData = {
        userId,
        action,
      };
      
      const log = await storage.createClientActivityLog(activityData);
      res.json({ success: true, log });
    } catch (error) {
      console.error('Error creating client activity log:', error);
      res.status(500).json({ error: 'Failed to create client activity log' });
    }
  });

  // Serve static files from attached_assets
  app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));

  const httpServer = createServer(app);
  return httpServer;
}
