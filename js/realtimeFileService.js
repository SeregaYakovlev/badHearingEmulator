class RealtimeFileService {
    constructor(page) {
        this.page = page;
    }

    async run() {
        let file = await this._downloadFileFromDesktop();
        this._showMediaPlayer(file);
    }

    async _downloadFileFromDesktop() {
        return await Utils.downloadFileFromDesktop();
    }

    async _showMediaPlayer(originalFile) {
        let preloader = new Preloader(this.page);
        let preloaderCaption = preloader.createCaptionArea();
        preloaderCaption.setMessage(setTSTR("OneMinute..."));
        preloader.show();

        let hearingFrequency = 500;

        let scene = new Scene(this.page);
        scene.addClassName("mediaPlayerScene");

        let realtimePlayer = new RealTimePlayer(scene, hearingFrequency);
        realtimePlayer.setHearingFrequency(hearingFrequency);
        await realtimePlayer.loadFile(originalFile);
        realtimePlayer.install(scene);

        let frequencySlider = new FrequencySlider(scene, hearingFrequency, 0, 8_000, realtimePlayer.getRealTimeFilter());
        frequencySlider.setFrequencyCallback((frequency) => {
            realtimePlayer.setHearingFrequency(frequency);
        });

        let actionsBox = scene.createBox();
        actionsBox.addClassName("actionsBox");

        let btnContainer = document.createElement("div");
        btnContainer.classList.add("mediaPlayerBtnContainer");
        actionsBox.addElement(btnContainer);

        let anotherFileBtn = document.createElement("button");
        anotherFileBtn.classList.add("myBtn");
        anotherFileBtn.innerHTML = setTSTR("anotherFile");
        anotherFileBtn.addEventListener("click", async () => {
            let anotherFile = await this._downloadFileFromDesktop();
            this._showMediaPlayer(anotherFile);
        });

        let soundVisualizationBtn = new MyBinaryButton();
        let soundVisualization = new SoundVisualization(scene, realtimePlayer);

        soundVisualizationBtn.setState1("FrequencySpectrum", async () => {
            realtimePlayer.hide();
            await soundVisualization.show();
            soundVisualization.startProcessing();
        });

        soundVisualizationBtn.setState2("ShowVideo", () => {
            realtimePlayer.show();
            soundVisualization.hide();
            soundVisualization.stopProcessing();
        });

        soundVisualizationBtn.applyFirstState();

        btnContainer.appendChild(anotherFileBtn);
        btnContainer.appendChild(soundVisualizationBtn.asHTMLElement());

        preloader.close();

        scene.show();
    }
}