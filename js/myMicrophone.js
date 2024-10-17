class MyMicrophone {
    constructor() {
        this.stream = null;
        this.microphone = null;
    }

    isEnabled() {
        return this.stream != null;
    }

    // Запрашивает доступ к микрофону
    async enable() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    autoGainControl: false,
                    noiseSuppression: false,
                    echoCancellation: false
                }
            });
        } catch (err) {
            console.error("Ошибка доступа к микрофону:", err);
            throw err;
        }
    }

    // Отключает микрофон и освобождает ресурсы
    disable() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        console.log("Микрофон отключен");
    }

    // Возвращает текущий поток
    getStream() {
        return this.stream;
    }
}
