const fs = require('fs');
const md5 = require('md5');

/* Here is a couple of important hints to help you out:
- An anagram of the phrase is: "poultry outwits ants"
- There are three levels of difficulty to try your skills with
- The MD5 hash of the easiest secret phrase is "e4820b45d2277f3844eac66c903e84be"
- The MD5 hash of the more difficult secret phrase is "23170acc097c24edb98fc5488ab033fe"
- The MD5 hash of the hard secret phrase is "665e5bcb0c20062fe8abaaf4628bb154" 
*/

const words = fs.readFileSync('wordlist').toString().split("\n");

const hint = "poultry outwits ants";

const hash1 = "e4820b45d2277f3844eac66c903e84be";
const hash2 = "23170acc097c24edb98fc5488ab033fe";
const hash3 = "665e5bcb0c20062fe8abaaf4628bb154";


/**
Returns a string containing all the characters alphabetically ordered
and without space
*/
function sortLetters(phrase) {
    return phrase.split('').sort().join('').trim()
}

const anagram = sortLetters(hint);
// ailnooprssttttuuwy

/**
Counts the number of each characters in a word or phrase 
example: counter("hello") returns {"h":1, "e":1, "l":2, "o":1}
*/
function counter(input) {

    let list = {};
    input = sortLetters(input);
    for (car of input) {
        if (list[car] > 0) {
            list[car]++
        }
        else {
            list[car] = 1
        }
    }
    return list;
}
const hintCounter = counter(hint);
//{ a: 1, i: 1, l: 1, n: 1, o: 2, p: 1, r: 1, s: 2, t: 4, u: 2, w: 1, y: 1 }


/**
Tests if a given word is eligible to form an anagram with the hint phrase
Takes a decomposition output from decompose function, and checks if its characters 
are amongst the ones of the anagram and that their numbers does'nt exceeds it
*/
function testWord(input, obj = hintCounter) {

    for (key in input) {
        if (!obj[key] || obj[key] < input[key]) {
            return false;
        }
    }
    return true;
}

// checks hashs
function checkHash(input) {
    const h = md5(input);
    return h == hash1 || h == hash2 || h == hash3;
}


/**
Given a word or a phrase counter, returns the missing characters in a string to form
an anagram of the hint phrase 
*/
function computeComplement(phrase, obj = hintCounter) {

    const compl = [];
    for (key in obj) {
        if (!phrase[key]) {
            for (i = 0; i < obj[key]; i++) {
                compl.push(key)
            }
        }
        else {
            for (i = 0; i < obj[key] - phrase[key]; i++) {
                compl.push(key)
            }
        }
    }
    return compl.join('');
}


/**
Builds a list of eligible words to form an anagram of the hint phrase
Objective is to narrow the number of combination by filtering out impossible words
*/
function buildPossibleWords(obj = hintCounter) {
    let possibleWords = [];
    console.log("total number of words : " , words.length)
    for (i in words) {
        const word = words[i];
        const wordCounter = counter(word);
        // only select words that can be used in an anagram and that are more than 1 letter
        if (testWord(wordCounter, obj) && word !== '' && word.length>1) {
            possibleWords.push(word);
        }
    }
    possibleWords = Array.from(new Set(possibleWords));
    console.log("number of possible words: ", possibleWords.length);
    return possibleWords;
}

/**
 * Builds 2-words combinations from a list of words and filters out 
 * the impossible combinations (because too many of the same letters would be used)
 */
function buildCombinations(possibleWords) {
    let combinations = [];
    for (i in possibleWords) {
        const word1 = possibleWords[i];
        const dec = counter(computeComplement(counter(word1)));
        const filtered = possibleWords.filter(w => testWord(counter(w), dec))

        for (j in filtered) {
            const phrase = word1 + " " + filtered[j];
          //  if (testWord(counter(phrase))) {
                combinations.push(phrase)
           // }
        }
    }
    console.log("2 words combinations : ", combinations.length);

    return combinations;
}

/**
 * Builds a map grouping words or phrases by their "complement"
 * i.e the list of additional letters they need to form an anagram of the hint phrase 
  */
function groupByComplement(wordList) {
    let map = {}

    wordList.forEach(d => {
        const compl = computeComplement(counter(d), hintCounter);
        if (!map[compl]) {
            map[compl] = []
        }
        map[compl].push(d);
    })
    
    return map;
}

/**
 * Explores the combinations between 2 datasets 
 * looks for matching anagrams 
 */
function checkAnagrams(combinations, map, solution = []){
    let count = 0;
    for (i in combinations) {
        const word1 = combinations[i];
        const filtered = map[sortLetters(word1)];
        for (j in filtered) {
            count++;
            const phrase = word1 + " " + filtered[j];

            if (checkHash(phrase)) {
                console.log("match found =========> ", phrase);
                solution.push(phrase);
            }
        }
    }
    console.log("number of anagrams checked: ", count)
}

/**

*/
function main() {

    const possibleWords = buildPossibleWords();
    const combinations = buildCombinations(possibleWords);
    const map3Words = groupByComplement(possibleWords);
    const map4Words = groupByComplement(combinations);
    let solution = [];
    // look for 3-words anagrams:
    checkAnagrams(combinations, map3Words, solution);
    // look for 4-words anagrams:
    checkAnagrams(combinations, map4Words, solution);
    return solution;
}



console.time("time")
console.log(main());


console.timeEnd("time")
/*
[ 'printout stout yawls',
  'ty outlaws printouts',
  'wu lisp not statutory' ]
*/