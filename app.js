// Firebase Configuration
// IMPORTANT: Replace this with your own Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app, auth, db;
let currentUser = null;

// Security: HTML sanitization helper to prevent XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Function to initialize Firebase
function initializeFirebase() {
    if (!window.firebaseModules) {
        console.error('Firebase modules not loaded');
        alert('Firebase modules failed to load. Please refresh the page.');
        return false;
    }

    try {
        app = window.firebaseModules.initializeApp(firebaseConfig);
        auth = window.firebaseModules.getAuth(app);
        db = window.firebaseModules.getFirestore(app);
        console.log('Firebase initialized successfully');
        
        // Set up auth state observer
        setupAuthObserver();
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        alert('Firebase initialization failed: ' + error.message);
        return false;
    }
}

// Wait for Firebase modules to load
if (window.firebaseModules) {
    initializeFirebase();
} else {
    window.addEventListener('firebaseReady', () => {
        initializeFirebase();
    });
}

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginModal = document.getElementById('login-modal');
const closeModal = document.querySelector('.close');
const loginForm = document.getElementById('login-form');
const landingSection = document.getElementById('landing-section');
const adminSection = document.getElementById('admin-section');
const getStartedBtn = document.getElementById('get-started-btn');

// Event Form
const eventForm = document.getElementById('event-form');
const eventNameInput = document.getElementById('event-name');
const eventDateInput = document.getElementById('event-date');
const eventMessageInput = document.getElementById('event-message');
const invitationImageInput = document.getElementById('invitation-image');

// Link Form
const linkForm = document.getElementById('link-form');
const recipientNameInput = document.getElementById('recipient-name');
const maxGuestsInput = document.getElementById('max-guests');
const generatedLinkDiv = document.getElementById('generated-link');
const linkUrlInput = document.getElementById('link-url');
const copyLinkBtn = document.getElementById('copy-link-btn');

// Stats
const totalLinksEl = document.getElementById('total-links');
const totalRsvpsEl = document.getElementById('total-rsvps');
const totalGuestsEl = document.getElementById('total-guests');
const rsvpTbody = document.getElementById('rsvp-tbody');

// Modal Controls
loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
});

getStartedBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

// Auth State Observer
function setupAuthObserver() {
    if (!auth) return;
    
    window.firebaseModules.onAuthStateChanged(auth, (user) => {
        currentUser = user;
        if (user) {
            // User is signed in
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            landingSection.style.display = 'none';
            adminSection.style.display = 'block';
            loginModal.style.display = 'none';
            loadEventData();
            loadInvitations();
        } else {
            // User is signed out
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
            landingSection.style.display = 'block';
            adminSection.style.display = 'none';
        }
    });
}

// Login Form Submit
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!auth) {
        alert('Firebase authentication not initialized. Please refresh the page.');
        return;
    }

    try {
        // Try to sign in first
        await window.firebaseModules.signInWithEmailAndPassword(auth, email, password);
        alert('Login successful!');
    } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            // If user doesn't exist, create new account
            try {
                await window.firebaseModules.createUserWithEmailAndPassword(auth, email, password);
                alert('Account created successfully!');
            } catch (createError) {
                console.error('Create account error:', createError);
                alert('Error creating account: ' + createError.message);
            }
        } else {
            console.error('Login error:', error);
            alert('Login error: ' + error.message);
        }
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await window.firebaseModules.signOut(auth);
    } catch (error) {
        alert('Error signing out: ' + error.message);
    }
});

// Event Form Submit
eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Please login first');
        return;
    }

    const eventData = {
        userId: currentUser.uid,
        name: eventNameInput.value,
        date: eventDateInput.value,
        message: eventMessageInput.value,
        imageUrl: invitationImageInput.value,
        updatedAt: new Date().toISOString()
    };

    try {
        const eventDocRef = window.firebaseModules.doc(db, 'events', currentUser.uid);
        await window.firebaseModules.setDoc(eventDocRef, eventData);
        alert('Event details saved successfully!');
    } catch (error) {
        alert('Error saving event: ' + error.message);
    }
});

// Load Event Data
async function loadEventData() {
    if (!currentUser) return;

    try {
        const eventDocRef = window.firebaseModules.doc(db, 'events', currentUser.uid);
        const eventDoc = await window.firebaseModules.getDoc(eventDocRef);
        
        if (eventDoc.exists()) {
            const data = eventDoc.data();
            eventNameInput.value = data.name || '';
            eventDateInput.value = data.date || '';
            eventMessageInput.value = data.message || '';
            invitationImageInput.value = data.imageUrl || '';
        }
    } catch (error) {
        console.error('Error loading event data:', error);
    }
}

// Link Form Submit
linkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Please login first');
        return;
    }

    // Input validation
    const recipientName = recipientNameInput.value.trim();
    const maxGuests = parseInt(maxGuestsInput.value);
    
    if (!recipientName || recipientName.length < 1 || recipientName.length > 100) {
        alert('Recipient name must be between 1 and 100 characters');
        return;
    }
    
    if (isNaN(maxGuests) || maxGuests < 1 || maxGuests > 50) {
        alert('Maximum guests must be between 1 and 50');
        return;
    }

    const linkId = generateLinkId();
    const linkData = {
        userId: currentUser.uid,
        linkId: linkId,
        recipientName: recipientName,
        maxGuests: maxGuests,
        status: 'pending',
        rsvpSubmitted: false,
        guestNames: [],
        additionalNotes: '',
        createdAt: new Date().toISOString()
    };

    try {
        const invitationDocRef = window.firebaseModules.doc(db, 'invitations', linkId);
        await window.firebaseModules.setDoc(invitationDocRef, linkData);
        
        // Generate and display the link
        const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
        const invitationUrl = `${baseUrl}rsvp.html?id=${linkId}`;
        
        linkUrlInput.value = invitationUrl;
        generatedLinkDiv.style.display = 'block';
        
        // Reset form
        linkForm.reset();
        
        // Reload invitations
        loadInvitations();
    } catch (error) {
        alert('Error creating invitation link: ' + error.message);
    }
});

