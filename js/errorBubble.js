class ErrorBubble{
    constructor(scene, tstr, timeout){
        this.scene = scene;
        this.tstr = tstr;
        this.timeout = timeout;
    }

    show(){
        let errorBubble = document.createElement("div");
        errorBubble.classList.add("errorBubble");
        this.errorBubble = errorBubble;

        let span = document.createElement("span");
        span.innerHTML = setTSTR(this.tstr);
        errorBubble.appendChild(span);

        document.body.appendChild(errorBubble);

        window.setTimeout(() => {
            this._remove();
        }, this.timeout);
    }

    _remove(){
        this.errorBubble.remove();
    }
}