class StringArgument {
    constructor(argumentValue) {
        this.argumentValue = argumentValue;
    }

    setAsLanguageDependent(){
        this.languageDependent = true;
    }

    getValue(language) {
        let value = this.argumentValue;

        // Возвращаем перевод аргумента, если он языко-зависимый
        if(this.languageDependent){
            return language.getTranslation(this.argumentValue);
        }
    
        // В противном случае возвращаем как есть (например цифровой аргумент цифры)
        else {
            return value;
        }

    }

    replaceFirstPlaceholderWithArgument(text, language) {
        return text.replace(/{}/, this.getValue(language));
    }

}

function SA(argumentValue, isLanguageDependent){
    let argument = new StringArgument(argumentValue);

    if(isLanguageDependent){
        argument.setAsLanguageDependent();
    }

    return argument;
}