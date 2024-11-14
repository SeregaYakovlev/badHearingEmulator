class RealtimeFileService {
    constructor(page) {
        this.page = page;
    }

    async run() {
        this._download_process_display_file_from_desktop();
    }

    async _download_process_display_file_from_desktop() {
        let myFile = new MyFile(this.page);
        myFile.setFileSizeLimit(100, MyFile.FileSizeUnits.MEGABYTES);
        myFile.setDurationLimit(1, MyFile.FileDurationUnits.HOURS);

        let file;
        try {
            file = await myFile.downloadFileFromDesktop();
            if (file) {
                this._onFileLoaded(file);
            }

        } catch (e) {
            if (!(e instanceof FileValidationError)) {
                throw e;  // Если ошибка не является FileValidationError, выбрасываем её дальше
            }

            let fileWarning = new FileWarningService(this.page, myFile, this);
            fileWarning.show();
        }
    }

    _onFileLoaded(file) {
        this._showMediaPlayer(file);
    }

    // interface method
    async onUserAgreed(myFile) {
        myFile.setUserAgreement(true);
        let file = await myFile.downloadSelectedFile();
        this._showMediaPlayer(file);
    }

    // interface method
    onUserRequestedFileSelection() {
        this._download_process_display_file_from_desktop();
    }

    async _showMediaPlayer(originalFile) {
        let preloader = new Preloader(this.page);
        let preloaderCaption = preloader.createCaptionArea();
        preloaderCaption.setMessage(htmlTSTR("OneMinute..."));
        preloader.show();

        let hearingFrequency = 500;

        let scene = new Scene(this.page);
        scene.addClassName("mediaPlayerScene");

        let realtimeFilter = new RealTimeFilter(scene);
        realtimeFilter.setHearingFrequency(hearingFrequency);

        this.realtimeFilter = realtimeFilter;

        let player = new MyPlayer(scene, this);
        player.setFile(originalFile);
        player.install(scene);

        this.player = player;

        let frequencySlider = new FrequencySlider(scene, hearingFrequency, 0, 8_000, realtimeFilter);
        frequencySlider.setFrequencyCallback((frequency) => {
            realtimeFilter.setHearingFrequency(frequency);
        });

        let actionsBox = scene.createBox();
        actionsBox.addClassName("actionsBox");

        let btnContainer = document.createElement("div");
        btnContainer.classList.add("mediaPlayerBtnContainer");
        actionsBox.addElement(btnContainer);

        let anotherFileBtn = document.createElement("button");
        anotherFileBtn.classList.add("myBtn");
        anotherFileBtn.innerHTML = htmlTSTR("anotherFile");
        anotherFileBtn.addEventListener("click", async () => {
            this._download_process_display_file_from_desktop();
        });

        let soundVisualizationBtn = new MyBinaryButton();
        let soundVisualization = new SoundVisualization(scene, realtimeFilter.getAudioContext(), realtimeFilter.getSoundSource());

        soundVisualizationBtn.setState1("FrequencySpectrum", async () => {
            player.hide();
            soundVisualization.show();
        });

        soundVisualizationBtn.setState2("ShowVideo", () => {
            player.show();
            soundVisualization.hide();
        });

        soundVisualizationBtn.applyFirstState();

        btnContainer.appendChild(anotherFileBtn);
        btnContainer.appendChild(soundVisualizationBtn.asHTMLElement());

        preloader.close();

        scene.show();
    }

    onPlay() {
        // this.audioContext.createMediaElementSource(this.audioElement) не любит пустые файлы
        // и работает с перебоями в таком случае
        if (!this.player.isFilterConnected()) {
            this.player.connectFilter(this.realtimeFilter);
        }
    }
}