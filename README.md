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

## 🚀 Quick Setup Guide

### Step 1: Fork This Repository

1. Click the **"Fork"** button at the top right
2. **Make your fork PRIVATE** to keep Firebase credentials secure
3. Clone to your computer or edit directly on GitHub

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

1. Go to your GitHub repository **Settings**
2. Click **Pages** (left sidebar)
3. Under **Source**, select **"Deploy from a branch"**
4. Choose **main** branch and **/ (root)**
5. Click **"Save"**
6. Wait 2-3 minutes for deployment
7. Your site URL: `https://YOUR-USERNAME.github.io/birthday_invitation/`

**Important:** Add your GitHub Pages URL to Firebase authorized domains:
- Firebase Console → Authentication → Settings → Authorized domains → Add domain

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
- ✅ Firestore security rules
- ✅ Authentication required for admin actions
- ✅ Event listeners (no inline onclick)
- ✅ Private fork recommended for credentials

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
