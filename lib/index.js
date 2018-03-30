import BootBot from 'bootbot';
import {acquireMenus} from './parsing';
import config from './config';
import moment from "moment";
import {findEmoji} from "./emoji";
import {capitalize, randomArrayElement} from "./utils";

/**
 * Checks deeply if there are any dishes in all menus.
 *
 * @param menus array of menu objects
 * @return {boolean}
 */
function hasNoDishes(menus) {
    for (const menu of menus) {
        if (menu.dishes.length > 0) {
            return false;
        }
    }

    return true;
}

/**
 * Formats menu to Facebook Messenger Bot API valid list
 * template JSON.
 *
 * @param menu menu
 * @return {Array}
 */
function formatMenuToListItems(menu) {
    const canteenName = menu.canteen;
    const listItems = [];

    for (const dish of menu.dishes) {
        listItems.push({
            title: `${findEmoji(dish.name)} ${dish.name}`,
            subtitle: `${canteenName}; ${dish.price}`,
        });
    }

    return listItems;
}

/**
 * Parses date information from specified message by
 * spiting it into words and checking for existence of
 * date expression.
 *
 * @param msg message to check
 */
function parseDateFromMessage(msg) {
    const dateRegex = /^([0-3]?[0-9])\.([0-1]?[0-9])\.?\d{0,4}[.?]?$/mi;
    const words = msg.split(' ');

    for (let word of words) {
        word = word.toLowerCase();
        if (word.endsWith('?') || word.endsWith('.')) {
            word = word.substr(0, word.length - 1);
        }

        if (word === 'dnes') {
            return ['dnes', moment().format('D.M.YYYY')];
        } else if (word === 'zajtra') {
            return ['zajtra', moment().add(1, 'day').format('D.M.YYYY')];
        } else if (word === 'pozajtra') {
            return ['pozajtra', moment().add(2, 'day').format('D.M.YYYY')];
        } else {
            const matches = word.match(dateRegex);
            if (matches !== null && matches.length === 3) {
                return ['', `${matches[1]}.${matches[2]}.2018`];
            }
        }
    }

    return ['dnes', moment().format('D.MM.YYYY')];
}


async function handleMessage(payload, chat) {
    await chat.sendAction('mark_seen');
    chat.sendTypingIndicator(8000);

    const [humanDate, date] = parseDateFromMessage(payload.message.text);
    const menus = await acquireMenus(date);

    if (menus === null || menus.length === 0 || hasNoDishes(menus)) {
        chat.say(`Sorry, na ${humanDate !== '' ? humanDate : date} som nenašiel žiadny jedálny lístok. 😞`);
        return;
    }

    await chat.say(`${capitalize(humanDate)} ${date} ${humanDate === 'dnes' ? 'je' : 'bude'} na obed: ⬇️`);

    for (const menu of menus) {
        const listItems = formatMenuToListItems(menu);

        if (listItems.length > 0) {
            await chat.sendListTemplate(listItems, null, {
                topElementStyle: 'compact',
            });
        }
    }
}

process.on('unhandledRejection', error => {
    console.log('unhandledRejection', error);
});

const bot = new BootBot({
    accessToken: config.facebook.accessToken,
    verifyToken: config.facebook.verifyToken,
    appSecret: config.facebook.appSecret,
});

bot.hear([/[ot|za]tvoren/i, /[ot|za]tvara/i], async (payload, chat) => {
    chat.say(`Otváracie hodiny - (pon - pia):
*FREEFOOD*: 7:30 - 15:30
*FAYNFOOD*: 7:30 - 15:00
*FAYNCOFFEE*: 7:30 - 15:30`);
});

bot.hear([/^v?d(ik[iy]?[cko]{0,3}|ak(a|uje+m))\s?(moc|pekne)?$/i, /^o?[kj]{1,2}|th(?:x|anks)$/i], async (payload, chat) => {
    chat.say('😉');
});

bot.hear([/^a[hj]o{1,12}j|ca{1,12}u(?:ko)?|nazda{1,12}r|cu{1,12}s|helou$/], async (payload, chat) => {
    const user = await chat.getUserProfile();
    const greeting = randomArrayElement(config.greetings);

    chat.say(`${greeting}, ${user.first_name}! 😄`);
});

bot.on('attachment', async (payload, chat, data) => {
    const attachment = payload.message.attachments[0];
    await chat.sendAction('mark_seen');
    console.log(attachment);
    // chat.say('Sorry, ale s fotkami zatiaľ robiť neviem. 😞')
});

bot.on('postback:OBED_DNES', async (payload, chat) => {
    await handleMessage({message: {text: 'Dnes'}}, chat);
});

bot.on('postback:OBED_ZAJTRA', async (payload, chat) => {
    await handleMessage({message: {text: 'Zajtra'}}, chat);
});

bot.on('message', async (payload, chat, data) => {
    if (data.captured) {
        return;
    }

    await handleMessage(payload, chat);
});

bot.setGetStartedButton(async (payload, chat) => {
    const user = await chat.getUserProfile();
    const greeting = randomArrayElement(config.greetings);

    chat.say(`${greeting}, ${user.first_name}! 😄`);
    chat.say(`Som *Obedbot* 🍽️ a vždy keď mi pošleš správu, tak ti poviem, čo je na obed. 🍗🍲🥗🍕`);
    chat.say(`Nezabudni o mne povedať v triede aby ste sa mi všetci dobre napapali. 😂`)
});

console.log('Starting FMFI UK Obedbot 1.0');
bot.setPersistentMenu([
    {
        "title": "🍴 Dnes",
        "type": "postback",
        "payload": "OBED_DNES"
    },
    {
        "title": "📅 Zajtra",
        "type": "postback",
        "payload": "OBED_ZAJTRA"
    }
]);
bot.start(config.port);