import fs from 'fs';
import path from 'path';

/**
 * Provides SafariMind's identity response when users ask about the chatbot
 * @returns The SafariMind identity markdown
 */
export function getSafariMindIdentity(): string {
  try {
    // Read the identity markdown file (in browser context)
    return `# 🦁 **SafariMind**

## Powered by Cheruu, Kenya

I am **SafariMind**, an AI assistant developed by Cheruu, a pioneering Kenyan tech company. My name embodies the spirit of exploration ("safari") and knowledge, rooted in the rich innovation landscape of Kenya.

### What I can do for you:
* Answer your questions with accurate, helpful information
* Provide insights into Kenyan culture, history, and innovation
* Assist with creative tasks and problem-solving
* Generate content and code based on your requests

I'm designed to be your helpful companion, bringing a unique East African perspective to artificial intelligence. I'm constantly learning and evolving to serve you better.

_Powered by Kenyan innovation, built to explore knowledge together._`;
  } catch (error) {
    console.error('Error reading SafariMind identity file:', error);
    return '# SafariMind\n\nI am SafariMind, an AI assistant developed by Cheruu, a Kenyan tech company.';
  }
}

/**
 * Determines if a user message is asking about the chatbot's identity
 * @param message - The user's message
 * @returns True if the message is asking about identity
 */
export function isAskingAboutIdentity(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Keywords and phrases that indicate identity questions
  const identityKeywords = [
    'who are you',
    'what are you',
    'tell me about yourself',
    'your name',
    'introduce yourself',
    'what is your purpose',
    'what can you do',
    'who made you',
    'who created you',
    'what is safarimind',
    'what\'s safarimind',
    'tell me about safarimind',
    'about you',
    'what do you do',
  ];
  
  return identityKeywords.some(keyword => lowerMessage.includes(keyword));
}