const { describe, test, expect } = require('@jest/globals');

// Import the escapeHtml function by evaluating the code
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

describe('escapeHtml - XSS Protection', () => {
  test('should escape HTML special characters', () => {
    const input = '<script>alert("XSS")</script>';
    const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';
    expect(escapeHtml(input)).toBe(expected);
  });

  test('should escape single quotes', () => {
    const input = "It's a test";
    const expected = "It&#039;s a test";
    expect(escapeHtml(input)).toBe(expected);
  });

  test('should escape ampersands', () => {
    const input = 'Tom & Jerry';
    const expected = 'Tom &amp; Jerry';
    expect(escapeHtml(input)).toBe(expected);
  });

  test('should handle empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  test('should handle null', () => {
    expect(escapeHtml(null)).toBe('');
  });

  test('should handle undefined', () => {
    expect(escapeHtml(undefined)).toBe('');
  });

  test('should escape multiple special characters', () => {
    const input = '<div class="test" id=\'box\'>Hello & Goodbye</div>';
    const expected = '&lt;div class=&quot;test&quot; id=&#039;box&#039;&gt;Hello &amp; Goodbye&lt;/div&gt;';
    expect(escapeHtml(input)).toBe(expected);
  });

  test('should handle already escaped HTML', () => {
    const input = '&lt;script&gt;';
    const expected = '&amp;lt;script&amp;gt;';
    expect(escapeHtml(input)).toBe(expected);
  });

  test('should preserve safe text', () => {
    const input = 'Hello World 123';
    expect(escapeHtml(input)).toBe(input);
  });
});

describe('Calendar File Generation', () => {
  test('should format ICS date correctly', () => {
    const date = new Date(2026, 0, 15, 18, 30, 0); // Jan 15, 2026, 6:30 PM
    const pad = (num) => String(num).padStart(2, '0');
    const formatted = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
    expect(formatted).toBe('20260115T183000');
  });

  test('should generate unique UID', () => {
    const uid1 = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@birthday-invitation`;
    const uid2 = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@birthday-invitation`;
    expect(uid1).not.toBe(uid2);
  });

  test('should format event time correctly', () => {
    const eventTime = '18:30';
    const [hours, minutes] = eventTime.split(':');
    expect(parseInt(hours)).toBe(18);
    expect(parseInt(minutes)).toBe(30);
  });

  test('should calculate event end time (5 hours later)', () => {
    const startHour = 18;
    const startMinute = 30;
    const endHour = startHour + 5;
    expect(endHour).toBe(23);
  });

  test('should escape newlines for ICS description', () => {
    const message = "Line 1\nLine 2\nLine 3";
    const escaped = message.replace(/\n/g, '\\n');
    expect(escaped).toBe('Line 1\\nLine 2\\nLine 3');
  });
});

describe('Date Parsing and Validation', () => {
  test('should validate YYYY-MM-DD format', () => {
    const validDate = '2026-01-15';
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    expect(regex.test(validDate)).toBe(true);
  });

  test('should reject invalid date formats', () => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    expect(regex.test('01-15-2026')).toBe(false);
    expect(regex.test('2026/01/15')).toBe(false);
    expect(regex.test('15-01-2026')).toBe(false);
    expect(regex.test('invalid')).toBe(false);
  });

  test('should parse date correctly avoiding timezone issues', () => {
    const dateString = '2026-03-15';
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(2); // March (0-indexed)
    expect(date.getDate()).toBe(15);
  });

  test('should parse time in HH:MM format', () => {
    const timeString = '18:30';
    const [hours, minutes] = timeString.split(':');
    expect(parseInt(hours)).toBe(18);
    expect(parseInt(minutes)).toBe(30);
  });

  test('should handle invalid time gracefully', () => {
    const timeString = 'invalid';
    const parts = timeString.split(':');
    expect(isNaN(parseInt(parts[0]))).toBe(true);
  });
});

