class SoundVisualization {

    static FONT_SIZE = 16;
    static FFT_SIZE = 8192;
    static FREQUENCY_RANGE = [16, 20_000];

    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.audioContext = player.getAudioContext();

        // Создаем контейнер для визуализации
        this.soundVisualizationBox = this.scene.createBox();
        this.soundVisualizationBox.hide();
        this.soundVisualizationBox.setName("soundVisualizationBox");
        this.soundVisualizationBox.addClassName("soundVisualizationBox");

        // Создаем анализатор для визуализации аудио
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = SoundVisualization.FFT_SIZE; // Размер FFT для анализа частот
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount); // Массив для данных частот

        // Основной канвас для визуализации частот
        this.mainCanvas = document.createElement('canvas');
        this.mainCanvas.classList.add("mainCanvas");
        this.soundVisualizationBox.addElement(this.mainCanvas);

        // Канвас для линий и подписей частот
        this.overlayCanvas = document.createElement('canvas');
        this.overlayCanvas.classList.add("overlayCanvas");
        this.soundVisualizationBox.addElement(this.overlayCanvas);
    }

    _connectToSoundSource() {
        let soundSource;
        try {
            soundSource = this.player.getSoundSource();
        }
        catch (e) { }

        if (soundSource) {
            soundSource.connect(this.analyser);
        }
    }

    _disconnectFromSoundSource() {
        let soundSource;
        try {
            soundSource = this.player.getSoundSource();
        }
        catch (e) { }

        if (soundSource) {
            try {
                soundSource.disconnect(this.analyser);
            } catch (e) {
                console.log("Некритичная ошибка: " + e);
            }
        }
    }

    show() {
        this.soundVisualizationBox.reveal();
    }

    startProcessing() {
        this._connectToSoundSource();
        this._startVisualization();
    }

    stopProcessing() {
        this._disconnectFromSoundSource();
    }

    hide() {
        this.soundVisualizationBox.hide();
    }

    _startVisualization() {
        let rect = this.mainCanvas.getBoundingClientRect();
        let cssCanvasWidth = rect.width;
        let cssCanvasHeight = rect.height;

        this.mainCanvasCtx = this._setUpHiResCanvas(this.mainCanvas);
        this.overlayCanvasCtx = this._setUpHiResCanvas(this.overlayCanvas);

        let draw = () => {
            requestAnimationFrame(draw);

            // Получаем данные частотного спектра
            this.analyser.getByteFrequencyData(this.dataArray);
            let fftArray = this.dataArray;

            // Очищаем canvas
            this.mainCanvasCtx.clearRect(0, SoundVisualization.FONT_SIZE, cssCanvasWidth, cssCanvasHeight);

            let maxValue = Math.max(...fftArray);
            let minFrequency = SoundVisualization.FREQUENCY_RANGE[0];
            let maxFrequency = SoundVisualization.FREQUENCY_RANGE[1];

            for (let pixelIndex = 0; pixelIndex < cssCanvasWidth; pixelIndex++) {

                // Рассчитываем частоту на основе положения мыши и заданного диапазона частот
                let frequency = minFrequency + (pixelIndex / cssCanvasWidth) * (maxFrequency - minFrequency);

                let sampleRate = this.analyser.context.sampleRate; // Частота дискретизации
                let nyquist = sampleRate / 2; // Частота Найквиста

                let barHeight;
                // Вычисляем индекс для этой частоты
                let fftIndex = Math.floor((frequency / nyquist) * (fftArray.length));
                barHeight = fftArray[fftIndex] || 0;

                let normalizedBarHeight = (barHeight / maxValue) * (cssCanvasHeight - SoundVisualization.FONT_SIZE - 1);

                // Определяем цвет по высоте
                let color = this.getColor(barHeight);

                // Отрисовка полосы
                this.mainCanvasCtx.fillStyle = color;
                this.mainCanvasCtx.fillRect(pixelIndex, cssCanvasHeight - normalizedBarHeight, 1, normalizedBarHeight); // Используем 1 пиксель в ширину
            }
        }

        // Добавляем обработчик события mousemove
        this.overlayCanvas.addEventListener('mousemove', (event) => {
            this._onMouseMove(event);
            this._drawMouseFrequency(cssCanvasWidth, cssCanvasHeight);
        });

        this.drawFrequencies(cssCanvasWidth);

        draw();
    }



    // Метод для отрисовки частот
    drawFrequencies(cssCanvasWidth) {
        // Рисуем прямоугольник для обозначения области частот
        this.mainCanvasCtx.fillStyle = 'black'; // Цвет прямоугольника
        this.mainCanvasCtx.fillRect(0, 0, cssCanvasWidth, SoundVisualization.FONT_SIZE);

        let frequencies = 10;
        let frequencyRange = SoundVisualization.FREQUENCY_RANGE;

        // Настройка шрифта для подписей
        this.mainCanvasCtx.fillStyle = 'white'; // Цвет текста
        this.mainCanvasCtx.font = `${SoundVisualization.FONT_SIZE}px Arial`; // Шрифт текста
        this.mainCanvasCtx.textAlign = 'center'; // Выравнивание текста по центру

        for (let i = 0; i < frequencies; i++) {
            // Вычисляем частоту для центра полосы
            let frequency = frequencyRange[0] + (frequencyRange[1] - frequencyRange[0]) * ((i + 0.5) / frequencies);

            // Форматируем частоту
            let formattedFrequency = frequency >= 1000 ? (frequency / 1000).toFixed(1) + 'k' : Math.round(frequency);

            // Подпись частоты в верхней части канваса
            this.mainCanvasCtx.fillText(formattedFrequency, ((i + 0.5) / frequencies) * cssCanvasWidth, SoundVisualization.FONT_SIZE); // Позиция Y 8 пикселей от верхней границы
        }
    }

    // Функция для получения цвета в зависимости от высоты
    getColor(value) {
        let maxHeight = 255; // Максимальная высота
        let normalizedValue = Math.min(value, maxHeight); // Ограничиваем значение до maxHeight

        let red, green;

        if (normalizedValue < maxHeight / 2) {
            // Переход от зеленого к желтому
            red = Math.floor((normalizedValue / (maxHeight / 2)) * 255); // Красный возрастает
            green = 255; // Зеленый максимален
        } else {
            // Переход от желтого к красному
            red = 255; // Красный максимален
            green = Math.floor(((maxHeight - normalizedValue) / (maxHeight / 2)) * 255); // Зеленый убывает
        }

        return `rgb(${red}, ${green}, 0)`; // Синий компонент остается 0
    }

    _setUpHiResCanvas(canvas) {
        // Get the size of the canvas in CSS pixels.
        let rect = canvas.getBoundingClientRect();

        // Get the device pixel ratio, falling back to 1.
        let dpr = window.devicePixelRatio || 1;

        // Scale the resolution of the drawing surface
        // (without affecting the physical size of the canvas window).
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        let ctx = canvas.getContext('2d');
        // Scale all drawing operations,
        // to account for the resolution scaling.
        ctx.scale(dpr, dpr);
        return ctx;
    }

    _onMouseMove(event) {
        // Запоминаем положение указателя мыши
        let rect = this.overlayCanvas.getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
    }

    _drawMouseFrequency(cssCanvasWidth, cssCanvasHeight) {
        this.overlayCanvasCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

        if (this.mouseX !== null && this.mouseX >= 0 && this.mouseX <= cssCanvasWidth) {
            // Получаем диапазон частот
            let minFrequency = SoundVisualization.FREQUENCY_RANGE[0];
            let maxFrequency = SoundVisualization.FREQUENCY_RANGE[1];

            // Рассчитываем частоту на основе положения мыши и заданного диапазона частот
            let frequency = minFrequency + (this.mouseX / cssCanvasWidth) * (maxFrequency - minFrequency);

            // Преобразуем частоту в удобный текстовый формат (Гц или кГц)
            let frequencyText = frequency >= 1_000
                ? (frequency / 1_000).toFixed(1) + ' kHz'
                : frequency.toFixed(1) + ' Hz';

            // Рисуем вертикальную линию на месте курсора
            this.overlayCanvasCtx.strokeStyle = 'white';
            this.overlayCanvasCtx.lineWidth = 1;
            this.overlayCanvasCtx.beginPath();
            this.overlayCanvasCtx.moveTo(this.mouseX, SoundVisualization.FONT_SIZE);
            this.overlayCanvasCtx.lineTo(this.mouseX, cssCanvasHeight);
            this.overlayCanvasCtx.stroke();

            // Отображаем текст частоты рядом с курсором
            this.overlayCanvasCtx.fillStyle = 'white';
            this.overlayCanvasCtx.font = `${SoundVisualization.FONT_SIZE}px Arial`;
            this.overlayCanvasCtx.fillText(frequencyText, this.mouseX + 5, SoundVisualization.FONT_SIZE * 2);
        }
    }

}
