let socket = null;
let betSite = null;
let ports = [];
let data_sync = [];

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
      deviceId: new Date().getTime(),
      data_sync:[]
    },(items)=>{
      socket = new WebSocket(`ws://${items.host}:${items.port}/ws/pcautomation/${items.code}/`);
      socket.addEventListener('open',(event)=>{
        betSite = JSON.parse(items.betSite)
        chrome.runtime.getPlatformInfo((platformInfo)=>{
          var manifestData = chrome.runtime.getManifest();
          socket.send(JSON.stringify({
            event_type:"connection",
            event:"pc_connected",
            args:[`${items.deviceId}->${platformInfo.os}:chrome_lambo_slave:${manifestData.version}`],
            kwargs:{
              logins:items.data_sync
            }
          }));
        });
        chrome.action.setBadgeText({
          "text":"ON"
        });
        showNotification(`Connection established!`);
        chrome.tabs.update({
          url:betSite.url
        });
        chrome.storage.sync.set(
          {
            data_sync:[]
          },
          ()=>{
            return null;
          }
        );
      });
      socket.addEventListener('error',(event)=>{
        showNotification(`Connection ${event.type}`);
        chrome.action.setBadgeText({
          "text":"OFF"
        });
      });
      socket.addEventListener('close',(event)=>{
        showNotification(`Connection closed`);
        chrome.action.setBadgeText({
          "text":"OFF"
        });
        socket = null;
      });
      socket.addEventListener('message',(event)=>{
        var data = JSON.parse(event.data);
        if(ports.length > 0){
          ports.forEach(
            (port) => {
              try {
                port.postMessage(data);
              } catch (error) {
                console.log(error);
              }
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
        callback(null);
      }
    );
  });
}

function loginUser(details){
  if(socket){
    if(socket.readyState == socket.OPEN){
      socket.send(JSON.stringify({
        event_type:"user",
        event:"loggedIn",
        args:[details.user,details.url,details.datetime],
        kwargs:{}
      }));
    } else {
      socket.close();
      socket = null;
      createConnection();
      loginUser(details);
    }
  } else {
    chrome.storage.sync.get(
      {
        data_sync:[]
      },
      (items)=>{
        data_sync = items.data_sync
        data_sync.push(
          {
            user:details.user,
            url:details.url,
            datetime:details.datetime
          }
        );
        chrome.storage.sync.set(
          {
            data_sync:data_sync
          },
          ()=>{
            return null;
          }
        );
      }
    );
  }
}

chrome.runtime.onInstalled.addListener(()=>{
  chrome.action.setBadgeText({
    "text":"OFF"
  });
  var currentDate = new Date();
  chrome.storage.sync.set(
    {
      deviceId:currentDate.getTime()
    },
    ()=>{
      showNotification(`Chrome Lambo Slave installed: ${currentDate.getTime()}`);
    }
  );
});

chrome.action.onClicked.addListener((tab) => {
  chrome.action.setBadgeText({
    "text":"..."
  });
  createConnection();
});

chrome.runtime.onConnect.addListener((my_port)=>{
  my_port.onMessage.addListener((msg)=>{
    switch (msg.command) {
      case "update_betsites":
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
        break;
      
      case "login_user":
        loginUser(msg.kwargs);
        break;
    
      default:
        break;
    }
  });
  ports.push(my_port);
});