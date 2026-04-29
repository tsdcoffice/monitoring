import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonButtons, IonButton, IonIcon
} from "@ionic/react";

import { arrowBackOutline } from "ionicons/icons";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useIonViewWillEnter } from "@ionic/react";

interface BatchCount {
  batch:number
  year: number
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

  const location = useLocation();
const queryParams = new URLSearchParams(location.search);
const selectedYear = queryParams.get("year");

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

}, [slug, selectedYear])



const fetchBatches = async () => {

  const trainingName = courseSlugMap[slug];

  if (!trainingName) {
    setBatches([]);
    return;
  }

  let query = supabase
    .from("trainees")
    .select("batch, year_enrolled")
    .eq("course", trainingName);

  if (selectedYear) {
    query = query.eq("year_enrolled", Number(selectedYear));
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    setBatches([]);
    return;
  }

  const batchMap: { [key: string]: BatchCount } = {};

  data.forEach((t: any) => {
    if (!t.batch || !t.year_enrolled) return;

    const key = `${t.batch}-${t.year_enrolled}`;

    if (!batchMap[key]) {
      batchMap[key] = {
        batch: Number(t.batch),
        year: Number(t.year_enrolled),
        count: 0
      };
    }

    batchMap[key].count++;
  });

  let batchArray = Object.values(batchMap);

  batchArray.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return a.batch - b.batch;
  });

  setBatches(batchArray);
};

  const openBatch = (batch:number, year:number)=>{
  history.push(`/trainees/${slug}/${batch}/${year}`)
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

{!selectedYear || selectedYear === "" ? (

  Object.entries(
    batches.reduce((acc: any, b) => {
      if (!acc[b.year]) acc[b.year] = [];
      acc[b.year].push(b);
      return acc;
    }, {})
  ).map(([year, batchList]: any) => (

    <div key={year} style={{ width: "100%" }}>

      <h2 style={{ marginLeft: "10px", color: "#10377a" }}>
        Year: {year}
      </h2>

      <IonRow>
        {batchList.map((b: BatchCount) => (
          <IonCol size="12" sizeMd="4" key={`${b.batch}-${b.year}`}>
            <IonCard
              button
              onClick={() => openBatch(b.batch, b.year)}
              style={{
                backgroundColor: '#10377a',
                color: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderLeft: '5px solid #d68718',
                margin: '10px',
                textAlign: 'center'
              }}
            >
              <IonCardHeader>
                <IonCardTitle style={{ color: '#ffffff', fontSize:"2rem", fontWeight:'bold' }}>
                  Batch {b.batch}
                </IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <h1 style={{margin:0, fontSize:"2rem", fontWeight:'bold'}}>
                  {b.count}
                </h1>
                <p style={{margin:0, fontSize:"1rem"}}>Trainees</p>
              </IonCardContent>
            </IonCard>
          </IonCol>
        ))}
      </IonRow>

    </div>
  ))

) : (

  batches.map(b => (
    <IonCol size="12" sizeMd="4" key={`${b.batch}-${b.year}`}>
      <IonCard
        button
        onClick={() => openBatch(b.batch, b.year)}
        style={{
          backgroundColor: '#10377a',
          color: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderLeft: '5px solid #d68718',
          margin: '10px',
          textAlign: 'center'
        }}
      >
        <IonCardHeader>
          <IonCardTitle style={{ color: '#ffffff' }}>
            Batch {b.batch}
          </IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          <h1 style={{margin:0, fontSize:"2.5rem", fontWeight:'bold'}}>
            {b.count}
          </h1>
          <p style={{margin:0, fontWeight:'bold'}}>Trainees</p>
        </IonCardContent>
      </IonCard>
    </IonCol>
  ))

)}


</IonRow>
</IonGrid>

</IonContent>

</IonPage>

  )
}

export default BatchList