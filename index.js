#!/usr/local/bin/node

'use strict'

const fs = require('fs');

const mode = process.argv[2];

if (mode === 'train') {
    const filename = process.argv[3];
    const modelName = process.argv[4] || 'model.txt';

    const input = fs.readFileSync(filename, 'utf-8');
    const specialChars = ['\'', '\n', ' ', '\r', '\t'];

    console.log(process.argv);

    const json = {};

    let totalCount = 0;

    for (let i = 0; i < input.length - 1; i++) {
        const key = input[i];
        const nextKey = input[i + 1];

        if (specialChars.includes(key) || specialChars.includes(nextKey)) {
            continue;
        }

        if (json[key] === undefined) {
            json[key] = {};
            json[key][nextKey] = 1;
            totalCount++;
        } else {
            if (json[key][nextKey] === undefined) {
                json[key][nextKey] = 1;
                totalCount++;
            } else {
                json[key][nextKey] = json[key][nextKey] + 1;
                totalCount++;
            }
        }
    }

    for (const key of Object.keys(json)) {
        for (const deepKey of Object.keys(json[key])) {
            json[key][deepKey] = json[key][deepKey] / totalCount;
        }
    }

    fs.writeFileSync(modelName, JSON.stringify(json));
} else if (mode === 'generate') {
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
    let word = '';
    const keys = Object.keys(wordmap);

    for (let i = 0; i < wordLength; i += 2) {
        const randomKey = keys[random(0, keys.length - 1)];
        const values = wordmap[randomKey]

        const diffs = [];
        const diffKeys = [];
        const randomVal = Math.random() / 100;

        for (const key of Object.keys(values)) {
            diffs.push(Math.abs(values[key] - randomVal));
            diffKeys.push(key);
        }

        const index = diffs.indexOf(Math.min.apply(null, diffs));
        const randomValue = diffKeys[index];

        word += randomKey + randomValue;
    }

    return word;
}

function random(min, max) {
   return Math.floor(Math.random() * (max - min + 1)) + min;
}
