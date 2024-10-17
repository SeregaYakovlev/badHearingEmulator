class FrequencyLine {

    constructor(audiogram, frequencyValue) {
        this.audiogram = audiogram;
        this.frequencyValue = frequencyValue;

        this.frequencyLine = document.createElement("div");
        this.frequencyLine.classList.add("frequencyLine");
    }

    getInt() {
        return this.frequencyValue;
    }

    drawAtAudioGram() {
        this.audiogram.addFrequencyLine(this);
        this._addCaption();
    }

    getIndex() {
        let frequencies = this.audiogram.getFrequencies();
        return frequencies.findIndex(frequency => frequency.getInt() === this.getInt());
    }

    getFrequencyPercentage(){
        let frequencyPercentage = 100 * (this.getIndex() / (this.audiogram.getFrequencyLength() - 1)); // Используем (length - 1), чтобы последний элемент был в крайней позиции
        return frequencyPercentage;
    }

    getMouseX(){
        let audiogramWidth = this.audiogram.getWidthInPX();

        return audiogramWidth * (this.getFrequencyPercentage() / 100);
    }

    _addCaption() {
        let caption = document.createElement("span");
        caption.classList.add("caption");
        let frequency = this.getInt();
        if (frequency >= 1000) {
            frequency = (frequency / 1000) + "k";
        }
    
        caption.textContent = frequency;
        this.frequencyLine.appendChild(caption);
    }

    asHTMLElement() {
        return this.frequencyLine;
    }
}