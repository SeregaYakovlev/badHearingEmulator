class LogPanel {
    constructor() {
        this.logs = document.createElement("div");
        this.logs.classList.add("logs");
        this.logs.readOnly = true; // Сделать только для чтения
    }

    install(htmlElement) {
        htmlElement.appendChild(this.logs);
    }

    // Функция для добавления логов
    write(message) {
        let span = document.createElement("span");
        span.textContent = message;

        if(this._isException(message)){
            span.classList.add("exception");
        }

        this.logs.appendChild(span);
        this._onLogWritten(message);
    }


    _isException(message) {
        return message.toLowerCase().includes("error") ||
            message.toLowerCase().includes("exception") ||
            message.toLowerCase().includes("fatal") ||
            message.toLowerCase().includes("disconnected");
    }

    _onLogWritten(log) {
        this.logs.scrollTop = this.logs.scrollHeight; // Автопрокрутка к последнему сообщению
    }
}