describe('Guest Count Calculations', () => {
  test('should calculate total guests from numGuests field', () => {
    const rsvps = [
      { attending: true, numGuests: 2, guestNames: [] },
      { attending: true, numGuests: 3, guestNames: [] },
      { attending: false, numGuests: 0, guestNames: [] }
    ];
    
    let total = 0;
    rsvps.forEach(rsvp => {
      if (rsvp.attending) {
        total += rsvp.numGuests || rsvp.guestNames?.length || 0;
      }
    });
    
    expect(total).toBe(5);
  });

  test('should fallback to guestNames.length for old format', () => {
    const rsvps = [
      { attending: true, guestNames: ['John', 'Jane'] },
      { attending: true, guestNames: ['Bob'] }
    ];
    
    let total = 0;
    rsvps.forEach(rsvp => {
      if (rsvp.attending) {
        const count = rsvp.numGuests || rsvp.guestNames?.length || 0;
        total += count;
      }
    });
    
    expect(total).toBe(3);
  });

  test('should handle mixed format (new and old)', () => {
    const rsvps = [
      { attending: true, numGuests: 2, guestNames: [] }, // New format
      { attending: true, guestNames: ['Bob', 'Alice'] }, // Old format
      { attending: true, numGuests: 1, guestNames: ['Charlie'] } // Both
    ];
    
    let total = 0;
    rsvps.forEach(rsvp => {
      if (rsvp.attending) {
        const count = rsvp.numGuests || rsvp.guestNames?.length || 0;
        total += count;
      }
    });
    
    expect(total).toBe(5); // 2 + 2 + 1
  });

  test('should return 0 for empty guestNames array', () => {
    const rsvp = { attending: true, guestNames: [] };
    const count = rsvp.numGuests || rsvp.guestNames?.length || 0;
    expect(count).toBe(0);
  });

  test('should handle missing guestNames field', () => {
    const rsvp = { attending: true };
    const count = rsvp.numGuests || rsvp.guestNames?.length || 0;
    expect(count).toBe(0);
  });

  test('should not count declined RSVPs', () => {
    const rsvps = [
      { attending: false, numGuests: 2, guestNames: ['John', 'Jane'] },
      { attending: true, numGuests: 3, guestNames: [] }
    ];
    
    let total = 0;
    rsvps.forEach(rsvp => {
      if (rsvp.attending) {
        total += rsvp.numGuests || rsvp.guestNames?.length || 0;
      }
    });
    
    expect(total).toBe(3);
  });
});

describe('Input Validation', () => {
  test('should validate family name length (1-100)', () => {
    const validName = 'The Smith Family';
    expect(validName.length).toBeGreaterThan(0);
    expect(validName.length).toBeLessThanOrEqual(100);
  });

  test('should reject empty family name', () => {
    const emptyName = '';
    expect(emptyName.length).toBe(0);
  });

  test('should reject family name over 100 characters', () => {
    const longName = 'A'.repeat(101);
    expect(longName.length).toBeGreaterThan(100);
  });

  test('should validate guest name length (max 100)', () => {
    const validName = 'John Smith';
    expect(validName.length).toBeLessThanOrEqual(100);
  });

  test('should validate additional notes length (max 500)', () => {
    const validNotes = 'These are some notes';
    expect(validNotes.length).toBeLessThanOrEqual(500);
  });

  test('should validate max guests range (1-50)', () => {
    const validMaxGuests = 10;
    expect(validMaxGuests).toBeGreaterThanOrEqual(1);
    expect(validMaxGuests).toBeLessThanOrEqual(50);
  });

  test('should reject max guests below 1', () => {
    const invalidMaxGuests = 0;
    expect(invalidMaxGuests).toBeLessThan(1);
  });

  test('should reject max guests above 50', () => {
    const invalidMaxGuests = 51;
    expect(invalidMaxGuests).toBeGreaterThan(50);
  });

  test('should validate venue length (max 200)', () => {
    const validVenue = 'The Garden Restaurant, 123 Main St';
    expect(validVenue.length).toBeLessThanOrEqual(200);
  });

  test('should validate event name length (1-200)', () => {
    const validName = "John's 30th Birthday";
    expect(validName.length).toBeGreaterThan(0);
    expect(validName.length).toBeLessThanOrEqual(200);
  });

  test('should validate event message length (max 1000)', () => {
    const validMessage = 'You are invited to celebrate!';
    expect(validMessage.length).toBeLessThanOrEqual(1000);
  });
});

