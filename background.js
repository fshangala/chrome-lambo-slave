let socket = null
let betSite = null
let ports = []

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
    socket = null;
  } else {
    chrome.storage.sync.get({
      host:"localhost",
      port:8000,
      code:"sample",
      betSite:0,
      stake:200,
    },(items)=>{
      socket = new WebSocket(`ws://${items.host}:${items.port}/ws/pcautomation/${items.code}/`);
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
        });
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
        if(ports.length > 0){
          ports.forEach(
            (port) => {
              port.postMessage(data);
            }
          );
        }
      });
    });
  }
}

function updateBetsites(callback) {
  chrome.storage.sync.get({
    host:"localhost",
    port:8000
  },(items)=>{
    fetch(`http://${items.host}:${items.port}/api/betsite-desktop/`).then(response => response.json()).then(
      (json)=>{
        chrome.storage.sync.set({
          betsites:json
        });
        callback(json);
      }
    ).catch(
      (error)=>{
        callback(error);
      }
    );
  });
}

chrome.runtime.onInstalled.addListener(()=>{
  chrome.action.setBadgeText({
    "text":"OFF"
  });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.action.setBadgeText({
    "text":"..."
  });
  createConnection();
});

chrome.runtime.onConnect.addListener((my_port)=>{
  my_port.onMessage.addListener((msg)=>{
    console.log(msg);
    if(msg.command == "update_betsites"){
      updateBetsites(
        (betsites)=>{
          my_port.postMessage({
            command:"update_betsites_response",
            kwargs:{
              betsites: betsites
            }
          });
        }
      );
    }
  });
  ports.push(my_port);
});