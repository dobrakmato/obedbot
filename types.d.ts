// Business

interface Dish {
    name: string;
    price: string;
}

interface Canteen {
    name: string;
    url: string;
}

interface Menu {
    canteen: Canteen;
    soup?: Dish;
    dishes: Dish[];
}

// Presentational

interface ListItem {
    title: string;
    subtitle: string;
    image?: string;
}

type ListItems =
    [ListItem]
    | [ListItem, ListItem]
    | [ListItem, ListItem, ListItem]
    | [ListItem, ListItem, ListItem, ListItem];

interface ListView {
    items: ListItems;
}