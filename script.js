const api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbHVlIjoiNjVjYzg5MGUxNDBjZmQ3MjNkYTk5YzVhIiwiaWF0IjoxNzA3OTAzMjQ2LCJleHAiOjMzMjEyMzY3MjQ2fQ.kskaa0ChRD0BzQw66q4hNBiiA3j6fCM2zHDR6zuvD1o";
const coin_out = document.getElementById("coin_w");
const usdt_out = document.getElementById("usdt_w");
const status_out = document.getElementById("status");
const coinSelect = document.getElementById('s_coin');
const indicatorSelect = document.getElementById('s_indicator');
const strategySelect = document.getElementById('s_strategy');
const money_btn = document.getElementById("add_money");
const start_btn = document.getElementById("start");
const addMoneyInput = document.getElementById('specificSizeInputName');
money_btn.addEventListener("click", addMoney);
start_btn.addEventListener("click", start);
let intervalId;
let wallet = {
    "usdt":0,
    "coin":0
};
let k = 0;
let noOfGrids = 100;
let grid = [];
var buy_trades = [];
let minRange = 0;
let maxRange = 0;

function addMoney(){
    const moneyToAdd = parseInt(addMoneyInput.value);
    if (!isNaN(moneyToAdd) && moneyToAdd > 0) {
        wallet.usdt += moneyToAdd;
        usdt_out.innerText = wallet.usdt;
        addMoneyInput.value = "";
    } else {
        status_out.innerText = "Please enter a valid amount.";
    }
}

function start(){
    const selectedCoin = coinSelect.value;
    const selectedIndicator = indicatorSelect.value;
    const selectedStrategy = strategySelect.value;
    console.log(selectedStrategy);
    status_out.innerText = `Starting ...`;
    if(selectedStrategy == "grid"){
        gridStrategy(selectedIndicator, selectedCoin);
        
    }
    else{
        clearInterval(intervalId);
        intervalId = setInterval(() => {
            normalStrategy(selectedIndicator, selectedCoin);
        }, 60000);
    }
    
    
    
}

async function call(coin, i) {
    const url = `https://api.taapi.io/${i}?secret=${api_key}&exchange=binance&symbol=${coin}/USDT&interval=1m`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        status_out.innerText = data.value;
        return data.value;
        
    } catch (error) {
        status_out.innerText = "Error fetching data:", error;
        throw error;
    }
}

async function Decide(rsi) {
    if(20 >= rsi){
        return "100b";
    }
    if( rsi > 20 && rsi <= 30){
        return "80b";
    }
    if( rsi > 30 && rsi <= 35){
        return "60b";
    }
    if( rsi > 35 && rsi < 40){
        return "40b";
    }

    if( rsi > 40 && rsi <= 45){
        return "20b";
    }
    if(rsi > 45 && rsi <= 60){
        return "0b";
    }
    if(rsi >60 && rsi <= 65){
        return "20s";
    }
    if(rsi >65 && rsi <= 70){
        return "50s";
    }
    if(rsi >70 && rsi <= 75){
        return "80s";
    }
    if(rsi >75 ){
        return "100s";
    }
}


async function normalStrategy(ind , sym){
    try {
        const c_value = sym;
        const i_value = ind;
        const rsi_v = await call(c_value , i_value);
        console.log(rsi_v);
        let result = await Decide(rsi_v);
        console.log(result);
        let l_char = result.substring(result.length - 1);
        let per = parseInt(result.substring(0, result.length - 1));
        if (l_char == "b") {
            if (per == 0) {
                status_out.innerText = `This is inappropriate time to buy/sell.\nCurrent RSI value = ${rsi_v}`;
                
            } else {
                status_out.innerText = `Buy Order.\nCurrent RSI value = ${rsi_v}`;
                if (wallet.usdt != 0){
                    console.log(wallet.usdt);
                    setTimeout(async () => {
                        let price_v = await call(c_value, "price");
                        status_out.innerText = `Trade is executed at ${price_v}`;
                        wallet.coin += (wallet.usdt * (per / 100)) / price_v;
                        wallet.usdt -= (wallet.usdt * (per / 100));
                        usdt_out.innerText = wallet.usdt;
                        coin_out.innerText = wallet.coin;
                    }, 18000);
                }
                else{
                    status_out.innerText = `Insufficient Balance in usdt wallet`;
                }
                
            }
        } else {
            if(wallet.coin !=0){
                status_out.innerText = `Sell Order.\nCurrent RSI value = ${rsi_v}`;
                setTimeout(async () => {
                    let price_v = await call(c_value, "price");
                    status_out.innerText = `Trade is executed at ${price_v}`;
                    wallet.usdt += price_v * (wallet.coin * (per / 100));
                    wallet.coin -= (wallet.coin * (per / 100));
                    usdt_out.innerText = wallet.usdt;
                    coin_out.innerText = wallet.coin;
                }, 18000);
                
            }
            else{
                status_out.innerText = `Insufficient coin in ${c_value} wallet.`;
            }
            
        }
    } catch (error) {
        status_out.innerText = "Error: " + error.message;
    }
}


