let socket = null
let betSite = null
let port = null

function showNotification(message){
  chrome.notifications.create(Date.now().toString(),{
    type:"basic",
    iconUrl: "images/icon.png",
    title:"Chrome Lambo Slave",
    message:message
  });
}

function createConnection(){
  if(socket){
    socket.close();
  }
  var defaultBetSite = {
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
  chrome.storage.sync.get({
    host:"localhost",
    port:8000,
    code:"sample",
    betSite:JSON.stringify(defaultBetSite),
    stake:200,
  },(items)=>{
    socket = new WebSocket(`ws://${items.host}:${items.port}/ws/pcautomation/${items.code}/`)
    socket.addEventListener('open',(event)=>{
      betSite = JSON.parse(items.betSite)
      socket.send(JSON.stringify({
        event_type:"connection",
        event:"pc_connected",
        args:["chrome_connected"],
        kwargs:{}
      }));
      chrome.action.setBadgeText({
        "text":"ON"
      });
      chrome.tabs.update({
        url:betSite.url
      })
    });
    socket.addEventListener('error',(event)=>{
      showNotification(`Connection error: ${event.target.url}`);
      chrome.action.setBadgeText({
        "text":"OFF"
      });
    });
    socket.addEventListener('close',(event)=>{
      showNotification(`Connection closed`);
      chrome.action.setBadgeText({
        "text":"OFF"
      });
    });
    socket.addEventListener('message',(event)=>{
      var data = JSON.parse(event.data);
      if(port){
        port.postMessage(data)
      }
    });
  });
}

chrome.runtime.onInstalled.addListener(()=>{
  chrome.action.setBadgeText({
    "text":"OFF"
  });
  chrome.runtime.openOptionsPage();
});

chrome.action.onClicked.addListener((tab) => {
  chrome.action.setBadgeText({
    "text":"..."
  });
  createConnection();
});

chrome.runtime.onConnect.addListener((my_port)=>{
  port = my_port
  port.onMessage.addListener((msg)=>{
    console.log(msg);
  });
});