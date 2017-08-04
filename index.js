#!/usr/local/bin/node

'use strict'

const fs = require('fs');

const mode = process.argv[2];

if (mode === 'train') {
    // TODO it should track consonant and vowel placement
    const filename = process.argv[3];
    const modelName = process.argv[4] || 'model.txt';

    const input = fs.readFileSync(filename, 'utf-8');
    const specialChars = ['\'', '-', '\n', ' ', '\r', '\t'];

    console.log(process.argv);

    const json = {};

    for (let i = 0; i < input.length - 1; i++) {
        const key = input[i];
        const nextKey = input[i + 1];

        if (specialChars.includes(key) || specialChars.includes(nextKey)) {
            continue;
        }

        if (json[key] === undefined) {
            json[key] = {};
            json[key][nextKey] = 1;
            json[key]['sum'] = 1;
        } else {
            if (json[key][nextKey] === undefined) {
                json[key][nextKey] = 1;
                json[key]['sum'] = 1;
            } else {
                json[key][nextKey] += 1;
                json[key]['sum'] += 1;
            }
        }
    }

    for (const key of Object.keys(json)) {
        for (const deepKey of Object.keys(json[key])) {
            if (deepKey !== 'sum') {
                json[key][deepKey] = json[key][deepKey] / json[key]['sum'];
            }
        }
    }

    fs.writeFileSync(modelName, JSON.stringify(json));
} else if (mode === 'generate') {
    // TODO; it should generate words with the same consonant / vowel cadence as model

    const filename = process.argv[3];
    const wordLength = process.argv[4];
    const wordCount = process.argv[5];

    const file = JSON.parse(fs.readFileSync(filename, 'utf-8'));

    const words = [];

    for (let i = 0; i < wordCount; i++) {
        words.push(makeWord(file, wordLength));
    }

    console.log(words);
} else {
    console.log(`Usage: 
            train [file] [model name]
            generate [model] [word length] [words to generate]
    `);
}

function makeWord(wordmap, wordLength) {
    const keys = Object.keys(wordmap);

    let word = getNextLetter(keys[random(0, keys.length - 1)], wordmap);

    for (let i = 1; i < wordLength; i++) {
        word += getNextLetter(word[i - 1], wordmap);
    }

    return word;
}

function random(min, max) {
   return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getNextLetter(letter, wordMap) {
    const values = wordMap[letter];

    const diffs = [];
    const diffKeys = [];
    const randomVal = Math.random();

    for (const key of Object.keys(values)) {
        diffs.push(Math.abs(values[key] - randomVal));
        diffKeys.push(key);
    }

    const index = diffs.indexOf(Math.min.apply(null, diffs));

    return diffKeys[index];
}
