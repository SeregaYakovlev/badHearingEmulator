class Audiogram {

    static Types = {
        LEFT_EAR: 1,
        RIGHT_EAR: 2,
        BINAURAL: 3
    }

    constructor(audiogramType) {
        this.audiogramType = audiogramType;
        this.audiogramContainer = document.createElement("div");
        this.audiogramContainer.classList.add("audiogramContainer");

        this.audiogram = document.createElement("div");
        this.audiogram.classList.add("audiogram");

        if (audiogramType === Audiogram.Types.LEFT_EAR) {
            this.audiogram.classList.add("left_ear");
        } else if (audiogramType === Audiogram.Types.RIGHT_EAR) {
            this.audiogram.classList.add("right_ear");
        } else if (audiogramType === Audiogram.Types.BINAURAL) {
            this.audiogram.classList.add("binaural");
        } else {
            throw new Error("Cannot define audiogram type");
        }

        this.audiogramContainer.appendChild(this.audiogram);

        this.frequencyLines = [
            new FrequencyLine(this, 125),
            new FrequencyLine(this, 250),
            new FrequencyLine(this, 500),
            new FrequencyLine(this, 1_000),
            new FrequencyLine(this, 2_000),
            new FrequencyLine(this, 4_000),
            new FrequencyLine(this, 8_000),
            new FrequencyLine(this, 16_000)
        ];


        this.levelLines = [
            new LevelLine(this, 0),
            new LevelLine(this, 10),
            new LevelLine(this, 20),
            new LevelLine(this, 30),
            new LevelLine(this, 40),
            new LevelLine(this, 50),
            new LevelLine(this, 60),
            new LevelLine(this, 70),
            new LevelLine(this, 80),
            new LevelLine(this, 90),
            new LevelLine(this, 100),
            new LevelLine(this, 110),
            new LevelLine(this, 120),
        ];

        this.points = [];

        this.audiogram.addEventListener("click", (e) => {
            this.handleClick(e);
        });
    }

    getCaption(){
        let caption;
        if(this.audiogramType === Audiogram.Types.LEFT_EAR){
            caption = htmlTSTR("LeftEar");
        }
        else if(this.audiogramType === Audiogram.Types.RIGHT_EAR){
            caption = htmlTSTR("RightEar");
        }
        else if(this.audiogramType === Audiogram.Types.BINAURAL){
            caption = htmlTSTR("BothEars");
        }
        else {
            throw new Error("Algorithm error");
        }

        return caption;
    }

    getTypeString() {
        switch(this.audiogramType) {
            case Audiogram.Types.LEFT_EAR:
                return 'LEFT_EAR';
            case Audiogram.Types.RIGHT_EAR:
                return 'RIGHT_EAR';
            case Audiogram.Types.BINAURAL:
                return 'BINAURAL';
            default:
                throw new Error("Algorithm error");
        }
    }

    getType(){
        return this.audiogramType;
    }

    asHTMLElement(){
        return this.audiogramContainer;
    }

    _onPointDrawed(point) {
        this.points.push(point);
        this._drawOrUpdateLine();
    }

    _onPointCleared(point) {
        let index = this.points.indexOf(point);
        this.points.splice(index, 1);
        this._drawOrUpdateLine();
    }

    getPoints() {
        return this.points;
    }

    static _sortPointsByFrequency(points) {
        return [...points].sort((a, b) => a.getFrequency() - b.getFrequency());
    }

    _drawOrUpdateLine() {
        if (this.audiogramLine) {
            this.audiogramLine.remove();
        }

        if (this.points.length < 2) {
            return;
        }


        let sortedPoints = Audiogram._sortPointsByFrequency(this.points);

        this.audiogramLine = this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.audiogramLine.classList.add("audiogramLine");
        this.audiogram.appendChild(this.audiogramLine);

        // Пройтись по отсортированным точкам и нарисовать линии
        for (let i = 0; i < sortedPoints.length - 1; i++) {
            let p1 = sortedPoints[i];
            let p2 = sortedPoints[i + 1];

            let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', p1.getMouseX() + 2.5); // +5 чтобы центрировать линию по середине точки
            line.setAttribute('y1', p1.getMouseY() + 2.5);
            line.setAttribute('x2', p2.getMouseX() + 2.5);
            line.setAttribute('y2', p2.getMouseY() + 2.5);

            this.audiogramLine.appendChild(line);
        }
    }

    handleClick(e) {

        // Получаем размеры и позицию элемента
        let rect = this.audiogram.getBoundingClientRect();

        // Вычисляем относительные координаты клика относительно элемента
        let xRelativeToElement = e.clientX - rect.left;
        let yRelativeToElement = e.clientY - rect.top;

        if (xRelativeToElement < 0 || yRelativeToElement < 0) {
            /* почему-то на числа децибел и частот браузер реагирует,
            хотя не должен */
            return;
        }

        let point = new Point(this, xRelativeToElement, yRelativeToElement);
        point.draw();

    }

    addFrequencyLine(frequencyLine) {
        let htmlElement = frequencyLine.asHTMLElement();
        let frequencyPercentage = frequencyLine.getFrequencyPercentage();
        htmlElement.style.left = `${frequencyPercentage}%`;
        this.audiogram.appendChild(htmlElement);
    }

    addLevelLine(levelLine) {
        let htmlElement = levelLine.asHTMLElement();
        let levelPercentage = levelLine.getLevelPercentage();
        htmlElement.style.top = `${levelPercentage}%`;
        this.audiogram.appendChild(htmlElement);
    }

    clearAllPoints() {
        let clonedPoints = [...this.points]; // Клонируем массив
        for (let point of clonedPoints) {
            point.clear();
        }
    }

    clearLastDrawnPoint() {
        let lastPoint = this.points[this.points.length - 1];
        lastPoint.clear();
    }

    drawPoint(point) {
        let htmlElement = point.asHTMLElement();

        this.audiogram.appendChild(htmlElement);

        this._onPointDrawed(point);
    }

    clearPoint(point) {
        let htmlElement = point.asHTMLElement();

        htmlElement.remove();

        this._onPointCleared(point);
    }

    show(htmlContainer) {
        for (let frequencyLine of this.frequencyLines) {
            frequencyLine.drawAtAudioGram(this);
        }

        for (let levelLine of this.levelLines) {
            levelLine.drawAtAudioGram(this);
        }

        htmlContainer.appendChild(this.audiogramContainer);
    }

    getLevels() {
        return this.levelLines;
    }

    getFrequencies() {
        return this.frequencyLines;
    }

    getLevelLength() {
        return this.levelLines.length;
    }

    getFrequencyLength() {
        return this.frequencyLines.length;
    }

    getHeightInPX() {
        return this.audiogram.getBoundingClientRect().height;
    }

    getWidthInPX() {
        return this.audiogram.getBoundingClientRect().width;
    }

    toJsonSerializableObj() {
        let json = {};
        json.audiogramType = this.getTypeString();
    
        let points = this.points;
        let sortedPoints = Audiogram._sortPointsByFrequency(points);
    
        json.audiogramPoints = []; // Инициализируем массив auditoryPoints
    
        for (let point of sortedPoints) {
            let p = {};
            p.frequency = point.getFrequency();
            p.level = point.getLevel();
            json.audiogramPoints.push(p); // Добавляем точку в массив auditoryPoints
        }
    
        return json;
    }
}