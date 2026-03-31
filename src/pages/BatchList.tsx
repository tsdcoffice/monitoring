import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonButtons, IonButton, IonIcon
} from "@ionic/react";

import { arrowBackOutline } from "ionicons/icons";
import { useParams, useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useIonViewWillEnter } from "@ionic/react";

interface BatchCount {
  batch:number
  count:number
}

const courseSlugMap:{[slug:string]:string} = {
  "barista": "Barista",
  "barangay-health": "Barangay Health Services NC II",
  "bayong-making": "Bayong Making",
  "beauty-care": "Beauty Care (Nail Care, Hair and Make-up)",
  "bread-pastry": "Bread and Pastry Production",
  "bookkeeping-nc3": "Bookkeeping NC III",
  "community-nutrition": "Community Nutrition Services",
  "cookery": "Cookery",
  "driving-nc2": "Driving NC II",
  "dressmaking-nc2": "Dressmaking NC II",
  "electrical-nc2": "Electrical Installation and Maintenance NC II",
  "emergency-medical": "Emergency Medical Services NC II",
  "food-processing": "Food Processing",
  "garbage-collection": "Garbage Collection NC II",
  "housekeeping-nc2": "Housekeeping NC II",
  "masonry-hallow": "Masonry and Hallow Blocks",
  "massage-therapy": "Massage Therapy",
  "organic-nc2": "Organic Agriculture NC II",
  "plumbing": "Plumbing",
  "pineapple-processing": "Pineapple Processing",
  "scaffolding": "Scaffolding",
  "security-nc2": "Security Services NC II",
  "smaw-nc1": "Shielded Metal Arc Welding(SMAW) NC I",
  "smaw-nc2": "Shielded Metal Arc Welding(SMAW) NC II"
};

const BatchList:React.FC = () => {

  const {slug} = useParams<{slug:string}>()
  const history = useHistory()

  const [batches,setBatches] = useState<BatchCount[]>([])

  useEffect(() => {

  fetchBatches()

  const channel = supabase
    .channel("trainee-changes")

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "trainees"
      },
      () => {
        fetchBatches()
      }
    )

    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }

}, [slug])


const fetchBatches = async () => {

  const trainingName = courseSlugMap[slug];

  if (!trainingName) {
    setBatches([]);
    return;
  }

  // 🔥 GET trainees directly (NO training_types anymore)
  const { data, error } = await supabase
    .from("trainees")
    .select("batch")
    .eq("course", trainingName);

  if (error) {
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    setBatches([]);
    return;
  }

  // 🔥 COUNT per batch
  const batchMap: { [key: number]: number } = {};

  data.forEach((t: any) => {
    if (!t.batch) return;

    const batchNum = Number(t.batch);

    if (!batchMap[batchNum]) {
      batchMap[batchNum] = 0;
    }

    batchMap[batchNum]++;
  });

  // convert to array
  const batchArray = Object.keys(batchMap).map((b) => ({
    batch: Number(b),
    count: batchMap[Number(b)]
  }));

  // sort ascending
  batchArray.sort((a, b) => a.batch - b.batch);

  setBatches(batchArray);
};

  const openBatch = (batch:number)=>{
    history.push(`/trainees/${slug}/${batch}`)
  }

  return(

<IonPage>

<IonHeader>
<IonToolbar style={{ '--background': '#10377a', '--color': '#ffffff' }}>
  

<IonButtons slot="start">
<IonButton routerLink="/training">
<IonIcon icon={arrowBackOutline}/>
</IonButton>
</IonButtons>

<IonTitle>
{slug.replace(/-/g," ").toUpperCase()} Batches
</IonTitle>

</IonToolbar>
</IonHeader>

<IonContent className="ion-padding">

<IonGrid>
<IonRow>

{batches.map(b=>(
<IonCol size="12" sizeMd="4" key={b.batch}>

<IonCard
  button
  onClick={()=>openBatch(b.batch)}
  style={{
    backgroundColor: '#10377a',      // Solid Blue Background
    color: '#ffffff',               // White Text
    borderRadius: '12px',           // Rounded Corners
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // Shadow effect
    borderLeft: '5px solid #d68718', // Ang Orange accent sa kilid
    margin: '10px',
    textAlign: 'center'
  }}
>

<IonCardHeader>
  <IonCardTitle style={{ color: '#ffffff' }}> {/* Siguroha nga puti ang Title */}
    Batch {b.batch}
  </IonCardTitle>
</IonCardHeader>

<IonCardContent>
  <h1 style={{margin:0, fontSize:"2.5rem", fontWeight: 'bold'}}>
    {b.count}
  </h1>
  <p style={{margin:0, opacity: 0.9}}>
    Trainees
  </p>
</IonCardContent>

</IonCard>

</IonCol>
))}


</IonRow>
</IonGrid>

</IonContent>

</IonPage>

  )
}

export default BatchList