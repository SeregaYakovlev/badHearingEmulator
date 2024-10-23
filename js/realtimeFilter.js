class RealTimeFilter {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.filters = [];
        for (let i = 0; i < 3; i++) {
            let filter = this._createFilter();
            this.filters.push(filter);
        }

    }

    getAudioContext(){
        return this.audioContext;
    }

    getSoundSource(){
        return this._getLastFilter();
    }

    _getLastFilter(){
        return this.filters[this.filters.length - 1];
    }

    setHearingFrequency(frequency) {
        this.hearingFrequency = frequency;
        if (frequency === -138) {
            // специальное сигнальное значение
            // отключения фильтра
            for (let filter of this.filters) {
                filter.frequency.value = 999_999_999;
            }
        }
        else {
            this.hearingFrequency = frequency;
            for (let filter of this.filters) {
                filter.frequency.value = frequency;
            }
        }
    }

    async loadFile(file) {
        this.file = file;
        // Чтение аудиофайла
        let arrayBuffer = await file.arrayBuffer();
        let audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this._audioBuffer = audioBuffer;
    }


    startProcessingFromMicrophone(stream) {
        if (!stream) {
            throw new Error("Invalid argument: no stream");
        }

        if (this.hearingFrequency == null) { // Проверяет на null и undefined, ноль допустим
            throw new Error("No hearing frequency parameter");
        }

        // Если аудио уже проигрывается, остановите его
        this.stopProcessing();

        // Создаем новый источник для микрофонного потока
        this.inputSource = this.audioContext.createMediaStreamSource(stream);

        this._connectFiltersToInputAndOutput(this.filters, this.inputSource, this.audioContext.destination);
    }

    startProcessingFromFile(position) {
        if (!this._audioBuffer) {
            throw new Error("No one source is loaded");
        }

        if (this.hearingFrequency == null) { // Проверяет на null и undefined, ноль допустим
            throw new Error("No hearing frequency parameter");
        }
        // Если аудио уже проигрывается, остановите его
        this.stopProcessing();

        this.inputSource = this.audioContext.createBufferSource();
        this.inputSource.buffer = this._audioBuffer;

        // Вычисляем смещение в аудиобуфере, соответствующее позиции видео
        let sampleRate = this._audioBuffer.sampleRate;
        let startOffset = position * sampleRate;

        this._connectFiltersToInputAndOutput(this.filters, this.inputSource, this.audioContext.destination);

        // Устанавливаем начальное положение в аудиобуфере
        this.inputSource.start(0, startOffset / sampleRate);
    }

    stopProcessing() {
        if (this.inputSource) {
            this.inputSource.disconnect();
            this.inputSource = null;
        }
        if (this._processor) {
            this._processor.disconnect();
        }

        for (let filter of this.filters) {
            filter.disconnect();
        }
    }

    _createFilter() {
        let filter = this.audioContext.createBiquadFilter();
        filter.type = "lowpass";
        return filter;
    }

    _connectFiltersToInputAndOutput(filters, input, output) {
        // Соединяем фильтры последовательно
        input.connect(filters[0]); // Подключаем источник к первому фильтру
        for (let i = 1; i < filters.length; i++) {
            filters[i - 1].connect(filters[i]); // Подключаем фильтры друг к другу
        }
        filters[filters.length - 1].connect(output); // Последний фильтр к выходу
    }

    static _getNextPowerOfTwo(integer) {
        return Math.pow(2, Math.ceil(Math.log2(integer)));
    }

}