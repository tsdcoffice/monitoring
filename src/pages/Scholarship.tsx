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
} from '@ionic/react';
import { search } from 'ionicons/icons';
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
    setSearchText(''); // ✅ auto clear
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Scholarship Dashboard</IonTitle>

          <IonButtons slot="end">
            <IonInput
              placeholder="Search..."
              value={searchText}
              onIonInput={e => setSearchText(e.detail.value!)}
              onKeyDown={handleKeyDown}   // ✅ ENTER search
              style={{ maxWidth: '200px', color: '#fff', marginRight: '5px' }}
            />
            <IonButton onClick={handleSearch}>
              <IonIcon icon={search} />
            </IonButton>
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
                    textAlign: 'center',
                    backgroundColor: '#6367FF',
                    color: '#fff',
                    borderRadius: '15px',
                  }}
                >
                  <IonCardHeader>
                    <IonCardTitle>{type.name} Scholars</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>
                      {counts[type.name] || 0}
                    </h1>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}

          </IonRow>

          {/* ✅ CLICKABLE TOTAL */}
          <IonRow>
            <IonCol size="12">
              <IonCard
                button
                onClick={() => goToStudents()}
                style={{
                  textAlign: 'center',
                  backgroundColor: '#8494FF',
                  color: '#fff',
                  borderRadius: '15px',
                }}
              >
                <IonCardHeader>
                  <IonCardTitle>Total Scholars</IonCardTitle>
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