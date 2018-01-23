# Board Game Adviser: "Everybody likes to play"

This app were originally published at Spanish Google Play Store as "Recomendador de Juegos de Mesa".
It's intended to recommend board game base on the answer of a little quiz. The data could be obtained from a remote accessible JSON (an php script to serve as static it's included) or locally. It uses an a LokiDB to save locally your own games inventory. The app offers solution based on your replies discarding previously the games that doesn't fit on age range and included in your inventory.

## Configurations

You can set some configurations in the main app file: /www/js/app.js

````javascript    

angular
  .constant('CONSTANTS', {
      DEFAULT_ENGINE: 'kdTree', /* id3 OR randomForest OR kdTree */
      MAX_NUMBER_OF_SOLUTIONS: 3,
      KEYWORD_DISCARD: 'discard',
      ATTR_TO_IGNORE : ['id','name','description', 'prize', 'url', 'tutorial','popular'],
      STRING_ATTR_MAP: {
        minjugadores:["2","3","4","5","6","7","8"],
        maxjugadores:["2","3","4","5","6","7","8","9","10","12","14","16","18","20","22","24"],
        minedad:["6","8","10","14"],
        tipojuego:["apostar", "gestion", "invadir", "pensar", "investigar", "imaginar", "agilizar"]
      },
      DB: {
        DB_NAME: 'gamesDB',
        COL_NAME: 'games',
        PREFIX: {"prefix": "mordor"},
        AUTOSAVE: true,
        INTERVAL: 3000
      },
      AUTOSEND_SECONDS: 250,
      MIN_PERCENT_VALID: 35,
      URL_LOCAL_TRAINING_SET: './assets/training.json',
      URL_REMOTE_TRAINING_SET: 'http://www.mordorgames.es/datos/',
      URL_IMAGES: 'http://www.mordorgames.es/datos/images/',
      URL_GAMES: 'http://www.mordorgames.es/tienda',
      URL_BLOG: 'https://www.mordorgames.es/category/noticias/',
      URL_SHOP: 'https://www.mordorgames.es/tienda/12-juegos-de-mesa',
      YOUTUBE_URL: 'https://www.youtube.com/embed/',
      NEWS_URL: 'http://www.mordorgames.es/category/noticias/feed/'
    })
````

## Requirementes

Node.js best with nvm :)

## How to Develop

Follow the ionic instructions.

````shell
  $ionic serve
````

Note: Remember to add the different platforms (ios and/or android) to produce the executable files (ipa or apk). Use the ionic tutorial for that.

## Plugins Needed
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-statusbar
cordova plugin add ionic-plugin-keyboard
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-whitelist

## Android Permissions

At time of develop this app, these permissions were required.

<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

## License

* The code and data it's under [MIT License](CODE-LICENSE.md).
* All the art relative to Mordor Games it's under the [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International Licence](ASSETS-LICENSE.md).
* The games and trademarks mentioned in database are property of their legitimes propietaries and are not related in any way with us. The opinions expressed here are based on our own conclusions as player and are only destinated to offer recomendations oriented to maximize the fun.

Feel free to make a Fork & PR and evolve it.

### Possible Improvements

- [ ] Add some automated testing.
- [ ] Migrate to next version of Ionic.
- [ ] Update the games DB.
- [ ] Evolve the persistence of my inventory of personal games.
- [ ] Going back to change previous answers.

Thanks for playing!
