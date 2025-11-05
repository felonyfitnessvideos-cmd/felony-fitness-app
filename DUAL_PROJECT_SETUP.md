# 🏗️ FELONY FITNESS - DUAL PROJECT SETUP

## 📊 PROJECT ARCHITECTURE

### **PRODUCTION PROJECT**
**Name**: `felony-fitness-admin` (wkmrdelhoeqhsdifrarn)
**Purpose**: Live production application
**Schemas**:
- `public` - Main app functionality (current)
- `marketing` - Website, leads, content management
- `analytics` - Usage tracking and metrics

### **DEVELOPMENT PROJECT**  
**Name**: `felony-fitness-dev` (ytpblkbwgdbiserhrlqm)
**Purpose**: Development and testing environment
**Schemas**:
- `public` - Mirror of production schema for testing
- `experimental` - New feature development
- `staging` - Pre-production testing

---

## 🔧 DEVELOPMENT WORKFLOW

### **Local Development Process**
1. **Link to DEV project** for daily development
2. **Test features** safely in development environment
3. **Migrate changes** to production when ready
4. **Keep production stable** and isolated

### **Schema Migration Strategy**
1. **Develop in DEV** project schemas
2. **Generate migrations** from changes
3. **Apply to PRODUCTION** after testing
4. **Maintain schema consistency** across environments

---

## 🚀 IMPLEMENTATION STEPS

### Phase 1: Configure Development Environment
1. Link repository to DEV project
2. Copy production schema to development
3. Set up development-specific configurations

### Phase 2: Set up Production Schemas
1. Add marketing schema to production project
2. Create analytics schema for metrics
3. Migrate any existing marketing data

### Phase 3: Create Dual-Environment Scripts
1. Development startup script (links to DEV)
2. Production management script (links to PROD)
3. Schema synchronization utilities

---

*Ready to implement this professional development workflow!*