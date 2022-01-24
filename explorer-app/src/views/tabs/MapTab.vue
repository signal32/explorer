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
                <!-- <img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo"/> -->
            </a>
            <div class="map" ref="mapContainer"></div>
        </div>
        <button id="bottomButton" @click="resetMap()" >Oops</button>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
// Inspired by https://documentation.maptiler.com/hc/en-us/articles/4413873409809-Display-a-map-in-Vue-js-using-MapLibre-GL-JS
import 'maplibre-gl/dist/maplibre-gl.css'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { Map, MapLayerEventType } from 'maplibre-gl';
import { defineComponent, onMounted, shallowRef, markRaw, watch, toRef, reactive } from 'vue'; 
import router from '@/router'


const TILE_API = process.env.VUE_APP_EXPLORER_TILE_API;

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
        const map = shallowRef<Map>();
        let pos = reactive({
          lng: router.currentRoute.value.query?.lng as unknown as number || -2.2568,
          lat: router.currentRoute.value.query?.lat as unknown as number || 57.0348535,
          zoom: router.currentRoute.value.query?.zoom as unknown as number || 16,
        });
        
        onMounted(() => {
            console.log("mounted")
            const map = new Map({
                container: mapContainer.value,
                style: TILE_API + 'styles/basic-preview/style.json',
                center: [pos.lng, pos.lat],
                zoom: pos.zoom,
                
            });
            map.on('load', () => map.resize());
            map.on('moveend', () => {
              const { lng, lat} = map.getCenter();
              router.replace({query: {zoom: map.getZoom().toFixed(2), lat, lng}})
              // history.replaceState({}, '', router.currentRoute.value.path + `?lng=${lng}&lat=${lat}&zoom=${map.getZoom()}`)
            })
            map.resize()
            
        })

        watch(pos, (now, prev) => {
          console.log("position changed to " + now);
          map.value?.flyTo({
            center: [now.lng, now.lat],
            zoom: now.zoom,
            speed: 0.2,
            curve: 1,
          });
        });


        async function resetMap () {
            map.value?.resize();
        }
        

        return { map, mapContainer, resetMap }
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

#bottomButton {
  position: fixed;
  bottom: 0px;
}
</style>