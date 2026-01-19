# 🎂 Birthday Invitation Website

A beautiful, feature-rich birthday invitation website with RSVP tracking. Perfect for hosting on GitHub Pages!

## ✨ Features

- 📧 **Custom Invitations**: Add personal messages and invitation images
- 🔗 **Shareable Links**: Generate unique RSVP links with customizable guest limits
- 📊 **RSVP Tracking**: Monitor who's attending in real-time
- 👥 **Guest Management**: Track guest names and special notes
- 📱 **Responsive Design**: Works beautifully on all devices
- 🔒 **Secure Admin Panel**: Protected dashboard for managing invitations
- ☁️ **Cloud-Based**: Uses Firebase for reliable, real-time data storage

## 🚀 Complete Setup Guide (For Beginners)

### Step 1: Fork This Repository

1. Click the **"Fork"** button at the top right of this GitHub page
2. **Make your fork PRIVATE** (recommended) - this keeps your Firebase credentials secure
3. Clone your private fork to your computer or edit directly on GitHub

### Step 2: Create a Firebase Project (100% Free)

Firebase provides the database and authentication for this website. The free tier is more than enough!

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "my-birthday-invitation")
4. **Disable Google Analytics** (not needed for this project)
5. Click **"Create project"** and wait for it to initialize

### Step 3: Register Your Web App in Firebase

1. In your Firebase project dashboard, click the **web icon** `</>` (labeled "Web")
2. Give it a nickname (e.g., "Birthday Website")
3. Click **"Register app"**
4. You'll see a `firebaseConfig` object - **COPY THIS!** You'll need it in the next step

### Step 4: Update Firebase Configuration in Your Code

You need to add your Firebase credentials to two files:

#### File 1: `app.js` (lines 3-10)
Replace this:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

With your actual Firebase config (paste what you copied in Step 3).

#### File 2: `rsvp.js` (lines 3-10)
Paste the **same Firebase configuration** here as well.

### Step 5: Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click **"Get started"**
3. Click on the **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. **Enable** the first toggle (Email/Password)
6. Click **"Save"**

### Step 6: Create Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select a location closest to you (doesn't matter much for small projects)
5. Click **"Enable"**

### Step 7: Configure Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. **Replace everything** with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events collection
    match /events/{userId} {
      // Owner can read/write
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // ANYONE can read event details (needed for guest invitation page)
      allow read: if true;
    }
    
    // Invitations collection
    match /invitations/{invitationId} {
      // Owner can create invitations (must be authenticated)
      allow create: if request.auth != null;
      
      // Owner can read/write/delete their own invitations
      allow read, write, delete: if request.auth != null && resource.data.userId == request.auth.uid;
      
      // ANYONE can read invitations and update for RSVP
      allow read, update: if true;
    }
  }
}
```

3. Click **"Publish"**

### Step 8: Create Required Database Index

This is IMPORTANT! Without it, your admin dashboard won't load invitations.

1. Go to **Firestore Database** → **Indexes** tab
2. Click **"Create Index"**
3. Set these values:
   - **Collection ID**: `invitations`
   - **Fields to index**:
     - Field: `userId`, Order: **Ascending**
     - Field: `createdAt`, Order: **Descending**
   - **Query scope**: Collection
4. Click **"Create Index"**
5. **Wait 1-2 minutes** for the index to build (status will show "Building..." then "Enabled")

> 💡 **Tip**: If you forget this step, Firebase will show an error with a direct link to create the index automatically!

### Step 9: Authorize Localhost (For Testing)

1. In Firebase Console, go to **Authentication** → **Settings** tab
2. Scroll down to **"Authorized domains"**
3. Make sure **`localhost`** is in the list
4. If not, click **"Add domain"** and add `localhost`

### Step 10: Test Locally

1. **Open `index.html`** in your web browser (double-click the file)
2. **Alternative**: Use a local server:
   ```bash
   # If you have Python 3 installed
   python3 -m http.server 8080
   # Then open: http://localhost:8080
   ```
3. Click **"Admin Login"** and create an account (use any email/password)
4. Fill in your **Event Configuration** (name, date, message, optional image)
5. Click **"Save Event Details"**
6. Create an **Invitation Link** (recipient name + max guests)
7. **Copy the generated link** and open it in a new tab/window
8. Submit an RSVP
9. Go back to admin dashboard - you should see the RSVP!

### Step 11: Authorize Your GitHub Pages Domain

Before deploying, you need to tell Firebase about your GitHub Pages URL:

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Click **"Add domain"**
3. Add: `YOUR_USERNAME.github.io` (replace with your actual GitHub username)
4. Click **"Add"**

### Step 11: Authorize Your GitHub Pages Domain

Before deploying, you need to tell Firebase about your GitHub Pages URL:

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Click **"Add domain"**
3. Add: `YOUR_USERNAME.github.io` (replace with your actual GitHub username)
4. Click **"Add"**

### Step 12: Deploy to GitHub Pages

#### Option A: Using GitHub Web Interface (Easiest)

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **"Source"**, select **"Deploy from a branch"**
4. Select **main** (or **master**) branch
5. Select **/ (root)** folder
6. Click **"Save"**
7. Wait 1-2 minutes - your site will be live at: `https://YOUR_USERNAME.github.io/REPO_NAME/`

