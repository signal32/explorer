<template>
    <IonCard>
        <IonCardHeader>
            <IonCardTitle>Evaluation Guide </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
            <h2>Some things to try:</h2>
            <p>You dont need to try them all, but the more you do the happier I will be :)</p>
            <ul>
                <li>Browse your local area (tap <IonIcon :icon="locate"/> to focus the map)</li>
                <li>Try applying some of the filters (<IonIcon :icon="layers"/>) to customise the map</li>
                <li>Click/tap on something that looks interesting and try following the recommendations.</li>
                <li>Try to find a historical building</li>
                <li>Try to find a railway station</li>
                <li>Tap on a City, town or village.</li>
                <li>Try to use the 'explore place' button and look at the places</li>
            </ul>

            <IonItem lines="none">
                Once you have finished playing around, fill out this quick (5min) questionnaire.
            </IonItem>

            <IonItem lines="none">
                <IonButton fill="outline" size="small" @click="openQuestionaire">
                    <IonLabel>Open Questionnaire</IonLabel>
                    <IonIcon slot="end" :icon="openOutline"/>
                </IonButton>
            </IonItem>

        </IonCardContent>
    </IonCard>

</template>

<script setup lang="ts">
import {IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonButton, IonIcon, IonLabel} from '@ionic/vue';
import {layers, locate, openOutline} from 'ionicons/icons';

function openQuestionaire() {
    window.open('https://forms.office.com/r/15vSZe79ja', '_blank')
}

</script>
