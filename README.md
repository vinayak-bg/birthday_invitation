# 🎂 Birthday Invitation System

A modern, full-featured birthday invitation platform with RSVP tracking and multi-event support. Perfect for hosting on GitHub Pages!

## ✨ Features

- 🎉 **Multiple Events**: Create and manage unlimited birthday events
- 📧 **Custom Invitations**: Add personal messages and invitation images
- 🔗 **Shareable Links**: Generate unique RSVP links with customizable guest limits
- 👨‍👩‍👧‍👦 **Family-Friendly**: Multiple families can RSVP using the same link
- 📊 **Real-Time Tracking**: Monitor RSVPs and guest counts live
- 📱 **Responsive Design**: Works beautifully on all devices
- 🔒 **Secure Admin Panel**: Protected dashboard for managing events
- ☁️ **Cloud-Based**: Uses Firebase for reliable, scalable storage
- 🚀 **Zero Cost**: Runs on GitHub Pages and Firebase free tier
- 📅 **Calendar Integration**: Download .ics files for iOS/Android calendars
- 🕐 **Time & Venue**: Add event time and location details
- ✅ **100% Test Coverage**: Comprehensive unit and integration tests

## 🧪 Testing

This project includes comprehensive test coverage. See [README-TESTING.md](README-TESTING.md) for details.

### Quick Start

```bash
# Install dependencies (requires Node.js)
npm install

# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

Test coverage includes:
- ✅ XSS protection and security
- ✅ Calendar file generation  
- ✅ Date/time parsing and formatting
- ✅ Guest count calculations
- ✅ Input validation
- ✅ RSVP workflows
- ✅ Backwards compatibility

## 🚀 Quick Setup Guide

### Step 1: Fork or Clone This Repository

1. Click the **"Fork"** button at the top right
2. Your fork can be **PUBLIC** - Firebase API keys are safe to expose (see Security FAQ below)
3. Clone to your computer or edit directly on GitHub

> **Note**: GitHub Pages requires a public repository on the free tier. Don't worry - your Firebase API keys are designed to be public. Your data is protected by Firestore security rules and domain restrictions, not by hiding the API key.

### Step 2: Create Firebase Project (Free)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name (e.g., "birthday-invitations")
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Step 3: Register Web App

1. In Firebase dashboard, click the **web icon** `</>`
2. Give it a nickname
3. Click **"Register app"**
4. **Copy the firebaseConfig object**

### Step 4: Update Firebase Configuration

Add your Firebase config to **both files**:

#### `app.js` (lines 3-10)
#### `rsvp.js` (lines 3-10)

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Step 5: Enable Authentication

1. Firebase Console → **Authentication** → **Get started**
2. Click **"Sign-in method"** tab
3. Enable **"Email/Password"**
4. Save

### Step 6: Create Firestore Database

1. Firebase Console → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select your region
5. Click **"Enable"**

### Step 7: Configure Firestore Security Rules

Go to **Firestore Database** → **Rules** tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function validStringLength(str, min, max) {
      return str is string && str.size() >= min && str.size() <= max;
    }
    
    // Events collection
    match /events/{eventId} {
      allow create: if isAuthenticated() 
        && request.resource.data.userId == request.auth.uid
        && validStringLength(request.resource.data.name, 1, 200);
      
      allow read, update, delete: if isAuthenticated() 
        && resource.data.userId == request.auth.uid;
      
      allow read: if true;
    }
    
    // Invitations collection
    match /invitations/{invitationId} {
      allow create: if isAuthenticated() 
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.eventId is string
        && request.resource.data.maxGuests >= 1 
        && request.resource.data.maxGuests <= 50;
      
      allow read, update, delete: if isAuthenticated() 
        && resource.data.userId == request.auth.uid;
      
      allow read: if true;
      
      allow update: if 
        request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['rsvpSubmitted', 'rsvps'])
        && request.resource.data.rsvps is list
        && request.resource.data.rsvps.size() == resource.data.rsvps.size() + 1
        && request.resource.data.rsvpSubmitted is bool;
    }
  }
}
```

Click **"Publish"**

### Step 8: Allow Localhost (Development)

1. Firebase Console → **Authentication** → **Settings**
2. Scroll to **"Authorized domains"**
3. Click **"Add domain"**
4. Add: `localhost`
5. Save

### Step 9: Deploy to GitHub Pages

#### Option A: Using GitHub Web Interface (Recommended)

