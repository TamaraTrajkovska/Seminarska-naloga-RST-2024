/**
 * Extract details from a formatted string.
 * @param {string} inputString - The input string in the format "[name]_[method]_[date]_[time]".
 * @returns {object} - An object containing the extracted details.
 */
export function parseAnalysisString(inputString) {
    
    const regex = /^\[(.*?)\]_\[(.*?)\]_\[(.*?)\]_\[(.*?)\]$/; // Regular expression to match the pattern
    const match = inputString.match(regex);
  
    if (!match) {
      throw new Error("Input string does not match the required format.");
    }
  
    return `${match[2]} ${match[1]} ${match[4]} ${match[3]}`
  }
  
  