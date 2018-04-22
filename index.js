exports.test = function (str) {

    if (str.length > 0) {
        
        // Trim whitespace
        str = str.trim();

        // Capital letter + period
        str = str[0].toUpperCase() + str.substr(1);
        if (str[str.length-1] !== "."){
            str += ".";
        }
    }


    return str;
}