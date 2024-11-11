class MyFFT {
    constructor(file) {
        this.originalFile = file;
    }

    setPreloader(preloader) {
        this.preloaderEarArea = preloader.createCaptionArea();
        this.preloaderStatusArea = preloader.createCaptionArea();
    }

    async _set_fft_ear_message(message){
        this.preloaderEarArea.setMessage(message);
        await new Promise(resolve => requestAnimationFrame(resolve));
    }

    async _set_fft_message(message){
        this.preloaderStatusArea.setMessage(message);
        await new Promise(resolve => requestAnimationFrame(resolve));
    }

    _onProcessingLeftEar(){
        this._set_fft_ear_message(htmlTSTR("LeftEar"));
    }

    _onProcessingRightEar(){
        this._set_fft_ear_message(htmlTSTR("RightEar"));
    }

    _onProcessingBinaural(){
        this._set_fft_ear_message(htmlTSTR("BothEars"));
    }

    async processWithAuditoryGraphs(auditoryGraphs) {
        await this._set_fft_message(htmlTSTR("FileDownloading..."));

        // Чтение аудиофайла
        let file = this.originalFile;
        let audioBuffer = await this._loadFileToAudioBuffer(file);

        await this._set_fft_message(htmlTSTR("FileUploaded"));

        let auditoryGraphType = AuditoryGraph.getListType(auditoryGraphs);
        if (auditoryGraphType === AuditoryGraph.AuditoryGraphType.BINAURAL) {
            audioBuffer = await this._convertToMonoBuffer(audioBuffer);
        }
        else if (auditoryGraphType === AuditoryGraph.AuditoryGraphType.SEPARATED) {
            audioBuffer = await this._convertToStereoBuffer(audioBuffer);
        }
        else {
            throw new Error("Algorithm error");
        }

        let sampleRate = audioBuffer.sampleRate;  // Частота дискретизации
        let numChannels = audioBuffer.numberOfChannels;  // Количество каналов

        let audioSamples = await this._getAudioSamples(audioBuffer);

        let handledSamples;

        if (auditoryGraphType == AuditoryGraph.AuditoryGraphType.SEPARATED) {
            let leftEarGraph = AuditoryGraph.getLeftEar(auditoryGraphs);
            let rightEarGraph = AuditoryGraph.getRightEar(auditoryGraphs);
            handledSamples = await this._handleStereoSamplesByFFT(
                audioSamples, sampleRate,
                leftEarGraph, rightEarGraph);
        }
        else if (auditoryGraphType == AuditoryGraph.AuditoryGraphType.BINAURAL) {
            let binauralGraph = AuditoryGraph.getBinaural(auditoryGraphs);

            await this._onProcessingBinaural();
            handledSamples = await this._handleMonoSamplesByFFT(audioSamples, sampleRate, binauralGraph);
        }
        else {
            throw new Error("Algorithm error");
        }

        let audioContext = new (window.AudioContext || window.webkitAudioContext)();
        let handledBuffer = MyFFT._createAudioBufferFromSamples(audioContext, sampleRate, numChannels, handledSamples);
        return handledBuffer;
    }

    async _loadFileToAudioBuffer(file) {
        let arrayBuffer = await file.arrayBuffer();
        let audioContext = new (window.AudioContext || window.webkitAudioContext)();
        let audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer;
    }

    async _getAudioSamples(audioBuffer) {
        console.time("getAudioSamples");

        await this._set_fft_message(htmlTSTR("ReadingSamplesFromFile"));

        let numChannels = audioBuffer.numberOfChannels;
        let samplesPerChannel = audioBuffer.length;

        // Создаем массив для хранения объединенных аудиоданных
        let allSamples = new Float32Array(samplesPerChannel * numChannels);

        for (let channel = 0; channel < numChannels; channel++) {
            let channelData = audioBuffer.getChannelData(channel);

            // Объединяем сэмплы в правильном порядке
            for (let i = 0; i < samplesPerChannel; i++) {
                allSamples[i * numChannels + channel] = channelData[i];
            }
        }

        console.timeEnd("getAudioSamples");

        await this._set_fft_message(htmlTSTR("SamplesFromFileRead"));

        return allSamples;
    }


    async _handleMonoSamplesByFFT(audioSamples, sampleRate, auditoryGraph) {
        return await this.handleSamplesByFFT(audioSamples, sampleRate, auditoryGraph);
    }

    async _handleStereoSamplesByFFT(audioSamples, sampleRate, leftEarGraph, rightEarGraph) {
        let length = audioSamples.length / 2;

        // Разделение на левый и правый каналы
        let leftChannel = new Float32Array(length);
        let rightChannel = new Float32Array(length);

        for (let i = 0; i < length; i++) {
            leftChannel[i] = audioSamples[2 * i];
            rightChannel[i] = audioSamples[2 * i + 1];
        }

        await this._onProcessingLeftEar();
        // Обработка моно-каналов отдельно
        let processedLeftChannel = await this._handleMonoSamplesByFFT(leftChannel, sampleRate, leftEarGraph);

        await this._onProcessingRightEar();
        let processedRightChannel = await this._handleMonoSamplesByFFT(rightChannel, sampleRate, rightEarGraph);

        // Объединение обработанных каналов в стерео
        let handledAudioSamples = new Float32Array(audioSamples.length);
        for (let i = 0; i < length; i++) {
            handledAudioSamples[2 * i] = processedLeftChannel[i];
            handledAudioSamples[2 * i + 1] = processedRightChannel[i];
        }

        return handledAudioSamples;
    }


    // Преобразует аудио сэмплы с использованием FFT и применяет коэффициенты ослабления
    async handleSamplesByFFT(audioSamples, sampleRate, auditoryGraph) {

        // Находим ближайшую степень двойки, большую или равную длине сэмплов
        let paddedLength = MyFFT.getNextPowerOfTwo(audioSamples.length);

        // Создаем массив комплексных чисел для FFT
        let floatInput = new Float32Array(paddedLength);  // Учитываем реальную и мнимую часть
        for (let i = 0; i < audioSamples.length; i++) {
            floatInput[i] = audioSamples[i];  // Реальная часть
        }

        // Заполняем оставшиеся элементы массива комплексных чисел нулями
        for (let i = audioSamples.length; i < paddedLength; i++) {
            floatInput[i] = 0;
        }

        // Создаем объект FFT и выполняем прямое преобразование Фурье
        console.time("fft");
        let fft = new FFTJS(paddedLength);
        let fftData = new Float32Array(paddedLength * 2); // Правильный размер для хранения результатов FFT

        await this._set_fft_message(htmlTSTR("PerformingDirectFFT"));

        // Прямое преобразование
        fft.realTransform(fftData, floatInput);
        console.timeEnd("fft");

        console.log("FFT length: " + fftData.length);
        // Применение коэффициентов ослабления
        console.time('Apply Attenuation');

        await this._set_fft_message(htmlTSTR("ApplicationAttenuationFactors"));

        for (let i = 0; i < fftData.length; i += 2) {

            let frequency;
            if (i < fftData.length / 2) {
                frequency = (i * sampleRate) / fftData.length;
            } else {
                frequency = ((fftData.length - i) * sampleRate) / fftData.length;
            }

            let point = auditoryGraph.getPointAt(frequency);

            let attenuation = point.getAttenuation();

            let fftValue = new Complex(fftData[i], fftData[i + 1]);
            let magnitude = fftValue.abs();
            let phase = fftValue.getArgument();

            // Применяем коэффициент ослабления к амплитуде
            let newMagnitude = magnitude * attenuation;
            let newComplex = Complex.polar2Complex(newMagnitude, phase);

            fftData[i] = newComplex.getReal();
            fftData[i + 1] = newComplex.getImaginary();

        }

        console.timeEnd('Apply Attenuation');

        await this._set_fft_message(htmlTSTR("PerformingInverseFFT"));
        console.time("ifft");
        // Выполняем обратное преобразование Фурье
        let ifftData = new Float32Array(fftData.length); // Правильный размер для хранения результатов IFFT
        fft.inverseTransform(ifftData, fftData);
        console.timeEnd("ifft");

        // Заполняем массив обработанных сэмплов
        let handledSamples = new Float32Array(audioSamples.length);
        for (let i = 0; i < audioSamples.length; i++) {
            handledSamples[i] = ifftData[i * 2];  // Учитываем только реальную часть и масштабируем
        }

        return handledSamples;
    }

    static getNextPowerOfTwo(integer) {
        return Math.pow(2, Math.ceil(Math.log2(integer)));
    }

    async _convertToMonoBuffer(audioBuffer) {
        await this._set_fft_message(htmlTSTR("ConvertingSoundToMonoFormat"));

        console.time("convertToMono");
        // Создание моно-канала
        let length = audioBuffer.length;
        let sampleRate = audioBuffer.sampleRate;
        let monoChannel = new Float32Array(length);

        // Суммирование всех каналов и усреднение
        let numOfChannels = audioBuffer.numberOfChannels;
        let channelData = new Array(numOfChannels);

        // Получаем данные для всех каналов один раз
        for (let channel = 0; channel < numOfChannels; channel++) {
            channelData[channel] = audioBuffer.getChannelData(channel);
        }

        for (let i = 0; i < length; i++) {
            let sum = 0;
            for (let channel = 0; channel < numOfChannels; channel++) {
                sum += channelData[channel][i];
            }
            monoChannel[i] = sum / numOfChannels;
        }

        let audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Создание нового моно-буфера
        let monoBuffer = audioContext.createBuffer(1, length, sampleRate);
        monoBuffer.copyToChannel(monoChannel, 0);

        console.timeEnd("convertToMono");

        return monoBuffer;
    }

    async _convertToStereoBuffer(audioBuffer) {
        console.time("convertToStereo");
        audioBuffer = await this._convertToMonoBuffer(audioBuffer);

        await this._set_fft_message(htmlTSTR("ConvertingSoundToStereoFormat"));

        let length = audioBuffer.length;
        let sampleRate = audioBuffer.sampleRate;

        // Получение данных моно-канала
        let inputData = audioBuffer.getChannelData(0); // Предполагаем, что исходный файл моно

        // Создание двух стерео-каналов
        let leftChannel = new Float32Array(length);
        let rightChannel = new Float32Array(length);

        // Заполнение обоих каналов одинаковыми данными из исходного аудиобуфера
        leftChannel.set(inputData);
        rightChannel.set(inputData);

        let audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // Создание нового стерео-буфера
        let stereoBuffer = audioContext.createBuffer(2, length, sampleRate);
        stereoBuffer.copyToChannel(leftChannel, 0); // Левый канал
        stereoBuffer.copyToChannel(rightChannel, 1); // Правый канал

        console.timeEnd("convertToStereo");
        return stereoBuffer;
    }

    static _createAudioBufferFromSamples(audioContext, sampleRate, numChannels, audioSamples) {
        // Создаем пустой AudioBuffer с нужным количеством каналов и сэмплов
        let audioBuffer = audioContext.createBuffer(numChannels, audioSamples.length / numChannels, sampleRate);

        // Копируем сэмплы в AudioBuffer
        for (let channel = 0; channel < numChannels; channel++) {
            let channelData = new Float32Array(audioSamples.length / numChannels);

            // Извлекаем сэмплы для текущего канала
            for (let i = 0; i < channelData.length; i++) {
                channelData[i] = audioSamples[i * numChannels + channel];
            }

            audioBuffer.copyToChannel(channelData, channel);
        }

        return audioBuffer;
    }
}
