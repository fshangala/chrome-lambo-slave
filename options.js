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
    document.querySelector("#host").value = items.host
    document.querySelector("#port").value = items.port
    document.querySelector("#code").value = items.code
    document.querySelector("#betSite").value = items.betSite
    document.querySelector("#stake").value = items.stake
  })
}
restoreOptions()

document.querySelector("#form").addEventListener("submit",(event)=>{
  event.preventDefault()
  var host = document.querySelector("#host").value
  var port = document.querySelector("#port").value
  var code = document.querySelector("#code").value
  var betSite = document.querySelector("#betSite").value
  var stake = document.querySelector("#stake").value
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
})