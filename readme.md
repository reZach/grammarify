Grammarify is a npm package that performs safe cleaning of text. The types of text cleaning Grammarify does are listed below.

### How to use
```
var grammarify = require("grammarify");

var sentence = "I'm so borrreeedddd";
console.log(grammarify.clean(sentence));
```

### Features

##### Automatically add periods at the end of sentences
```
"I am a sentence" -> "I am a sentence."
```

##### Remove "safe" lexical illusions
_(Some words are grammatically correct if repeated twice, words that are not are removed if duplicated)_
```
"The the pig snorted." -> "The pig snorted."
```

##### Spellcheck words
```
"I was mad becuase I left home early." -> "I was mad because I left home early."
```

##### Captialize words at the beginning of sentences
```
"I like to run. he runs faster than I." -> "I like to run. He runs faster than I."
```

##### Change SMS to full words
```
"Meet me at home asap." -> "Meet me at home as soon as possible."
```

##### Shrink stretched words
```
"I'm so borreedddd." -> "I'm so bored." 
```

##### Combine separated words
```
"Yesterday and to day we flew kites." -> "Yesterday and today we flew kites."
```

##### Split up sentences if connected
```
"Writing C# code is fun.It is much better than Java." -> "Writing C# code is fun. It is much better than Java."
```

### Bugs or suggestions?
Go to our [Github page](https://github.com/reZach/grammarify).