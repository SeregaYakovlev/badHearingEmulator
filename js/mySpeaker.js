class MySpeaker {
    constructor(scene) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.soundSources = [];
        this.playingSoundSources = []; // Хранит активные звуковые источники
        this.playingStartedTime = -1;
        this.speakerEventListeners = [];

        scene.subscribeToSceneClosing(this);
    }

    subscribeToSpeakerEvents(speakerListener) {
        this.speakerEventListeners.push(speakerListener);
    }

    getAudioContext() {
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

        // Слушаем событие окончания воспроизведения, чтобы удалить источник из активных
        streamSource.onended = () => {
            if (this.filters) {
                this.playingSoundSources = this.playingSoundSources.filter(source => source !== this.filters[this.filters.length - 1]);
            }
            else {
                this.playingSoundSources = this.playingSoundSources.filter(source => source !== streamSource);
            }
        };

        // Добавляем звук источник в активные
        if (this.filters) {
            this.playingSoundSources.push(this.filters[this.filters.length - 1]);
        }
        else {
            this.playingSoundSources.push(streamSource);
        }

        if (this.filters) {
            this._connectFiltersToOutput(streamSource, this.filters);
        }
        else {
            // на данный момент динамик еще не подключен
            streamSource.connect(this.audioContext.destination);
        }

        if (this.filters) {
            this._onPlayingStarted(this.filters[this.filters.length - 1]);
        }
        else {
            this._onPlayingStarted(streamSource);
        }

        this.playingStartedTime = this.audioContext.currentTime;
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
        if (this.filters) {
            this.playingSoundSources.push(this.filters[this.filters.length - 1]);
        }
        else {
            this.playingSoundSources.push(bufferSource);
        }

        // Слушаем событие окончания воспроизведения, чтобы удалить источник из активных
        bufferSource.onended = () => {
            if (this.filters) {
                this.playingSoundSources = this.playingSoundSources.filter(source => source !== this.filters[this.filters.length - 1]);
            }
            else {
                this.playingSoundSources = this.playingSoundSources.filter(source => source !== bufferSource);
            }
        };

        if (this.filters) {
            this._connectFiltersToOutput(bufferSource, this.filters);
        }
        else {
            // на данный момент динамик еще не подключен
            bufferSource.connect(this.audioContext.destination);
        }

        bufferSource.start(0, position);
        this.playingStartedTime = this.audioContext.currentTime;

        if (this.filters) {
            this._onPlayingStarted(this.filters[this.filters.length - 1]);
        }
        else {
            this._onPlayingStarted(bufferSource);
        }
    }

    stop() {
        let soundSourceCopy = [...this.soundSources];
        let playingSoundSourcesCopy = [...this.playingSoundSources];

        // Удаляем оба вида soundSources, так как в soundSource может быть нефильтрованный bufferSource,
        // а в playingSoundSources находиться последний фильтр

        for (let soundSource of soundSourceCopy) {
            soundSource.disconnect();

            if (soundSource instanceof AudioBufferSourceNode) {
                soundSource.stop();
            }

            this.soundSources = this.soundSources.filter(source => source !== soundSource);

        }        

        for (let soundSource of playingSoundSourcesCopy) {
            soundSource.disconnect();

            if (soundSource instanceof AudioBufferSourceNode) {
                soundSource.stop();
            }

            this.playingSoundSources = this.playingSoundSources.filter(source => source !== soundSource);

        }

        this.playingStartedTime = -1;
        this._onPlayingStopped();
    }

    getPlaybackTime() {
        if (this.playingStartedTime >= 0) {
            return this.audioContext.currentTime - this.playingStartedTime;
        }
        else {
            throw new Error("The speaker is not playing right now");
        }
    }

    _onPlayingStarted(source) {
        for (let speakerListener of this.speakerEventListeners) {
            speakerListener.onSpeakerPlayingStarted(source);
        }
    }

    _onPlayingStopped() {
        for (let speakerListener of this.speakerEventListeners) {
            speakerListener.onSpeakerPlayingStopped();
        }
    }

    isPlaying() {
        return this.playingSoundSources.length > 0; // Если есть активные источники, значит звук играет
    }

    getActiveSoundSource() {
        // динамик не может играть несколько источников
        return this.playingSoundSources[0];
    }

    _connectFiltersToOutput(soundSource, filters) {
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

    onSceneClosed() {
        this.stop();
    }
}
