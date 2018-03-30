import {contains} from "./utils";

/**
 * Creates a string of emoji smiles based on dish name.
 *
 * @param {string} dishName name of the dish
 * @return {string} string that may contain emoji symbols
 */
export function findEmoji(dishName) {
    const name = dishName.toLowerCase();
    let matches = 0;
    let emojiString = '';

    if (contains(name, 'pstruh') || contains(name, 'rybie')) {
        emojiString += '🐟';
        matches++;
    }

    if (contains(name, 'pizza')) {
        emojiString += '🍕';
        matches++;
    }

    if (contains(name, 'palacink')) {
        emojiString += '🥞';
        matches++;
    }

    if (contains(name, 'špagety')) {
        emojiString += '🍝';
        matches++;
    }

    if (contains(name, 'pirohy')) {
        //emojiString += '🥟';
        matches++;
    }

    if (contains(name, 'šalát')) {
        emojiString += '🥗';
        matches++;
    }

    if (contains(name, 'guláš')) {
        //emojiString += '🥣';
        matches++;
    }

    if (contains(name, 'karí')) {
        emojiString += '🍛';
        matches++;
    }

    if (contains(name, 'bravčov') || contains(name, 'hovädzie')) {
        //emojiString += '🥩   ';
        matches++;
    }

    if (matches < 2) {
        return emojiString;
    } else {
        return '';
    }
}