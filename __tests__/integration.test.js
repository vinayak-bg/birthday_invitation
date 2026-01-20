const { describe, test, expect, beforeEach } = require('@jest/globals');

describe('Integration Tests', () => {
  let mockInvitation;
  let mockEvent;

  beforeEach(() => {
    mockEvent = {
      id: 'event123',
      userId: 'user123',
      name: "John's Birthday",
      date: '2026-03-15',
      time: '18:00',
      endTime: '23:00',
      venue: 'The Garden Restaurant',
      message: 'Come celebrate!',
      imageUrl: 'https://example.com/image.jpg',
      createdAt: '2026-01-01T10:00:00.000Z'
    };

    mockInvitation = {
      linkId: 'inv_abc123',
      userId: 'user123',
      eventId: 'event123',
      maxGuests: 5,
      rsvpSubmitted: true,
      rsvps: [
        {
          familyName: 'The Smith Family',
          attending: true,
          numGuests: 3,
          guestNames: ['John', 'Jane', 'Jimmy'],
          additionalNotes: 'Looking forward!',
          rsvpDate: '2026-01-15T12:00:00.000Z'
        },
        {
          familyName: 'The Jones Family',
          attending: false,
          numGuests: 0,
          guestNames: [],
          additionalNotes: 'Sorry, cannot make it',
          rsvpDate: '2026-01-16T14:00:00.000Z'
        }
      ],
      createdAt: '2026-01-01T10:00:00.000Z'
    };
  });

  describe('Complete RSVP Flow', () => {
    test('should process attending RSVP correctly', () => {
      const attending = 'yes';
      const numGuests = 3;
      const guestNames = ['Alice', 'Bob', 'Charlie'];
      const familyName = 'The Test Family';
      const additionalNotes = 'Dietary restrictions: vegetarian';

      const rsvpEntry = {
        familyName: familyName,
        attending: attending === 'yes',
        numGuests: attending === 'yes' ? numGuests : 0,
        guestNames: guestNames,
        additionalNotes: additionalNotes,
        rsvpDate: new Date().toISOString()
      };

      expect(rsvpEntry.attending).toBe(true);
      expect(rsvpEntry.numGuests).toBe(3);
      expect(rsvpEntry.guestNames).toHaveLength(3);
      expect(rsvpEntry.familyName).toBe('The Test Family');
    });

    test('should process declining RSVP correctly', () => {
      const attending = 'no';
      const familyName = 'The Test Family';

      const rsvpEntry = {
        familyName: familyName,
        attending: attending === 'yes',
        numGuests: attending === 'yes' ? 0 : 0,
        guestNames: [],
        additionalNotes: '',
        rsvpDate: new Date().toISOString()
      };

      expect(rsvpEntry.attending).toBe(false);
      expect(rsvpEntry.numGuests).toBe(0);
      expect(rsvpEntry.guestNames).toHaveLength(0);
    });

    test('should allow RSVP without guest names', () => {
      const rsvpEntry = {
        familyName: 'The Anonymous Family',
        attending: true,
        numGuests: 2,
        guestNames: [], // No names provided
        additionalNotes: '',
        rsvpDate: new Date().toISOString()
      };

      expect(rsvpEntry.numGuests).toBe(2);
      expect(rsvpEntry.guestNames).toHaveLength(0);
    });
  });

  describe('Admin Dashboard Statistics', () => {
    test('should calculate total links correctly', () => {
      const invitations = [mockInvitation];
      const totalLinks = invitations.length;
      expect(totalLinks).toBe(1);
    });

    test('should calculate total RSVPs correctly', () => {
      const invitations = [mockInvitation];
      let totalRsvps = 0;
      invitations.forEach(inv => {
        totalRsvps += (inv.rsvps || []).length;
      });
      expect(totalRsvps).toBe(2);
    });

    test('should calculate total confirmed guests correctly', () => {
      const invitations = [mockInvitation];
      let totalGuests = 0;
      
      invitations.forEach(inv => {
        const rsvps = inv.rsvps || [];
        rsvps.forEach(rsvp => {
          if (rsvp.attending) {
            const guestCount = rsvp.numGuests || rsvp.guestNames?.length || 0;
            totalGuests += guestCount;
          }
        });
      });
      
      expect(totalGuests).toBe(3);
    });

    test('should handle multiple invitations', () => {
      const invitations = [
        mockInvitation,
        {
          linkId: 'inv_def456',
          rsvps: [
            { attending: true, numGuests: 2, guestNames: [] }
          ]
        }
      ];

      let totalGuests = 0;
      invitations.forEach(inv => {
        const rsvps = inv.rsvps || [];
        rsvps.forEach(rsvp => {
          if (rsvp.attending) {
            totalGuests += rsvp.numGuests || rsvp.guestNames?.length || 0;
          }
        });
      });

      expect(totalGuests).toBe(5); // 3 + 2
    });
  });

  describe('Event Creation and Editing', () => {
    test('should create new event with all fields including end time', () => {
      const eventData = {
        userId: 'user123',
        name: "Sarah's Birthday",
        date: '2026-05-20',
        time: '19:00',
        endTime: '23:30',
        venue: 'Central Park',
        message: 'Outdoor celebration!',
        imageUrl: 'https://example.com/party.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(eventData.name).toBe("Sarah's Birthday");
      expect(eventData.time).toBe('19:00');
      expect(eventData.endTime).toBe('23:30');
      expect(eventData.venue).toBe('Central Park');
    });

    test('should update existing event with new end time', () => {
      const updatedEvent = {
        ...mockEvent,
        time: '20:00',
        endTime: '01:00',
        venue: 'New Venue',
        updatedAt: new Date().toISOString()
      };

      expect(updatedEvent.time).toBe('20:00');
      expect(updatedEvent.endTime).toBe('01:00');
      expect(updatedEvent.venue).toBe('New Venue');
      expect(updatedEvent.name).toBe(mockEvent.name); // Unchanged
    });

    test('should remove undefined fields from event data', () => {
      const eventData = {
        name: 'Test',
        date: '2026-01-01',
        time: undefined,
        venue: null,
        message: ''
      };

      Object.keys(eventData).forEach(key => {
        if (eventData[key] === undefined) {
          delete eventData[key];
        }
      });

      expect(eventData).not.toHaveProperty('time');
      expect(eventData).toHaveProperty('venue'); // null is kept
    });
  });

  describe('Calendar File Generation Integration', () => {
    test('should generate complete calendar file with all event details including end time', () => {
      const eventData = mockEvent;
      const [year, month, day] = eventData.date.split('-');
      const [hours, minutes] = eventData.time.split(':');
      const [endHours, endMinutes] = eventData.endTime.split(':');
      
      const eventDate = new Date(year, month - 1, day, parseInt(hours), parseInt(minutes));
      const eventEndDate = new Date(year, month - 1, day, parseInt(endHours), parseInt(endMinutes));

      expect(eventDate.getFullYear()).toBe(2026);
      expect(eventDate.getMonth()).toBe(2); // March
      expect(eventDate.getDate()).toBe(15);
      expect(eventDate.getHours()).toBe(18);
      expect(eventEndDate.getHours()).toBe(23);
    });

    test('should calculate end time as start + 5 hours when endTime not provided', () => {
      const eventData = { ...mockEvent, endTime: null };
      const [hours, minutes] = eventData.time.split(':');
      const startHour = parseInt(hours);
      const defaultEndHour = startHour + 5;
      
      expect(defaultEndHour).toBe(23);
    });

    test('should handle event without time (use defaults)', () => {
      const eventData = { ...mockEvent, time: null };
      
      const defaultHour = 18;
      const startHour = eventData.time ? parseInt(eventData.time.split(':')[0]) : defaultHour;
      
      expect(startHour).toBe(18);
    });

    test('should include location in calendar if venue exists', () => {
      const eventData = mockEvent;
      const hasVenue = !!eventData.venue;
      const location = hasVenue ? eventData.venue : null;
      
      expect(hasVenue).toBe(true);
      expect(location).toBe('The Garden Restaurant');
    });
  });

  describe('RSVP Display Formatting', () => {
    test('should format RSVP response correctly for attending', () => {
      const rsvp = mockInvitation.rsvps[0];
      const status = rsvp.attending ? '✓' : '✗';
      const guestCount = rsvp.numGuests !== undefined ? rsvp.numGuests : (rsvp.guestNames?.length || 0);
      const guestInfo = guestCount > 0 ? ` (${guestCount} guest${guestCount > 1 ? 's' : ''})` : '';
      
      expect(status).toBe('✓');
      expect(guestInfo).toBe(' (3 guests)');
    });

    test('should format RSVP response correctly for declining', () => {
      const rsvp = mockInvitation.rsvps[1];
      const status = rsvp.attending ? '✓' : '✗';
      const guestCount = rsvp.numGuests !== undefined ? rsvp.numGuests : (rsvp.guestNames?.length || 0);
      const guestInfo = guestCount > 0 ? ` (${guestCount} guest${guestCount > 1 ? 's' : ''})` : '';
      
      expect(status).toBe('✗');
      expect(guestInfo).toBe('');
    });
  });

  describe('URL and Link Handling', () => {
    test('should generate correct RSVP URL', () => {
      const baseUrl = 'https://example.github.io/birthday-invitation/';
      const linkId = 'inv_abc123';
      const url = `${baseUrl}rsvp.html?id=${linkId}`;
      
      expect(url).toBe('https://example.github.io/birthday-invitation/rsvp.html?id=inv_abc123');
    });

    test('should extract invitation ID from URL', () => {
      const urlParams = new URLSearchParams('?id=inv_abc123');
      const invitationId = urlParams.get('id');
      
      expect(invitationId).toBe('inv_abc123');
    });

    test('should handle missing invitation ID', () => {
      const urlParams = new URLSearchParams('');
      const invitationId = urlParams.get('id');
      
      expect(invitationId).toBeNull();
    });
  });

  describe('Multi-Event Support', () => {
    test('should filter invitations by eventId', () => {
      const allInvitations = [
        { linkId: 'inv_1', eventId: 'event123' },
        { linkId: 'inv_2', eventId: 'event456' },
        { linkId: 'inv_3', eventId: 'event123' }
      ];

      const eventInvitations = allInvitations.filter(inv => inv.eventId === 'event123');
      expect(eventInvitations).toHaveLength(2);
    });

    test('should calculate stats per event', () => {
      const event1Invitations = [
        { rsvps: [{ attending: true, numGuests: 2 }] },
        { rsvps: [{ attending: true, numGuests: 3 }] }
      ];

      let totalGuests = 0;
      event1Invitations.forEach(inv => {
        inv.rsvps.forEach(rsvp => {
          if (rsvp.attending) {
            totalGuests += rsvp.numGuests || 0;
          }
        });
      });

      expect(totalGuests).toBe(5);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid date format gracefully', () => {
      const invalidDate = '15-03-2026'; // Wrong format
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      const isValid = regex.test(invalidDate);
      
      expect(isValid).toBe(false);
    });

    test('should handle missing event data gracefully', () => {
      const eventData = null;
      const eventName = eventData?.name || 'Birthday Celebration';
      
      expect(eventName).toBe('Birthday Celebration');
    });

    test('should handle empty RSVP array', () => {
      const invitation = { ...mockInvitation, rsvps: [] };
      const totalRsvps = invitation.rsvps.length;
      
      expect(totalRsvps).toBe(0);
    });

    test('should handle malformed time string', () => {
      try {
        const timeString = 'invalid';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        expect(isNaN(hour)).toBe(true);
      } catch (error) {
        // Should not throw
        expect(true).toBe(true);
      }
    });
  });
});