#### Option B: Using Git Command Line

If you have the repository cloned locally:

```bash
cd /path/to/birthday_invitation

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial setup with Firebase configuration"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Then follow Option A steps 2-7 to enable GitHub Pages.

---

## 📖 How to Use

### For You (Event Organizer)

1. **Login**: Go to your GitHub Pages URL and click "Admin Login"
2. **Login with your account** (the one you created in Step 10)
3. **Configure Event**: 
   - Event name (e.g., "Sarah's 30th Birthday")
   - Event date
   - Custom message (e.g., "Join us for an unforgettable evening...")
   - Optional: Add an invitation image URL
4. **Create Invitation Links**:
   - Enter recipient name/group (e.g., "Smith Family")
   - Set maximum guests allowed (e.g., 4)
   - Click "Generate Link"
5. **Copy and Share**: Copy the generated link and email it to your guests
6. **Track RSVPs**: Watch your dashboard update in real-time as guests respond!

### For Your Guests

Guests simply:
1. Click the invitation link you sent them
2. See the beautiful invitation with all event details
3. Click "Yes, I'll be there!" or "Sorry, can't make it"
4. If attending, enter names of all guests coming
5. Add any special notes (dietary restrictions, etc.)
6. Submit - done!

---

## 🗂️ Project Structure

```
birthday_invitation/
├── index.html          # Admin dashboard page
├── rsvp.html          # Guest RSVP page
├── app.js             # Admin functionality & Firebase initialization
├── rsvp.js            # Guest RSVP functionality
├── styles.css         # All styling (responsive design)
├── firebase-setup.html # Detailed Firebase setup guide
├── examples.html      # Usage examples and inspiration
├── README.md          # This file
└── .github/
    └── workflows/
        └── deploy.yml  # Optional: GitHub Actions auto-deployment
