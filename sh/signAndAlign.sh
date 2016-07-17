#!/usr/bin/env bash

cordova build --release android
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore /Users/manuel.depaz/Personal/Mordor/MobileApp/boardGameAdviser/sh/boardGame.keystore /Users/manuel.depaz/Personal/Mordor/MobileApp/boardGameAdviser/platforms/android/build/outputs/apk/android-release-unsigned.apk boardGame
/Users/manuel.depaz/android-sdk-macosx/build-tools/23.0.2/zipalign -v 4 /Users/manuel.depaz/Personal/Mordor/MobileApp/boardGameAdviser/platforms/android/build/outputs/apk/android-release-unsigned.apk MordorGames.apk
