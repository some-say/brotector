function get_worker_response(fn) {
        try {
            const URL = window.URL || window.webkitURL;
            var fn = "self.onmessage=async function(e){postMessage(await (" + fn.toString() + ")())}";
            var blob;
            try {
                blob = new Blob([fn], { type: "application/javascript" });
            } catch (e) {
                // Backwards-compatibility
                window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
                blob = new BlobBuilder();
                blob.append(response);
                blob = blob.getBlob();
            }
            var url = URL.createObjectURL(blob);
            var worker = new Worker(url);
            var _promise = new Promise((resolve, reject) => {
                worker.onmessage = (m) => {
                    worker.terminate();
                    resolve(m.data);
                };
            });
            worker.postMessage("call");
            return _promise;
        } catch (e) {
            return new Promise((resolve, reject) => {
                reject(e);
            });
        }
    }

const startTime = new Date();
class Brotector {
  constructor(on_detection, interval=100) {
    // on_detection(data:dict)
    this._isMouseHooked = false

    this.on_detection = on_detection
    this.detections = []
    this._detections = []
    this.interval = interval
    this.init_done = this.init()
  }
  log(data){
    data["timeSinceLoad"] = ((new Date()).getTime() - startTime.getTime()) / 1000;
    this.detections.push(data)
    this._detections.push(data.detection)
    this.on_detection(data)
  }
  async init(){
    this.test_navigator_webdriver()
    this.test_stackLookup()
    this.test_window_cdc()
    this.hook_mouseEvents()
    setInterval(this.intervalled.bind(this), this.interval)
  }
  async intervalled(){
    this.test_stackLookup()
  }
  test_navigator_webdriver(){
    if(navigator.webdriver === true){
        this.log({detection:"navigator.webdriver"})
    }
  }
  test_window_cdc(){
    let matches = []
    for(let prop in window) {
       prop.match(/cdc_[a-z0-9]/ig) && matches.push(prop)
    }
    if(matches.length > 0){
        this.log({detection:"window.cdc", matches:matches})
    }
  }
  test_stackLookup() {
    const key = "runtime.enabled.stacklookup"
    if (!(this._detections.includes(key))){
        let stackLookup = false;
        const e = new Error()
        // there might be several ways to catch property access from console print functions
        Object.defineProperty(e, 'stack', {
            configurable: false,
            enumerable: false,
            get: function() {
                stackLookup = true;
                return '';
                }
            });
        console.debug(e);
        if(stackLookup){this.log({detection:key})}
    }
  }
  hook_mouseEvents(window) {
    if (!this._isMouseHooked){
        for (event of ["mousedown", "mouseup", "mousemove", "click", "touchstart", "touchend", "touch", "scroll"]){
            document.addEventListener(event,this.mouseEventHandler.bind(this))
        }
    }
  }
  mouseEventHandler(e) {
    const key = "Input.cordinatesLeak"
    var is_touch = false
    if (e.type == "touchstart") {
            is_touch = true;
            e = e.touches[0] || e.changedTouches[0];
        }
    var is_bot = e.pageY == e.screenY && e.pageX == e.screenX;
    if (is_bot && 1 >= outerHeight - innerHeight) {
            // fullscreen
            is_bot = false;
        };
    if (is_bot && is_touch && navigator.userAgentData.mobile) {
            is_bot = "maybe"; // mobile touch can have e.pageY == e.screenY && e.pageX == e.screenX
        }
    if (e.isTrusted === false) {
            is_bot = true;
        }
    if (is_bot){
        this.log({"detection":key, "type":e.type, "is_bot":is_bot})
    }
  }
}