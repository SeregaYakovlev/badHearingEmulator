class MySocket {
    constructor(url) {
        this.socketUrl = url;
    }

    setStream(stream) {
        this.stream = stream;
    }

    connect() {
        let protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.socket = new WebSocket(`${protocol}//${this.socketUrl}`);

        // Используем стрелочные функции для сохранения контекста `this`
        this.socket.onopen = (event) => this._onOpen(event);
        this.socket.onmessage = (event) => this._onMessage(event.data);
        this.socket.onclose = (event) => this._onClose(event);
        this.socket.onerror = (error) => this._onError(error);
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    sendMessage() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send("Hello Server!");
        }
    }

    _onOpen(event) {
        if (this.stream && typeof this.stream.write === 'function') {
            this.stream.write("Connected to server");
        }
    }

    _onMessage(message) {
        if (this.stream && typeof this.stream.write === 'function') {
            this.stream.write(message);
        }
    }

    _onClose(event) {
        if (this.stream && typeof this.stream.write === 'function') {
            this.stream.write("Disconnected from server");
        }
    }

    _onError(error) {
        if (this.stream && typeof this.stream.write === 'function') {
            this.stream.write(`Error: ${error.message}`);
        }
    }
}