async function Decide_Grid(rsi) {
    if(20 >= rsi){
        return "0330";
    }
    if( rsi > 20 && rsi <= 30){
        return "0627";
    }
    if( rsi > 30 && rsi <= 35){
        return "0924";
    }
    if( rsi > 35 && rsi < 40){
        return "1221";
    }

    if( rsi > 40 && rsi <= 45){
        return "1518";
    }
    if(rsi > 45 && rsi <= 60){
        return "1815";
    }
    if(rsi >60 && rsi <= 65){
        return "2112";
    }
    if(rsi >65 && rsi <= 70){
        return "2409";
    }
    if(rsi >70 && rsi <= 75){
        return "2706";
    }
    if(rsi >75 ){
        return "3003";
    }
}

async function call_Grid(coin, i) {
    try {
        var interval = "5m";
        if(i == "rsi"){
            interval = "1d";
        }
        const url = `https://api.taapi.io/${i}?secret=${api_key}&exchange=binance&symbol=${coin}/USDT&interval=${interval}`;
        
        const response = await fetch(url);
        const data = await response.json();
        status_out.innerText = data.value;
        return data.value;
        
    } catch (error) {
        status_out.innerText = "Error fetching data:", error;
        throw error;
    }
}

async function action(c_value){
    setTimeout(async() => {status_out.innerText = "Loading ...";},1000);
    
    let buy_trades = [];
    setTimeout(async() => {
        
        var price =  await call_Grid(c_value,"price");
        for (let j = 0; j< noOfGrids;j++){
            if(grid[j] < price){
                buy_trades.push(grid[j])
            }
        }
        var kTemp = buy_trades.length;
        console.log("kTemp",kTemp);
        wallet.usdt +=  (kTemp - k) * 100;
        wallet.coin -= (kTemp - k) * 100/ price;
        if(kTemp > k){
            status_out.innerText = `Sell Order\nSold ${kTemp - k} Units at ${price}`;
        }
        else{
            status_out.innerText = `Buy Order\nBought ${k - kTemp} Units at ${price}`;
        }
        usdt_out.innerText = wallet.usdt;
        coin_out.innerText = wallet.coin;
        k = kTemp;

    }, 17000);
}



async function gridStrategy(ind , sym){
    const c_value = sym;
    const i_value = ind;
    const rsi_v = await call_Grid(c_value , i_value);
    var result =  await Decide_Grid(rsi_v);
    let perMin = parseInt(result.substring(0, 2))/100;
    let perMax = parseInt(result.substring(2,4))/100;
    status_out.innerText = "Calculating Grid ...";
    setTimeout(async () => {
        var price =  await call_Grid(c_value,"price");
        minRange = price - (price*perMin);
        console.log(minRange);
        maxRange = price + (price*perMax);
        for(let i = 0; i<noOfGrids; i++){
            let r = Math.pow((maxRange/minRange),1/(noOfGrids-1));
            let value = minRange * Math.pow(r,i);
            grid.push(value);
        }
        for (let j = 0; j< noOfGrids;j++){
            if(grid[j] < price){
                buy_trades.push(grid[j])
            }
        }
        console.log("Buy grids is ",buy_trades);
        // Order for initial buying
        k = buy_trades.length;
        console.log("k", k);
        var baseCap = wallet.usdt/100;
        var buyMoney = (100-k)* baseCap;
        console.log(buyMoney);
        var remainingUsd = k * baseCap;
        console.log(remainingUsd);
        //  wallet after initial buying
        wallet.usdt -= buyMoney;
        wallet.coin += buyMoney/price;
        status_out.innerText = `Initial Buy Order.\nTrade executed at ${price}`;
        usdt_out.innerText = wallet.usdt;
        coin_out.innerText = wallet.coin;
    }, 17000);
    status_out.innerText = "Initializing Bot ...";
    clearInterval(intervalId);
    intervalId = setInterval(() => {
        action(c_value);
    }, 60000);
    
    
    
}


