import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonButtons, IonButton, IonIcon
} from "@ionic/react";

import { arrowBackOutline } from "ionicons/icons";
import { useParams, useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

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
  "organic-nc2": "Organic agriculture NC II",
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

  useEffect(()=>{
    fetchBatches()
  },[slug])

  const fetchBatches = async () => {

  const trainingName = courseSlugMap[slug];

  // get training type id
  const { data: typeData } = await supabase
    .from("training_types")
    .select("id")
    .eq("name", trainingName)
    .single();

  if (!typeData) {
    setBatches([]);
    return;
  }

  // get all trainees under that training type
  const { data: trainees } = await supabase
    .from("trainees")
    .select("batch")
    .eq("training_type_id", typeData.id);

  if (!trainees || trainees.length === 0) {
    setBatches([]);
    return;
  }

  // count trainees per batch
  const batchMap: { [key: number]: number } = {};

  trainees.forEach((t: any) => {
    if (!t.batch) return;

    if (!batchMap[t.batch]) {
      batchMap[t.batch] = 0;
    }

    batchMap[t.batch]++;
  });

  // convert to array
  const batchArray = Object.keys(batchMap).map((b) => ({
    batch: Number(b),
    count: batchMap[Number(b)]
  }));

  // sort batch numbers
  batchArray.sort((a, b) => a.batch - b.batch);

  setBatches(batchArray);
};

  const openBatch = (batch:number)=>{
    history.push(`/trainees/${slug}/${batch}`)
  }

  return(

<IonPage>

<IonHeader>
<IonToolbar color="primary">

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
textAlign:"center",
background:"linear-gradient(135deg,#6367FF,#8A8EFF)",
color:"#fff",
borderRadius:"20px",
boxShadow:"0 4px 10px rgba(0,0,0,0.2)"
}}
>

<IonCardHeader>
<IonCardTitle>
Batch {b.batch}
</IonCardTitle>
</IonCardHeader>

<IonCardContent>

<h1 style={{margin:0,fontSize:"2rem"}}>
{b.count}
</h1>

<p style={{margin:0}}>
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