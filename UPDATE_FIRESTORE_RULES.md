# 🚨 IMPORTANT: Update Firestore Rules

## Action Required Before Going Live

You have improved Firestore security rules ready, but they need to be deployed manually.

### Steps to Deploy (2 minutes):

1. **Open Firebase Console**
   - Go to https://console.firebase.google.com/
   - Select your project: `birthday-invitation-4920b`

2. **Navigate to Firestore Rules**
   - Click **Firestore Database** in left sidebar
   - Click **Rules** tab at the top

3. **Copy New Rules**
   - Open `firestore.rules` file in this project
   - Select ALL content (Ctrl+A or Cmd+A)
   - Copy it (Ctrl+C or Cmd+C)

4. **Replace Rules in Console**
   - In Firebase Console Rules editor, select ALL existing rules
   - Delete them
   - Paste the new rules from `firestore.rules`

5. **Publish**
   - Click **"Publish"** button
   - Wait for confirmation (appears in ~5 seconds)

### What These Rules Do:

✅ Prevent unauthorized users from creating invitations in your database
✅ Validate data types and lengths server-side
✅ Restrict which fields guests can modify
✅ Ensure only you can manage your own events and invitations

### Current vs. Improved Rules:

**CURRENT (Less Secure):**
```javascript
allow create: if request.auth != null;
```
↓
**IMPROVED (More Secure):**
```javascript
allow create: if request.auth != null 
  && request.resource.data.userId == request.auth.uid
  && validStringLength(request.resource.data.recipientName, 1, 100)
  && request.resource.data.maxGuests >= 1 
  && request.resource.data.maxGuests <= 50;
```

---

## ⚠️ Don't Skip This!

Without updating Firestore rules, you're missing:
- Server-side input validation
- Protection against malicious invitation creation
- Data integrity guarantees

**Status:** Code fixes ✅ Applied | Firestore rules ⚠️ Pending manual update
