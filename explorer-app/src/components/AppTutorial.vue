<template>
    <IonCard>
        <IonCardHeader>
            <IonCardTitle>Help</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
            <h2>Not sure what to do?</h2>
            <p>Here are some ideas to get started:</p>
            <ul>
                <li>Browse your local area (tap <IonIcon :icon="locate"/> to focus the map)</li>
                <li>Try applying some of the filters (<IonIcon :icon="layers"/>) to customise the map</li>
                <li>Click/tap on something that looks interesting and try following the recommendations.</li>
                <li>Try to find a historical building</li>
                <li>Try to find a railway station</li>
                <li>Tap on a City, town or village.</li>
                <li>Try to use the 'explore place' button and look at the places</li>
            </ul>

        </IonCardContent>
    </IonCard>

</template>

<script setup lang="ts">
import {IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon} from '@ionic/vue';
import {layers, locate} from 'ionicons/icons';
</script>
