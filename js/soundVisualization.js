class SoundVisualization {

    static FONT_SIZE = 16;
    static FFT_SIZE = 8192;
    static FREQUENCY_RANGE = [16, 20_000];

    constructor(scene, audioContext, soundSource) {
        this.page = scene.getPage();
        this.scene = scene;
        this.audioContext = audioContext;
        this.soundSource = soundSource;

        scene.subscribeToSceneClosing(this);

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

    // interface method
    onSceneClosed() {
        this._stopVisualization();
    }

    _startVisualization() {
        this.soundSource.connect(this.analyser);

        let rect = this.mainCanvas.getBoundingClientRect();
        let cssCanvasWidth = rect.width;
        let cssCanvasHeight = rect.height;

        this._drawSpectrum(cssCanvasWidth, cssCanvasHeight);
    }

    _stopVisualization() {
        try {
            this.soundSource.disconnect(this.analyser);
            cancelAnimationFrame(this.animationFrameId);
        } catch (e) {

        }
    }

    async show() {
        this.soundVisualizationBox.reveal();

        return new Promise((resolve) => {
            // Запрашиваем обновление интерфейса
            requestAnimationFrame(() => {
                this._initDisplay(); // Инициализируем отображение в следующем кадре
                this._startVisualization();
                resolve(); // Разрешаем промис после обновления
            });
        });
    }

    hide() {
        this._stopVisualization();
        this.soundVisualizationBox.hide();
    }

    _initDisplay() {
        let rect = this.mainCanvas.getBoundingClientRect();
        let cssCanvasWidth = rect.width;
        let cssCanvasHeight = rect.height;

        this.mainCanvasCtx = this._setUpHiResCanvas(this.mainCanvas);
        this.overlayCanvasCtx = this._setUpHiResCanvas(this.overlayCanvas);

        // Добавляем обработчик события mousemove
        this.overlayCanvas.addEventListener('mousemove', (event) => {
            this._onMouseMove(event.clientX);
            this._drawMouseFrequency(cssCanvasWidth, cssCanvasHeight);
        });

        // Добавляем обработчик события touchmove
        this.overlayCanvas.addEventListener('touchmove', (moveEvent) => {
            // Вызываем обработчик движения и рисования
            this._onMouseMove(moveEvent.touches[0].clientX);
            this._drawMouseFrequency(cssCanvasWidth, cssCanvasHeight);
        }, { passive: true });

        this.drawFrequencies(cssCanvasWidth);
    }

    _drawSpectrum(cssCanvasWidth, cssCanvasHeight) {
        this.animationFrameId = requestAnimationFrame(() => this._drawSpectrum(cssCanvasWidth, cssCanvasHeight));

        // Получаем данные частотного спектра
        this.analyser.getByteFrequencyData(this.dataArray);
        let fftArray = this.dataArray;

        // Очищаем canvas
        this.mainCanvasCtx.clearRect(0, SoundVisualization.FONT_SIZE, cssCanvasWidth, cssCanvasHeight);

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

            let normalizedBarHeight = (barHeight / 255) * (cssCanvasHeight - SoundVisualization.FONT_SIZE - 1);
            // Определяем цвет по высоте
            let color = this._getColor(barHeight);

            // Отрисовка полосы
            this.mainCanvasCtx.fillStyle = color;
            this.mainCanvasCtx.fillRect(pixelIndex, cssCanvasHeight - normalizedBarHeight, 1, normalizedBarHeight); // Используем 1 пиксель в ширину
        }
    }

    _getColor(value) {
        if (this.page.isDay()) {
            return this._getColorDay(value);
        }
        else {
            return this._getColorNight(value);
        }
    }

    // Функция для получения цвета в зависимости от высоты
    _getColorDay(value) {
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

    _getColorNight(value) {
        // Получаем дневной цвет
        let dayColor = this._getColorDay(value);
    
        // Извлекаем RGB-каналы из строкового формата 'rgb(r, g, b)'
        let match = dayColor.match(/\d+/g);
        if (!match || match.length < 3) {
            throw new Error("Invalid color format from _getColorDay");
        }
    
        let [red, green, blue] = match.map(Number);
    
        // Преобразуем в оттенок серого (взвешенное среднее)
        let gray = Math.floor(0.299 * red + 0.587 * green + 0.114 * blue);
    
        // Целевой цвет для ночного окраса (#d3af86)
        let targetColor = { red: 211, green: 175, blue: 134 };
    
        // Смешивание серого с целевым цветом
        let mixFactor = gray / 255; // Масштабируем оттенок серого (от 0 до 1)
        let redNight = Math.floor(mixFactor * targetColor.red);
        let greenNight = Math.floor(mixFactor * targetColor.green);
        let blueNight = Math.floor(mixFactor * targetColor.blue);
    
        // Возвращаем окрашенный серый цвет
        return `rgb(${redNight}, ${greenNight}, ${blueNight})`;
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
            let formattedFrequency = frequency >= 1000 ? Math.round((frequency / 1000)) + 'k' : Math.round(frequency);

            // Подпись частоты в верхней части канваса
            this.mainCanvasCtx.fillText(formattedFrequency, ((i + 0.5) / frequencies) * cssCanvasWidth, SoundVisualization.FONT_SIZE); // Позиция Y 8 пикселей от верхней границы
        }
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

    _onMouseMove(mouseX) {
        // Запоминаем положение указателя мыши
        let rect = this.overlayCanvas.getBoundingClientRect();
        this.mouseX = mouseX - rect.left;
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
                : Math.round(frequency) + ' Hz';

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
