class Point {
    constructor(audiogram, mouseX, mouseY) {
        this.audiogram = audiogram;

        this.mouseX = mouseX;
        this.mouseY = mouseY;

        this.level = this.YToLevel(mouseY);
        this.frequency = this.XToFrequency(mouseX);

        this.point = document.createElement("div");
        this.point.classList.add("audiogramPoint");

        // Устанавливаем координаты точки
        this.point.style.left = `${mouseX}px`;
        this.point.style.top = `${mouseY}px`;
    }

    getLevel() {
        return this.level;
    }

    getFrequency() {
        return this.frequency;
    }

    asHTMLElement() {
        return this.point;
    }

    getMouseX() {
        return this.mouseX;
    }

    getMouseY() {
        return this.mouseY;
    }

    draw() {
        this.audiogram.drawPoint(this);
    }

    clear(){
        this.audiogram.clearPoint(this);
    }

    YToLevel(y) {
        let levels = this.audiogram.getLevels();

        let minLevel = levels[0];
        let maxLevel = levels[levels.length - 1];

        let minY = minLevel.getMouseY();
        let maxY = maxLevel.getMouseY();

        // Преобразуем координаты мыши в уровень с помощью интерполяции
        let level = minLevel.getInt() + ((y - minY) / (maxY - minY)) * (maxLevel.getInt() - minLevel.getInt());

        return level;
    }

    // частоты в отличие от децибелов меняются по логарифму
    XToFrequency(x) {
        let frequencies = this.audiogram.getFrequencies();

        let minFrequency = frequencies[0];
        let maxFrequency = frequencies[frequencies.length - 1];

        let minX = minFrequency.getMouseX();
        let maxX = maxFrequency.getMouseX();

        let logMinFreq = Math.log10(minFrequency.getInt());
        let logMaxFreq = Math.log10(maxFrequency.getInt());

        let logFrequency = logMinFreq + ((x - minX) / (maxX - minX)) * (logMaxFreq - logMinFreq);
        let frequency = Math.pow(10, logFrequency);

        return frequency;
    }
}