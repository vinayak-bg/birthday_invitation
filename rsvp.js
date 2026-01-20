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
// Parse markdown for links and newlines only (secure, limited markdown)
function parseMarkdown(text) {
    if (!text) return '';
    
    // First escape HTML to prevent XSS
    let safe = escapeHtml(text);
    
    // Convert markdown links [text](url) to HTML links
    // This is safe because we've already escaped HTML
    safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
        // Basic URL validation - must start with http:// or https://
        if (url.match(/^https?:\/\/.+/)) {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
        }
        // If URL is invalid, return the original text
        return match;
    });
    
    // Convert newlines to <br>
    safe = safe.replace(/\n/g, '<br>');
    
    return safe;
}
// Generate .ics calendar file for download
function generateCalendarFile(eventData) {
    if (!eventData || !eventData.date) {
        alert('Event date is not available for calendar download.');
        return;
    }

    // Parse the date (YYYY-MM-DD format)
    const [year, month, day] = eventData.date.split('-');
    
    // Get time from eventData or use default 6:00 PM (backwards compatible)
    let startHour = 18, startMinute = 0;
    if (eventData.time) {
        try {
            const [hours, minutes] = eventData.time.split(':');
            startHour = parseInt(hours);
            startMinute = parseInt(minutes);
        } catch (error) {
            console.error('Error parsing event time:', error);
        }
    }
    
    // Get end time or calculate as start + 5 hours (backwards compatible)
    let endHour = startHour + 5, endMinute = startMinute;
    if (eventData.endTime) {
        try {
            const [hours, minutes] = eventData.endTime.split(':');
            endHour = parseInt(hours);
            endMinute = parseInt(minutes);
        } catch (error) {
            console.error('Error parsing event end time:', error);
        }
    }
    
    // Create date for calendar (use actual time or default to 6:00 PM)
    const eventDate = new Date(year, month - 1, day, startHour, startMinute, 0);
    const eventEndDate = new Date(year, month - 1, day, endHour, endMinute, 0);
    
    // Format dates for iCalendar format (yyyyMMddTHHmmss)
    const formatICSDate = (date) => {
        const pad = (num) => String(num).padStart(2, '0');
        return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
    };
    
    const dtStart = formatICSDate(eventDate);
    const dtEnd = formatICSDate(eventEndDate);
    const dtStamp = formatICSDate(new Date());
    
    // Clean and format description
    const eventName = eventData.name || 'Birthday Celebration';
    const description = eventData.message ? eventData.message.replace(/\n/g, '\\n') : "You're invited to celebrate!";
    const location = eventData.venue ? eventData.venue.replace(/\n/g, '\\n') : '';
    
    // Generate unique ID for the event
    const uid = `${dtStamp}-${Math.random().toString(36).substring(2, 9)}@birthday-invitation`;
    
    // Create .ics file content
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Birthday Invitation//NONSGML Event Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${eventName}`,
        `DESCRIPTION:${description}`,
        location ? `LOCATION:${location}` : null,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'BEGIN:VALARM',
        'TRIGGER:-PT24H',
        'ACTION:DISPLAY',
        'DESCRIPTION:Reminder: Birthday celebration tomorrow!',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ].filter(line => line !== null).join('\r\n');
    
    // Create blob and download
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${eventName.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}
// Get invitation ID from URL - must be declared early
const urlParams = new URLSearchParams(window.location.search);
const invitationId = urlParams.get('id');

