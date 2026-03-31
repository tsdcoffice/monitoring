import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonInput,
  IonSearchbar,
  useIonViewWillEnter
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { arrowBackOutline, search } from 'ionicons/icons';

interface Course {
  name: string;
  slug: string;
}

// Courses in alphabetical order
const courses: Course[] = [
  { name: "Barista", slug: "barista" },
  { name: "Barangay Health Services NC II", slug: "barangay-health" },
  { name: "Bayong Making", slug: "bayong-making" },
  { name: "Beauty Care (Nail Care, Hair and Make-up)", slug: "beauty-care" },
  { name: "Bread and Pastry Production", slug: "bread-pastry" },
  { name: "Bookkeeping NC III", slug: "bookkeeping-nc3" },
  { name: "Community Nutrition Services", slug: "community-nutrition" },
  { name: "Cookery", slug: "cookery" },
  { name: "Driving NC II", slug: "driving-nc2" },
  { name: "Dressmaking NC II", slug: "dressmaking-nc2" },
  { name: "Electrical Installation and Maintenance NC II", slug: "electrical-nc2" },
  { name: "Emergency Medical Services NC II", slug: "emergency-medical" },
  { name: "Food Processing", slug: "food-processing" },
  { name: "Garbage Collection NC II", slug: "garbage-collection" },
  { name: "Housekeeping NC II", slug: "housekeeping-nc2" },
  { name: "Masonry and Hallow Blocks", slug: "masonry-hallow" },
  { name: "Massage Therapy", slug: "massage-therapy" },
  { name: "Organic Agriculture NC II", slug: "organic-nc2" },
  { name: "Plumbing", slug: "plumbing" },
  { name: "Pineapple Processing", slug: "pineapple-processing" },
  { name: "Scaffolding", slug: "scaffolding" },
  { name: "Security Services NC II", slug: "security-nc2" },
  { name: "Shielded Metal Arc Welding(SMAW) NC I", slug: "smaw-nc1" },
  { name: "Shielded Metal Arc Welding(SMAW) NC II", slug: "smaw-nc2" },
];

const Training: React.FC = () => {
  const history = useHistory();
  const [courseCounts, setCourseCounts] = useState<{ [slug: string]: number }>({});
  const [totalTrainees, setTotalTrainees] = useState(0);
   const [searchText, setSearchText] = useState('');

  useIonViewWillEnter(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
  const { data, error } = await supabase
    .from('trainees')
    .select('id, course');

  if (error) {
    console.error(error);
    return;
  }

  const counts: { [slug: string]: number } = {};
  courses.forEach(course => (counts[course.slug] = 0));

  data?.forEach((trainee: any) => {
    const courseName = trainee.course;

    const courseObj = courses.find(c => c.name === courseName);

    if (courseObj) {
      counts[courseObj.slug]++;
    }
  });

  setCourseCounts(counts);
  setTotalTrainees(data?.length || 0);
};

  const goToTrainees = (slug: string) => {

  if(slug === "all"){
    history.push("/trainees/all")
  }else{
    history.push(`/batch/${slug}`)
  }

};

  const handleSearch = () => {
  if (!searchText.trim()) return;

  history.push(`/trainees/all?query=${encodeURIComponent(searchText)}`);
  setSearchText('');
};

const handleKeyDown = (e: any) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
};

  return (
    <><IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': '#10377a', '--color': '#ffffff' }}>
          <IonButtons slot="start">
            <IonButton routerLink="/dashboard" routerDirection="root">
              <IonIcon icon={arrowBackOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle style={{ fontWeight: 600 }}>TSDC SKILSS TRAINING DASHBOARD</IonTitle>

          <IonButtons slot="end">
            <IonSearchbar
              value={searchText}
              debounce={300}
              placeholder="Search Trainee..."
              onIonChange={(e) => setSearchText(e.detail.value!)}
              onKeyDown={(e: any) => {
                  if (e.key === "Enter") {
                    const value = e.target.value;
                  if (!value.trim()) return;

              history.push(`/trainees/all?query=${encodeURIComponent(value)}`);
              setSearchText("");
                }
              }}
              style={{
                width: "260px",
                "--border-radius": "10px"
                }}
            />
          </IonButtons>
        
      </IonToolbar>
    </IonHeader><IonContent fullscreen className="ion-padding">
        <IonText>
          <h2 style={{ textAlign: 'center', fontWeight: 600 }}>TSDC Skills Training Programs</h2>
        </IonText>

        {/* Courses */}
        <IonGrid>
          <IonRow>
            {courses.map(course => (
              <IonCol size="12" sizeMd="4" key={course.slug}>
                <IonCard
                  button
                  onClick={() => goToTrainees(course.slug)}
                  style={{
                    backgroundColor: '#10377a',
                    color: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    borderLeft: '5px solid #d68718', // Gamay ra kaayo nga orange sa kilid
                    margin: '10px',
                    textAlign: 'center', 
                    height: '150px',            
                    display: 'flex',            // Para ma-center ang content verticaly
                    flexDirection: 'column',    // Vertical arrangement
                    justifyContent: 'center'
                    }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <IonCardHeader>
                    <IonCardTitle style={{
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      color: '#ffffff'
                      }}
                      >
                      {course.name.toUpperCase()}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: 0 }}>
                      {courseCounts[course.slug] || 0}
                    </h1>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        {/* Total Trainees */}
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonCard
                button
                onClick={() => goToTrainees('all')}
                style={{
                background: 'linear-gradient(180deg, #10377a 92%, #d68718 100%)',
                color: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                margin: '10px',
                textAlign: 'center'
                }}
              >
                <IonCardHeader>
                  <IonCardTitle style={{
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    color: '#ffffff'
                    }}
                    >
                    TOTAL TRAINEES
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0 }}>
                    {totalTrainees}
                  </h1>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
    </>
  );
};

export default Training;