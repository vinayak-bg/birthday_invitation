// Firebase Configuration
// IMPORTANT: Replace this with your own Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbSpb1G9KVo6CxyWrjzYdH4u5OTahNpVE",
    authDomain: "birthday-invitation-4920b.firebaseapp.com",
    projectId: "birthday-invitation-4920b",
    storageBucket: "birthday-invitation-4920b.firebasestorage.app",
    messagingSenderId: "455710154033",
    appId: "1:455710154033:web:92fee81509f7e916386410"
 
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
const eventFormCard = document.getElementById('event-form-card');
const eventFormTitle = document.getElementById('event-form-title');
const createNewEventBtn = document.getElementById('create-new-event-btn');
const cancelEventBtn = document.getElementById('cancel-event-btn');
const eventsListContainer = document.getElementById('events-list-container');
const eventNameInput = document.getElementById('event-name');
const eventDateInput = document.getElementById('event-date');
const eventTimeInput = document.getElementById('event-time');
const eventVenueInput = document.getElementById('event-venue');
const eventMessageInput = document.getElementById('event-message');
const invitationImageInput = document.getElementById('invitation-image');

// Link Form
const linkForm = document.getElementById('link-form');
const linkFormCard = document.getElementById('link-form-card');
const selectedEventNameEl = document.getElementById('selected-event-name');
const maxGuestsInput = document.getElementById('max-guests');
const generatedLinkDiv = document.getElementById('generated-link');
const linkUrlInput = document.getElementById('link-url');
const copyLinkBtn = document.getElementById('copy-link-btn');

