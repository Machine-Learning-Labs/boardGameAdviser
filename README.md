# Board Game Adviser
#### published at Spanish Google Play Store as "Recomendador de Juegos de Mesa"

"Everybody likes to play"

This mobile app it's developed to promote 

# Remote data (optional)
Necesario que haya un fichero default.json en esta ruta:
http://www.mordorgames.es/datos/dataset.json

# Configurations

## Plugins Needed
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-statusbar
cordova plugin add ionic-plugin-keyboard
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-whitelist

## Android
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

# How to Develop
No olvidar que hay que añadir las plataformas y los plugins, ya que eso permite generar las apk e ipa correspondientes

### Checklist (check `x` in `[ ]` of list items)

- [ ] Add some automated testing
- [ ] Migrate to next version of Ionic
- [ ] Update the games DB
- [ ] Evolve the persistence of my inventory of personal games

Feel free to make a Fork & PR and evolve it.
