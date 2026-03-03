import React from 'react';
import { 
  IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, 
  IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonProgressBar, IonText, IonGrid, IonRow, IonCol 
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartOptions
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard: React.FC = () => {
  const history = useHistory();

  // Mock Data
  const totalStudents = 500;
  const scholarshipCount = 320;
  const trainingCount = 180;

  // Bar Chart Data
  const barData = {
    labels: Array.from({ length: 22 }, (_, i) => `Brgy ${i + 1}`),
    datasets: [{
      label: 'Students',
      data: Array.from({ length: 22 }, () => Math.floor(Math.random() * 50) + 10),
      backgroundColor: 'rgba(56, 128, 255, 0.7)',
      borderColor: '#3880ff',
      borderWidth: 1,
      borderRadius: 5,
    }]
  };

  // Kani nga options ang mo-fix sa "mo-gamay" nga issue
  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false, // Importante ni!
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: 'gray' }, // Sigurado nga makita sa dark/light
        grid: { color: 'rgba(150, 150, 150, 0.1)' }
      },
      x: {
        ticks: { 
          color: 'gray',
          maxRotation: 45,
          minRotation: 45 
        },
        grid: { display: false }
      }
    }
  };

  const pieData = {
    labels: ['Male', 'Female'],
    datasets: [{
      data: [240, 260],
      backgroundColor: ['#3880ff', '#eb445a'],
      borderWidth: 0,
    }]
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
          <h2 style={{ fontWeight: 'bold', marginLeft: '10px' }}>Profiling Overview</h2>
        </IonText>

        <IonGrid className="ion-no-padding">
          <IonRow>
            <IonCol size="12" sizeMd="6">
              <IonCard button onClick={() => history.push('/profiling/scholarship')} 
                style={{ background: 'linear-gradient(135deg, #3880ff 0%, #6096ff 100%)', borderRadius: '15px' }}>
                <IonCardHeader>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <IonCardTitle style={{ color: 'white' }}>Scholarship</IonCardTitle>
                    <h2 style={{ color: 'white', margin: 0 }}>{scholarshipCount}</h2>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <IonProgressBar value={scholarshipCount / totalStudents} style={{ height: '8px', borderRadius: '4px', '--progress-background': '#fff' }} />
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="6">
              <IonCard button onClick={() => history.push('/profiling/training')} 
                style={{ background: 'linear-gradient(135deg, #2dd36f 0%, #52e08a 100%)', borderRadius: '15px' }}>
                <IonCardHeader>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <IonCardTitle style={{ color: 'white' }}>Training</IonCardTitle>
                    <h2 style={{ color: 'white', margin: 0 }}>{trainingCount}</h2>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <IonProgressBar value={trainingCount / totalStudents} style={{ height: '8px', borderRadius: '4px', '--progress-background': '#fff' }} />
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* --- Bar Chart: 22 Barangays --- */}
        <IonCard style={{ borderRadius: '15px', marginTop: '10px' }}>
          <IonCardHeader>
            <IonCardTitle style={{ fontSize: '1rem' }}>Students per Barangay</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {/* Kani nga div maoy mag-control sa gidak-on sa chart */}
            <div style={{ height: '400px', width: '100%', position: 'relative' }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </IonCardContent>
        </IonCard>

        {/* --- Pie Chart: Gender --- */}
        <IonCard style={{ borderRadius: '15px' }}>
          <IonCardHeader><IonCardTitle style={{ fontSize: '1rem' }}>Gender Distribution</IonCardTitle></IonCardHeader>
          <IonCardContent>
            <div style={{ height: '250px', position: 'relative' }}>
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          </IonCardContent>
        </IonCard>

      </IonContent>
    </IonPage>
  );
};

export default Dashboard;