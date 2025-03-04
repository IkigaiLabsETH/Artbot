import fs from 'fs';
import path from 'path';

/**
 * Ensures that a directory exists, creating it if necessary
 * @param {string} dirPath - The directory path to ensure exists
 */
export function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
} 