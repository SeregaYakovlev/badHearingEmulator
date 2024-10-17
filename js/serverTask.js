class ServerTask {
    constructor() {
    }

    setLeftEarAudiogram(leftEarAudiogram) {
        if (this.binauralAudiogram) {
            throw new Error("Audiogram can not be binaural and separate at the same time");
        }
        else if (leftEarAudiogram.getType() !== Audiogram.Types.LEFT_EAR) {
            throw new Error("Audiogram is not left-ear type");
        }
        else if (this.leftEarAudiogram) {
            throw new Error("Left ear audiogram already set");
        }
        else {
            this.leftEarAudiogram = leftEarAudiogram;
        }
    }

    setRightEarAudiogram(rightEarAudiogram) {
        if (this.binauralAudiogram) {
            throw new Error("Audiogram cannot be binaural and separate at the same time");
        } else if (rightEarAudiogram.getType() !== Audiogram.Types.RIGHT_EAR) {
            throw new Error("Audiogram is not right-ear type");
        } else if (this.rightEarAudiogram) {
            throw new Error("Right ear audiogram already set");
        } else {
            this.rightEarAudiogram = rightEarAudiogram;
        }
    }

    setBinauralAudiogram(binauralAudiogram) {
        if (this.leftEarAudiogram || this.rightEarAudiogram) {
            throw new Error("Audiogram cannot be binaural and separate at the same time");
        } else if (binauralAudiogram.getType() !== Audiogram.Types.BINAURAL) {
            throw new Error("Audiogram is not binaural type");
        } else if(this.binauralAudiogram) {
            throw new Error("Binaural audiogram already set");
        }
        else {
            this.binauralAudiogram = binauralAudiogram;
        }
    }

    setFile(file){
        this.file = file;
    }

    getFile(){
        return this.file;
    }

    recreate(){
        let newServerTask = new ServerTask();
        
        if(this.leftEarAudiogram){
            newServerTask.setLeftEarAudiogram(this.leftEarAudiogram);
        }

        if(this.rightEarAudiogram){
            newServerTask.setRightEarAudiogram(this.rightEarAudiogram);
        }

        if(this.binauralAudiogram){
            newServerTask.setBinauralAudiogram(this.binauralAudiogram);
        }

        return newServerTask;
    }

    getAudiograms(){
        let audiograms = [];
        if(this.leftEarAudiogram && this.rightEarAudiogram){
            audiograms.push(this.leftEarAudiogram);
            audiograms.push(this.rightEarAudiogram);
        }
        else if(this.binauralAudiogram){
            audiograms.push(this.binauralAudiogram);
        }
        else {
            throw new Error("Algorithm error");
        }
        return audiograms;
    }

    async send(){
        if(this.sent){
            throw new Error("Already sent");
        }

        if(!this.file){
            throw new Error("No file");
        }

        let audiograms = this.getAudiograms();

        return this._handleFile(this.file, audiograms);
    }


    async _handleFile(file, audiograms) {
        // Конвертируем каждый аудиограм в JSON и собираем их в массив
        let audiogramArray = audiograms.map(audiogram => audiogram.toJsonSerializableObj());
        let json = JSON.stringify(audiogramArray);

        // Создаем объект FormData для отправки данных на сервер
        let formData = new FormData();

        // Добавляем файл в объект FormData
        formData.append('file', file);

        // Добавляем массив JSON аудиограмм в объект FormData как строку
        formData.append('audiograms', json);

        // Отправляем запрос на сервер
        let response = await fetch(window.location.origin + "/" + "post", {
            method: 'POST',
            body: formData
        });

        // Проверяем успешность запроса
        if (response.ok) {
            // Чтение байтов файла из ответа
            let arrayBuffer = await response.arrayBuffer();
            return await this._createFileFromArrayBuffer(arrayBuffer, "handledFile.wav");
        } else {
            throw new Error('Failed to upload file');
        }
    }

    async _createFileFromArrayBuffer(arrayBuffer, fileName, mimeType = 'audio/wav') {
        // Создаем Blob из ArrayBuffer
        let blob = new Blob([arrayBuffer], { type: mimeType });
    
        // Создаем File из Blob
        let file = new File([blob], fileName, { type: mimeType });
    
        return file;
    }
}