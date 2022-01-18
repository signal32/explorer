<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Home</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content id="yeet">
        <!-- <div id="mybox">hi</div> -->
        <div class="map-wrap">
            <a href="https://www.maptiler.com" class="watermark">
                <img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo"/>
            </a>
            <div class="map" ref="mapContainer"></div>
        </div>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
// Inspired by https://documentation.maptiler.com/hc/en-us/articles/4413873409809-Display-a-map-in-Vue-js-using-MapLibre-GL-JS
import 'maplibre-gl/dist/maplibre-gl.css'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { Map, MapLayerEventType } from 'maplibre-gl';
import { defineComponent, onMounted, shallowRef, markRaw } from 'vue'; 

export default defineComponent({
    components: {
        IonContent,
        IonHeader,
        IonPage,
        IonTitle,
        IonToolbar,
    },

    setup() {
        const mapContainer = shallowRef("");
        const map = shallowRef("");
        
        onMounted(() => {
            console.log("mounted")
            const map = new Map({
                container: mapContainer.value,
                style: 'https://demotiles.maplibre.org/style.json',
                center: [-74.5, 40],
                zoom: 9,
            });
            map.on('load', () => map.resize())
            map.resize()
        })
        

        return { map, mapContainer }
    }
});
</script>

<style scoped>
@import '~maplibre-gl/dist/maplibre-gl.css';

.map-wrap {
  position: relative;
  width: 100%;
  height: 100%  /* calculate height of the screen minus the heading: calc(100vh - 77px);*/
}

.map {
  position: absolute;
  width: 100%;
  height: 100%;
}

.watermark {
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 999;
}

/* #mybox {
    width: 100vw;
    height: 100vh;
    background-color: red;
} */
</style>