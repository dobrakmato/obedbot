/**
 * Returns random element from provided array.
 *
 * @param {T[]} arr array
 * @return {T} random element
 */
export function randomArrayElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Returns whether specified str contains specified substring or not.
 *
 * @param {string} str string to check for existence of substring
 * @param {string} substr substring
 * @return {boolean} true or false
 */
export function contains(str, substr) {
    return str.indexOf(substr) >= 0;
}

/**
 * Capitalizes specified string.
 *
 * @param {string} str string to capitalize
 * @return {string} capitalized string
 */
export const capitalize = str => str.charAt(0).toUpperCase() + str.substring(1);