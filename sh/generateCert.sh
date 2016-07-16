#!/usr/bin/env bash

echo "take care replacing this cert, It will be necessary to make new releases"
keytool -genkey -v -keystore boardGame.keystore -alias boardGame -keyalg RSA -keysize 2048 -validity 10000



