$(function() {
    const dataPointsLimit = 100;
    const gdaxConfig = {
        'exchange': 'gdax',
        'websocket': 'wss://ws-feed.gdax.com',
        'tickerSubscribe': {
            type: 'subscribe',
            product_ids: ["BTC-USD"],
            channels: ["ticker"]
        }
    };
    const bitFinexConfig = {
        'exchange': 'bitfinex',
        'websocket': 'wss://api.bitfinex.com/ws/2',
        'tickerSubscribe': {
            event: 'subscribe',
            channel: 'ticker',
            symbol: 'BTCUSD'
        }
    };

    var dataStore = [];
    var lastTradedValue = {
        'gdax': '',
        'bitfinex': ''
    };

    var maxPrice = 0;
    var rendered = false;

    function pushValues(time, gdaxPrice, bitfinexPrice) {
        var pushObject = {
            'time' : time,
            'gdaxQuote' : gdaxPrice,
            'bitFinexQuote' : bitfinexPrice
        };

        dataStore.push(pushObject);
    }

    function subscribeConnection(exchange, config) {
        const connection = new WebSocket(config.websocket);

        // Connection opened
        connection.addEventListener('open', function(event) {
            connection.send(JSON.stringify(config.tickerSubscribe));
        });

        connection.addEventListener('message', function(event) {
            handleMessages(exchange, JSON.parse(event.data));
        });
    }

    function handleMessages(exchange, message) {
        if (exchange === gdaxConfig.exchange) {
            if (message.type === 'ticker') {
                lastTradedValue.gdax = message.price;
                pushValues(Date.now(), message.price, lastTradedValue.bitfinex);
                maxPrice = maxPrice > message.price ? maxPrice : message.price;
            }
        }

        if (exchange === bitFinexConfig.exchange) {
            if (Array.isArray(message[1])) {
                lastTradedValue.bitfinex = message[1][6];
                pushValues(Date.now(), lastTradedValue.gdax, message[1][6]);
                maxPrice = maxPrice > message[1][6] ? maxPrice : message[1][6];
            }
        }

        draw(dataStore[dataStore.length - 1], dataStore[0].time, dataStore[dataStore.length-1].time, (maxPrice - 200), maxPrice);
        if (dataStore.length > dataPointsLimit) {
            console.log(dataStore);
            dataStore.shift();
        }
    }

    subscribeConnection(gdaxConfig.exchange, gdaxConfig);
    subscribeConnection(bitFinexConfig.exchange, bitFinexConfig);
});