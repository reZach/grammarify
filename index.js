var spellchecker = require("spellchecker");

exports = module.exports = new Grammarify();

function Grammarify(){

    // Private variables
    var smsMap = new Grammarify_SMS();
    var numberMap = new Grammarify_Numbers();

    return {
        clean: function(string){
            if (string.length === 0){
                return "";
            }

            //console.log(spellchecker.getCorrectionsForMisspelling("ref"));

            // Get rid of all whitespace
            var words = string.split(" ");
            var newWords = words.filter(w => w.length !== 0);

            // Replace shorthand/improper grammar
            // the spellchecker might miss
            newWords = smsMap.transform(newWords);

            // Save where there is existing punctuation
            var endingPunctuation = [];
            for (var i = 0; i < newWords.length; i++){
                if (newWords[i].indexOf(".") >= 0){
                    endingPunctuation.push(".");
                } else if (newWords[i].indexOf("!") >= 0){
                    endingPunctuation.push("!");
                } else if (newWords[i].indexOf("?") >= 0){
                    endingPunctuation.push("?");                    
                } else {
                    endingPunctuation.push("");
                }
            }
            
            
            // Clean the sentence;
            // main logic loop
            var duplicates = ["the", "a", "an", "and", "but", "or", "nor", "for", "so", "yet"];
            var corrections = [];
            var periodsIndex = -1;
            var endingPunctuationIndex = false;
            var lastCharacter = "";
            for (var i = 0; i < newWords.length; i++){

                // Remove words that are safe to delete if duplicated after each other
                if (i > 0 && 
                    newWords[i] === newWords[i-1].substring(1) &&
                    duplicates.indexOf(newWords[i]) >= 0){

                    newWords.splice(i, 1);
                    i--;
                    continue;
                }

                // Spellcheck words
                if (spellchecker.isMisspelled(newWords[i])){
                    corrections = spellchecker.getCorrectionsForMisspelling(newWords[i]);

                    if (corrections.length > 0){
                        newWords[i] = corrections[0];
                        corrections = [];
                    }
                }

                // Capitalize words if necessary
                if (i > 0){
                    endingPunctuationIndex = endingPunctuation[i-1] !== "";
                }                
                if (i === 0 || endingPunctuationIndex){
                    newWords[i] = newWords[i][0].toUpperCase() + newWords[i].substr(1);
                }

                // Add ending period if necessary
                if (i === newWords.length - 1){
                    
                    // Only if the word doesn't already end in punctuation
                    lastCharacter = newWords[i][newWords[i].length-1];
                    if (lastCharacter !== "." &&
                        lastCharacter !== "!" &&
                        lastCharacter !== "?"){
                            newWords[i] = newWords[i] + ".";
                        }
                }

                // Add leading space to word
                if (i !== 0){
                    newWords[i] = " " + newWords[i];
                }
            }

            return newWords.join("");
        }
    }    
}

function Grammarify_SMS(){

    var map = {
        // #s
        "2night": "tonight",
        "2nite": "tonight",

        // A
        "asap": "as soon as possible",
        "asl": "American Sign Language",

        // B
        "bc": "because",
        "bf": "boyfriend",
        "btw": "by the way",

        // C

        // D

        // E
        "eg": "example",
        "els": "else",

        // F
        "f": "female",
        "ftw": "for the win",
        "fyi": "for your information",

        // G
        "gf": "girlfriend",
        "gotta": "got to",
        "gr8": "great",

        // H
        "hada": "had a",
        "hmu": "hit me up",
        "hr": "hour",
        "hrs": "hours",

        // I
        "idk": "I don't know",

        // J

        // K
        "kinda": "kind of",

        // L

        // M
        "m": "male",

        // N
        "nite": "night",

        // O
        "omg": "oh my gosh",

        // P
        "pls": "please",
        "plz": "please",
        "ppl": "people",           

        // Q

        // R

        // S

        // T
        "tbh": "to be honest",
        "tho": "though",
        "thru": "through",
        "tryna": "trying to",

        // U
        "u": "you",

        // V

        // W
        "wanna": "want to",
        "wk": "week",
        "wks": "weeks",
        "wtf": "what the fuck",
        "wth": "what the heck",
        "wya": "where are you at",

        // X

        // Y
        "yknow": "you know"

        // Z
        
    };

    return {
        transform: function(input){
            var punctuation = "";
            var container = [];
            var stripped = "";

            // Create the data we are transforming
            if (Array.isArray(input)){
                container = input;
            } else if (typeof input === "string"){
                container = input.split(" ");
            } else {
                return "";
            }

            // Transform our data
            for (var i = 0; i < container.length; i++){

                // Save existing punctuation
                stripped = container[i].match(/([a-zA-Z0-9']*)([\?!\.;]*)$/);
                if (typeof stripped[2] !== ""){
                    punctuation = stripped[2];
                }
                
                stripped = stripped[1]; // Sets stripped to input that was passed into the .match call
                if (typeof map[stripped] !== "undefined"){
                    container[i] = map[stripped];

                    // Re-add punctuation back in
                    if (punctuation !== ""){
                        container[i] = container[i] + punctuation;
                        punctuation = "";
                    }
                }
            }

            return container;
        }
    }
}

function Grammarify_Numbers(){

}