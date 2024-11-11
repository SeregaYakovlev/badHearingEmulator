class MyFile {
    static FileSizeUnits = {
        BYTES: 0,
        KILOBYTES: 1,
        MEGABYTES: 2,
        GIGABYTES: 3
    };

    static FileDurationUnits = {
        MILLISECONDS: 0,
        SECONDS: 1,
        MINUTES: 2,
        HOURS: 3
    };

    constructor(page) {
        this.page = page;
        this.file = null;
        this.fileSizeLimit = null;
    }

    // Метод для получения наибольшего размера файла в разных единицах
    getLargestFileSize() {
        if (!this.file) {
            throw new Error("No file");
        }

        let fileSizeInBytes = this.file.size;
        let size, units;

        if (fileSizeInBytes >= 1024 * 1024 * 1024) {
            size = fileSizeInBytes / (1024 * 1024 * 1024);
            units = MyFile.FileSizeUnits.GIGABYTES;
        } else if (fileSizeInBytes >= 1024 * 1024) {
            size = fileSizeInBytes / (1024 * 1024);
            units = MyFile.FileSizeUnits.MEGABYTES;
        } else if (fileSizeInBytes >= 1024) {
            size = fileSizeInBytes / 1024;
            units = MyFile.FileSizeUnits.KILOBYTES;
        } else {
            size = fileSizeInBytes;
            units = MyFile.FileSizeUnits.BYTES;
        }

        return { size, units };
    }

    // Метод для получения наибольшего лимита размера файла в разных единицах
    getLargestFileSizeLimit() {
        if (!this.fileSizeLimit) {
            throw new Error("No fileSizeLimit");
        }

        let fileSizeLimitInBytes = this.fileSizeLimit;
        let size, units;

        if (fileSizeLimitInBytes >= 1024 * 1024 * 1024) {
            size = fileSizeLimitInBytes / (1024 * 1024 * 1024);
            units = MyFile.FileSizeUnits.GIGABYTES;
        } else if (fileSizeLimitInBytes >= 1024 * 1024) {
            size = fileSizeLimitInBytes / (1024 * 1024);
            units = MyFile.FileSizeUnits.MEGABYTES;
        } else if (fileSizeLimitInBytes >= 1024) {
            size = fileSizeLimitInBytes / 1024;
            units = MyFile.FileSizeUnits.KILOBYTES;
        } else {
            size = fileSizeLimitInBytes;
            units = MyFile.FileSizeUnits.BYTES;
        }

        return { size, units };
    }


    // Метод для получения размера файла в разных единицах
    getFileSize(fileSizeUnits = MyFile.FileSizeUnits.BYTES) {
        if (!this.file) {
            throw new Error("No file");
        }

        let fileSizeInBytes = this.file.size;

        switch (fileSizeUnits) {
            case MyFile.FileSizeUnits.BYTES:
                return fileSizeInBytes;
            case MyFile.FileSizeUnits.KILOBYTES:
                return (fileSizeInBytes / 1024);
            case MyFile.FileSizeUnits.MEGABYTES:
                return (fileSizeInBytes / (1024 * 1024));
            case MyFile.FileSizeUnits.GIGABYTES:
                return (fileSizeInBytes / (1024 * 1024 * 1024));
            default:
                throw new Error("Algorithm error");
        }
    }

    // Метод для получения лимита размера файла в разных единицах
    getFileSizeLimit(fileSizeUnits = MyFile.FileSizeUnits.BYTES) {
        if (!this.fileSizeLimit) {
            throw new Error("No fileSizeLimit");
        }

        let fileSizeLimitInBytes = this.fileSizeLimit;

        switch (fileSizeUnits) {
            case MyFile.FileSizeUnits.BYTES:
                return fileSizeLimitInBytes;
            case MyFile.FileSizeUnits.KILOBYTES:
                return (fileSizeLimitInBytes / 1024);
            case MyFile.FileSizeUnits.MEGABYTES:
                return (fileSizeLimitInBytes / (1024 * 1024));
            case MyFile.FileSizeUnits.GIGABYTES:
                return (fileSizeLimitInBytes / (1024 * 1024 * 1024));
            default:
                throw new Error("Algorithm error");
        }
    }

    // Метод для установки лимита размера файла в различных единицах
    setFileSizeLimit(fileSize, fileSizeUnits = MyFile.FileSizeUnits.BYTES) {
        let fileSizeInBytes;

        switch (fileSizeUnits) {
            case MyFile.FileSizeUnits.BYTES:
                fileSizeInBytes = fileSize;
                break;
            case MyFile.FileSizeUnits.KILOBYTES:
                fileSizeInBytes = fileSize * 1024;
                break;
            case MyFile.FileSizeUnits.MEGABYTES:
                fileSizeInBytes = fileSize * 1024 * 1024;
                break;
            case MyFile.FileSizeUnits.GIGABYTES:
                fileSizeInBytes = fileSize * 1024 * 1024 * 1024;
                break;
            default:
                throw new Error("Algorithm error");
        }

        this.fileSizeLimit = fileSizeInBytes;
    }

    async getDuration(durationUnits = MyFile.FileDurationUnits.SECONDS) {
        let durationInSeconds = await this._getFileDuration();

        switch (durationUnits) {
            case MyFile.FileDurationUnits.MILLISECONDS:
                return durationInSeconds * 1000;
            case MyFile.FileDurationUnits.SECONDS:
                return durationInSeconds;
            case MyFile.FileDurationUnits.MINUTES:
                return durationInSeconds / 60;
            case MyFile.FileDurationUnits.HOURS:
                return durationInSeconds / 3600;
            default:
                throw new Error("Algorithm error");
        }
    }

    async getLargestDuration() {

        let durationInSeconds = await this._getFileDuration();
        let duration, units;

        if (durationInSeconds >= 3600) { // Если больше или равно одному часу
            duration = durationInSeconds / 3600;
            units = MyFile.FileDurationUnits.HOURS;
        } else if (durationInSeconds >= 60) { // Если больше или равно одной минуте
            duration = durationInSeconds / 60;
            units = MyFile.FileDurationUnits.MINUTES;
        } else if (durationInSeconds >= 1) { // Если больше или равно одной секунде
            duration = durationInSeconds;
            units = MyFile.FileDurationUnits.SECONDS;
        } else { // Если меньше секунды
            duration = durationInSeconds * 1000;
            units = MyFile.FileDurationUnits.MILLISECONDS;
        }

        return { duration, units };
    }


    getDurationLimit(durationUnits = MyFile.FileDurationUnits.SECONDS) {
        if (!this.durationLimit) {
            throw new Error("No durationLimit");
        }

        let durationLimitInSeconds = this.durationLimit;

        switch (durationUnits) {
            case MyFile.FileDurationUnits.MILLISECONDS:
                return durationLimitInSeconds * 1000;
            case MyFile.FileDurationUnits.SECONDS:
                return durationLimitInSeconds;
            case MyFile.FileDurationUnits.MINUTES:
                return durationLimitInSeconds / 60;
            case MyFile.FileDurationUnits.HOURS:
                return durationLimitInSeconds / 3600;
            default:
                throw new Error("Algorithm error");
        }
    }

    getLargestDurationLimit() {
        if (!this.durationLimit) {
            throw new Error("No durationLimit");
        }

        let durationInSeconds = this.durationLimit;
        let duration, units;

        if (durationInSeconds >= 3600) { // Если больше или равно часу
            duration = durationInSeconds / 3600;
            units = MyFile.FileDurationUnits.HOURS;
        } else if (durationInSeconds >= 60) { // Если больше или равно минуте
            duration = durationInSeconds / 60;
            units = MyFile.FileDurationUnits.MINUTES;
        } else if (durationInSeconds >= 1) { // Если больше или равно одной секунде
            duration = durationInSeconds;
            units = MyFile.FileDurationUnits.SECONDS;
        } else { // Если меньше секунды
            duration = durationInSeconds * 1000;
            units = MyFile.FileDurationUnits.MILLISECONDS;
        }

        return { duration, units };
    }

    setDurationLimit(duration, durationUnits = MyFile.FileDurationUnits.SECONDS) {
        let durationInSeconds;

        switch (durationUnits) {
            case MyFile.FileDurationUnits.MILLISECONDS:
                durationInSeconds = duration / 1000;
                break;
            case MyFile.FileDurationUnits.SECONDS:
                durationInSeconds = duration;
                break;
            case MyFile.FileDurationUnits.MINUTES:
                durationInSeconds = duration * 60;
                break;
            case MyFile.FileDurationUnits.HOURS:
                durationInSeconds = duration * 3600;
                break;
            default:
                throw new Error("Algorithm error");
        }

        this.durationLimit = durationInSeconds;
    }

    async isDurationLimitExceeded() {
        if (this.durationLimit) {
            let fileDuration = await this._getFileDuration();

            // Сравниваем длительность файла с лимитом
            return fileDuration > this.durationLimit;
        }
        else {
            return false;
        }
    }

    isFileSizeLimitExceeded() {
        if (this.fileSizeLimit) {
            let fileSize = this.file.size;
            return fileSize > this.fileSizeLimit;
        }
        else {
            return false;
        }
    }

    async _getFileDuration() {
        return new Promise((resolve, reject) => {
            let audio = document.createElement('audio');
            audio.setAttribute('src', URL.createObjectURL(this.file));

            // Убедитесь, что аудио элемент не задерживает память
            let releaseResources = () => {
                URL.revokeObjectURL(audio.src); // Освободить ресурсы URL
                audio.remove(); // Удалить элемент из DOM
            };

            audio.addEventListener('loadedmetadata', () => {
                let duration = audio.duration;
                releaseResources();  // Удаляем аудио элемент после получения длительности
                resolve(duration);
            });

            audio.addEventListener('error', (err) => {
                releaseResources();  // Удаляем аудио элемент в случае ошибки
                reject(new Error("Error loading audio file"));
            });
        });
    }

    async downloadSelectedFile() {
        return new Promise((resolve) => {
            resolve(this.file)
        });
    }

    async downloadFileFromDesktop() {
        let file = await this._downloadFileFromDesktop();

        if(!file){
            return;
        }

        this.file = file;

        if (!this.isUserAgreed()) {
            this.validationResult = await this._validateFile();
            if (!this.validationResult.isOk) {
                throw new FileValidationError(this.validationResult);  // Бросаем ошибку с результатом валидации
            }
        }

        return this.file;
    }

    getValidationResult() {
        return this.validationResult;
    }

    async _validateFile() {
        let obj = {};

        obj.isVideoOrAudio = this._isAudioOrVideoFile();

        obj.isFileSizeLimitExceeded = this.isFileSizeLimitExceeded();

        try {
            obj.isDurationLimitExceeded = await this.isDurationLimitExceeded();
        } catch (e) {
            // может быть загружено не аудио
            obj.isDurationLimitExceeded = false;
        }

        obj.isOk = obj.isVideoOrAudio && !obj.isFileSizeLimitExceeded && !obj.isDurationLimitExceeded;

        obj.toJson = () => {
            return JSON.stringify(obj);
        };

        return obj;
    }

    isUserAgreed() {
        return this.userIsAgreed;
    }

    setUserAgreement(userAgreement) {
        this.userIsAgreed = userAgreement;
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
                    resolve(null); // Отклоняем промис, если файл не выбран
                }
            });

            hiddenInput.addEventListener("cancel", () => {
                resolve(null);
            })

            hiddenInput.click();
        });
    }

    getFileExtension() {
        if (!this.file || !this.file.name) {
            throw new Error("No file or file name");
        }
        return this.file.name.split('.').pop().toLowerCase();
    }

    getFileName() {
        if (!this.file || !this.file.name) {
            throw new Error("No file or file name");
        }
        return this.file.name;
    }

    // Метод для проверки, является ли файл аудио или видео
    _isAudioOrVideoFile() {
        if (!this.file) return false;
        let fileType = this.file.type;
        return fileType.startsWith("audio/") || fileType.startsWith("video/");
    }
}

class FileValidationError extends Error {
    constructor(validationResult) {
        super("File validation failed.");
        this.name = "FileValidationError";
        this.validationResult = validationResult;  // Храним результат валидации
    }
}
