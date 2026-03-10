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
  IonButtons,
  IonButton,
  IonIcon,
  IonInput,
  IonBackButton,
  IonSearchbar,
  
} from '@ionic/react';
import { arrowBackOutline, search } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface ScholarshipType {
  id: string;
  name: string;
}

const Scholarship: React.FC = () => {

  const history = useHistory();
  const [types, setTypes] = useState<ScholarshipType[]>([]);
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [searchText, setSearchText] = useState('');

  
  useEffect(() => {
  fetchScholarshipData();

  // Maminaw sa bisan unsang INSERT sa 'students' table
  const channel = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'students' },
      () => {
        fetchScholarshipData(); // I-refresh ang counts kung naay bag-ong na-add
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  const fetchScholarshipData = async () => {

    const { data: typeData } = await supabase
      .from('scholarship_types')
      .select('*')
      .order('name');

    if (!typeData) return;

    setTypes(typeData);

    const newCounts: { [key: string]: number } = {};

    for (const type of typeData) {
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('scholarship_type_id', type.id);

      newCounts[type.name] = count || 0;
    }

    setCounts(newCounts);
  };

  const totalScholars = Object.values(counts).reduce((a, b) => a + b, 0);

  const goToStudents = (typeName?: string) => {
    if (!typeName) {
      history.push('/students');
    } else {
      history.push(`/students?type=${encodeURIComponent(typeName)}`);
    }
  };

  const handleSearch = () => {
    if (!searchText.trim()) return;

    history.push(`/students?query=${encodeURIComponent(searchText)}`);
    setSearchText('');
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': '#10377a', '--color': '#ffffff' }}>
          

          {/* ✅ SAME BACK BUTTON AS TRAINING */}
          <IonButtons slot="start">
            <IonButton routerLink="/dashboard" routerDirection="root">
              <IonIcon icon={arrowBackOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>

          <IonTitle style={{ fontWeight: 600 }}>SCHOLARSHIP DASHBOARD</IonTitle>

          <IonButtons slot="end">
            <IonSearchbar
              value={searchText}
              debounce={300}
              placeholder="Search Student..."
              onIonChange={(e) => setSearchText(e.detail.value!)}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                const value = e.target.value;
                if (!value.trim()) return;

              history.push(`/students?query=${encodeURIComponent(value)}`);
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
      </IonHeader>

      <IonContent className="ion-padding">

        <IonGrid>
          <IonRow>

            {types.map((type) => (
              <IonCol size="12" sizeMd="4" key={type.id}>
                <IonCard
                  button
                  onClick={() => goToStudents(type.name)} 
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
                  <IonCardTitle
                    style={{
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      color: '#ffffff'
                      }}
                    >
                    {type.name} Scholars
                  </IonCardTitle>
                </IonCardHeader>
                  <IonCardContent>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 600, margin: 0 }}>
                    {counts[type.name] || 0}
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
                onClick={() => goToStudents()}
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
                  <IonCardTitle
                    style={{
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    color: '#ffffff'
                    }}
                    >
                    Total Scholars
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>
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