# Sentry Error Tracking Integration Plan

## Overview

This document outlines the plan for integrating Sentry error tracking into the Bugarin Health Tracking application. Sentry is already installed and initialized but needs comprehensive error handling throughout the application.

## Current State

- ✅ Sentry dependency installed: `@sentry/react-native@7.10.0`
- ✅ Sentry initialized in `app/_layout.tsx` with DSN configured
- ✅ Session Replay enabled (10% sample rate, 100% on errors)
- ✅ Default PII collection enabled for better context
- ⚠️ Error tracking not yet implemented across application

## Implementation Plan

### Phase 1: Error Tracking Utilities

**Objective:** Create reusable error tracking and reporting utilities

**Tasks:**

1. Create `utils/error-handler.ts` with functions for:
   - Capturing exceptions with context
   - Capturing messages (info, warnings)
   - Setting user context
   - Setting breadcrumbs for user actions
   - Tagging errors by category (database, network, UI, etc.)

### Phase 2: Database Error Handling

**Objective:** Track database operation failures

**Files to Update:**

- `database/operations.ts` - Add error tracking to all database operations
- `database/init.ts` - Track database initialization errors
- `database/db.ts` - Track connection and query errors

**Error Categories:**

- Database initialization failures
- Query execution errors
- Data validation errors
- Transaction failures

### Phase 3: Component Error Handling

**Objective:** Track UI errors and user interactions

**Files to Update:**

- `app/(tabs)/exercise.tsx` - Exercise data operations
- `app/(tabs)/food.tsx` - Food data operations
- `app/(tabs)/weight.tsx` - Weight data operations
- `app/(tabs)/settings.tsx` - Reset data, navigation errors
- `components/ui/*.tsx` - UI component errors
- `hooks/*.ts` - Hook failures

**Implementations:**

- Error boundaries for critical screens
- User action tracking (breadcrumbs)
- Navigation error handling
- Data fetch/update error handling

### Phase 4: Global Error Handling

**Objective:** Catch unhandled errors globally

**Tasks:**

1. Implement error boundaries for main app sections
2. Add unhandled promise rejection handler
3. Add global error logging for uncaught exceptions

### Phase 5: Monitoring & Alerts

**Objective:** Set up meaningful error monitoring

**Configurations:**

- Error severity levels (Critical, Error, Warning, Info)
- Release version tracking
- Environment tagging (development/production)
- Performance monitoring integration

## Error Categories to Track

### 1. Database Errors

- Initialization failures
- Query execution errors
- Data persistence errors
- Migration failures

### 2. Navigation Errors

- Route not found
- Navigation stack issues
- Deep link failures

### 3. Data Operations

- Exercise tracking failures
- Food logging failures
- Weight entry errors
- Target setting failures

### 4. UI Errors

- Component render errors
- State management issues
- Animation failures

### 5. System Errors

- Storage access errors
- Permission issues
- Device capability errors

## Breadcrumb Categories

### User Actions

- Screen navigation
- Button presses
- Data submissions
- Screen focus/blur

### System Events

- App initialization
- App backgrounding
- Network status changes

### Data Events

- Database queries
- API calls
- Data updates
- Cache operations

## Implementation Timeline

| Phase                    | Priority | Estimated Effort |
| ------------------------ | -------- | ---------------- |
| Phase 1: Utilities       | High     | 1-2 hours        |
| Phase 2: Database        | High     | 2-3 hours        |
| Phase 3: Components      | High     | 3-4 hours        |
| Phase 4: Global Handling | Medium   | 1-2 hours        |
| Phase 5: Monitoring      | Medium   | 1 hour           |

## Success Criteria

- ✅ All error-prone operations wrapped with Sentry tracking
- ✅ Database operations include error context
- ✅ User actions tracked as breadcrumbs
- ✅ Error severity appropriately assigned
- ✅ Sensitive data excluded from error reports
- ✅ Production vs development environments properly tagged
- ✅ Errors appear in Sentry dashboard with proper context
- ✅ Error rates and patterns identifiable

## Best Practices

1. **PII Handling**: Already enabled, but ensure sensitive user data is not logged in error messages
2. **Breadcrumbs**: Add breadcrumbs before operations that might fail
3. **Context**: Always include relevant context when capturing exceptions
4. **Levels**: Use appropriate severity levels (debug, info, warning, error, fatal)
5. **Release Tracking**: Tag errors with app version for better tracking
6. **Environment**: Clearly separate development and production errors

## Next Steps

1. Create error tracking utility module
2. Update database operations with comprehensive error tracking
3. Add error tracking to all UI operations
4. Implement error boundaries
5. Test error tracking in development
6. Deploy and monitor in production
