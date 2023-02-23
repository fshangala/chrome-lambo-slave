let betSite = null
let defaultBetSite = {
  "id": 2,
  "name": "lotus365.com",
  "url": "https://lotus365.com",
  "bet_buttons": ".SportEvent__market .odd-button",
  "input_elements": ".SportEvent__market ion-input input",
  "odds_input": 0,
  "stake_input": 1,
  "alt_stake_input": 0,
  "betslip_buttons": ".DesktopBetPlacing-container .DesktopBetPlacing__bottomBtns-placeBet",
  "confirm_button": 0
}

function confirmBet(betSite){
  if(betSite){
    document.querySelector(betSite.betslip_buttons).click();
  } else {
    chrome.storage.sync.get({
      host:"localhost",
      port:8000,
      code:"sample",
      betSite:JSON.stringify(defaultBetSite),
      stake:200,
    },(items)=>{
      betSite = JSON.parse(items.betSite);
      document.querySelector(betSite.betslip_buttons).click();
    });
  }
}

chrome.storage.sync.get({
  host:"localhost",
  port:8000,
  code:"sample",
  betSite:JSON.stringify(defaultBetSite),
  stake:200,
},(items)=>{
  betSite = JSON.parse(items.betSite)
});

let lambo_port = chrome.runtime.connect({name:"chrome_lambo"});
lambo_port.onMessage.addListener((msg)=>{
  console.log(msg)
  switch (msg.event) {
    case "confirm_bet":
      confirmBet();
      break;

    case "click":
      confirmBet();
      break;

    default:
      break;
  }
})