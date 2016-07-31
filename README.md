# README #

Repositorio con el código fuente de la app móvil en ionic.

# Server
Necesario que haya un fichero default.json en esta ruta:
http://www.mordorgames.es/datos/dataset.json

# Dev
No olvidar que hay que añadir las plataformas y los plugins, ya que eso permite generar las apk e ipa correspondientes


# Plugins para añadir (comprobando)
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-statusbar
cordova plugin add ionic-plugin-keyboard
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-whitelist

# Permisos necesarios
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
