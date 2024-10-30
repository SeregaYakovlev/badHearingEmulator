class MyMicrophone {
    constructor(scene) {
        this.stream = null;
        this.microphone = null;

        scene.subscribeToSceneClosing(this);
    }

    onSceneClosed() {
        this.disable();
    }

    isEnabled() {
        return this.stream != null;
    }

    // Запрашивает доступ к микрофону
    async enable() {
        this.stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                autoGainControl: false,
                noiseSuppression: false,
                echoCancellation: false
            }
        });
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

    // Проверяет разрешение на доступ к микрофону
    async isPermissionGranted() {
        let permissionStatus = await navigator.permissions.query({ name: 'microphone' });
        let isGranted = permissionStatus.state === "granted";
        return isGranted;
    }
}
