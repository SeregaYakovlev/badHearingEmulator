class MySpeaker {
    constructor(audioContext) {
        if (!audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        else {
            this.audioContext = audioContext;
        }

        this.soundSources = [];
        this.playingSoundSources = []; // Хранит активные звуковые источники
    }

    getAudioContext(){
        return this.audioContext;
    }

    getSoundSource() {
        return this.getActiveSoundSource();
    }

    setFilters(filters) {
        this.filters = filters;
    }

    playStream(stream) {
        if (this.isPlaying()) {
            throw new Error("The speaker is already playing");
        }

        if (!stream) {
            throw new Error("Invalid argument: no stream");
        }

        let streamSource = this._createSoundStreamSource(stream);

        streamSource.onended = () => {
            this.playingSoundSources = this.playingSoundSources.filter(source => source !== streamSource);
        }

        this.playingSoundSources.push(streamSource);

        if (this.filters) {
            this._connectFilters(streamSource, this.filters);
        }
        else {
            // на данный момент динамик еще не подключен
            streamSource.connect(this.audioContext.destination);
        }
    }

    playBuffer(audioBuffer, position) {
        if (this.isPlaying()) {
            throw new Error("The speaker is already playing");
        }

        if (!audioBuffer) {
            throw new Error("AudioBuffer is not set.");
        }

        let bufferSource = this._createSoundBufferSource();
        bufferSource.buffer = audioBuffer;

        // Добавляем звук источник в активные
        this.playingSoundSources.push(bufferSource);

        // Слушаем событие окончания воспроизведения, чтобы удалить источник из активных
        bufferSource.onended = () => {
            this.playingSoundSources = this.playingSoundSources.filter(source => source !== bufferSource);
        };

        if (this.filters) {
            this._connectFilters(bufferSource, this.filters);
        }
        else {
            // на данный момент динамик еще не подключен
            bufferSource.connect(this.audioContext.destination);
        }

        bufferSource.start(0, position);
    }

    stop() {
        let soundSourceCopy = [...this.soundSources];
        for (let soundSource of soundSourceCopy) {
            soundSource.disconnect();

            if (soundSource instanceof AudioBufferSourceNode) {
                soundSource.stop();
            }

            // Удаляем источник из soundSources с использованием filter
            this.soundSources = this.soundSources.filter(source => source !== soundSource);

            this.playingSoundSources = this.playingSoundSources.filter(source => source !== soundSource);

        }
    }

    isPlaying() {
        return this.playingSoundSources.size > 0; // Если есть активные источники, значит звук играет
    }

    getActiveSoundSource() {
        // динамик не может играть несколько источников
        return this.playingSoundSources[0];
    }

    _connectFilters(soundSource, filters) {
        this._connectFiltersToInputAndOutput(filters, soundSource, this.audioContext.destination);
    }

    _connectFiltersToInputAndOutput(filters, input, output) {
        // Соединяем фильтры последовательно
        input.connect(filters[0]); // Подключаем источник к первому фильтру
        for (let i = 1; i < filters.length; i++) {
            filters[i - 1].connect(filters[i]); // Подключаем фильтры друг к другу
        }
        filters[filters.length - 1].connect(output); // Последний фильтр к выходу
    }

    _createSoundBufferSource() {
        let soundSource = this.audioContext.createBufferSource();
        this.soundSources.push(soundSource);
        return soundSource; // Не забываем вернуть созданный источник
    }

    _createSoundStreamSource(stream) {
        let soundSource = this.audioContext.createMediaStreamSource(stream);
        this.soundSources.push(soundSource);
        return soundSource; // Не забываем вернуть созданный источник
    }
}