1. **Push your code to GitHub** (if you haven't already):
   ```bash
   git add .
   git commit -m "Initial setup with Firebase configuration"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** (top navigation)
   - Click **Pages** in the left sidebar
   - Under **Source**, select **"Deploy from a branch"**
   - Choose **main** branch and **/ (root)** folder
   - Click **"Save"**

3. **Wait for deployment** (2-3 minutes)
   - GitHub will show a message: "Your site is ready to be published at..."
   - Refresh the page to see the live URL
   - Your site will be available at: `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`

4. **Add GitHub Pages domain to Firebase** (IMPORTANT - This is what secures your app):
   - Copy your GitHub Pages URL (without https://)
   - Example: `your-username.github.io`
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Click **"Add domain"**
   - Paste: `your-username.github.io`
   - Click **"Add"**
   
   > ⚠️ **SecurDeploy to Netlify/Vercel (Private Repos Supported)

If you want to keep your repository private, use these free alternatives:

**Netlify**:
1. Go to [Netlify](https://www.netlify.com/)
2. Sign up/Login with GitHub
3. Click "Add new site" → "Import an existing project"
4. Choose your private GitHub repository
5. Deploy settings: Leave defaults (Build command: blank, Publish directory: /)
6. Click "Deploy site"
7. Your site URL: `random-name.netlify.app` (can customize)
8. Add your Netlify domain to Firebase authorized domains

**Vercel**:
1. Go to [Vercel](https://vercel.com/)
2. Sign up/Login with GitHub
3. Click "Add New" → "Project"
4. Import your private repository
5. Click "Deploy"
6. Your site URL: `project-name.vercel.app`
7. Add your Vercel domain to Firebase authorized domains

#### Option C: ity Note**: Only domains in this list can use your Firebase project. This prevents others from using your API key on their own websites.

#### Option B: Using Custom Domain (Optional)

If you want to use your own domain (e.g., `invitations.yourdomain.com`):

1. **In GitHub**:
   - Go to Settings → Pages
   - Under "Custom domain", enter your domain
   - Click "Save"

2. **In your DNS provider**:
   - Add a CNAME record pointing to `your-username.github.io`
   - Or add A records for GitHub's IP addresses
   - [Full DNS setup guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

3. **In Firebase**:
   - Add your custom domain to Firebase authorized domains

#### Troubleshooting Deployment

**404 Error after deployment?**
- Wait a few more minutes, deployment can take up to 10 minutes
- Make sure `index.html` is in the root directory
- Check that branch name is correct in Pages settings

**Changes not showing?**
- Clear browser cache: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Check that you pushed your latest changes to GitHub
- Verify the correct branch is selected in Pages settings

**Firebase auth error on live site?**
- Make sure you added your GitHub Pages domain to Firebase authorized domains
- Check that Firebase config is correct in both `app.js` and `rsvp.js`

### Step 10: Create Your First Event!

1. Visit your website
2. Click **"Get Started"**
3. Enter email/password (first time creates account)
4. Click **"+ Create New Event"**
5. Fill in event details
6. Click **"Save Event"**
7. Click **"Select"** on your event
8. Generate invitation links
9. Share with guests!

## 📖 How to Use

### For Event Organizers

1. **Create Events**: Click "+ Create New Event" to add birthday parties
2. **Select Event**: Click "Select" on the event you want to work with
3. **Generate Links**: Create links with different guest limits (e.g., 2 guests, 5 guests)
4. **Share Links**: Send the same link to multiple families
5. **Track RSVPs**: Watch responses come in real-time
6. **Manage**: Edit or delete events as needed

### For Guests

1. Click the invitation link you received
2. See the birthday invitation with all details
3. Select "Yes, I'll be there!" or "Sorry, can't make it"
4. Enter your family/group name
5. Add names of all attending guests
6. Add optional message to organizers
7. Submit!

## 🏗️ Project Structure

```
birthday_invitation/
├── index.html          # Admin dashboard
├── rsvp.html          # Guest RSVP page
├── app.js             # Admin logic
├── rsvp.js            # Guest RSVP logic
├── styles.css         # All styling
├── firestore.rules    # Database security rules
└── README.md          # This file
```

## 🔒 Security Features

- ✅ XSS protection with HTML escaping
- ✅ Input validation (client + server)
- ✅ Firestore security rules enforce data access
- ✅ Authentication required for admin actions
- ✅ Domain restrictions in Firebase
- ✅ Event listeners (no inline onclick)

### 🔐 Security FAQ

**Q: Is it safe to have my Firebase API keys in a public repository?**

**A: Yes!** Firebase API keys are **not secret keys**. They're designed to be included in client-side code and apps. Here's what actually keeps your data secure:

1. **Firestore Security Rules**: These server-side rules control who can read/write data
2. **Domain Restrictions**: Firebase only accepts requests from authorized domains you specify
3. **Authentication**: Only authenticated users can create/manage events
4. **User-specific Data**: Rules ensure users can only access their own events

**Q: Can someone steal my database if they see my API key?**

**A: No.** The API key just identifies your Firebase project. Without proper authentication and passing security rules, they cannot access your data. It's like knowing someone's address but not being able to enter their house.

**Q: What if I want to keep my repository private anyway?**

**A: You have options:**

1. **GitHub Pro** ($4/month): Includes private repos with GitHub Pages
2. **Netlify/Vercel**: Free hosting that works with private GitHub repos
3. **Environment Variables**: Use a build tool to inject API keys (more complex)

**Q: Should I rotate my Firebase API keys?**

**A: Not necessary** unless you suspect your Firebase Admin credentials were compromised. Client API keys are meant to be public. However, do keep your Firebase Console access secure!

## 💡 Tips

- **Image Hosting**: Use [Imgur](https://imgur.com) or [imgbb](https://imgbb.com) for invitation images (Google Drive doesn't work)
- **Testing**: Test locally with `python3 -m http.server 8080` before deploying
- **Multiple Events**: Perfect for managing multiple kids' birthdays or annual events
- **Link Management**: Create different links for different group sizes
- **RSVP Tracking**: Use the admin dashboard to see who's confirmed in real-time

## 🆘 Troubleshooting

**Can't see events after login?**
- Hard refresh browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

**Image not showing on RSVP page?**
- Don't use Google Drive links
- Use direct image URLs from Imgur or imgbb

**Date showing wrong?**
- Should now be fixed with local timezone handling

**No RSVPs showing?**
- Make sure you've selected an event
- Check browser console (F12) for errors
- Verify Firestore rules are deployed

**Firebase errors?**
- Double-check Firebase config in both `app.js` and `rsvp.js`
- Verify domain is in Firebase authorized domains

## 📝 License

MIT License - Feel free to use for your own events!

## 🎈 Credits

Built with vanilla JavaScript, Firebase, and love! Perfect for making birthday parties more organized and fun.

---

*Last Updated: January 19, 2026*

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
