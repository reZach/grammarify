var spellchecker = require("spellchecker");

exports = module.exports = new Grammarify();

function Grammarify(){

}

Grammarify.prototype.clean = function(str){

    if (str.length === 0){
        return "";
    }

    // Get rid of all whitespace
    var words = str.split(" ");
    var newWords = words.filter(w => w.length !== 0);

    // Save where there are existing periods
    var periods = newWords.reduce(function(acc, curr, index){
        return acc + (curr.indexOf(".") > 0 ? (index.toString() + ".") : "");
    }, "");
    periods = periods.split(".");
    periods = periods.filter(p => p.length !== 0);

    // Clean
    var replacer = {
        "bc": "because",
        "bf": "boyfriend",
        "gf": "girlfriend",
        "eg": "example"
    };
    var corrections = [];
    var periodsIndex = -1;
    for (var i = 0; i < newWords.length; i++){

        // Replace words spellchecker might miss
        if (typeof replacer[newWords[i]] !== "undefined"){
            newWords[i] = replacer[newWords[i]];
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
        periodsIndex = periods.indexOf((i-1).toString()) >= 0;
        if (i === 0 || periodsIndex){
            newWords[i] = newWords[i][0].toUpperCase() + newWords[i].substr(1);
        }

        // Add period if necessary
        periodsIndex = periods.indexOf(i.toString()) >= 0;
        if (periodsIndex || i === newWords.length - 1){
            newWords[i] = newWords[i] + ".";
        }

        // Add leading space to word
        if (i !== 0){
            newWords[i] = " " + newWords[i];
        }
    }

    return newWords.join("");
}