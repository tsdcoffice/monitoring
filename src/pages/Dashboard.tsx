import React, { useState } from 'react';
import {
  IonButtons, IonContent, IonHeader, IonMenuButton, IonPage,
  IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonProgressBar, IonText, IonGrid, IonRow, IonCol,
  useIonViewWillEnter
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { supabase } from '../supabaseClient';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const barangays = [
  "Agusan Canyon","Alae","Dahilayan","Dalirig","Damilag","Diclum",
  "Guilang-guilang","Kalugmanan","Lindaban","Lingion","Lunocan",
  "Maluko","Mambatangan","Mampayag","Mantibugao","Minsuro",
  "San Miguel","Sankanan","Santiago","Santo Niño",
  "Tankulan (Pob.)","Ticala"
];

const Dashboard: React.FC = () => {

  const history = useHistory();

  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTrainees, setTotalTrainees] = useState(0);
  const [barangayCounts, setBarangayCounts] = useState<number[]>([]);

  useIonViewWillEnter(() => {
    fetchDashboardData();
  });

  const fetchDashboardData = async () => {

    const { count: studentCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    const { count: traineeCount } = await supabase
      .from('trainees')
      .select('*', { count: 'exact', head: true });

    setTotalStudents(studentCount || 0);
    setTotalTrainees(traineeCount || 0);

    const counts = new Array(barangays.length).fill(0);

    const { data: studentBarangay } = await supabase
      .from('students')
      .select('barangay');

    const { data: traineeBarangay } = await supabase
      .from('trainees')
      .select('barangay');

    [...(studentBarangay || []), ...(traineeBarangay || [])].forEach((item: any) => {
      const index = barangays.indexOf(item.barangay);
      if (index !== -1) counts[index]++;
    });

    setBarangayCounts(counts);
  };

  const totalPeople = totalStudents + totalTrainees;

  const barData = {
    labels: barangays,
    datasets: [{
      label: 'Total',
      data: barangayCounts,
      backgroundColor: 'rgba(56,128,255,0.7)',
      borderRadius: 5,
    }]
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true },
      x: { ticks: { maxRotation: 45, minRotation: 45 } }
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle style={{ fontWeight: 'bold' }}>DASHBOARD</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <IonText>
          <h2 style={{ fontWeight: 'bold', marginLeft: '10px' }}>
            Profiling Overview
          </h2>
        </IonText>

        <IonGrid>
          <IonRow>

            <IonCol size="12" sizeMd="6">
              <IonCard button onClick={() => history.push('/scholarship')}
                style={{ background: 'linear-gradient(135deg, #efae3f 0%, #f1ab33 100%)', borderRadius: '15px' }}>
                <IonCardHeader>
                  <IonCardTitle style={{ color: 'white' }}>
                    Scholarship ({totalStudents})
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonProgressBar
                    value={totalPeople > 0 ? totalStudents / totalPeople : 0}
                    style={{ height: '8px' }}
                  />
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="6">
              <IonCard button onClick={() => history.push('/training')}
                style={{ background: 'linear-gradient(135deg, #3880ff 0%, #6096ff 100%)', borderRadius: '15px' }}>
                
                <IonCardHeader>
                  <IonCardTitle style={{ color: 'white' }}>
                    Training ({totalTrainees})
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonProgressBar
                    value={totalPeople > 0 ? totalTrainees / totalPeople : 0}
                    style={{ height: '8px' }}
                  />
                </IonCardContent>
              </IonCard>
            </IonCol>

          </IonRow>
        </IonGrid>

        <IonCard style={{ borderRadius: '15px', marginTop: '10px' }}>
          <IonCardHeader>
            <IonCardTitle>Students & Trainees per Barangay</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div style={{ height: '400px' }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </IonCardContent>
        </IonCard>

      </IonContent>
    </IonPage>
  );
};

export default Dashboard;