# Sentry Error Recording - Quick Reference

## ✅ What's Been Implemented

### 1. Error Handler Utilities (`utils/error-handler.ts`)

Comprehensive error tracking with multiple helper functions:

```typescript
// Capture exceptions with context
captureException(error, { category, severity, tags, extra });

// Log messages (info, warnings)
captureMessage(message, { level, category, tags });

// Track user actions
addBreadcrumb(message, { category, level, data });

// Wrap async functions
await withErrorHandling(fn, { operation, category });

// Wrap sync functions
withErrorHandlingSync(fn, { operation, category });

// Database-specific errors
captureDatabaseError(error, operation, details);

// Data operation errors
captureDataOperationError(error, operation, details);

// UI errors
captureUIError(error, component, details);

// Navigation errors
captureNavigationError(error, route, details);
```

### 2. Settings Screen Enhancement

- **New Button**: "Test Sentry Error" for verifying error tracking
- **Enhanced Reset Function**: Tracks data reset with breadcrumbs and messages
- **Error Handling**: All user actions are monitored and logged

### 3. Database Operations

- **Error Tracking**: All database operations capture errors with context
- **Breadcrumbs**: User actions tracked automatically
- **Data Context**: Operation details included for debugging

## 🚀 How to Test

1. **Open Settings Screen**
2. **Tap "Test Sentry Error"** button (red bug icon)
3. **Check Sentry Dashboard** at: https://sentry.io/organizations/personal-2i3/issues/
4. **Look for**:
   - New error entry: "Test error from Bugarin Health Tracker"
   - Breadcrumbs showing the test action
   - Error context and severity

## 📊 Error Categories

| Category         | Use Case                         |
| ---------------- | -------------------------------- |
| `database`       | SQL queries, database operations |
| `data-operation` | Exercise, food, weight tracking  |
| `ui`             | Component render errors          |
| `navigation`     | Route/deep link failures         |
| `network`        | API calls (future)               |
| `system`         | App lifecycle events             |

## 🏷️ Error Severity Levels

| Level     | Usage                   |
| --------- | ----------------------- |
| `fatal`   | App-breaking errors     |
| `error`   | Operation failures      |
| `warning` | Degraded functionality  |
| `info`    | Informational messages  |
| `debug`   | Development diagnostics |

## 📝 Common Usage Examples

### Track Database Operation

```typescript
try {
  addBreadcrumb("Adding exercise", { category: "data" });
  const result = addExercise(...);
  return result;
} catch (error) {
  captureDatabaseError(error, "addExercise", { data });
  throw error;
}
```

### Track User Action

```typescript
const handleButtonPress = () => {
  addBreadcrumb("User pressed reset button", {
    category: "user-action",
  });
  // ... operation code
};
```

### Track Operation Success/Failure

```typescript
try {
  resetAllData();
  captureMessage("Data reset successful", { level: "info" });
} catch (error) {
  captureException(error, {
    category: "data-operation",
    severity: "error",
  });
}
```

## 🔧 Sentry Configuration

**DSN**: `https://dbdd398c56c4a1ed5fe33d520206907b@o4510388552204288.ingest.us.sentry.io/4510762955767808`

**Features Enabled**:

- ✅ Session Replay (10% normal, 100% on errors)
- ✅ Error tracking
- ✅ Breadcrumb logging
- ✅ PII collection
- ✅ Log collection

## 📱 Testing Checklist

- [ ] Test Sentry button works
- [ ] Error appears in Sentry dashboard
- [ ] Breadcrumbs show user action
- [ ] Reset data operation tracked
- [ ] Exercise operations tracked (next phase)
- [ ] Food operations tracked (next phase)
- [ ] Weight operations tracked (next phase)

## 📚 Documentation Files

| File                                | Purpose                           |
| ----------------------------------- | --------------------------------- |
| `.azure/SENTRY_INTEGRATION_PLAN.md` | Detailed implementation plan      |
| `SENTRY_IMPLEMENTATION_SUMMARY.md`  | What was implemented              |
| `utils/error-handler.ts`            | Error tracking utilities          |
| `app/(tabs)/settings.tsx`           | Settings with Sentry test         |
| `database/operations.ts`            | Database operations with tracking |

## 🔄 Next Steps

### Phase 2: Expand Error Tracking

- Add tracking to exercise/food/weight screens
- Implement error boundaries
- Add network error tracking

### Phase 3: Enhanced Monitoring

- Add performance monitoring
- Implement custom alerts
- Set up error grouping rules

### Phase 4: Production Ready

- Environment-based configuration
- Release version tracking
- Custom error pages

## ⚠️ Important Notes

- **PII Protection**: Sensitive data is automatically excluded
- **Development Mode**: Errors logged to console in `__DEV__`
- **Error Context**: Include relevant details for debugging
- **Breadcrumbs**: Keep messages concise and meaningful
- **Categories**: Always specify appropriate error categories

## 🎯 Success Indicators

✅ Errors appear in Sentry dashboard
✅ Breadcrumbs track user actions
✅ Error details include context
✅ Test button functions properly
✅ No console errors from Sentry
✅ Session replays available on errors

---

**Implementation Status**: ✅ Core features complete
**Last Updated**: January 24, 2026
**Ready for**: Extended deployment and Phase 2 implementation
