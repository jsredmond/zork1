/**
 * MessageConsistencyManager implementation for Z-Machine compatible message standardization
 */

import { MessageConsistencyManager, MessageType, MessageContext } from './interfaces';

interface MessageTemplate {
  template: string;
  requiresInterpolation: boolean;
  alternates?: string[];
}

export class ZMachineMessageStandards implements MessageConsistencyManager {
  private messageTemplates = new Map<MessageType, MessageTemplate>([
    [MessageType.MALFORMED_COMMAND, {
      template: "That sentence isn't one I recognize.",
      requiresInterpolation: false
    }],
    [MessageType.MISSING_OBJECT, {
      template: "There seems to be a noun missing in that sentence!",
      requiresInterpolation: false
    }],
    [MessageType.OBJECT_NOT_HERE, {
      template: "You can't see any {object} here!",
      requiresInterpolation: true
    }],
    [MessageType.DONT_HAVE_OBJECT, {
      template: "You don't have {the_object}.",
      requiresInterpolation: true
    }],
    [MessageType.EMPTY_HANDED, {
      template: "You are empty-handed.",
      requiresInterpolation: false
    }],
    [MessageType.UNKNOWN_VERB, {
      template: "I don't know the word \"{verb}\".",
      requiresInterpolation: true
    }]
  ]);

  /**
   * Standardizes a message according to Z-Machine conventions
   */
  standardizeMessage(messageType: MessageType, context: MessageContext): string {
    const template = this.messageTemplates.get(messageType);
    
    if (!template) {
      return this.getDefaultMessage(messageType);
    }

    if (template.requiresInterpolation) {
      return this.interpolateTemplate(template.template, context);
    }

    return template.template;
  }

  /**
   * Validates that a message follows proper formatting rules
   */
  validateMessageFormat(message: string): boolean {
    if (!message || typeof message !== 'string') {
      return false;
    }

    // Check basic formatting rules
    const trimmed = message.trim();
    
    // Must not be empty
    if (trimmed.length === 0) {
      return false;
    }

    // Should end with proper punctuation
    const lastChar = trimmed[trimmed.length - 1];
    if (!['.', '!', '?'].includes(lastChar)) {
      return false;
    }

    // Should start with capital letter (unless it's a quote)
    const firstChar = trimmed[0];
    if (firstChar !== '"' && firstChar !== firstChar.toUpperCase()) {
      return false;
    }

    // Should not have multiple consecutive spaces
    if (trimmed.includes('  ')) {
      return false;
    }

    return true;
  }

  /**
   * Gets the canonical message for a given situation
   */
  getCanonicalMessage(messageType: MessageType, context: MessageContext): string {
    return this.standardizeMessage(messageType, context);
  }

  /**
   * Interpolates template variables with context values
   */
  private interpolateTemplate(template: string, context: MessageContext): string {
    let result = template;

    // Replace common template variables with proper article handling
    if (context.object) {
      const cleanObjectName = this.formatObjectName(context.object);
      
      // Handle different article patterns in templates
      result = result.replace(/\{object\}/g, cleanObjectName);
      result = result.replace(/\{the_object\}/g, `the ${cleanObjectName}`);
      result = result.replace(/\{a_object\}/g, this.formatObjectWithArticle(cleanObjectName, 'a'));
      result = result.replace(/\{an_object\}/g, this.formatObjectWithArticle(cleanObjectName, 'an'));
    }

    if (context.verb) {
      result = result.replace(/\{verb\}/g, context.verb);
    }

    if (context.location) {
      result = result.replace(/\{location\}/g, context.location);
    }

    // Handle any additional context variables
    for (const [key, value] of Object.entries(context)) {
      if (typeof value === 'string') {
        const placeholder = `{${key}}`;
        result = result.replace(new RegExp(placeholder, 'g'), value);
      }
    }

    return result;
  }

  /**
   * Formats object names with proper articles
   */
  private formatObjectName(objectName: string): string {
    if (!objectName) {
      return '';
    }

    // Remove any existing articles
    const cleaned = objectName.replace(/^(the|a|an)\s+/i, '');
    
    // Don't add articles to proper nouns or already formatted names
    if (this.isProperNoun(cleaned) || objectName.includes('the ')) {
      return cleaned;
    }

    // Return base form - articles will be added contextually by message templates
    return cleaned;
  }

