class VariableStorage {
    constructor() {
        this.variables = [];
    }

    setVariable(variableName, variableValue) {
        // Найти объект с нужным именем переменной
        let object = this.variables.find(o => o.variableName === variableName);
        
        if (object) {
            // Если объект найден, обновить его значение
            object.variableValue = variableValue;
        } else {
            // Если объект не найден, создать новый и добавить его в массив
            object = { variableName, variableValue };
            this.variables.push(object);
        }
    }

    getVariable(variableName) {
        // Найти объект с нужным именем переменной
        let object = this.variables.find(o => o.variableName === variableName);
        return object ? object.variableValue : undefined;
    }
}