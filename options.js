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
  ].join('')
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
    betSite:"",
    stake:200,
  },(items)=>{
    document.querySelector("#host").value = items.host;
    document.querySelector("#port").value = items.port;
    document.querySelector("#code").value = items.code;
    document.querySelector("#betSite").value = items.betSite;
    document.querySelector("#stake").value = items.stake;
    renderGoBtn(items.betSite);
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

function renderGoBtn(betsite_id){
  chrome.storage.sync.get({
    betsites:[],
  },(items)=>{
    if(items.betsites.length > 0){
      items.betsites.forEach(
        (betsite)=>{
          if(betsite.id == betsite_id){
            document.querySelector("#goBtn").setAttribute("href",betsite.url);
          }
        }
      );
    }
  });
}

let lambo_port = chrome.runtime.connect({name:"chrome_lambo_options"});
lambo_port.onMessage.addListener(
  (msg)=>{
    switch (msg.command) {
      case "update_betsites_response":
        try {
          renderSelectBetsites(msg.kwargs.betsites);
        } catch (error) {
          console.log(error);
          chrome.storage.sync.get({
            betsites:[]
          },(items)=>{
            renderSelectBetsites(items.betsites);
          });
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

document.querySelector("#form").addEventListener("submit",(event)=>{
  event.preventDefault()
  var host = document.querySelector("#host").value
  var port = document.querySelector("#port").value
  var code = document.querySelector("#code").value
  var betSite = document.querySelector("#betSite").value
  var stake = document.querySelector("#stake").value
  console.log(betSite)
  var optionsObject = {
    host:host,
    port:port,
    code:code,
    betSite:betSite,
    stake:stake
  }
  saveOptions(optionsObject,()=>{
    var liveToast = new bootstrap.Toast(toastTemplate("Options saved!"))
    liveToast.show()
  })
});

