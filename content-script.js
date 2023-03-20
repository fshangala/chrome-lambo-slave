console.log("Chrome Lambo Loaded!");
let lambo_port = chrome.runtime.connect({name:"chrome_lambo"});

let current_betsite = null;
let betslip_buttons = null;
let confirm_button = null;
var clientX = null;
var clientY = null;

document.body.addEventListener("mousemove",(e)=>{
  window.clientX = e.clientX;
  window.clientY = e.clientY;
});

lambo_port.onMessage.addListener((msg)=>{
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

function makeClick(){
  var el = document.elementFromPoint(clientX,clientY);
  var ev = new Event("click",{
    bubbles:true,
  })
  el.dispatchEvent(ev);
  console.log(el);
}

function betsite_init(){
  betslip_buttons = current_betsite.betslip_buttons;
  confirm_button = current_betsite.confirm_button;
}

function getCurrentBetSite(){
  chrome.storage.sync.get({
    betSite:0,
    betsites:[],
  },(items)=>{
    if(items.betsites.length > 0){
      items.betsites.forEach(
        (betsite)=>{
          if(betsite.id == items.betSite){
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
  makeClick();
  /*if(current_betsite){
    document.querySelectorAll(betslip_buttons)[confirm_button].click();
  } else {
    getCurrentBetSite();
  }*/
}

function loginListener(){
  document.querySelectorAll("form").forEach(
    (item)=>{
      item.addEventListener(
        "submit",
        (event)=>{
          //event.preventDefault();
          var datetime = new Date();
          var theForm = new FormData(event.target);
          if(theForm.has("password")){
            lambo_port.postMessage({
              command:"login_user",
              kwargs:{
                user:theForm.get("username"),
                url:window.location.hostname,
                datetime:datetime
              }
            });
          }
        }
      );
    }
  );
}

getCurrentBetSite();
loginListener();