// Copy Link Button
copyLinkBtn.addEventListener('click', () => {
    linkUrlInput.select();
    document.execCommand('copy');
    copyLinkBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyLinkBtn.textContent = 'Copy';
    }, 2000);
});

// Generate Random Link ID
function generateLinkId() {
    return 'inv_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Load Invitations
let invitationsUnsubscribe = null;

async function loadInvitations() {
    if (!currentUser) return;

    try {
        const invitationsQuery = window.firebaseModules.query(
            window.firebaseModules.collection(db, 'invitations'),
            window.firebaseModules.where('userId', '==', currentUser.uid),
            window.firebaseModules.orderBy('createdAt', 'desc')
        );

        // Set up real-time listener only once
        if (!invitationsUnsubscribe) {
            invitationsUnsubscribe = window.firebaseModules.onSnapshot(invitationsQuery, (snapshot) => {
                let totalLinks = 0;
                let totalRsvps = 0;
                let totalGuests = 0;
                const invitations = [];

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    invitations.push(data);
                    totalLinks++;
                    if (data.rsvpSubmitted) {
                        totalRsvps++;
                        totalGuests += data.guestNames.length;
                    }
                });

                // Update stats
                totalLinksEl.textContent = totalLinks;
                totalRsvpsEl.textContent = totalRsvps;
                totalGuestsEl.textContent = totalGuests;

                // Update table
                if (invitations.length === 0) {
                    rsvpTbody.innerHTML = '<tr><td colspan="7" class="no-data">No invitation links created yet</td></tr>';
                } else {
                    rsvpTbody.innerHTML = invitations.map(inv => {
                        const statusClass = inv.rsvpSubmitted ? 
                            (inv.guestNames.length > 0 ? 'status-confirmed' : 'status-declined') : 
                            'status-pending';
                        const statusText = inv.rsvpSubmitted ? 
                            (inv.guestNames.length > 0 ? 'Confirmed' : 'Declined') : 
                            'Pending';
                        
                        const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
                        const invitationUrl = `${baseUrl}rsvp.html?id=${escapeHtml(inv.linkId)}`;
                        
                        // Sanitize all user-provided data to prevent XSS
                        const safeRecipientName = escapeHtml(inv.recipientName);
                        const safeGuestNames = inv.guestNames.map(name => escapeHtml(name)).join(', ') || '-';
                        const safeLinkId = escapeHtml(inv.linkId);
                        
                        return `
                            <tr>
                                <td>${safeRecipientName}</td>
                                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                                <td>${inv.guestNames.length}</td>
                                <td>${safeGuestNames}</td>
                                <td>${inv.maxGuests}</td>
                                <td><span class="link-cell" data-url="${escapeHtml(invitationUrl)}">Copy Link</span></td>
                                <td>
                                    <button class="btn btn-danger btn-small delete-btn" data-link-id="${safeLinkId}" data-recipient-name="${safeRecipientName}">Delete</button>
                                </td>
                            </tr>
                        `;
                    }).join('');
                    
                    // Attach event listeners to delete buttons and copy link cells
                    // Using setTimeout to ensure DOM is ready
                    setTimeout(() => {
                        document.querySelectorAll('.delete-btn').forEach(btn => {
                            btn.addEventListener('click', function() {
                                const linkId = this.dataset.linkId;
                                const recipientName = this.dataset.recipientName;
                                deleteInvitation(linkId, recipientName);
                            });
                        });
                        
                        document.querySelectorAll('.link-cell').forEach(cell => {
                            cell.addEventListener('click', function() {
                                const url = this.dataset.url;
                                copyToClipboard(url);
                            });
                        });
                    }, 0);
                }
            });
        }

    } catch (error) {
        console.error('Error loading invitations:', error);
    }
}

// Copy to Clipboard Helper
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Link copied to clipboard!');
}

// Delete Invitation
async function deleteInvitation(linkId, recipientName) {
    // Confirm deletion
    const confirmDelete = confirm(`Are you sure you want to delete the invitation for "${recipientName}"?\n\nThis action cannot be undone.`);
    
    if (!confirmDelete) {
        return;
    }

    if (!currentUser) {
        alert('You must be logged in to delete invitations');
        return;
    }

    try {
        const invitationDocRef = window.firebaseModules.doc(db, 'invitations', linkId);
        await window.firebaseModules.deleteDoc(invitationDocRef);
        
        // Success message
        alert(`Invitation for "${recipientName}" has been deleted successfully.`);
    } catch (error) {
        console.error('Error deleting invitation:', error);
        alert('Error deleting invitation: ' + error.message);
    }
}

// Make functions globally accessible
window.copyToClipboard = copyToClipboard;
window.deleteInvitation = deleteInvitation;
