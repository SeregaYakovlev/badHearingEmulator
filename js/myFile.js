class MyFile {
    constructor(page) {
        this.page = page;
        this.file = null;
        this.fileSizeLimit = null;
    }

    getFileSize(){
        return this.file.size;
    }

    getFileSizeLimit(){
        return this.fileSizeLimit;
    }

    _isLimitIsExceeded() {
        if (this.fileSizeLimit) {
            let fileSize = this.file.size;
            return fileSize > this.fileSizeLimit;
        }
        else {
            return false;
        }
    }

    setFileSizeLimitInMegabytes(fileSizeLimit) {
        this.fileSizeLimit = this._megabytesToBytes(fileSizeLimit);
    }

    async downloadFileFromDesktop(){
        this.file = await this._downloadFileFromDesktop();

        let userIsAgree;
        while (this._isLimitIsExceeded() && !userIsAgree) {
            let warningResult = await this._displayFileSizeWarning();
            userIsAgree = warningResult.userIsAgree;
            if (!userIsAgree) {
                this.file = warningResult.anotherFile;
            }
        }

        return this.file;
    }

    async _downloadFileFromDesktop() {
        return new Promise((resolve, reject) => {
            // Создаем скрытый input элемент
            let hiddenInput = document.createElement("input");
            hiddenInput.type = "file";
            hiddenInput.style.display = "none"; // Скрываем элемент

            // Ограничиваем выбор файлов только аудио и видео
            hiddenInput.accept = ""; // Инициализация

            hiddenInput.accept += "audio/*,";
            hiddenInput.accept += "video/*";


            // Обработчик события выбора файла
            hiddenInput.addEventListener('change', () => {
                let file = hiddenInput.files[0]; // Получаем первый выбранный файл
                if (file) {
                    resolve(file); // Разрешаем промис с выбранным файлом
                } else {
                    reject(new Error("No file selected")); // Отклоняем промис, если файл не выбран
                }
            });

            hiddenInput.click();
        });
    }

    async _displayFileSizeWarning() {
        let fileSizeInMegaBytes = Math.round(this._bytesToMegabytes(this.file.size));
        let fileSizeLimit = Math.round(this._bytesToMegabytes(this.fileSizeLimit));

        return new Promise((resolve) => {
            let scene = new Scene(this.page);
            scene.addClassName("fileSizeWarningScene");
            let box = scene.createBox();

            let p = document.createElement("p");
            p.innerHTML = setTSTR("FileSizeWarning", [fileSizeInMegaBytes, fileSizeLimit]);

            let anotherFileBtn = document.createElement("button");
            anotherFileBtn.classList.add("myBtn");
            anotherFileBtn.innerHTML = setTSTR("anotherFile");

            anotherFileBtn.addEventListener("click", async () => {
                let anotherFile = await this._downloadFileFromDesktop();
                scene.close();
                resolve({ anotherFile: anotherFile, userIsAgree: false }); // Возвращает новый файл
            });

            let agreeBtn = document.createElement("button");
            agreeBtn.classList.add("myBtn");
            agreeBtn.innerHTML = setTSTR("ContinueAnyway");

            agreeBtn.addEventListener("click", () => {
                scene.close();
                resolve({ anotherFile: null, userIsAgree: true }); // Возвращает согласие на обработку
            });

            let btnContainer = document.createElement("div");
            btnContainer.classList.add("exactlyServiceBtnContainer");

            btnContainer.appendChild(anotherFileBtn);
            btnContainer.appendChild(agreeBtn);

            box.addElement(p);
            box.addElement(btnContainer);
            scene.show();
        });
    }

    _megabytesToBytes(megabytes) {
        return megabytes * 1024 * 1024;
    }

    _bytesToMegabytes(bytes) {
        let megabytes = bytes / (1024 * 1024);
        return megabytes;
    }
}