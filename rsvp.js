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
let app, db;

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

// Get invitation ID from URL - must be declared early
const urlParams = new URLSearchParams(window.location.search);
const invitationId = urlParams.get('id');

// Function to initialize Firebase
function initializeFirebase() {
    console.log('Initializing Firebase...');
    console.log('Firebase modules available:', !!window.firebaseModules);
    console.log('Invitation ID:', invitationId);
    
    if (!window.firebaseModules) {
        console.error('Firebase modules not loaded');
        showInvalid();
        return false;
    }

    try {
        app = window.firebaseModules.initializeApp(firebaseConfig);
        db = window.firebaseModules.getFirestore(app);
        console.log('Firebase initialized successfully', { app, db });
        
        // Start loading invitation
        if (invitationId) {
            console.log('Starting to load invitation...');
            setTimeout(() => loadInvitation(), 100); // Small delay to ensure DB is ready
        } else {
            console.error('No invitation ID in URL');
            showInvalid();
        }
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        alert('Firebase Error: ' + error.message);
        showInvalid();
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
const loadingSection = document.getElementById('loading-section');
const invalidSection = document.getElementById('invalid-section');
const rsvpSection = document.getElementById('rsvp-section');
const successSection = document.getElementById('success-section');

// Event Details
const eventNameEl = document.getElementById('event-name');
const eventDateEl = document.getElementById('event-date');
const recipientNameEl = document.getElementById('recipient-name');
const eventMessageEl = document.getElementById('event-message');
const invitationImageContainer = document.getElementById('invitation-image-container');
const invitationImage = document.getElementById('invitation-image');

// RSVP Form
const rsvpForm = document.getElementById('rsvp-form');
const rsvpStatusSection = document.getElementById('rsvp-status-section');
const rsvpFormSection = document.getElementById('rsvp-form-section');
const guestDetailsSection = document.getElementById('guest-details-section');
const numGuestsSelect = document.getElementById('num-guests');
const maxGuestsNote = document.getElementById('max-guests-note');
const guestNamesContainer = document.getElementById('guest-names-container');
const confirmedGuestsDiv = document.getElementById('confirmed-guests');
const successMessage = document.getElementById('success-message');

let invitationData = null;
let eventData = null;

// Note: invitationId is declared at the top of the file, loadInvitation will be called after Firebase initializes

async function loadInvitation() {
    console.log('=== Starting loadInvitation ===');
    console.log('DB object:', db);
    console.log('Invitation ID:', invitationId);
    console.log('Firebase modules:', window.firebaseModules);
    
    try {
        // Load invitation data
        console.log('Creating doc reference...');
        const invitationDocRef = window.firebaseModules.doc(db, 'invitations', invitationId);
        console.log('Doc reference created:', invitationDocRef);
        
        console.log('Fetching document...');
        const invitationDoc = await window.firebaseModules.getDoc(invitationDocRef);
        console.log('Document fetched. Exists:', invitationDoc.exists);
        
        if (!invitationDoc.exists) {
            console.error('Invitation document does not exist');
            showInvalid();
            return;
        }

        invitationData = invitationDoc.data();
        console.log('Invitation data loaded:', invitationData);
        
        // Load event data
        console.log('Loading event data for userId:', invitationData.userId);
        const eventDocRef = window.firebaseModules.doc(db, 'events', invitationData.userId);
        const eventDoc = await window.firebaseModules.getDoc(eventDocRef);
        
        if (eventDoc.exists) {
            eventData = eventDoc.data();
            console.log('Event data loaded:', eventData);
        } else {
            console.log('No event data found');
        }

        // Display invitation
        console.log('Displaying invitation...');
        displayInvitation();
        
    } catch (error) {
        console.error('Error in loadInvitation:', error);
        console.error('Error details:', error.message, error.code);
        alert('Error loading invitation: ' + error.message);
        showInvalid();
    }
}

function displayInvitation() {
    loadingSection.style.display = 'none';
    rsvpSection.style.display = 'block';

    // Set event details
    if (eventData) {
        eventNameEl.textContent = eventData.name || 'Birthday Celebration';
        
        if (eventData.date) {
            const date = new Date(eventData.date);
            eventDateEl.textContent = date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
        
        if (eventData.message) {
            eventMessageEl.textContent = eventData.message;
        }
        
        if (eventData.imageUrl) {
            invitationImage.src = eventData.imageUrl;
            invitationImageContainer.style.display = 'block';
        }
    }

    recipientNameEl.textContent = invitationData.recipientName;

    // Check if already RSVP'd
    if (invitationData.rsvpSubmitted) {
        showRsvpStatus();
    } else {
        setupRsvpForm();
    }
}

function showRsvpStatus() {
    rsvpFormSection.style.display = 'none';
    rsvpStatusSection.style.display = 'block';

    if (invitationData.guestNames.length > 0) {
        // Sanitize all user input to prevent XSS attacks
        const safeGuestNames = invitationData.guestNames.map(name => `<li>✓ ${escapeHtml(name)}</li>`).join('');
        const safeNotes = invitationData.additionalNotes ? `<p><strong>Notes:</strong> ${escapeHtml(invitationData.additionalNotes)}</p>` : '';
        
        confirmedGuestsDiv.innerHTML = `
            <p><strong>Confirmed Guests:</strong></p>
            <ul style="list-style: none; padding: 0;">
                ${safeGuestNames}
            </ul>
            ${safeNotes}
        `;
    } else {
        confirmedGuestsDiv.innerHTML = '<p>You\'ve indicated that you cannot attend.</p>';
    }
}

function setupRsvpForm() {
    rsvpFormSection.style.display = 'block';
    rsvpStatusSection.style.display = 'none';

    // Set up guest number dropdown
    numGuestsSelect.innerHTML = '<option value="">Select number of guests</option>';
    for (let i = 1; i <= invitationData.maxGuests; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i === 1 ? '1 guest' : `${i} guests`;
        numGuestsSelect.appendChild(option);
    }
    
    maxGuestsNote.textContent = `Maximum ${invitationData.maxGuests} guest${invitationData.maxGuests > 1 ? 's' : ''} allowed`;

    // Radio button change listener
    const radioButtons = document.querySelectorAll('input[name="attending"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'yes') {
                guestDetailsSection.style.display = 'block';
            } else {
                guestDetailsSection.style.display = 'none';
            }
        });
    });

    // Number of guests change listener
    numGuestsSelect.addEventListener('change', (e) => {
        const numGuests = parseInt(e.target.value);
        updateGuestNameInputs(numGuests);
    });
}

