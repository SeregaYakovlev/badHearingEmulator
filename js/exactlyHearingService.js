class ExactlyHearingService {
    constructor(page) {
        this.page = page;

        this.leftEarScene = new AudiogramScene(this.page, this, Audiogram.Types.LEFT_EAR);
        this.rightEarScene = new AudiogramScene(this.page, this, Audiogram.Types.RIGHT_EAR);
        this.binauralScene = new AudiogramScene(this.page, this, Audiogram.Types.BINAURAL);
    }

    show() {
        this._showMainScene();
    }

    _showMainScene() {
        let scene = new Scene(this.page);
        scene.addClassName("mainScene");
        let b = scene.createBox();

        let welcomElem = document.createElement("div");

        let p0 = document.createElement("p");
        p0.innerHTML = `${htmlTSTR("audiogramScene_mainBox_P0")}`;
        welcomElem.appendChild(p0);

        let p1 = document.createElement("p");
        p1.innerHTML = `1) ${htmlTSTR("audiogramScene_mainBox_P1")}`;
        welcomElem.appendChild(p1);

        let p2 = document.createElement("p");
        p2.innerHTML = `2) ${htmlTSTR("audiogramScene_mainBox_P2")}`;
        welcomElem.appendChild(p2);

        let separateEarsBtn = document.createElement("button");
        separateEarsBtn.classList.add("myBtn");
        separateEarsBtn.innerHTML = htmlTSTR("onEachEar");
        separateEarsBtn.addEventListener("click", () => {
            this.leftEarScene.show();
        })

        let binauralBtn = document.createElement("button");
        binauralBtn.classList.add("myBtn");
        binauralBtn.innerHTML = htmlTSTR("OnBothEarsOnce");
        binauralBtn.addEventListener("click", () => {
            this.binauralScene.show();
        })

        b.addElement(welcomElem);

        let div = document.createElement("div");
        div.classList.add("exactlyServiceBtnContainer");

        div.appendChild(separateEarsBtn);
        div.appendChild(binauralBtn);

        b.addElement(div);

        scene.show();
    }

    async _download_process_display_file_from_desktop() {
        let myFile = new MyFile(this.page);
        myFile.setFileSizeLimit(20, MyFile.FileSizeUnits.MEGABYTES);
        myFile.setDurationLimit(5, MyFile.FileDurationUnits.MINUTES);

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

    async _onFileLoaded(file) {
        let audiograms = [];

        if (this.leftEarScene.isShown()) {
            audiograms.push(this.leftEarScene.getAudiogram());
        }

        if (this.rightEarScene.isShown()) {
            audiograms.push(this.rightEarScene.getAudiogram());
        }

        if (this.binauralScene.isShown()) {
            audiograms.push(this.binauralScene.getAudiogram());
        }

        let preloader = new Preloader(this.page);
        preloader.show();
        let handledAudioFile = await this._handleFile(preloader, file, audiograms);
        preloader.close();
        this._showMediaPlayer(handledAudioFile, file);
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

    async onDataInputed(scene) {
        if (scene.isLeftEar()) {
            this.rightEarScene.show();
        }
        else if (scene.isRightEar() || scene.isBinaural()) {
            this._download_process_display_file_from_desktop();
        }
        else {
            throw new Error("Algorithm error");
        }
    }

    async _handleFile(preloader, originalFile, audiograms) {
        let handledAudioFile;

        let myFFT = new MyFFT(originalFile);
        myFFT.setPreloader(preloader);

        // Конвертируем каждый аудиограм в JSON и собираем их в массив
        let audiogramArray = audiograms.map(audiogram => audiogram.toJsonSerializableObj());
        let json = JSON.stringify(audiogramArray);

        let auditoryGraphArray = AuditoryGraph.getAuditoryGraphArrayFromJson(json);

        handledAudioFile = await myFFT.processWithAuditoryGraphs(auditoryGraphArray);

        return handledAudioFile;
    }

    _showMediaPlayer(handledAudioFile, originalFile) {
        let scene = new Scene(this.page);
        scene.addClassName("mediaPlayerScene");

        let player = new MyPlayer(scene, null);
        player.setFile(originalFile);
        player.install(scene);
        player.setCustomAudioFile(handledAudioFile);

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

        btnContainer.appendChild(anotherFileBtn);

        let soundVisualizationBtn = new MyBinaryButton();

        let soundVisualization = new SoundVisualization(scene, player.getAudioContext(), player.getSoundSource());

        soundVisualizationBtn.setState1("FrequencySpectrum", async () => {
            player.hide();
            soundVisualization.show();
        });

        soundVisualizationBtn.setState2("ShowVideo", () => {
            player.show();
            soundVisualization.hide();
        });

        soundVisualizationBtn.applyFirstState();

        btnContainer.appendChild(soundVisualizationBtn.asHTMLElement());

        scene.show();
    }
}