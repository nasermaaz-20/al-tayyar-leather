/**
 * Utility functions for input validation to enforce language-specific characters.
 */

export const filterEnglishInput = (text: string): string => {
  // Remove any Arabic characters
  return text.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\ufb50-\ufdff\ufe70-\ufeff]/g, '');
};

export const filterArabicInput = (text: string): string => {
  // Remove any English letters
  return text.replace(/[a-zA-Z]/g, '');
};
