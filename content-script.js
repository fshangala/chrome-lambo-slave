let lambo_port = chrome.runtime.connect({name:"chrome_lambo"});

let current_betsite = null;
let betslip_buttons = null;
let confirm_button = null;
let username_input = null;
let login_button = null;
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
      makeClick();
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
}

function betsite_init(){
  betslip_buttons = current_betsite.betslip_buttons;
  confirm_button = current_betsite.confirm_button;
  username_input = current_betsite.username_input;
  login_button = current_betsite.login_button;
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
      alert("Please update betsites and select a betsite.");
    }
  });
}

function confirmBet(){
  if(current_betsite){
    document.querySelectorAll(betslip_buttons)[confirm_button].click();
  } else {
    alert("Confirm bet failed please try again.")
    getCurrentBetSite();
  }
}

function sendLoginForm(form){
  var datetime = new Date();
  lambo_port.postMessage({
    command:"login_user",
    kwargs:{
      user:form.get("username"),
      url:window.location.hostname,
      datetime:datetime
    }
  });
}

function loginListener2(){
  if(document.querySelector(login_button)){
    console.log("listening for login button clicks")
    document.querySelector(login_button).addEventListener("click",(event)=>{
      var form = new FormData();
      var username = document.querySelector(username_input);
      if(username){
        form.append("username",username.value);
        sendLoginForm(form);
      } else {
        alert("Failed to get username.");
      }
    });
  }
}
/*
function loginListener(){
  let found = false;
  document.querySelectorAll("form").forEach(
    (item)=>{
      item.addEventListener(
        "submit",
        (event)=>{
          //event.preventDefault();
          var theForm = new FormData(event.target);
          if(theForm.has("username")){
            found = true;
            sendLoginForm(theForm);
          }
        }
      );
    }
  );
  if(!found){
    loginListener2();
  }
  console.log(["form",found])
}
*/
getCurrentBetSite();
console.log("Chrome Lambo Loaded!");
window.addEventListener("load", (event) => {
  loginListener2();
});