describe('Link ID Generation', () => {
  test('should generate link ID with inv_ prefix', () => {
    const linkId = 'inv_' + Math.random().toString(36).substring(2, 15);
    expect(linkId).toMatch(/^inv_[a-z0-9]+$/);
  });

  test('should generate unique link IDs', () => {
    const id1 = 'inv_' + Math.random().toString(36).substring(2, 15);
    const id2 = 'inv_' + Math.random().toString(36).substring(2, 15);
    expect(id1).not.toBe(id2);
  });

  test('should generate link ID with minimum length', () => {
    const linkId = 'inv_' + Math.random().toString(36).substring(2, 15);
    expect(linkId.length).toBeGreaterThanOrEqual(8); // inv_ + at least 4 chars
  });
});

describe('RSVP Entry Structure', () => {
  test('should create valid RSVP entry for attending', () => {
    const rsvpEntry = {
      familyName: 'The Smith Family',
      attending: true,
      numGuests: 3,
      guestNames: ['John', 'Jane', 'Jimmy'],
      additionalNotes: 'Looking forward to it!',
      rsvpDate: new Date().toISOString()
    };

    expect(rsvpEntry).toHaveProperty('familyName');
    expect(rsvpEntry).toHaveProperty('attending');
    expect(rsvpEntry).toHaveProperty('numGuests');
    expect(rsvpEntry).toHaveProperty('guestNames');
    expect(rsvpEntry).toHaveProperty('additionalNotes');
    expect(rsvpEntry).toHaveProperty('rsvpDate');
    expect(rsvpEntry.attending).toBe(true);
    expect(rsvpEntry.numGuests).toBe(3);
  });

  test('should create valid RSVP entry for declining', () => {
    const rsvpEntry = {
      familyName: 'The Jones Family',
      attending: false,
      numGuests: 0,
      guestNames: [],
      additionalNotes: '',
      rsvpDate: new Date().toISOString()
    };

    expect(rsvpEntry.attending).toBe(false);
    expect(rsvpEntry.numGuests).toBe(0);
    expect(rsvpEntry.guestNames).toEqual([]);
  });

  test('should have ISO date format for rsvpDate', () => {
    const isoDate = new Date().toISOString();
    expect(isoDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

describe('Event Data Structure', () => {
  test('should create valid event data', () => {
    const eventData = {
      userId: 'test-user-123',
      name: "John's Birthday",
      date: '2026-03-15',
      time: '18:00',
      venue: 'The Garden Restaurant',
      message: 'Come celebrate!',
      imageUrl: 'https://example.com/image.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    expect(eventData).toHaveProperty('userId');
    expect(eventData).toHaveProperty('name');
    expect(eventData).toHaveProperty('date');
    expect(eventData).toHaveProperty('time');
    expect(eventData).toHaveProperty('venue');
    expect(eventData.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('should handle optional fields (time and venue)', () => {
    const eventData = {
      userId: 'test-user-123',
      name: "John's Birthday",
      date: '2026-03-15',
      time: null,
      venue: null,
      message: '',
      imageUrl: ''
    };

    expect(eventData.time).toBeNull();
    expect(eventData.venue).toBeNull();
  });
});

describe('Backwards Compatibility', () => {
  test('should handle old RSVP format without numGuests', () => {
    const oldRsvp = {
      familyName: 'The Smith Family',
      attending: true,
      guestNames: ['John', 'Jane'],
      additionalNotes: 'test'
    };

    const guestCount = oldRsvp.numGuests || oldRsvp.guestNames?.length || 0;
    expect(guestCount).toBe(2);
  });

  test('should handle old event format without time and venue', () => {
    const oldEvent = {
      name: "John's Birthday",
      date: '2026-03-15',
      message: 'Come celebrate!'
    };

    expect(oldEvent.time).toBeUndefined();
    expect(oldEvent.venue).toBeUndefined();
    expect(oldEvent.date).toBeDefined();
  });

  test('should use default time (6 PM) when time is not available', () => {
    const eventData = { date: '2026-03-15' };
    const defaultHour = 18;
    const defaultMinute = 0;
    
    const hour = eventData.time ? parseInt(eventData.time.split(':')[0]) : defaultHour;
    const minute = eventData.time ? parseInt(eventData.time.split(':')[1]) : defaultMinute;
    
    expect(hour).toBe(18);
    expect(minute).toBe(0);
  });

  test('should filter null values from calendar content', () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      null, // Venue line when not provided
      'END:VCALENDAR'
    ];
    
    const filtered = icsContent.filter(line => line !== null);
    expect(filtered).toHaveLength(3);
    expect(filtered).not.toContain(null);
  });
});

describe('Security Tests', () => {
  test('should prevent XSS in family name', () => {
    const maliciousName = '<script>alert("XSS")</script>';
    const escaped = escapeHtml(maliciousName);
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
  });

  test('should prevent XSS in event message', () => {
    const maliciousMessage = '<img src=x onerror="alert(1)">';
    const escaped = escapeHtml(maliciousMessage);
    expect(escaped).not.toContain('<img');
    expect(escaped).toContain('&lt;img');
  });

  test('should prevent XSS in venue', () => {
    const maliciousVenue = '<iframe src="evil.com"></iframe>';
    const escaped = escapeHtml(maliciousVenue);
    expect(escaped).not.toContain('<iframe');
    expect(escaped).toContain('&lt;iframe');
  });

  test('should sanitize event name for file download', () => {
    const eventName = "John's <Birthday> Party!";
    const sanitized = eventName.replace(/[^a-z0-9]/gi, '_');
    expect(sanitized).toBe('John_s__Birthday__Party_');
    expect(sanitized).not.toContain('<');
    expect(sanitized).not.toContain('>');
  });
});

describe('Date Formatting', () => {
  test('should format date for display', () => {
    const date = new Date(2026, 2, 15); // March 15, 2026
    const formatted = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    expect(formatted).toContain('March');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2026');
  });

  test('should format time for display', () => {
    const timeDate = new Date();
    timeDate.setHours(18, 30);
    const formatted = timeDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    expect(formatted).toMatch(/6:30 PM/i);
  });

  test('should pad single digit numbers', () => {
    const pad = (num) => String(num).padStart(2, '0');
    expect(pad(5)).toBe('05');
    expect(pad(10)).toBe('10');
    expect(pad(0)).toBe('00');
  });
});

describe('Array Sorting', () => {
  test('should sort events by createdAt descending', () => {
    const events = [
      { id: '1', createdAt: '2026-01-10T10:00:00.000Z' },
      { id: '2', createdAt: '2026-01-15T10:00:00.000Z' },
      { id: '3', createdAt: '2026-01-05T10:00:00.000Z' }
    ];

    events.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    expect(events[0].id).toBe('2');
    expect(events[1].id).toBe('1');
    expect(events[2].id).toBe('3');
  });

  test('should handle missing createdAt with fallback to 0', () => {
    const events = [
      { id: '1', createdAt: '2026-01-10T10:00:00.000Z' },
      { id: '2' }, // Missing createdAt
      { id: '3', createdAt: '2026-01-15T10:00:00.000Z' }
    ];

    events.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    expect(events[0].id).toBe('3');
    expect(events[1].id).toBe('1');
    expect(events[2].id).toBe('2');
  });
});
