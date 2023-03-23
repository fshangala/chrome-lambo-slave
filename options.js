function checkUpdate(){
  fetch("https://api.github.com/repos/fshangala/chrome-lambo-slave/releases").then(response=>response.json()).then(
    (json)=>{
      var manifestData = chrome.runtime.getManifest();
      var button = document.querySelector("#card-header a");
      if(`v${manifestData.version}` !== json[0].tag_name){
        document.querySelector("#card-header").removeAttribute("hidden");
        button.setAttribute("href",json[0].html_url);
        button.innerText = `Download the latest version ${json[0].tag_name}`;
      } else {
        document.querySelector("#card-header").setAttribute("hidden");
      }
    }
  ).catch(
    (error)=>{
      console.log(error);
    }
  );
}

function toastTemplate(message){
  var toastContainer = document.querySelector("#toast-container")
  var toast = [
    '<div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">',
    '  <div class="toast-header">',
    '    <img src="images/icon.png" width="30" height="30" class="rounded me-2" alt="chrome-lambo">',
    '    <strong class="me-auto">Chrome Lambo</strong>',
    '    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>',
    '  </div>',
    '  <div class="toast-body">',
    `  ${message}`,
    '  </div>',
    '</div>'
  ].join('');
  var div = document.createElement("div")
  div.innerHTML = toast.trim()
  return toastContainer.appendChild(div.firstChild)
}
function saveOptions(data,callBack){
  chrome.storage.sync.set(data,()=>{
    callBack()
  })
}
function restoreOptions(){
  chrome.storage.sync.get({
    host:"localhost",
    port:8000,
    code:"sample",
    betSite:0,
    stake:200,
    deviceId:null,
  },(items)=>{
    document.querySelector("#host").value = items.host;
    document.querySelector("#port").value = items.port;
    document.querySelector("#code").value = items.code;
    document.querySelector("#betSite").value = items.betSite;
    document.querySelector("#stake").value = items.stake;
    document.querySelector("#deviceId").innerText = `Device ID: ${items.deviceId}`;
    renderGoBtn();
  });
}
function renderSelectBetsites(betsites){
  var select = document.querySelector("#betSite");
  betsites.forEach(
    (betsite)=>{
      var option = document.createElement("option");
      option.setAttribute("value",betsite.id);
      option.innerText = betsite.name;
      select.appendChild(option);
    }
  );
}

function renderGoBtn(){
  chrome.storage.sync.get({
    betSite:0,
    betsites:[]
  },(items)=>{
    if(items.betsites.length > 0){
      items.betsites.forEach(
        (betsite)=>{
          if(betsite.id == items.betSite){
            var goBtn = document.querySelector("#goBtn")
            goBtn.setAttribute("href",betsite.url);
            goBtn.innerText = `Go to ${betsite.name}`;
            goBtn.classList.remove("disabled");
          }
        }
      );
    }
  });
}

function renderVersion(){
  var manifestData = chrome.runtime.getManifest();
  document.querySelector("#version-badge").innerText = `v${manifestData.version}`;
}

let lambo_port = chrome.runtime.connect({name:"chrome_lambo_options"});
lambo_port.onMessage.addListener(
  (msg)=>{
    switch (msg.command) {
      case "update_betsites_response":
        if(msg.kwargs.betsites){
          renderSelectBetsites(msg.kwargs.betsites);
        } else {
          chrome.storage.sync.get({
            betsites:[]
          },(items)=>{
            renderSelectBetsites(items.betsites);
          });
          var liveToast = new bootstrap.Toast(toastTemplate("Failed to load betsites from the server. Loaded local betsites."));
          liveToast.show();
        }
        break;
    
      default:
        break;
    }
  }
);
lambo_port.postMessage({
  command:"update_betsites",
  kwargs:null
});
restoreOptions();

document.querySelectorAll("form").forEach(
  (form)=>{
    form.addEventListener(
      "submit",
      (event)=>{
        event.preventDefault();
        console.log(form.getAttribute("id"));
        var theForm = new FormData(form);
        switch (form.getAttribute("id")) {
          case "connection-settings-form":
            saveOptions(
              {
                host:theForm.get("host"),
                port:theForm.get("port"),
                code:theForm.get("code"),
              },
              ()=>{
                window.location.reload();
              }
            );
            break;
          
          case "betsite-settings-form":
            saveOptions(
              {
                betSite:theForm.get("betSite"),
                stake:theForm.get("stake")
              },
              ()=>{
                var liveToast = new bootstrap.Toast(toastTemplate("Bet site settings saved!"));
                liveToast.show();
                renderGoBtn();
              }
            );
        
          default:
            break;
        }
      }
    );
  }
);

renderVersion();
checkUpdate();
/*
document.querySelector("#form").addEventListener("submit",(event)=>{
  event.preventDefault()
  var betSite = document.querySelector("#betSite").value
  var stake = document.querySelector("#stake").value
  var optionsObject = {
    betSite:betSite,
    stake:stake
  }
  saveOptions(optionsObject,()=>{
    var liveToast = new bootstrap.Toast(toastTemplate("Options saved!"))
    liveToast.show()
  })
});
*/