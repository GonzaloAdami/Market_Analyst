// ------------ AUTHOR: GONZALO EZEQUIEL ADAMI ---------
// @Copyrigth GONZALO EZEQUIEL ADAMI 2024 
// ----------------------------------------------------



// -----------------------------------------------   CLASSES   ---------------------------------------------------

// ------------ CLASS FOR MARKETS ---------
class Market {
    constructor(name, value, Percent_Change) {
        this.name = name;
        this.value =  value;
        this.Percent_Change = Percent_Change;
    }
}

// ----------- CLASS FOR THE DAY -------------------
class Day {
    constructor(day, market) {
        this.day = day;
        this.market = market;
    }
}
    
// -----------------------------------------------   VARIABLES   ---------------------------------------------------

// ------- ALL VARIABLES TO BE USED -------
const apiKey = 'CXndlmAFTKZepZv8BLWQYtIg9HCY01bx';
const symbol = 'O:SPY251219C00650000';

let companyNames = [];
let markets = [];
let positiveMarkets = [];
let negativeMarkets = [];
let days = [];
let month = [];


// -----------------------------------------------   FUNCTIONS   ---------------------------------------------------

// --------- AUXILIARY FUNCTIONS ------------
function calculateImprovementPercent_Change(currentValue, previousValue) {
    return ((currentValue - previousValue) / previousValue) * 100;
}

function clearConsole() {
    console.clear();
}
// ---------  ADD MARKETS ---------
function addMarket(name, value, Percent_Change) {
    let newMarket = new Market(name, value, Percent_Change);
    markets.push(newMarket);
    console.log("\x1b[33mNew market added!\x1b[0m");
    displayMarkets();
}




// ---------------- OBTAIN MARKET DATA ----------------

//OBTAIN DATA FOR EACH COMPANY
function fetchCompanyData(symbol) {
    return fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/2023-01-09/2023-01-09?adjusted=true&sort=asc&limit=120&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data.results)) {
                data.results.forEach(result => {
                    const companyName = symbol;
                    const stockValue = result.c;
                    const Percent_ChangeImprovement = calculateImprovementPercent_Change(result.c, result.o);
                    addMarket(companyName, stockValue, Percent_ChangeImprovement);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

//OBTAIN COMPANY NAMES
function fetchCompanyNames() {
    return fetch(`https://api.polygon.io/v3/reference/tickers?active=true&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(result => {
                const companyName = result.ticker;
                companyNames.push(companyName);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

//POST OBTAINED INFORMATION
function postCompanies() {
    return Promise.all(companyNames.map(symbol => fetchCompanyData(symbol)))
        .then(() => {
            analyzeMarket();
            displayMarkets();
        });
}


// ----------------- MAIN FUNCTIONS -------------------


//DETERMINE POSITIVE AND NEGATIVE MARKETS
function analyzeMarket() {
    positiveMarkets = markets.filter(market => market.Percent_Change > 0);
    negativeMarkets = markets.filter(market => market.Percent_Change <= 0);
}

//CONSOLE INTERFACE
function displayMarkets() {
    console.clear();
    process.stdout.write('\x1b[F\x1b[F\x1b[F\x1b[F\x1b[F\x1b[F');
    console.log("\x1b[36m---------------------\x1b[0m");
    console.log("\x1b[37mProfits:\x1b[0m");

    for (let market of positiveMarkets) {
        console.log(`- Name: \x1b[33m${market.name}\x1b[0m, Value: \x1b[32m$${market.value}\x1b[0m, Percent_Change: \x1b[36m${market.Percent_Change}%\x1b[0m`);
    }

    console.log("\x1b[36m---------------------\x1b[0m");
    console.log("\x1b[37mLosses:\x1b[0m");

    for (let market of negativeMarkets) {
        console.log(`- Name: \x1b[33m${market.name}\x1b[0m, Value: \x1b[32m$${market.value}\x1b[0m, Percent_Change: \x1b[36m${market.Percent_Change}%\x1b[0m`);
    }

    console.log("\x1b[36m---------------------\x1b[0m");
    console.log("\x1b[37mRecord of all markets:\x1b[0m");
    console.log("\x1b[36m-----\x1b[0m");

    for (let day of days) {
        console.log(`Day: \x1b[34m${day.day}\x1b[0m`);
        console.log("\x1b[36mMarkets:\x1b[0m");

        for (let market of day.market) {
            console.log(`- Name: \x1b[33m${market.name}\x1b[0m, Value: \x1b[32m$${market.value}\x1b[0m, Percent_Change: \x1b[36m${market.Percent_Change}%\x1b[0m`);
        }

        console.log("\x1b[36m-----\x1b[0m");
    }
}



// ----------------- FINISH MARKET AND ADD DAYS -------------------
function finishMarket() {
    let copiedMarkets = [...markets];
    let newDay = new Day(days.length + 1, copiedMarkets);
    days.push(newDay);
    if (days.length === 30) {
        month.push(days);
        days = [];
    }
    markets = [];
}

// ------------ START AND UPDATE FUNCTIONS ------------
fetchCompanyNames()
    .then(() => postCompanies())
    .catch(error => {
        console.error('Error fetching tickets:', error);
    });

// Update and display markets every 60 seconds
setInterval(() => {
    finishMarket();
    postCompanies();
}, 60000);

// Clear console every 60 seconds
setInterval(clearConsole, 59999);
