const { describe, test, expect } = require('@jest/globals');

// Import the functions by evaluating the code
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

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

describe('Markdown Parsing', () => {
  describe('Link Parsing', () => {
    test('should convert markdown link to HTML anchor', () => {
      const input = 'Check out [our website](https://example.com)';
      const expected = 'Check out <a href="https://example.com" target="_blank" rel="noopener noreferrer">our website</a>';
      expect(parseMarkdown(input)).toBe(expected);
    });

    test('should convert multiple markdown links', () => {
      const input = 'Visit [Google](https://google.com) or [GitHub](https://github.com)';
      const result = parseMarkdown(input);
      expect(result).toContain('<a href="https://google.com"');
      expect(result).toContain('<a href="https://github.com"');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    test('should require http:// or https:// protocol', () => {
      const input = 'Visit [our site](example.com)';
      const result = parseMarkdown(input);
      expect(result).toBe('Visit [our site](example.com)');
      expect(result).not.toContain('<a href');
    });

    test('should support https links', () => {
      const input = '[Secure Site](https://secure.com)';
      const result = parseMarkdown(input);
      expect(result).toContain('<a href="https://secure.com"');
    });

    test('should support http links', () => {
      const input = '[Site](http://example.com)';
      const result = parseMarkdown(input);
      expect(result).toContain('<a href="http://example.com"');
    });

    test('should handle links with complex URLs', () => {
      const input = '[Map](https://maps.google.com/?q=123+Main+St)';
      const result = parseMarkdown(input);
      expect(result).toContain('<a href="https://maps.google.com/?q=123+Main+St"');
    });

    test('should handle link text with spaces', () => {
      const input = '[Click here for more info](https://example.com)';
      const result = parseMarkdown(input);
      expect(result).toContain('>Click here for more info</a>');
    });

    test('should reject javascript: URLs', () => {
      const input = '[Click](javascript:alert("XSS"))';
      const result = parseMarkdown(input);
      expect(result).toBe('[Click](javascript:alert(&quot;XSS&quot;))');
      expect(result).not.toContain('<a href');
    });

    test('should reject data: URLs', () => {
      const input = '[Click](data:text/html,<script>alert("XSS")</script>)';
      const result = parseMarkdown(input);
      expect(result).not.toContain('<a href="data:');
    });

    test('should handle empty link text', () => {
      const input = '[](https://example.com)';
      const result = parseMarkdown(input);
      // Regex requires at least one char in link text, so this won't match
      expect(result).toBe('[](https://example.com)');
    });

    test('should handle empty URL', () => {
      const input = '[text]()';
      const result = parseMarkdown(input);
      expect(result).toBe('[text]()');
    });
  });

  describe('Newline Handling', () => {
    test('should convert single newline to <br>', () => {
      const input = 'Line 1\nLine 2';
      const result = parseMarkdown(input);
      expect(result).toBe('Line 1<br>Line 2');
    });

    test('should convert multiple newlines to multiple <br>', () => {
      const input = 'Line 1\n\nLine 2\n\nLine 3';
      const result = parseMarkdown(input);
      expect(result).toBe('Line 1<br><br>Line 2<br><br>Line 3');
    });

    test('should handle newlines with links', () => {
      const input = 'Visit:\n[Google](https://google.com)\n[GitHub](https://github.com)';
      const result = parseMarkdown(input);
      expect(result).toContain('Visit:<br>');
      expect(result).toContain('<a href="https://google.com"');
      expect(result).toContain('<br><a href="https://github.com"');
    });
  });

  describe('XSS Protection', () => {
    test('should escape HTML in regular text', () => {
      const input = '<script>alert("XSS")</script>';
      const result = parseMarkdown(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
      expect(result).not.toContain('<script>');
    });

    test('should escape HTML in link text', () => {
      const input = '[<script>alert("XSS")</script>](https://example.com)';
      const result = parseMarkdown(input);
      expect(result).toContain('&lt;script&gt;');
      expect(result).not.toContain('<script>alert');
    });

    test('should handle malicious HTML with markdown', () => {
      const input = '<img src=x onerror="alert(1)"> [link](https://example.com)';
      const result = parseMarkdown(input);
      expect(result).not.toContain('<img src=x');
      expect(result).toContain('&lt;img');
      expect(result).toContain('<a href="https://example.com"');
    });

    test('should escape ampersands in regular text', () => {
      const input = 'Tom & Jerry';
      const result = parseMarkdown(input);
      expect(result).toBe('Tom &amp; Jerry');
    });

    test('should handle mixed XSS attempts and valid markdown', () => {
      const input = 'Check <script>alert("XSS")</script> or visit [our site](https://example.com)';
      const result = parseMarkdown(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('<a href="https://example.com"');
    });

    test('should add target="_blank" to all links', () => {
      const input = '[Link](https://example.com)';
      const result = parseMarkdown(input);
      expect(result).toContain('target="_blank"');
    });

    test('should add rel="noopener noreferrer" to all links', () => {
      const input = '[Link](https://example.com)';
      const result = parseMarkdown(input);
      expect(result).toContain('rel="noopener noreferrer"');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string', () => {
      expect(parseMarkdown('')).toBe('');
    });

    test('should handle null', () => {
      expect(parseMarkdown(null)).toBe('');
    });

    test('should handle undefined', () => {
      expect(parseMarkdown(undefined)).toBe('');
    });

    test('should handle text without markdown', () => {
      const input = 'Just plain text';
      expect(parseMarkdown(input)).toBe('Just plain text');
    });

    test('should handle malformed markdown links', () => {
      const input = '[link](incomplete';
      const result = parseMarkdown(input);
      expect(result).toBe('[link](incomplete');
    });

    test('should handle nested brackets in link text', () => {
      const input = '[[nested]](https://example.com)';
      const result = parseMarkdown(input);
      // The regex won't match due to the opening bracket before
      expect(result).toBe('[[nested]](https://example.com)');
    });

    test('should preserve text around markdown', () => {
      const input = 'Before [link](https://example.com) After';
      const result = parseMarkdown(input);
      expect(result).toContain('Before ');
      expect(result).toContain(' After');
      expect(result).toContain('<a href="https://example.com"');
    });

    test('should handle links at start and end of text', () => {
      const input = '[Start](https://start.com) middle [End](https://end.com)';
      const result = parseMarkdown(input);
      expect(result).toContain('<a href="https://start.com"');
      expect(result).toContain('<a href="https://end.com"');
      expect(result).toContain('middle');
    });
  });

  describe('Combined Features', () => {
    test('should handle links and newlines together', () => {
      const input = 'First line\n[Link](https://example.com)\nLast line';
      const result = parseMarkdown(input);
      expect(result).toBe('First line<br><a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a><br>Last line');
    });

    test('should handle multiple features in complex text', () => {
      const input = 'Join us!\n\nRSVP at [our website](https://party.com)\n\nSee you there!';
      const result = parseMarkdown(input);
      expect(result).toContain('Join us!<br><br>');
      expect(result).toContain('<a href="https://party.com"');
      expect(result).toContain('<br><br>See you there!');
    });

    test('should maintain security with all features', () => {
      const input = '<script>alert("XSS")</script>\n[Safe Link](https://example.com)\n<img src=x>';
      const result = parseMarkdown(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('<img src=x>');
      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('<a href="https://example.com"');
    });
  });

  describe('Real World Examples', () => {
    test('should format invitation with RSVP link', () => {
      const input = 'You\'re invited to Sarah\'s birthday!\n\nPlease RSVP at [this link](https://example.com/rsvp)';
      const result = parseMarkdown(input);
      expect(result).toContain('You&#039;re invited');
      expect(result).toContain('<br><br>Please RSVP');
      expect(result).toContain('<a href="https://example.com/rsvp"');
    });

    test('should format message with multiple links', () => {
      const input = 'Party details:\n[Venue Info](https://venue.com)\n[Directions](https://maps.google.com)\n[Gift Registry](https://registry.com)';
      const result = parseMarkdown(input);
      expect(result).toContain('Party details:<br>');
      expect(result).toContain('href="https://venue.com"');
      expect(result).toContain('href="https://maps.google.com"');
      expect(result).toContain('href="https://registry.com"');
    });

    test('should format message with venue and map link', () => {
      const input = 'Location: The Garden Restaurant\n[View on Google Maps](https://maps.google.com/?q=Garden+Restaurant)';
      const result = parseMarkdown(input);
      expect(result).toContain('Location: The Garden Restaurant<br>');
      expect(result).toContain('<a href="https://maps.google.com/?q=Garden+Restaurant"');
    });
  });
});
