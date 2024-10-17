class AuditoryGraph {
    static AuditoryGraphType = {
        LEFT_EAR: 'LEFT_EAR',
        RIGHT_EAR: 'RIGHT_EAR',
        BINAURAL: 'BINAURAL',
        SEPARATED: 'SEPARATED'
    };

    constructor(audiogramType, points = []) {
        this.audiogramType = audiogramType;
        this.audiogramPoints = points;
    }

    // Метод клонирования
    clone() {
        return new AuditoryGraph(
            this.audiogramType,
            this.audiogramPoints.map(point => point.clone()) // Предполагаем, что у точек есть метод clone
        );
    }

    getType() {
        return this.audiogramType;
    }

    addAuditoryPoint(auditoryPoint) {
        this.audiogramPoints.push(auditoryPoint);
    }

    addAuditoryPointWithParams(frequency, level) {
        this.audiogramPoints.push(new AuditoryPoint(frequency, level));
    }

    getPoints() {
        return this.audiogramPoints;
    }

    getMinFrequency() {
        return 20;
    }

    getMaxFrequency() {
        return 20000;
    }

    getPointAt(frequency) {
        if (this.audiogramPoints.length === 0) {
            throw new Error("No auditory points");
        }

        let lowerPoint = this.audiogramPoints
            .filter(p => p.getFrequency() <= frequency)
            .sort((a, b) => b.getFrequency() - a.getFrequency())[0];

        let upperPoint = this.audiogramPoints
            .filter(p => p.getFrequency() > frequency)
            .sort((a, b) => a.getFrequency() - b.getFrequency())[0];

        if (!lowerPoint) {
            return new AuditoryPoint(frequency, upperPoint.getLevel());
        }

        if (!upperPoint) {
            return new AuditoryPoint(frequency, lowerPoint.getLevel());
        }

        return this.interpolate(frequency, lowerPoint, upperPoint);
    }

    validate() {
        if (this.audiogramPoints.length === 0) {
            throw new Error("The audiogram must contain at least one point.");
        }

        let frequencies = new Set();
        for (let point of this.audiogramPoints) {
            if (frequencies.has(point.getFrequency())) {
                throw new Error("Duplicate frequency found: " + point.getFrequency());
            }
            frequencies.add(point.getFrequency());
        }
    }

    interpolate(frequency, lowerPoint, upperPoint) {
        let lowerFrequency = lowerPoint.getFrequency();
        let upperFrequency = upperPoint.getFrequency();
        let lowerLevel = lowerPoint.getLevel();
        let upperLevel = upperPoint.getLevel();

        let interpolatedLevel = lowerLevel + (frequency - lowerFrequency) * (upperLevel - lowerLevel) / (upperFrequency - lowerFrequency);
        return new AuditoryPoint(frequency, Math.round(interpolatedLevel));
    }

    toJson() {
        return JSON.stringify(this);
    }

    static fromJson(json) {
        let data = JSON.parse(json);
        let instance = new this(); // Создайте новый экземпляр класса
    
        Object.assign(instance, data);

        // Предположим, что у вас есть массив auditoryPoints
        if (data.audiogramPoints) {
            instance.audiogramPoints = data.audiogramPoints.map(pointData => AuditoryPoint.fromJson(pointData));
        }

        return instance;
    }
    

    static validateList(auditoryGraphs) {
        for (let graph of auditoryGraphs) {
            graph.validate();
        }

        if (auditoryGraphs.length === 1) {
            if (auditoryGraphs[0].getType() !== AuditoryGraph.AuditoryGraphType.BINAURAL) {
                throw new Error("For a single AuditoryGraph, the type must be BINAURAL.");
            }
        } else if (auditoryGraphs.length === 2) {
            let type1 = auditoryGraphs[0].getType();
            let type2 = auditoryGraphs[1].getType();

            if (!((type1 === AuditoryGraph.AuditoryGraphType.LEFT_EAR && type2 === AuditoryGraph.AuditoryGraphType.RIGHT_EAR) ||
                (type1 === AuditoryGraph.AuditoryGraphType.RIGHT_EAR && type2 === AuditoryGraph.AuditoryGraphType.LEFT_EAR))) {
                throw new Error("For two AuditoryGraphs, their types must be LEFT_EAR and RIGHT_EAR in any order.");
            }
        } else {
            throw new Error("Invalid number of AuditoryGraphs. Expected 1 or 2.");
        }
    }

    static getListType(auditoryGraphs) {
        // Validation is assumed to be done elsewhere
        if (auditoryGraphs.length === 1) {
            return AuditoryGraph.AuditoryGraphType.BINAURAL;
        } else if (auditoryGraphs.length === 2) {
            return AuditoryGraph.AuditoryGraphType.SEPARATED;
        } else {
            throw new Error("Algorithm error");
        }
    }

    static getLeftEar(auditoryGraphs) {
        for (let graph of auditoryGraphs) {
            if (graph.getType() === AuditoryGraph.AuditoryGraphType.LEFT_EAR) {
                return graph;
            }
        }
        throw new Error("No left ear");
    }

    static getRightEar(auditoryGraphs) {
        for (let graph of auditoryGraphs) {
            if (graph.getType() === AuditoryGraph.AuditoryGraphType.RIGHT_EAR) {
                return graph;
            }
        }
        throw new Error("No right ear");
    }

    static getBinaural(auditoryGraphs) {
        for (let graph of auditoryGraphs) {
            if (graph.getType() === AuditoryGraph.AuditoryGraphType.BINAURAL) {
                return graph;
            }
        }
        throw new Error("No binaural audiogram");
    }

    static getAuditoryGraphArrayFromJson(jsonString) {
        // Преобразуем строку в массив JSON объектов
        let jsonArray = JSON.parse(jsonString);

        // Создаем массив AuditoryGraph из JSON объектов
        return jsonArray.map(graph => {
            // Создаем новый экземпляр AuditoryGraph
            let auditoryGraph = new AuditoryGraph(graph.audiogramType);

            // Преобразуем каждый пункт из JSON в AuditoryPoint и добавляем его в граф
            graph.audiogramPoints.forEach(point => {
                let auditoryPoint = new AuditoryPoint(point.frequency, point.level);
                auditoryGraph.addAuditoryPoint(auditoryPoint);
            });

            return auditoryGraph;
        });
    }
}