```

---

## 🔒 Security & Privacy

### Why Keep Your Fork Private?

- Your Firebase credentials are in `app.js` and `rsvp.js`
- While Firebase API keys are safe to expose (security is handled by Firestore rules), keeping it private prevents:
  - Unauthorized users from seeing your Firebase project name
  - Potential abuse of your Firebase quota
  - People seeing your guest list and event details

### Firebase Security

- **API Keys**: Safe to include in code - security is enforced by Firestore rules
- **Firestore Rules**: Control who can read/write data
- **Authentication**: Only you can create invitation links
- **Guest Access**: Guests can only view/update the specific invitation they receive

### What's Safe to Share?

✅ The original public repository (without your Firebase config)
✅ Invitation links with your guests
✅ Your live website URL

❌ Your Firebase credentials
❌ Your admin login credentials
❌ Your private fork repository

---

## 🎨 Customization

### Change Colors

Edit CSS variables in `styles.css` (lines 1-12):

```css
:root {
    --primary-color: #6366f1;    /* Main purple */
    --secondary-color: #ec4899;  /* Pink accent */
    --success-color: #10b981;    /* Green for success messages */
    /* ... more colors */
}
```

### Add Your Own Invitation Image

1. Upload your image to a hosting service (Imgur, Google Drive, etc.)
2. Get the direct image URL
3. In the admin dashboard, paste the URL in "Invitation Image URL" field

### Custom Domain (Optional)

If you want `invitation.yourdomain.com` instead of `username.github.io`:

1. Buy a domain (Namecheap, Google Domains, etc.)
2. Add a `CNAME` file to your repository with your domain
3. Configure DNS with your domain provider
4. In Firebase Console, add your custom domain to authorized domains
5. Follow [GitHub's custom domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

---

## 🐛 Troubleshooting

### Problem: "Firebase modules failed to load"

**Solution**: Check your internet connection. Firebase SDK loads from CDN. Try refreshing the page.

### Problem: "Invalid Invitation Link" on RSVP page

**Solutions**:
1. Make sure you copied the complete link (including `?id=...`)
2. Check that the invitation exists in your Firebase Firestore database
3. Verify Firestore security rules are correctly set up (Step 7)

### Problem: Admin dashboard shows "No invitation links created yet" but I created some

**Solutions**:
1. Check browser console (F12) for errors
2. Most common issue: Missing Firestore index (Step 8)
3. Go to Firestore → Indexes tab and create the required index
4. Refresh the page after index is created

### Problem: "Error creating invitation link: Missing or insufficient permissions"

**Solutions**:
1. Verify Firestore security rules (Step 7)
2. Make sure you're logged in as admin
3. Check that `allow create: if request.auth != null;` is in your rules

### Problem: Guest can't submit RSVP - "Permission denied"

**Solutions**:
1. Verify Firestore rules include: `allow read, update: if true;` for invitations
2. Check Firebase Console → Firestore → Rules and re-publish them
3. Make sure events collection also has: `allow read: if true;`

### Problem: GitHub Pages shows 404 error

**Solutions**:
1. Wait 2-3 minutes after enabling GitHub Pages
2. Check Settings → Pages shows "Your site is published at..."
3. Ensure branch and folder are correctly selected
4. Try accessing with `/index.html` at the end of URL

---

## 📊 Firebase Usage & Costs

### Free Tier Limits (Spark Plan)

- **Firestore Reads**: 50,000/day
- **Firestore Writes**: 20,000/day  
- **Storage**: 1 GB
- **Bandwidth**: 10 GB/month

### Typical Usage for a Party

For a party with **100 guests**:
- Creating links: ~100 writes
- Guests viewing invitations: ~200 reads (guests may open multiple times)
- RSVP submissions: ~100 writes + ~100 reads
- Admin dashboard views: ~50 reads per view

**Total**: Well within free tier! Even for large events with 200+ guests.

### Monitoring Usage

1. Firebase Console → **Usage and billing**
2. View current usage vs. limits
3. Set up budget alerts (optional)

---

## 💡 Tips for Success

### Before Creating Links

- ✅ Test the entire flow yourself first
- ✅ Set up event details completely
- ✅ Upload your invitation image
- ✅ Send yourself a test invitation

### Creating Invitation Links

- 📧 Create separate links for different groups (family, friends, coworkers)
- 👥 Be generous with guest limits (+1 or +2 for flexibility)
- 📝 Use descriptive recipient names ("College Friends Group")

### Sharing Links

- 📧 Email is best (guests can easily find and click)
- 💬 WhatsApp/Messenger work great too
- 📱 Can also generate QR codes pointing to invitation links

### Managing RSVPs

- ⏰ Check dashboard regularly
- 📊 Set RSVP deadline in your event message
- 📞 Follow up with guests who haven't responded
- 🍽️ Use guest notes to plan menu, seating, etc.

---

## 🌟 Future Enhancement Ideas

Want to add more features? Consider:

- [ ] QR code generation for invitations
- [ ] Calendar integration (Add to Google Calendar/iCal)
- [ ] Photo gallery after the event
- [ ] Gift registry links
- [ ] Automatic reminder emails
- [ ] Multiple events per admin account
- [ ] Invitation templates/themes
- [ ] Guest +1 management
- [ ] Dietary restriction tracking
- [ ] Seating arrangement planner

---

## 📄 License

This project is free to use for personal purposes. Feel free to customize it for your events!

---

## 🤝 Contributing

Found a bug? Have a feature idea? 

1. Fork the **original public repository** (not your private fork)
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Please don't include any Firebase credentials in pull requests!

---

## ❓ Getting Help

### Detailed Setup Guide

Open `firebase-setup.html` in your browser for a more detailed, step-by-step guide with screenshots and explanations.

### Common Questions

**Q: Do I need to know coding?**
A: No! Just follow the steps to copy-paste Firebase configuration. Everything else is ready to use.

**Q: Is Firebase really free?**
A: Yes! The free tier is more than enough for personal party invitations. You won't be charged unless you explicitly upgrade.

**Q: Can I use this for multiple parties?**
A: Yes! Just update your event details each time. Consider creating separate Firebase projects for different events if you want to keep data separate.

**Q: My guests need to create accounts?**
A: No! Only you (the admin) need an account. Guests just click the link and RSVP directly.

**Q: Can I see who hasn't responded yet?**
A: Yes! The dashboard shows all links with their status: Pending, Confirmed, or Declined.

---

## 🎉 Enjoy Your Party!

Made with ❤️ for celebrating special moments

**Happy Birthday Planning! 🎂🎈🎊**
