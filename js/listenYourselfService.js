class ListenYourselfService {
    constructor(page) {
        this.page = page;
        this.hearingFrequency = 500;
    }

    show() {
        let scene = new Scene(this.page);
        scene.addClassName("listenYourselfScene");

        this.microphone = new MyMicrophone(scene);

        this.realtimeFilter = new RealTimeFilter(scene);
        this.realtimeFilter.setHearingFrequency(this.hearingFrequency);

        let mainBox = scene.createBox();
        mainBox.addClassName("mainBox");

        this._addMicrophoneRecordBtn(mainBox);
        this._addListenYourselfBox(scene);
        this._addFrequencySlider(scene);
        this._addFrequencySpectrum(scene);

        scene.show();

        this.scene = scene;
    }

    async _enableMicrophone() {
        try {
            await this.microphone.enable();
            this._onMicrophoneEnabled();
        } catch (e) {
            if (!(await this.microphone.isPermissionGranted())) {
                this._onMicrophonePermissionDenied();
            }
            throw e;
        }
    }

    _onMicrophonePermissionDenied() {
        let errorBubble = new ErrorBubble(this.scene, "MicrophonePermissionError", 2000);
        errorBubble.show();
    }

    _disableMicrophone() {
        this.microphone.disable();
        this._onMicrophoneDisabled();
    }

    _addMicrophoneRecordBtn(box) {
        let btn = new MyBinaryButton();
        btn.addClassName("microphoneRecordBtn");

        btn.setState1("StartMicrophoneRecord", async () => {
            try {
                await this._enableMicrophone();
                btn.asHTMLElement().setAttribute('microphone-enabled', 'true');
            } catch (e) {
                btn.cancelState();
            }
        });

        btn.setState2("StopMicrophoneRecord", () => {
            this._disableMicrophone();
            btn.asHTMLElement().setAttribute('microphone-enabled', 'false');
        })

        btn.applyFirstState();

        box.addElement(btn.asHTMLElement());
    }

    _addListenYourselfBox(scene) {
        let box = scene.createBox();
        box.addClassName("listenYourselfBox");

        let audioPlayer = new ListenYourselfPlayer(scene, this);
        audioPlayer.installInBox(box);
        this.audioPlayer = audioPlayer;

        // Событие, когда запись начата
        box.onRecordStarted = () => {
            audioPlayer.clear();
        };


        // Событие, когда запись завершена
        box.onRecordEnded = (audioChunks) => {
            // Создаем объект Blob из записанных данных
            let audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); // Укажите правильный MIME-тип
            let audioFile = new File([audioBlob], "recordedAudio.webm", { type: 'audio/webm' }); // Создайте файл с именем и типом

            audioPlayer.loadFile(audioFile); // Загружаем файл в аудиоплеер
            this._onFileLoaded();
        };

        this.listenYourselfBox = box;
        this.audioPlayer = audioPlayer;
    }

    _onFileLoaded() {
        if (!this.audioPlayer.isFilterConnected()) {
            this.audioPlayer.connectFilter(this.realtimeFilter);
        }
    }

    _onMicrophoneEnabled() {
        this.listenYourselfBox.onRecordStarted();

        let stream = this.microphone.getStream();
        this.mediaRecorder = new MediaRecorder(stream);

        // Обработка данных при записи
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                let array = [];
                array.push(event.data);
                this.listenYourselfBox.onRecordEnded(array);
            }
        };

        // Начало записи
        this.mediaRecorder.start();
    }

    _onMicrophoneDisabled() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
            this.mediaRecorder = null;
        }
    }

    _onRecordEnded(audioChunks) {
        this.listenYourselfBox.onRecordEnded(audioChunks);
    }

    _addFrequencySlider(scene) {
        let frequencySlider = new FrequencySlider(scene, this.hearingFrequency, 0, 8_000, this.realtimeFilter);
        frequencySlider.setFrequencyCallback((frequency) => {
            this._setHearingFrequency(frequency);
        });
    }

    _addFrequencySpectrum(scene) {
        this.soundVisualization = new SoundVisualization(scene, this.realtimeFilter.getAudioContext(), this.realtimeFilter.getSoundSource());
        scene.update(); // важный вызов, чтобы bounding_client_rect увидел элемент
        this.soundVisualization.show();
    }

    getAudioContext() {
        return this.realtimeFilter.getAudioContext();
    }

    getSoundSource() {
        return this.realtimeFilter.getSoundSource();
    }

    _setHearingFrequency(frequency) {
        this.hearingFrequency = frequency;
        this.realtimeFilter.setHearingFrequency(frequency);
    }
}
