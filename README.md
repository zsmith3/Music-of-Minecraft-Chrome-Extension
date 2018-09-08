# Music of Minecraft Chrome Extension

A Chrome extension which plays Minecraft's music randomly in the background while you browse. It also has the capacity to play other user-selected music files in the same ambient nature.

## Installation

Get it on the Chrome Web Store [here](). (This link doesn't work yet)

## Features

- Two options for music selection:
    - Minecraft: you select the ".minecraft/assets/" folder on your computer, and the extension pulls all of the music files from the index kept there
    - Folder: you select any folder on your computer, then it (and its subdirectories) are scannned for any audio files
- Adjustable volume
- Choose whether to start playing when Chrome opens
- Choose whether to play in the background when Chrome is closed
- Click the extension icon to play/pause at any time
- Random playing:
    - Music is selected randomly from the selection
    - No single track will play twice in a row, but tracks can repeat before the shuffle is completed
    - Before a song is played, it is delayed by a random time interval, to roughly mimic the game

## To-Do

I have no current intention of developing this project further - this is just a suggestion. I'm always grateful for any contributions - although if enough interest was received I would develop more myself.

- Make a Firefox version

## Acknowledgements

- This project was inspired by the [Animal Crossing Music Extension](https://github.com/JdotCarver/Animal-Crossing-Music-Extension).
- The options page uses the [Bootstrap](https://getbootstrap.com/) framework.
- The [ES6-Promise](https://github.com/stefanpenner/es6-promise) polyfill is also used.
