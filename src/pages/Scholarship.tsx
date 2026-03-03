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
  IonButton,
  IonIcon,
  IonInput,
} from '@ionic/react';
import { search } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const Scholarship: React.FC = () => {
  const history = useHistory();
  const [scholarStats, setScholarStats] = useState({
    als: 0,
    college: 0,
    law: 0,
    medicine: 0,
    shs: 0,
  });

  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    const { data, error } = await supabase.from('students').select('type');

    if (error) {
      console.error(error);
      return;
    }

    const counts = {
      als: 0,
      college: 0,
      law: 0,
      medicine: 0,
      shs: 0,
    };

    data?.forEach((student: any) => {
      if (counts.hasOwnProperty(student.type)) {
        counts[student.type as keyof typeof counts]++;
      }
    });

    setScholarStats(counts);
  };

  const totalScholars =
    scholarStats.als +
    scholarStats.college +
    scholarStats.law +
    scholarStats.medicine +
    scholarStats.shs;

  const goToStudents = (type: string) => {
    history.push(`/students/${type}`);
  };

  const cardColors: { [key: string]: string } = {
    als: '#6367FF',
    college: '#8494FF',
    law: '#C9BEFF',
    medicine: '#FFDBFD',
    shs: '#6367FF',
    total: '#8494FF',
  };

  const handleSearch = () => {
    if (searchText.trim() === '') return;
    history.push(`/students?query=${encodeURIComponent(searchText)}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Scholarship Dashboard</IonTitle>

          {/* Search bar */}
          <IonButtons slot="end">
            <IonInput
              placeholder="Search..."
              value={searchText}
              onIonInput={e => setSearchText(e.detail.value!)}
              style={{ maxWidth: '200px', color: '#fff', marginRight: '5px' }}
            />
            <IonButton onClick={handleSearch}>
              <IonIcon icon={search} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonText>
          <h2 style={{ textAlign: 'center' }}>
          
          </h2>
        </IonText>

        <IonGrid>
          <IonRow>
            {Object.entries(scholarStats).map(([key, value]) => (
              <IonCol size="12" sizeMd="4" key={key}>
                <IonCard
                  button
                  onClick={() => goToStudents(key)}
                  style={{
                    textAlign: 'center',
                    backgroundColor: cardColors[key],
                    color: '#ffffff',
                    borderRadius: '15px',
                  }}
                >
                  <IonCardHeader>
                    <IonCardTitle>{key.toUpperCase()} Scholars</IonCardTitle>
                  </IonCardHeader>

                  <IonCardContent>
                    <h1
                      style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        margin: 0,
                      }}
                    >
                      {value}
                    </h1>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonCard
                button
                onClick={() => goToStudents('all')}
                style={{
                  textAlign: 'center',
                  backgroundColor: cardColors.total,
                  color: '#ffffff',
                  borderRadius: '15px',
                }}
              >
                <IonCardHeader>
                  <IonCardTitle>Total Scholars</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <h1
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      margin: 0,
                    }}
                  >
                    {totalScholars}
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

export default Scholarship;