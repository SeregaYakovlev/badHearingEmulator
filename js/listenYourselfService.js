class ListenYourselfService {
    constructor(page) {
        this.page = page;
        this.microphone = new MyMicrophone();
        this.realtimeFilter = new RealTimeFilter();
        this.hearingFrequency = 500;
    }

    show() {
        let scene = new Scene(this.page);
        scene.addClassName("listenYourselfScene");

        let mainBox = scene.createBox();
        mainBox.addClassName("mainBox");

        this._addMicrophoneRecordBtn(mainBox);
        this._addListenYourselfBox(scene);
        this._addFrequencySlider(scene);
        this._addFrequencySpectrum(scene);
        this._addMainPageBtn(scene);

        scene.show();
    }

    async _enableMicrophone() {
        await this.microphone.enable();
        this._onMicrophoneEnabled();
    }

    _disableMicrophone() {
        this.microphone.disable();
        this._onMicrophoneDisabled();
    }

    _addMicrophoneRecordBtn(box) {
        let btn = new MyBinaryButton();
        btn.addClassName("microphoneRecordBtn");

        btn.setState1("StartMicrophoneRecord", () => {
            btn.asHTMLElement().setAttribute('microphone-enabled', 'true');
            this._enableMicrophone();
        });

        btn.setState2("StopMicrophoneRecord", () => {
            btn.asHTMLElement().setAttribute('microphone-enabled', 'false');
            this._disableMicrophone();
        })

        btn.applyFirstState();

        box.addElement(btn.asHTMLElement());

        this.microphoneRecordBtn = btn;
    }

    _addListenYourselfBox(scene) {
        let box = scene.createBox();
        box.addClassName("listenYourselfBox");

        // Создаем элемент аудиопроигрывателя
        let audioPlayer = document.createElement("audio");
        audioPlayer.controls = true; // Добавляем элементы управления (воспроизведение, пауза и т.д.)
        audioPlayer.volume = 0.0; // Устанавливаем начальную громкость

        // Функция для загрузки аудиофайла
        audioPlayer.loadFile = (file) => {
            audioPlayer.src = URL.createObjectURL(file); // Создаем URL для аудиофайла
            audioPlayer.load(); // Загружаем новый источник
        };

        // Обработчики событий
        audioPlayer.addEventListener('play', () => {
            this._onPlay(audioPlayer.currentTime); // Передаем текущую позицию
        });

        audioPlayer.addEventListener('pause', () => {
            this._onPause();
        });

        audioPlayer.addEventListener('seeked', () => {
            this._onSeek(audioPlayer.currentTime); // Передаем новую позицию
        });

        audioPlayer.addEventListener('ended', () => {
            this._onEnded();
        });

        // Добавляем элемент аудиопроигрывателя в box
        box.addElement(audioPlayer);

        // Событие, когда запись начата
        box.onRecordStarted = () => {
            // Создаем пустой файл
            let emptyBlob = new Blob([], { type: 'audio/webm' }); // Укажите нужный MIME-тип
            let emptyFile = new File([emptyBlob], "emptyFile.webm", { type: 'audio/webm' });

            audioPlayer.loadFile(emptyFile); // Сбрасываем источник при начале записи
        };


        // Событие, когда запись завершена
        box.onRecordEnded = async (audioChunks) => {
            // Создаем объект Blob из записанных данных
            let audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); // Укажите правильный MIME-тип
            let audioFile = new File([audioBlob], "recordedAudio.webm", { type: 'audio/webm' }); // Создайте файл с именем и типом

            audioPlayer.loadFile(audioFile); // Загружаем файл в аудиоплеер
            this.realtimeFilter.setHearingFrequency(this.hearingFrequency);
            await this.realtimeFilter.loadFile(audioFile); // Загружаем файл в фильтр
        };



        this.listenYourselfBox = box;
        this.audioPlayer = audioPlayer;
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

    _onPause() {
        this.realtimeFilter.stopProcessing();
        this.soundVisualization.stopProcessing();
    }

    _onPlay(position) {
        this.realtimeFilter.startProcessingFromFile(position);
        this.soundVisualization.startProcessing();
    }

    _onSeek(position) {
        this.realtimeFilter.stopProcessing();

        if (this.isPlaying()) {
            this.realtimeFilter.startProcessingFromFile(position);
            this.soundVisualization.startProcessing();
        }
    }

    _onEnded() {
        this.realtimeFilter.stopProcessing();
        this.soundVisualization.stopProcessing();
    }

    isPlaying() {
        return !this.audioPlayer.paused; // Возвращает true, если плеер воспроизводит звук, иначе false
    }


    _addFrequencySlider(scene) {
        let frequencySlider = new FrequencySlider(scene, this.hearingFrequency, 0, 8_000);
        frequencySlider.setFrequencyCallback((frequency) => {
            this._setHearingFrequency(frequency);
        });
    }

    _addFrequencySpectrum(scene) {
        this.soundVisualization = new SoundVisualization(scene, this);
        scene.update(); // важный вызов, чтобы bounding_client_rect увидел элемент
        this.soundVisualization.show();
    }

    getAudioContext() {
        return this.realtimeFilter.getAudioContext();
    }

    getSoundSource() {
        return this.realtimeFilter.getSoundSource();
    }

    _addMainPageBtn(scene) {
        let actionsBox = scene.createBox();
        actionsBox.addClassName("actionsBox");

        let btnContainer = document.createElement("div");
        btnContainer.classList.add("liveConversationBtnContainer");

        actionsBox.addElement(btnContainer);

        let mainSceneBtn = document.createElement("button");
        mainSceneBtn.innerHTML = setTSTR("homePage");
        mainSceneBtn.addEventListener("click", () => {
            this.page.showRoot();
        });

        btnContainer.appendChild(mainSceneBtn);
    }

    _setHearingFrequency(frequency) {
        this.hearingFrequency = frequency;
        this.realtimeFilter.setHearingFrequency(frequency);
    }
}
