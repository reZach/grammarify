const Grammarify = require('../src/index.js')
const grammarify = new Grammarify({
    spellcheck: true,
    skipURLs: true,
    wordMap: {
        "asap": "as soon as possible"
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
    
})

test('Automatically add periods at the end of sentences', () => {
    expect(grammarify.clean('I am a sentence')).toBe('I am a sentence.')
})

test('Remove "safe" lexical illusions', () => {
    expect(grammarify.clean('The the pig snorted.')).toBe('The pig snorted.')
})

test('Spellcheck words', () => {
    expect(grammarify.clean('I was mad becuase I left home early.')).toBe('I was mad because I left home early.')
})

test('Capitalize words at the beginning of sentences', () => {
    expect(grammarify.clean('I like to run. he runs faster than I.')).toBe('I like to run. He runs faster than I.')
})

test('Change SMS/shorthand to full words', () => {
    expect(grammarify.clean('Meet me at home asap.')).toBe('Meet me at home as soon as possible.')
})

test('Shrink stretched words', () => {
    expect(grammarify.clean(`I'm so borreedddd.`)).toBe(`I'm so bored.`)
})

test('Combine separated words', () => {
    expect(grammarify.clean('Yesterday and to day we flew kites.')).toBe('Yesterday and today we flew kites.')
})

test('Split up sentences if connected', () => {
    expect(grammarify.clean('Writing C# code is fun.It is much better than Java.')).toBe('Writing C# code is fun. It is much better than Java.')
})

test('Fix intended ellipsis', () => {
    expect(grammarify.clean('I was thinking yesterday..that I should go outside.')).toBe('I was thinking yesterday... that I should go outside.')
})

test('Add spaces between comma/semicolon/colon-separated words', () => {
    expect(grammarify.clean('She likes to eat,cook,clean and dance!')).toBe('She likes to eat, cook, clean and dance!')
})

test('Fix extra spaces in between words', () => {
    expect(grammarify.clean('Wow  what an  extra long coat!')).toBe('Wow what an extra long coat!')
})

test('Fix duplicate punctuation', () => {
    expect(grammarify.clean(' what a daay. i must have had 1,,000 shots')).toBe('What a day. I must have had 1,000 shots.')
})

test('Ignore URLs', () => {
    expect(grammarify.clean('https://thesource.fm/?channel=trade')).toBe('https://thesource.fm/?channel=trade')
})