  /**
   * Determines if a word is a proper noun
   */
  private isProperNoun(word: string): boolean {
    // Simple heuristic: starts with capital letter and isn't a common object
    const commonObjects = ['lamp', 'sword', 'rope', 'bottle', 'bag', 'box', 'key'];
    return word[0] === word[0].toUpperCase() && 
           !commonObjects.includes(word.toLowerCase());
  }

  /**
   * Gets the appropriate article for an object name
   * Returns the correct article based on Z-Machine conventions
   */
  private getArticleForObject(objectName: string): string {
    if (!objectName) {
      return '';
    }

    const lower = objectName.toLowerCase();
    
    // Special cases for specific objects that always use "the"
    const definiteArticleObjects = [
      'forest', 'white house', 'house', 'tree', 'window', 'board', 
      'boarded window', 'kitchen window', 'mailbox', 'small mailbox',
      'lamp', 'sword', 'trophy', 'coffin', 'rug', 'trapdoor', 'trap door',
      'grating', 'dam', 'reservoir', 'control panel', 'machine'
    ];

    if (definiteArticleObjects.includes(lower)) {
      return 'the';
    }

    // Use "an" for vowel sounds
    const vowelSounds = ['a', 'e', 'i', 'o', 'u'];
    const firstLetter = lower.charAt(0);
    
    if (vowelSounds.includes(firstLetter)) {
      return 'an';
    }

    // Default to "a"
    return 'a';
  }

  /**
   * Formats object name with appropriate article for error messages
   */
  formatObjectWithArticle(objectName: string, forceArticle?: 'the' | 'a' | 'an'): string {
    if (!objectName) {
      return '';
    }

    const cleanName = this.formatObjectName(objectName);
    
    if (forceArticle) {
      return `${forceArticle} ${cleanName}`;
    }

    const article = this.getArticleForObject(cleanName);
    return `${article} ${cleanName}`;
  }

  /**
   * Gets default message for unknown message types
   */
  private getDefaultMessage(messageType: MessageType): string {
    return "I don't understand that.";
  }

  /**
   * Adds or updates a message template
   */
  addMessageTemplate(messageType: MessageType, template: MessageTemplate): void {
    this.messageTemplates.set(messageType, template);
  }

  /**
   * Gets all configured message templates
   */
  getMessageTemplates(): Map<MessageType, MessageTemplate> {
    return new Map(this.messageTemplates);
  }

  /**
   * Normalizes message text for comparison
   */
  normalizeMessage(message: string): string {
    return message
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .toLowerCase();
  }

  /**
   * Checks if two messages are equivalent after normalization
   */
  messagesEquivalent(message1: string, message2: string): boolean {
    return this.normalizeMessage(message1) === this.normalizeMessage(message2);
  }

  /**
   * Formats error messages with consistent punctuation and capitalization
   */
  formatErrorMessage(message: string): string {
    if (!message) {
      return '';
    }

    let formatted = message.trim();

    // Ensure proper capitalization
    if (formatted.length > 0) {
      formatted = formatted[0].toUpperCase() + formatted.slice(1);
    }

    // Ensure proper ending punctuation
    const lastChar = formatted[formatted.length - 1];
    if (!['.', '!', '?'].includes(lastChar)) {
      formatted += '.';
    }

    return formatted;
  }

  /**
   * Handles context-sensitive message selection
   */
  selectContextualMessage(messageType: MessageType, context: MessageContext): string {
    const template = this.messageTemplates.get(messageType);
    
    if (!template) {
      return this.getDefaultMessage(messageType);
    }

    // Handle special cases based on context
    switch (messageType) {
      case MessageType.DONT_HAVE_OBJECT:
        // If no specific object, use empty-handed message
        if (!context.object) {
          return this.standardizeMessage(MessageType.EMPTY_HANDED, context);
        }
        break;
        
      case MessageType.OBJECT_NOT_HERE:
        // Ensure object name is properly formatted
        if (context.object) {
          context.object = this.formatObjectName(context.object);
        }
        break;

      case MessageType.MALFORMED_COMMAND:
        // Always return the standard malformed command message
        return template.template;
    }

    return this.standardizeMessage(messageType, context);
  }
}