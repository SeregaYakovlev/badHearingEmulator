class MyBinaryButton {
    constructor() {
        this.btn = document.createElement("button");
        this.btn.classList.add("myBtn");
        this.btn.addEventListener("click", () => {
            this._onClick();
        });
    }

    cancelState() {
        this.stateCancelled = true;
    }

    addClassName(className) {
        this.btn.classList.add(className);
    }

    asHTMLElement() {
        return this.btn;
    }

    applyFirstState() {
        this._applyState(this.state1);
    }

    applySecondState() {
        this._applyState(this.state2);
    }

    _applyState(state) {
        this.btn.innerHTML = htmlTSTR(state.tstr);
        this.currentState = state;
    }

    _applyOppositeState() {
        if (this.currentState.name === "state1") {
            this.applySecondState();
        }
        else if (this.currentState.name === "state2") {
            this.applyFirstState();
        }
    }

    setState1(tstr, action) {
        this.state1 = {
            tstr: tstr,
            action: action,
            name: "state1"
        }
    }

    setState2(tstr, action) {
        this.state2 = {
            tstr: tstr,
            action: action,
            name: "state2"
        }
    }

    async _onClick() {
        await this.currentState.action();
        if (!this.stateCancelled) {
            this._applyOppositeState();
        }

        this.stateCancelled = null;
    }
}