import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonSearchbar,
  IonButtons,
  IonBackButton
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface RouteParams {
  course: string;
}

const TraineeList: React.FC = () => {
  const { course } = useParams<RouteParams>();
  const decodedCourse = decodeURIComponent(course);

  const [trainees, setTrainees] = useState<any[]>([]);
  const [filteredTrainees, setFilteredTrainees] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchTrainees();
  }, [decodedCourse]);

  const fetchTrainees = async () => {
    const { data, error } = await supabase
      .from('trainees')
      .select('*')
      .eq('course', decodedCourse);

    if (error) {
      console.error(error);
      return;
    }

    setTrainees(data || []);
    setFilteredTrainees(data || []);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);

    const filtered = trainees.filter((trainee) =>
      trainee.name.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredTrainees(filtered);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/training" />
          </IonButtons>
          <IonTitle>{decodedCourse}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">

        <IonSearchbar
          value={searchText}
          onIonInput={(e) => handleSearch(e.detail.value!)}
          placeholder="Search trainee name..."
        />

        <IonText>
          <p style={{ textAlign: 'center' }}>
            Total Trainees: <strong>{filteredTrainees.length}</strong>
          </p>
        </IonText>

        <IonList>
          {filteredTrainees.map((trainee) => (
            <IonItem key={trainee.id}>
              <IonLabel>
                <h2>{trainee.name}</h2>
                {trainee.age && <p>Age: {trainee.age}</p>}
                {trainee.address && <p>Address: {trainee.address}</p>}
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

      </IonContent>
    </IonPage>
  );
};

export default TraineeList;