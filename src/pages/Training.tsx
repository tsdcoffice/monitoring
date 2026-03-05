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
  IonIcon
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { arrowBackOutline } from 'ionicons/icons';

interface Course {
  name: string;
  slug: string;
}

// Courses in alphabetical order
const courses: Course[] = [
  { name: "Barista", slug: "barista" },
  { name: "Barangay Health Services NCII", slug: "barangay-health" },
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
  { name: "Organic agriculture NC II", slug: "organic-nc2" },
  { name: "Plumbing", slug: "plumbing" },
  { name: "Pineapple Processing", slug: "pineapple-processing" },
  { name: "Scaffolding", slug: "scaffolding" },
  { name: "Security Services NCII", slug: "security-nc2" },
  { name: "Shielded Metal Arc Welding(SMAW) NC I", slug: "smaw-nc1" },
  { name: "Shielded Metal Arc Welding(SMAW) NC II", slug: "smaw-nc2" },
];

const Training: React.FC = () => {
  const history = useHistory();
  const [courseCounts, setCourseCounts] = useState<{ [slug: string]: number }>({});
  const [totalTrainees, setTotalTrainees] = useState(0);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    const { data, error } = await supabase
      .from('trainees')
      .select(`
        id,
        training_types (
          name
        )
      `);

    if (error) {
      console.error(error);
      return;
    }

    const counts: { [slug: string]: number } = {};
    courses.forEach(course => (counts[course.slug] = 0));

    data?.forEach((trainee: any) => {
      const trainingName = trainee.training_types?.name;
      const courseObj = courses.find(c => c.name === trainingName);
      if (courseObj) counts[courseObj.slug]++;
    });

    setCourseCounts(counts);
    setTotalTrainees(data?.length || 0);
  };

  const goToTrainees = (slug: string) => {
    const route = slug === 'all' ? '/trainees/all' : `/trainees/${slug}`;
    history.push(route);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton routerLink="/dashboard" routerDirection="root">
            <IonIcon icon={arrowBackOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle>TSDC Skills Training Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonText>
          <h2 style={{ textAlign: 'center' }}>TSDC Skills Training Programs</h2>
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
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #6367FF, #8A8EFF)',
                    color: '#fff',
                    borderRadius: '20px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <IonCardHeader>
                    <IonCardTitle style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                      {course.name}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
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
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #FF6363, #FF8A8A)',
                  color: '#fff',
                  borderRadius: '25px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                }}
              >
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
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
  );
};

export default Training;