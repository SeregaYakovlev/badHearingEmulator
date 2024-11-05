function setTSTR(stringName, args){
    let translatedString = new TranslatedString(stringName);
    translatedString.applyArgs(args);
    return translatedString.toHTMLFormat(window.page.getCurrentLanguage());
}

function getTSTR(stringName){
    let translatedString = new TranslatedString(stringName);
    return translatedString.toTextFormat(window.page.getCurrentLanguage());
}