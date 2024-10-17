class LevelLine {

    constructor(audiogram, levelValue) {
        this.audiogram = audiogram;
        this.levelValue = levelValue;

        this.levelLine = document.createElement("div");
        this.levelLine.classList.add("levelLine");
    }

    getInt(){
        return this.levelValue;
    }

    getIndex() {
        let levels = this.audiogram.getLevels();
        return levels.findIndex(level => level.getInt() === this.getInt());
    }

    getLevelPercentage(){
        let levelPercentage = 100 * (this.getIndex() / (this.audiogram.getLevelLength() - 1)); // Используем (length - 1), чтобы последний элемент был в крайней позиции
        return levelPercentage;
    }
    
    getMouseY(){
        let audiogramHeight = this.audiogram.getHeightInPX();

        return audiogramHeight * (this.getLevelPercentage() / 100);
    }

    drawAtAudioGram() {
        this.audiogram.addLevelLine(this);
        this._addCaption();
    }

    static _calculateIndent(value) {
        // Получаем длину числа
        let length = value.toString().length;
    
        // Вычисляем отступ на основе длины числа
        // Можно выбрать коэффициент, который будет умножать на длину числа,
        // чтобы получить желаемое значение сдвига
        let coefficient = 0.6; // Выберите коэффициент по вашему усмотрению
    
        // Вычисляем отступ
        let indent = -coefficient * length;
    
        return indent + 'em'; // Возвращаем значение отступа с единицей измерения em
    }

    _addCaption(){
        let caption = document.createElement("span");
        caption.classList.add("caption");
        
        let levelValue = this.getInt();
        caption.style.textIndent = LevelLine._calculateIndent(levelValue);
        caption.textContent = levelValue;
        this.levelLine.appendChild(caption);
    }

    asHTMLElement() {
        return this.levelLine;
    }
}