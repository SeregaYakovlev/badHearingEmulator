class FileWarningService {
    constructor(page, myFile, callback) {
        this.page = page;
        this.callback = callback;
        this.myFile = myFile;
        this.scene = new Scene(this.page);
        this.scene.addClassName("fileWarningScene");
    }

    _createAgreeBtn(text) {
        let agreeBtn = document.createElement("button");
        agreeBtn.classList.add("myBtn");
        agreeBtn.innerHTML = htmlTSTR(text);

        agreeBtn.addEventListener("click", () => {
            this.callback.onUserAgreed(this.myFile);
            this.scene.close();
        });

        return agreeBtn;
    }

    _createNonAgreeBtn(text) {
        let nonAgreeBtn = document.createElement("button");
        nonAgreeBtn.classList.add("myBtn");
        nonAgreeBtn.innerHTML = htmlTSTR(text);

        nonAgreeBtn.addEventListener("click", () => {
            this.callback.onUserRequestedFileSelection();
        });

        return nonAgreeBtn;
    }

    async show() {
        let validationResult = this.myFile.getValidationResult();

        if (!validationResult.isVideoOrAudio) {
            this._addFileTypeWarning();
        }

        if (validationResult.isFileSizeLimitExceeded) {
            this._addFileSizeWarning();
        }

        if (validationResult.isDurationLimitExceeded) {
            await this._addDurationWarning();
        }

        this._addAgreementContainer();
        this.scene.show();
    }

    _addFileTypeWarning() {
        let fileName = this.myFile.getFileName();
        let fileExtension = this.myFile.getFileExtension();

        let box = this._createWarningBox();

        let pContainer = document.createElement("div");
        pContainer.classList.add("div");

        let p1 = document.createElement("p");

        p1.innerHTML = htmlTSTR("FileDownloadedWithNameAndExtension",
            [
                SA(fileName, false),
                SA(fileExtension, false)
            ]);

        let p2 = document.createElement("p");
        p2.innerHTML = htmlTSTR("IsThisDefinitelyAudioVideoFile?");

        pContainer.appendChild(p1);
        pContainer.appendChild(p2);

        box.addElement(pContainer);
    }

    async _addDurationWarning() {
        let fileDurationObj = await this.myFile.getLargestDuration();
        let fileDurationLimitObj = this.myFile.getLargestDurationLimit();

        let box = this._createWarningBox();

        let pContainer = document.createElement("div");

        let p1 = document.createElement("p");
        p1.innerHTML = htmlTSTR("FileWarningDuration",
            [
                SA((fileDurationObj.duration).toFixed(1), false),
                SA(this._getFileDurationUnitTSTR(fileDurationObj.units), true)
            ]
        );

        let p2 = document.createElement("p");
        p2.innerHTML = htmlTSTR(
            "FileWarningDurationRecommendation",
            [
                SA((fileDurationLimitObj.duration).toFixed(1), false),
                SA(this._getFileDurationUnitTSTR(fileDurationLimitObj.units), true)
            ]
        );

        pContainer.appendChild(p1);
        pContainer.appendChild(p2);

        box.addElement(pContainer);

    }

    _addFileSizeWarning() {
        let fileSizeObj = this.myFile.getLargestFileSize();
        let fileSizeLimitObj = this.myFile.getLargestFileSizeLimit();

        let box = this._createWarningBox();

        let pContainer = document.createElement("div");
        pContainer.classList.add("div");

        let p1 = document.createElement("p");
        p1.innerHTML = htmlTSTR("FileWarningSize",
            [
                SA((fileSizeObj.size).toFixed(1), false),
                SA(this._getFileSizeUnitTSTR(fileSizeObj.units), true)
            ]);

        let p2 = document.createElement("p");
        p2.innerHTML = htmlTSTR("FileWarningRecommendation",
            [
                SA((fileSizeLimitObj.size).toFixed(1), false),
                SA(this._getFileSizeUnitTSTR(fileSizeLimitObj.units), true)
            ]
        )
        pContainer.appendChild(p1);
        pContainer.appendChild(p2);

        box.addElement(pContainer);
    }

    _addAgreementContainer() {
        let box = this.scene.createBox();

        let nonAgreeBtn = this._createNonAgreeBtn("anotherFile");

        let agreeBtn = this._createAgreeBtn("ContinueAnyway");

        let btnContainer = document.createElement("div");
        btnContainer.classList.add("fileWarningBtnContainer");

        btnContainer.appendChild(nonAgreeBtn);
        btnContainer.appendChild(agreeBtn);

        box.addElement(btnContainer);
    }

    _createWarningBox() {
        let box = this.scene.createBox();
        box.addClassName("warningBox");

        // Создаем иконку предупреждения
        let warningIcon = document.createElement("div");
        warningIcon.classList.add("warningIcon");

        // Добавляем иконку в box
        box.addElement(warningIcon);

        return box;
    }

    _getFileSizeUnitTSTR(fileSizeUnit) {
        if (fileSizeUnit === MyFile.FileSizeUnits.BYTES) {
            return "BYTE_short";
        } else if (fileSizeUnit === MyFile.FileSizeUnits.KILOBYTES) {
            return "KILOBYTE_short";
        } else if (fileSizeUnit === MyFile.FileSizeUnits.MEGABYTES) {
            return "MEGABYTE_short";
        } else if (fileSizeUnit === MyFile.FileSizeUnits.GIGABYTES) {
            return "GIGABYTE_short";
        } else {
            throw new Error("Unknown file size unit");
        }
    }

    _getFileDurationUnitTSTR(durationUnit) {
        if (durationUnit === MyFile.FileDurationUnits.MILLISECONDS) {
            return "MILLISECOND_short";
        } else if (durationUnit === MyFile.FileDurationUnits.SECONDS) {
            return "SECOND_short";
        } else if (durationUnit === MyFile.FileDurationUnits.MINUTES) {
            return "MINUTE_short";
        } else if (durationUnit === MyFile.FileDurationUnits.HOURS) {
            return "HOUR_short";
        } else {
            throw new Error("Unknown duration unit");
        }
    }

}