// State
let selectedEventId = null;
let isEditingEvent = false;
let editingEventId = null;

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
            loadEvents();
        } else {
            // User is signed out
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
            landingSection.style.display = 'block';
            adminSection.style.display = 'none';
            selectedEventId = null;
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

// Create New Event Button
createNewEventBtn.addEventListener('click', () => {
    isEditingEvent = false;
    editingEventId = null;
    eventFormTitle.textContent = 'Create New Event';
    eventForm.reset();
    eventFormCard.style.display = 'block';
});

// Cancel Event Button
cancelEventBtn.addEventListener('click', () => {
    eventFormCard.style.display = 'none';
    eventForm.reset();
    isEditingEvent = false;
    editingEventId = null;
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
        time: eventTimeInput.value || null,
        venue: eventVenueInput.value || null,
        message: eventMessageInput.value,
        imageUrl: invitationImageInput.value,
        createdAt: isEditingEvent ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Remove undefined fields
    Object.keys(eventData).forEach(key => eventData[key] === undefined && delete eventData[key]);

    try {
        if (isEditingEvent && editingEventId) {
            // Update existing event
            const eventDocRef = window.firebaseModules.doc(db, 'events', editingEventId);
            await window.firebaseModules.updateDoc(eventDocRef, eventData);
            alert('Event updated successfully!');
        } else {
            // Create new event
            await window.firebaseModules.addDoc(window.firebaseModules.collection(db, 'events'), eventData);
            alert('Event created successfully!');
        }
        
        eventFormCard.style.display = 'none';
        eventForm.reset();
        isEditingEvent = false;
        editingEventId = null;
        loadEvents();
    } catch (error) {
        alert('Error saving event: ' + error.message);
    }
});

// Load All Events
async function loadEvents() {
    if (!currentUser) return;

    try {
        const eventsQuery = window.firebaseModules.query(
            window.firebaseModules.collection(db, 'events'),
            window.firebaseModules.where('userId', '==', currentUser.uid)
        );
        
        const snapshot = await window.firebaseModules.getDocs(eventsQuery);
        
        if (snapshot.empty) {
            eventsListContainer.innerHTML = '<p class="no-data">No events yet. Create your first event!</p>';
            linkFormCard.style.display = 'none';
            return;
        }
        
        const events = [];
        snapshot.forEach(doc => {
            events.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by createdAt in JavaScript - handle missing createdAt with fallback to 0
        events.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });
        
        // Display events
        eventsListContainer.innerHTML = events.map(event => {
            let date = 'Date TBD';
            if (event.date && typeof event.date === 'string' && event.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [year, month, day] = event.date.split('-');
                date = new Date(year, month - 1, day).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                });
            }
            const isSelected = selectedEventId === event.id;
            
            return `
                <div class="event-item ${isSelected ? 'selected' : ''}" data-event-id="${event.id}">
                    <div class="event-info">
                        <h4>${escapeHtml(event.name)}</h4>
                        <p>${date}</p>
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-small btn-secondary select-event-btn" data-event-id="${event.id}">
                            ${isSelected ? '✓ Selected' : 'Select'}
                        </button>
                        <button class="btn btn-small btn-secondary edit-event-btn" data-event-id="${event.id}">Edit</button>
                        <button class="btn btn-small btn-danger delete-event-btn" data-event-id="${event.id}">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Attach event listeners
        document.querySelectorAll('.select-event-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                selectEvent(this.dataset.eventId);
            });
        });
        
        document.querySelectorAll('.edit-event-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                editEvent(this.dataset.eventId, events);
            });
        });
        
        document.querySelectorAll('.delete-event-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                deleteEvent(this.dataset.eventId);
            });
        });
        
    } catch (error) {
        console.error('Error loading events:', error);
        eventsListContainer.innerHTML = '<p class="error-text">Error loading events</p>';
    }
}

// Select Event
function selectEvent(eventId) {
    selectedEventId = eventId;
    loadEvents(); // Refresh to show selection
    
    // Find event name
    const eventItem = document.querySelector(`.event-item[data-event-id="${eventId}"]`);
    const eventName = eventItem?.querySelector('h4')?.textContent || 'Event';
    
    selectedEventNameEl.textContent = `Creating link for: ${eventName}`;
    linkFormCard.style.display = 'block';
    
    // Load invitations for this event
    loadInvitations();
}

// Edit Event
function editEvent(eventId, events) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    isEditingEvent = true;
    editingEventId = eventId;
    eventFormTitle.textContent = 'Edit Event';
    
    eventNameInput.value = event.name || '';
    eventDateInput.value = event.date || '';
    eventTimeInput.value = event.time || '';
    eventVenueInput.value = event.venue || '';
    eventMessageInput.value = event.message || '';
    invitationImageInput.value = event.imageUrl || '';
    
    eventFormCard.style.display = 'block';
}

// Delete Event
async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?\n\nThis will also delete all invitation links for this event.')) {
        return;
    }
    
    try {
        // Delete event
        await window.firebaseModules.deleteDoc(window.firebaseModules.doc(db, 'events', eventId));
        
        // Delete all invitations for this event
        const invitationsQuery = window.firebaseModules.query(
            window.firebaseModules.collection(db, 'invitations'),
            window.firebaseModules.where('eventId', '==', eventId)
        );
        const invitationsSnapshot = await window.firebaseModules.getDocs(invitationsQuery);
        
        const deletePromises = [];
        invitationsSnapshot.forEach(doc => {
            deletePromises.push(window.firebaseModules.deleteDoc(doc.ref));
        });
        await Promise.all(deletePromises);
        
        alert('Event deleted successfully!');
        
        if (selectedEventId === eventId) {
            selectedEventId = null;
            linkFormCard.style.display = 'none';
        }
        
        loadEvents();
    } catch (error) {
        alert('Error deleting event: ' + error.message);
    }
}

// Link Form Submit
linkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Please login first');
        return;
    }
    
    if (!selectedEventId) {
        alert('Please select an event first');
        return;
    }

    // Input validation
    const maxGuests = parseInt(maxGuestsInput.value);
    
    if (isNaN(maxGuests) || maxGuests < 1 || maxGuests > 50) {
        alert('Maximum guests must be between 1 and 50');
        return;
    }

    const linkId = generateLinkId();
    const linkData = {
        userId: currentUser.uid,
        eventId: selectedEventId,
        linkId: linkId,
        maxGuests: maxGuests,
        rsvpSubmitted: false,
        rsvps: [], // Array to store multiple RSVPs per link
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
    if (!currentUser || !selectedEventId) {
        rsvpTbody.innerHTML = '<tr><td colspan="7" class="no-data">Please select an event first</td></tr>';
        totalLinksEl.textContent = '0';
        totalRsvpsEl.textContent = '0';
        totalGuestsEl.textContent = '0';
        return;
    }

    // Unsubscribe from previous listener if exists
    if (invitationsUnsubscribe) {
        invitationsUnsubscribe();
        invitationsUnsubscribe = null;
    }

    try {
        const invitationsQuery = window.firebaseModules.query(
            window.firebaseModules.collection(db, 'invitations'),
            window.firebaseModules.where('eventId', '==', selectedEventId)
        );

        // Set up real-time listener
        invitationsUnsubscribe = window.firebaseModules.onSnapshot(invitationsQuery, (snapshot) => {
                let totalLinks = 0;
                let totalRsvps = 0;
                let totalGuests = 0;
                const invitations = [];

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    invitations.push(data);
                    totalLinks++;
                    
                    // Count RSVPs from the rsvps array
                    const rsvps = data.rsvps || [];
                    totalRsvps += rsvps.length;
                    
                    // Count total confirmed guests
                    rsvps.forEach(rsvp => {
                        if (rsvp.attending) {
                            // Use numGuests if available (new format), otherwise fall back to guestNames.length (old format)
                            const guestCount = rsvp.numGuests || rsvp.guestNames?.length || 0;
                            totalGuests += guestCount;
                        }
                    });
                });
                
                // Sort by createdAt in JavaScript
                invitations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                // Update stats
                totalLinksEl.textContent = totalLinks;
                totalRsvpsEl.textContent = totalRsvps;
                totalGuestsEl.textContent = totalGuests;

                // Update table
                if (invitations.length === 0) {
                    rsvpTbody.innerHTML = '<tr><td colspan="7" class="no-data">No invitation links created yet</td></tr>';
                } else {
                    rsvpTbody.innerHTML = invitations.map(inv => {
                        const rsvps = inv.rsvps || [];
                        const confirmedRsvps = rsvps.filter(r => r.attending);
                        const totalConfirmed = confirmedRsvps.reduce((sum, r) => sum + (r.guestNames?.length || 0), 0);
                        
                        const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
                        const invitationUrl = `${baseUrl}rsvp.html?id=${escapeHtml(inv.linkId)}`;
                        
                        // Sanitize data
                        const safeLinkId = escapeHtml(inv.linkId);
                        const shortLinkId = inv.linkId.substring(0, 8) + '...';
                        
                        // Build response details with family/group names
                        let responseDetails = '-';
                        if (rsvps.length > 0) {
                            responseDetails = rsvps.map(r => {
                                const familyName = r.familyName || 'Unknown';
                                // Use numGuests if available (new format), otherwise fall back to guestNames.length (old format)
                                const guestCount = r.numGuests !== undefined ? r.numGuests : (r.guestNames?.length || 0);
                                const status = r.attending ? '✓' : '✗';
                                const guestInfo = guestCount > 0 ? ` (${guestCount} guest${guestCount > 1 ? 's' : ''})` : '';
                                return `${status} <strong>${escapeHtml(familyName)}</strong>${guestInfo}`;
                            }).join('<br>');
                        }
                        
                        return `
                            <tr>
                                <td><code>${escapeHtml(shortLinkId)}</code></td>
                                <td>${inv.maxGuests}</td>
                                <td>${rsvps.length}</td>
                                <td>${totalConfirmed}</td>
                                <td style="max-width: 200px;">${responseDetails}</td>
                                <td><span class="link-cell" data-url="${escapeHtml(invitationUrl)}">Copy Link</span></td>
                                <td>
                                    <button class="btn btn-danger btn-small delete-btn" data-link-id="${safeLinkId}">Delete</button>
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
                                deleteInvitation(linkId);
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
async function deleteInvitation(linkId) {
    // Confirm deletion
    const confirmDelete = confirm(`Are you sure you want to delete this invitation link (${linkId.substring(0, 8)}...)?\n\nThis action cannot be undone.`);
    
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
        alert('Invitation link has been deleted successfully.');
    } catch (error) {
        console.error('Error deleting invitation:', error);
        alert('Error deleting invitation: ' + error.message);
    }
}

// Make functions globally accessible
window.copyToClipboard = copyToClipboard;
window.deleteInvitation = deleteInvitation;
