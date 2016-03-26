#!/bin/bash

mkdir -p releases/android

ruta_out="platforms/android/build/outputs/apk/"
nombre_apk_unsigned="android-release-unsigned.apk"
nombre_apk_signed="android-release-signed.apk"
ruta_releases_android="releases/android/"
android_home=$(echo $ANDROID_HOME)
final_apk="boardGameAdviser.apk"
keystore_file="boardGameAdviser.keystore"

function log {
	echo
	echo -e "\e[34m=====> $1"
	echo -e "\e[0m "
}

function log_error {
	echo
	echo -e "\e[31mXXXXX $1"
	echo -e "\e[0m "
}


echo
log "Creando fichero apk (sin firma) ..."
ionic build android --release
if [ "$?" -ne 0 ]; then log_error "El comando ha fallado"; exit 1; fi


echo
log "Copiando apk a carpeta releases/android/"
cp $ruta_out$nombre_apk_unsigned $ruta_releases_android
if [ "$?" -ne 0 ]; then log_error "El comando ha fallado"; exit 1; fi


echo
log "Generando fichero keystore ..."
if [ -f $ruta_releases_android$keystore_file ]; then
	rm $ruta_releases_android$keystore_file
	if [ "$?" -ne 0 ]; then log_error "El comando ha fallado"; exit 1; fi
fi
keytool -genkey -v -keystore $ruta_releases_android$keystore_file -alias boardGameAdviser -keyalg RSA -keysize 2048 -validity 10000
if [ "$?" -ne 0 ]; then log_error "El comando ha fallado"; exit 1; fi
cp $ruta_releases_android$nombre_apk_unsigned $ruta_releases_android$nombre_apk_signed
if [ "$?" -ne 0 ]; then log_error "El comando ha fallado"; exit 1; fi


echo
log "Firmando apk..."
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore $ruta_releases_android$keystore_file $ruta_releases_android$nombre_apk_signed boardGameAdviser
if [ "$?" -ne 0 ]; then log_error "El comando ha fallado"; exit 1; fi


echo
log "Alineando apk..."
echo "Introduzca ruta zipalign (dentro de $android_home/build-tools/<version>/zipalign):"
read zipalign_ruta
if [ -f $ruta_releases_android$final_apk ]; then
	rm $ruta_releases_android$final_apk;
	if [ "$?" -ne 0 ]; then log_error "El comando ha fallado"; exit 1; fi
fi
$zipalign_ruta -v 4 $ruta_releases_android$nombre_apk_signed $ruta_releases_android$final_apk
if [ "$?" -ne 0 ]; then log_error "El comando ha fallado"; exit 1; fi


echo
log "Fichero apk generado en "$ruta_releases_android$final_apk
