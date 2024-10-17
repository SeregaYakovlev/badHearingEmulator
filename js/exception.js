class Exp {
    constructor(exp) {
        this.exp = exp;
    }

    show() {
        let exceptionElem = document.createElement("div");
        exceptionElem.classList.add("exception");

        let exceptionWindow = document.createElement("div");
        exceptionWindow.classList.add("exceptionWindow");

        let title = document.createElement("h1");
        title.classList.add("exceptionTitle");
        title.textContent = "Program crash";

        let stackTraceContainer = document.createElement("div");
        stackTraceContainer.classList.add("stackTraceContainer");

        let stackTrace = document.createElement("pre");
        stackTrace.classList.add("stackTrace");
        stackTrace.textContent = this.exp.message;
        stackTrace.textContent += "\n";
        stackTrace.textContent += this.exp.stack;

        let reloadButton = document.createElement("button");
        reloadButton.classList.add("reloadButton");
        reloadButton.textContent = "Reload";
        reloadButton.onclick = () => window.location.reload();

        stackTraceContainer.appendChild(stackTrace);
        
        exceptionWindow.appendChild(title);
        exceptionWindow.appendChild(stackTraceContainer);
        exceptionWindow.appendChild(reloadButton);

        exceptionElem.appendChild(exceptionWindow);
        document.body.appendChild(exceptionElem);
        
        // Анимация появления
        setTimeout(() => {
            exceptionElem.classList.add("visible");
        }, 10);
    }
}

window.addEventListener("unhandledrejection", function (event) {
    new Exp(event.reason).show();
});

window.addEventListener("error", function (event) {
    new Exp(event.error).show();
});
