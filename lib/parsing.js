import jsdom from 'jsdom/lib/old-api';
import config from './config';

/***
 * Creates a Window object from specified URL with jQuery ready in it.
 *
 * @param url url to open
 * @return {Promise}
 */
async function createWindow(url) {
    return new Promise((resolve, reject) => {
        jsdom.env({
            url: url,
            scripts: ['http://code.jquery.com/jquery.js'],
            done: function (err, window) {
                if (err) {
                    reject(err);
                }
                resolve(window);
            },
        })
    });
}

/**
 * Parses element as dish-containing element.
 * @param el
 * @param outDishes
 */
function parseDish(el, outDishes) {
    const dishString = el.text();

    let name = null;
    let price = null;

    if (dishString.indexOf('-') !== false) {
        name = dishString.split('-')[0].trim();
        price = dishString.split('-')[1].trim();
    } else {
        name = dishString;
    }

    outDishes.push({name, price});
}

/**
 * Parses whole menu from window object and canteen data structure.
 *
 * @param window window previously created used to perform parsing
 * @param canteen canteen object
 * @param day date in format DD.MM.YYYY
 * @return {{canteen, soup: null, dishes: Array}} menu object
 */
function parseMenu(window, canteen, day) {
    const $ = window.$;

    const selector = canteen.selector.replace('$$DATE$$', day);
    const dishes = [];
    $(selector).find('li').each(function () {
        parseDish($(this), dishes);
    });

    return {
        canteen: canteen.name,
        soup: null,
        dishes: dishes,
    };
}

/**
 * Performs all tasks required to acquiring the menu from remote web page.
 *
 * @param canteen canteen object
 * @param day date in format DD.MM.YYYY
 * @return {Promise.<{canteen, soup: null, dishes: Array}>}
 */
export async function acquireMenu(canteen, day) {
    const window = await createWindow(canteen.url);
    const menu = parseMenu(window, canteen, day);
    window.close();
    return menu;
}

/**
 * Returns all menus from all canteens in configuration file as array.
 *
 * @return {Promise.<Array>}
 */
export async function acquireMenus(day) {
    const menus = [];
    for (const canteen of config.canteens) {
        menus.push(await acquireMenu(canteen, day));
    }
    return menus;
}