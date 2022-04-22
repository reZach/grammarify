let spellchecker;
let spellcheck = true;
let skipURLs = false;

if (typeof window === 'undefined') {
    spellchecker = require("spellchecker");
} else {
    spellcheck = false;
}

exports = module.exports = function Grammarify(opts){

    // Global options
    opts = opts || {
        spellcheck: true,
        skipURLs: false,
        wordMap: {
            "2night": "tonight",
            "2nite": "tonight",
            "asap": "as soon as possible",
            "asl": "American Sign Language",
            "bc": "because",
            "bf": "boyfriend",
            "btw": "by the way",
            "cuz": "because",
            "eg": "example",
            "els": "else",
            "f": "female",
            "ftw": "for the win",
            "fyi": "for your information",
            "gf": "girlfriend",
            "gotta": "got to",
            "gr8": "great",
            "hada": "had a",
            "hmu": "hit me up",
            "hr": "hour",
            "hrs": "hours",
            "idk": "I don't know",
            "im": "I'm",
            "jude": "Jude", // how to expand this to all proper nouns??
            "kinda": "kind of",
            "m": "male",
            "msg": "message",
            "nite": "night",
            "na": "N/A",
            "n/a": "N/A",
            "omg": "oh my gosh",
            "pls": "please",
            "plz": "please",
            "ppl": "people",           
            "tbh": "to be honest",
            "tho": "though",
            "thru": "through",
            "tryna": "trying to",
            "u": "you",
            "w": "with",
            "wanna": "want to",
            "whaat": "what", // spellchecker library thinks this is a word
            "whaaat": "what", // spellchecker library thinks this is a word
            "wk": "week",
            "wks": "weeks",
            "wtf": "what the fuck",
            "wth": "what the heck",
            "wya": "where are you at",
            "yknow": "you know"
        },
        disconnectedList: [
            "awesome",
            "everything",
            "herself",
            "himself",
            "nowhere",
            "today",
            "yourself"
        ]               
        
    }

    // Private variables
    const preProcessMap = new Grammarify_PreProcess();
    const smsMap = new Grammarify_SMS(opts.wordMap);
    const disconnectedMap = new Grammarify_Disconnected(opts.disconnectedList);
    const numberMap = new Grammarify_Numbers();

    return {
        clean: function(string){

            spellcheck = opts.spellcheck
            skipURLs = opts.skipURLs || false
            if (skipURLs === true) {
                // If URL formatting is found, just return the string untouched.
                if (string.match(`(?:\/\/)`)) return string
            }

            if (string.length === 0){
                return "";
            }

            // Replace unicode characters that break parsing
            string = string
                .replace(/[\u2018\u2019]/g, "'")
                .replace(/[\u201C\u201D]/g, '"');

            // Run through pre-processing;
            // fixing periods and other characters
            string = preProcessMap.fixPeriodAndEllipsis(string);
            string = preProcessMap.fixSpaceAfterCharacter(string);

            // Get rid of all whitespace
            const words = string.split(" ");
            let newWords = words.filter(w => w.length !== 0);

            // Fix stretched words
            newWords = smsMap.fixStretching(newWords);

            // Replace shorthand/improper grammar
            // the spellchecker might miss
            newWords = smsMap.fixShorthand(newWords);

            // Fix words that should really be
            // one word instead of two
            newWords = disconnectedMap.fixSeparated(newWords);

            // Save where there is existing punctuation
            let endingPunctuation = [];
            for (let i = 0; i < newWords.length; i++){
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
            const duplicates = ["the", "a", "an", "and", "but", "or", "nor", "for", "so", "yet"];
            let corrections = [];
            let endingPunctuationIndex = false;
            let lastCharacter = "";
            let spcheckThisWord = "";
            let preSpellcheck = "";
            let preSpellcheckEndingPunct = "";
            for (let i = 0; i < newWords.length; i++){

                // Remove words that are safe to delete if duplicated after each other
                if (i > 0 && 
                    newWords[i] === newWords[i-1].trim().toLowerCase() &&
                    duplicates.indexOf(newWords[i].toLowerCase()) >= 0){

                    newWords.splice(i, 1);
                    i--;
                    continue;
                }

                // Spellcheck words;
                // remove ending punctuation first
                preSpellcheck = newWords[i].match(/[\W]+$/g);

                if (preSpellcheck !== null){
                    spcheckThisWord = newWords[i].replace(/[\W]+$/g, "");
                } else {
                    spcheckThisWord = newWords[i];
                }
                if (spellcheck === true && spellchecker.isMisspelled(spcheckThisWord)){
                    corrections = spellchecker.getCorrectionsForMisspelling(spcheckThisWord);
                    
                    if (corrections.length > 0){
                        newWords[i] = corrections[0];
                        corrections = [];

                        // Add ending punctuation back in
                        if (preSpellcheck !== null){
                            newWords[i] = newWords[i] + preSpellcheck[0];
                        }
                    }
                }

                // Capitalize words if necessary
                if (i > 0){
                    endingPunctuationIndex = endingPunctuation[i-1] !== "";
                }        
                // These extra comparisons address some edge cases where an elipsis would result in a capitalized
                // word following it. For example, this:
                //   "I was thinking yesterday... to test you."
                // Would result in this:
                //   "I was thinking yesterday... To test you."
                if (i === 0 || endingPunctuationIndex && !newWords[i-1].endsWith('..') && !newWords[i-2].endsWith('..')){
                    newWords[i] = newWords[i][0].toUpperCase() + newWords[i].substring(1);
                }

                // Add a leading space to words
                // The additional comparison addresses an edge case where the following statement:
                //   "I was thinking yesterday..that I should go outside."
                // Would turn into this:
                //   "I was thinking yesterday.. . that I should go outside."
                if (i !== 0 && newWords[i] !== '.'){
                    newWords[i] = " " + newWords[i];
                }
            }

            // Add ending period if necessary
            const lastWord = newWords.length - 1;

            // Only if the word doesn't already end in punctuation
            lastCharacter = newWords[lastWord][newWords[lastWord].length - 1];
            if (lastCharacter !== "." &&
                lastCharacter !== "!" &&
                lastCharacter !== "?"){
                    newWords[lastWord] = newWords[lastWord] + ".";
                }
                
            return newWords.join("");
        }
    }    
}

function Grammarify_PreProcess(){

    // Valid characters to fix;
    // cannot be duplicated
    const validCharsToFix = [",", ";", ":", "%"];

    const fixer = function(input, charToFix){
        
        // Remove this character from the beginning of the string
        let regex = new RegExp("^[ \\" + charToFix + ".]+", "g");
        input = input.replace(regex, "");

        // Capture all instances of this character
        regex = new RegExp("\\b([ \\" + charToFix + "]*\\" + charToFix + "[ \\" + charToFix + "]*)(\\b|$)", "g");
        const badMatches = input.match(regex);
        let badMatchesIndex = 0;
        let tempSearch = "";

        if (badMatches !== null){
            for (let i = 0; i < badMatches.length; i++){
                badMatchesIndex = input.indexOf(badMatches[i], badMatchesIndex);

                tempSearch = input.substring(badMatchesIndex);

                // Corner-case;
                // don't add space if fixing this
                // 3,,000
                if (badMatchesIndex + badMatches[i].length < input.length &&
                    input[badMatchesIndex + badMatches[i].length + 1].match(/\d/) !== null){
                    tempSearch = tempSearch.replace(badMatches[i], charToFix);
                } else {
                    tempSearch = tempSearch.replace(badMatches[i], (charToFix + " "));
                }
                
                input = input.substring(0, badMatchesIndex) + tempSearch;

                badMatchesIndex++;
            }
        }

        return input;
    };

    return {
        fixPeriodAndEllipsis: function(input){

            // Remove periods from the beginning of the string
            input = input.replace(/^[ \.]+/g, "");

            const badPeriods = input.match(/\b([ \.]*\.[ \.]*)(\b|$)/g);
            let badPeriodsIndex = 0;
            let tempSearch = "";
            
            if (badPeriods !== null){
                for (let i = 0; i < badPeriods.length; i++){
                    badPeriodsIndex = input.indexOf(badPeriods[i], badPeriodsIndex);
                    
                    // If we only find a single period;
                    // ie. "the pig.ran"
                    //     "the pig .ran"
                    //     "the pig . ran"
                    if (badPeriods[i].split(".").length == 2){
                        tempSearch = input.substring(badPeriodsIndex);
                        tempSearch = tempSearch.replace(badPeriods[i], ". ");
                        input = input.substring(0, badPeriodsIndex) + tempSearch;

                        badPeriodsIndex++;
                    } else if (badPeriods[i].split(".").length >= 3){
                        
                        // If we find an ellipsis-like pattern;
                        // ie. "the pig..ran"
                        //     "the pig ..ran"
                        //     "the pig .. ran"
                        tempSearch = input.substring(badPeriodsIndex);
                        tempSearch = tempSearch.replace(badPeriods[i], "... ");
                        input = input.substring(0, badPeriodsIndex) + tempSearch;

                        badPeriodsIndex++;
                    }
                }
            }

            return input;
        },
        fixSpaceAfterCharacter: function(input){

            // Process all characters we can fix
            for (let i = 0; i < validCharsToFix.length; i++){
                input = fixer(input, validCharsToFix[i]);
            }

            return input;
        }
    }
}

function Grammarify_SMS(map){

    const unstretchify = function(word, indicees, pivot){

        // Base cases;
        // word matches to a shorthand map we have defined
        if (typeof map[word] !== "undefined"){
            return map[word];
        } else if (spellcheck === true && !spellchecker.isMisspelled(word)){
            
            // The word is not misspelled
            return word;
        } else if (indicees.reduce((acc, cur) => {return acc + (cur.endIndex - cur.startIndex);}, 0) === 0){
            
            // Above check could use optimization;
            // exit if we've iterated fully over
            // this particular pivot value
            return "";
        } else {

            // Alter indicees array
            const indiceesArrayIndex = pivot > 0 ? pivot - 1 : indicees.length-1;

            if (indicees[indiceesArrayIndex].endIndex > indicees[indiceesArrayIndex].startIndex){
                indicees[indiceesArrayIndex].endIndex = indicees[indiceesArrayIndex].endIndex - 1;

                // Chop off duplicate letter in word,
                // this is how we work to the base case
                word = word.substring(0, indicees[indiceesArrayIndex].startIndex) + word.substring(indicees[indiceesArrayIndex].startIndex+1);
            } else {

                // Change the pivot
                if (pivot > 0){
                    pivot = pivot - 1;
                } else {
                    pivot = indicees.length - 1;
                }
            }

            return unstretchify(word, indicees, pivot);
        }
    };

    return {
        fixStretching: function(input){
            let container = [];

            // Create the data we are transforming
            if (Array.isArray(input)){
                container = input;
            } else if (typeof input === "string"){
                container = input.split(" ");
            } else {
                return "";
            }

            // Fix the input
            let stretchedIndicees = [];
            let lastMarkedChar = "";
            let tempWord = "";
            for (let i = 0; i < container.length; i++){

                // Identify stretched characters within the word
                for (let j = 0; j < container[i].length; j++){

                    if (j > 0){

                        // Save information about stretched letters
                        // ie. "preettyyyy"
                        if (container[i][j] === container[i][j-1]){

                            if (lastMarkedChar === ""){
                                stretchedIndicees.push({
                                    "startIndex": j-1,
                                    "endIndex": j 
                                });
                                lastMarkedChar = container[i][j];
                            } else {
                                stretchedIndicees[stretchedIndicees.length-1]["endIndex"] = j; 
                            }                                                                      
                        } else {
                            lastMarkedChar = "";
                        }
                    }
                }


                // Only fix word if it isn't shorthand and
                // it is incorrect
                if (spellcheck === true &&
                    stretchedIndicees.length > 0 &&
                    typeof container[i] !== "undefined" &&
                    spellchecker.isMisspelled(container[i])){

                    let fixed = "";
                    let staticIndicees = JSON.parse(JSON.stringify(stretchedIndicees)); // Deep copy array
 
                    for (let pivot = 0; pivot < staticIndicees.length; pivot++){
                        fixed = unstretchify(container[i], staticIndicees, pivot);

                        if (fixed !== ""){
                            container[i] = fixed;
                            break;
                        }

                        // Reset w/ deep copy
                        staticIndicees = JSON.parse(JSON.stringify(stretchedIndicees));
                    }
                }

                stretchedIndicees = [];
                lastMarkedChar = "";
            }

            return container;
        },
        fixShorthand: function(input){
            let punctuation = "";
            let container = [];
            let stripped = "";

            // Create the data we are transforming
            if (Array.isArray(input)){
                container = input;
            } else if (typeof input === "string"){
                container = input.split(" ");
            } else {
                return "";
            }

            // Fix the input
            for (let i = 0; i < container.length; i++){

                // Save existing punctuation
                stripped = container[i].match(/([a-zA-Z0-9']*)([\?!\.;+]*)$/);
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

function Grammarify_Disconnected(list){
    
    return {
        fixSeparated: function(input){
            let container = [];

            // Create the data we are transforming
            if (Array.isArray(input)){
                container = input;
            } else if (typeof input === "string"){
                container = input.split(" ");
            } else {
                return "";
            }

            // Fix the input
            let listIndex = 0;
            if (container.length > 1){
                for (let i = 1; i < container.length; i++){

                    // If we found a match
                    listIndex = list.indexOf((container[i-1] + container[i]).toLowerCase());
                    if (listIndex >= 0){
                        container[i-1] = list[listIndex];

                        container.splice(i, 1);
                        i--;
                    }
                }
            }

            return container;
        }
    }
}

function Grammarify_Numbers(){

}