function updateGuestNameInputs(numGuests) {
    guestNamesContainer.innerHTML = '';
    
    for (let i = 1; i <= numGuests; i++) {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        formGroup.innerHTML = `
            <label for="guest-name-${i}">Guest ${i} Name</label>
            <input type="text" id="guest-name-${i}" placeholder="Full name" required>
        `;
        guestNamesContainer.appendChild(formGroup);
    }
}

function showInvalid() {
    loadingSection.style.display = 'none';
    invalidSection.style.display = 'block';
}

// RSVP Form Submit
rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const attending = document.querySelector('input[name="attending"]:checked').value;
    
<<<<<<< Updated upstream
=======
    // Validate family name (required for both attending and declining)
    const familyName = familyNameInput.value.trim();
    if (!familyName || familyName.length < 1 || familyName.length > 100) {
        alert('Family/Group name must be between 1 and 100 characters');
        return;
    }
    
>>>>>>> Stashed changes
    let guestNames = [];
    let additionalNotes = '';

    if (attending === 'yes') {
<<<<<<< Updated upstream
=======
        
>>>>>>> Stashed changes
        const numGuests = parseInt(numGuestsSelect.value);
        
        if (!numGuests) {
            alert('Please select the number of guests');
            return;
        }

        // Collect and validate guest names
        for (let i = 1; i <= numGuests; i++) {
            const guestNameInput = document.getElementById(`guest-name-${i}`);
            const guestName = guestNameInput ? guestNameInput.value.trim() : '';
            
            // Validate guest name length
            if (!guestName || guestName.length < 1 || guestName.length > 100) {
                alert(`Guest ${i} name must be between 1 and 100 characters`);
                return;
            }
            
            guestNames.push(guestName);
        }

        if (guestNames.length !== numGuests) {
            alert('Please enter all guest names');
            return;
        }

        additionalNotes = document.getElementById('additional-notes').value.trim();
        
        // Validate additional notes length
        if (additionalNotes.length > 500) {
            alert('Additional notes must be less than 500 characters');
            return;
        }
    }

    // Update invitation in database
    try {
        const invitationDocRef = window.firebaseModules.doc(db, 'invitations', invitationId);
        await window.firebaseModules.updateDoc(invitationDocRef, {
            rsvpSubmitted: true,
            guestNames: guestNames,
            additionalNotes: additionalNotes,
            status: guestNames.length > 0 ? 'confirmed' : 'declined',
            rsvpDate: new Date().toISOString()
        });

        // Show success message
        rsvpSection.style.display = 'none';
        successSection.style.display = 'block';
        
        if (guestNames.length > 0) {
            successMessage.textContent = `We're excited to celebrate with you, ${guestNames.join(' and ')}!`;
        } else {
            successMessage.textContent = 'Thank you for letting us know. We\'ll miss you!';
        }

    } catch (error) {
        alert('Error submitting RSVP: ' + error.message);
        console.error('Error:', error);
    }
});