// Function to initialize Firebase
function initializeFirebase() {
    if (!window.firebaseModules) {
        console.error('Firebase modules not loaded');
        showInvalid();
        return false;
    }

    try {
        app = window.firebaseModules.initializeApp(firebaseConfig);
        db = window.firebaseModules.getFirestore(app);
        
        // Start loading invitation
        if (invitationId) {
            setTimeout(() => loadInvitation(), 100); // Small delay to ensure DB is ready
        } else {
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
const eventTimeEl = document.getElementById('event-time');
const eventTimeContainer = document.getElementById('event-time-container');
const eventVenueEl = document.getElementById('event-venue');
const eventVenueContainer = document.getElementById('event-venue-container');
const eventMessageEl = document.getElementById('event-message');
const invitationImageContainer = document.getElementById('invitation-image-container');
const invitationImage = document.getElementById('invitation-image');

// RSVP Form
const rsvpForm = document.getElementById('rsvp-form');
const rsvpStatusSection = document.getElementById('rsvp-status-section');
const rsvpFormSection = document.getElementById('rsvp-form-section');
const guestDetailsSection = document.getElementById('guest-details-section');
const familyNameInput = document.getElementById('family-name');
const numGuestsSelect = document.getElementById('num-guests');
const maxGuestsNote = document.getElementById('max-guests-note');
const guestNamesContainer = document.getElementById('guest-names-container');
const confirmedGuestsDiv = document.getElementById('confirmed-guests');
const successMessage = document.getElementById('success-message');

let invitationData = null;
let eventData = null;

// Note: invitationId is declared at the top of the file, loadInvitation will be called after Firebase initializes

async function loadInvitation() {
    try {
        // Load invitation data
        const invitationDocRef = window.firebaseModules.doc(db, 'invitations', invitationId);
        const invitationDoc = await window.firebaseModules.getDoc(invitationDocRef);
        
        if (!invitationDoc.exists) {
            showInvalid();
            return;
        }

        invitationData = invitationDoc.data();
        
        // Load event data using eventId from invitation
        if (!invitationData.eventId) {
            showInvalid();
            return;
        }
        
        const eventDocRef = window.firebaseModules.doc(db, 'events', invitationData.eventId);
        const eventDoc = await window.firebaseModules.getDoc(eventDocRef);
        
        if (eventDoc.exists) {
            eventData = eventDoc.data();
        } else {
            showInvalid();
            return;
        }

        // Display invitation
        displayInvitation();
        
    } catch (error) {
        console.error('Error in loadInvitation:', error);
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
        
        if (eventData.date && typeof eventData.date === 'string' && eventData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Parse date as local date to avoid timezone issues
            // eventData.date is in format "YYYY-MM-DD"
            try {
                const [year, month, day] = eventData.date.split('-');
                const date = new Date(year, month - 1, day); // month is 0-indexed
                eventDateEl.textContent = date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            } catch (error) {
                console.error('Error parsing date:', error);
                eventDateEl.textContent = 'Date to be announced';
            }
        } else {
            eventDateEl.textContent = 'Date to be announced';
        }
        
        // Display time if available (backwards compatible)
        if (eventData.time) {
            try {
                // Parse start time (HH:MM format)
                const [hours, minutes] = eventData.time.split(':');
                const startTime = new Date();
                startTime.setHours(parseInt(hours), parseInt(minutes));
                
                let timeText = startTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                });
                
                // Add end time if available
                if (eventData.endTime) {
                    const [endHours, endMinutes] = eventData.endTime.split(':');
                    const endTime = new Date();
                    endTime.setHours(parseInt(endHours), parseInt(endMinutes));
                    timeText += ' - ' + endTime.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                    });
                }
                
                eventTimeEl.textContent = timeText;
                eventTimeContainer.style.display = 'flex';
            } catch (error) {
                console.error('Error parsing time:', error);
            }
        }
        
        // Display venue if available (backwards compatible)
        if (eventData.venue) {
            eventVenueEl.textContent = escapeHtml(eventData.venue);
            eventVenueContainer.style.display = 'flex';
        }
        
        if (eventData.message) {
            // Parse markdown (links and newlines) with XSS protection
            const formattedMessage = parseMarkdown(eventData.message);
            eventMessageEl.innerHTML = formattedMessage;
        }
        
        if (eventData.imageUrl) {
            invitationImage.src = eventData.imageUrl;
            invitationImageContainer.style.display = 'block';
        }
    }

    // Set up calendar download button
    const downloadCalendarBtn = document.getElementById('download-calendar-btn');
    if (downloadCalendarBtn && eventData) {
        downloadCalendarBtn.addEventListener('click', () => {
            generateCalendarFile(eventData);
        });
    }
    
    // Always show RSVP form (multiple people can RSVP with same link)
    setupRsvpForm();
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
                numGuestsSelect.setAttribute('required', 'required');
            } else {
                guestDetailsSection.style.display = 'none';
                numGuestsSelect.removeAttribute('required');
                numGuestsSelect.value = ''; // Clear selection
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
            <label for="guest-name-${i}">Guest ${i} Name (optional)</label>
            <input type="text" id="guest-name-${i}" placeholder="Full name">
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
    
    // Validate family name (required for both attending and declining)
    const familyName = familyNameInput.value.trim();
    if (!familyName || familyName.length < 1 || familyName.length > 100) {
        alert('Family/Group name must be between 1 and 100 characters');
        return;
    }
    
    let guestNames = [];
    let additionalNotes = '';

    if (attending === 'yes') {
        const numGuests = parseInt(numGuestsSelect.value);
        
        if (!numGuests) {
            alert('Please select the number of guests');
            return;
        }

        // Collect guest names (optional)
        for (let i = 1; i <= numGuests; i++) {
            const guestNameInput = document.getElementById(`guest-name-${i}`);
            const guestName = guestNameInput ? guestNameInput.value.trim() : '';
            
            // Guest names are optional, but if provided, validate length
            if (guestName) {
                if (guestName.length > 100) {
                    alert(`Guest ${i} name must be less than 100 characters`);
                    return;
                }
                guestNames.push(guestName);
            }
        }

        additionalNotes = document.getElementById('additional-notes').value.trim();
        
        // Validate additional notes length
        if (additionalNotes.length > 500) {
            alert('Additional notes must be less than 500 characters');
            return;
        }
    }

    // Create RSVP entry
    const rsvpEntry = {
        familyName: familyName || 'Declined',
        attending: attending === 'yes',
        numGuests: attending === 'yes' ? parseInt(numGuestsSelect.value) : 0,
        guestNames: guestNames,
        additionalNotes: additionalNotes,
        rsvpDate: new Date().toISOString()
    };

    // Append to rsvps array in the invitation document using arrayUnion to prevent race conditions
    try {
        const invitationDocRef = window.firebaseModules.doc(db, 'invitations', invitationId);
        
        // Use arrayUnion to safely append without race conditions
        await window.firebaseModules.updateDoc(invitationDocRef, {
            rsvps: window.firebaseModules.arrayUnion(rsvpEntry),
            rsvpSubmitted: true // Keep for backwards compatibility
        });

        // Show success message
        rsvpSection.style.display = 'none';
        successSection.style.display = 'block';
        
        if (guestNames.length > 0) {
            // Escape familyName for XSS protection (defense in depth)
            successMessage.textContent = `We're excited to celebrate with ${escapeHtml(familyName)}!`;
        } else {
            successMessage.textContent = 'Thank you for letting us know. We\'ll miss you!';
        }

    } catch (error) {
        alert('Error submitting RSVP: ' + error.message);
        console.error('Error:', error);
    }
});
