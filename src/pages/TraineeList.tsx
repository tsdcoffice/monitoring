import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonButton,
  IonIcon,
  IonButtons
} from '@ionic/react';

import { arrowBackOutline, printOutline, downloadOutline } from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Trainee {
  id: string;
  firstname: string;
  lastname: string;
  middlename: string | null;
  gender: string;
  barangay: string;
  educational_attainment: string;
  is_ip: boolean;
  ip_group: string | null;
  training_types: { name: string } | null;
}

interface RouteParams {
  slug: string;
}

const TraineeList: React.FC = () => {

  const { slug } = useParams<RouteParams>();
  const history = useHistory();
  const [trainees, setTrainees] = useState<Trainee[]>([]);

  useEffect(() => {
    fetchTrainees();
  }, [slug]);

  const fetchTrainees = async () => {

    let query = supabase
      .from('trainees')
      .select(`*, training_types(name)`);

    if (slug !== 'all') {
      const formattedName = slug.replace(/-/g, ' ');

      const { data: typeData } = await supabase
        .from('training_types')
        .select('id')
        .ilike('name', formattedName)
        .single();

      if (typeData) {
        query = query.eq('training_type_id', typeData.id);
      }
    }

    const { data } = await query.order('lastname');
    setTrainees(data || []);
  };

  /* =========================
     BACK BUTTON (NO UNDO BUG)
  ========================== */
  const handleBack = () => {
    history.replace('/training');
  };

  /* =========================
     PRINT (DATA ONLY)
  ========================== */
  const handlePrint = () => {

    const printWindow = window.open('', '', 'width=1000,height=700');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Trainee List</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 5px; font-size: 12px; }
            th { background-color: #f2f2f2; }
            h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h2>TSDC Trainee List</h2>
          <p>Date: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Barangay</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Educational Attainment</th>
                <th>IP</th>
                <th>Training</th>
              </tr>
            </thead>
            <tbody>
              ${trainees.map(t => `
                <tr>
                  <td>${t.barangay}</td>
                  <td>${t.lastname}, ${t.firstname} ${t.middlename || ''}</td>
                  <td>${t.gender}</td>
                  <td>${t.educational_attainment}</td>
                  <td>${t.is_ip ? `IP (${t.ip_group})` : 'Not IP'}</td>
                  <td>${t.training_types?.name || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  /* =========================
     REAL PDF DOWNLOAD
  ========================== */
  const handleDownloadPDF = () => {

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('TSDC Trainee List', 105, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });

    const tableData = trainees.map(t => [
      t.barangay,
      `${t.lastname}, ${t.firstname} ${t.middlename || ''}`,
      t.gender,
      t.educational_attainment,
      t.is_ip ? `IP (${t.ip_group})` : 'Not IP',
      t.training_types?.name || '-'
    ]);

    autoTable(doc, {
      head: [[
        'Barangay',
        'Name',
        'Gender',
        'Education',
        'IP',
        'Training'
      ]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
    });

    doc.save('tsdc_trainee_list.pdf');
  };

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar color="primary">

          <IonButtons slot="start">
            <IonButton onClick={handleBack}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>

          <IonTitle>
            {slug !== 'all'
              ? `${slug.replace(/-/g, ' ').toUpperCase()} Trainees`
              : 'All Trainees'}
          </IonTitle>

        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <IonText>
          <h2>Total Displayed: {trainees.length}</h2>
        </IonText>

        <IonButton fill="clear" onClick={handlePrint}>
          <IonIcon icon={printOutline} slot="icon-only" />
        </IonButton>

        <IonButton fill="clear" onClick={handleDownloadPDF}>
          <IonIcon icon={downloadOutline} slot="icon-only" />
        </IonButton>

        <IonGrid style={{ marginTop: '20px' }}>

          <IonRow style={{ fontWeight: 'bold', borderBottom: '2px solid #000' }}>
            <IonCol>Barangay</IonCol>
            <IonCol>Name</IonCol>
            <IonCol>Gender</IonCol>
            <IonCol>Education</IonCol>
            <IonCol>IP</IonCol>
            <IonCol>Training</IonCol>
          </IonRow>

          {trainees.map(trainee => (
            <IonRow key={trainee.id}>
              <IonCol>{trainee.barangay}</IonCol>
              <IonCol>
                {trainee.lastname}, {trainee.firstname} {trainee.middlename || ''}
              </IonCol>
              <IonCol>{trainee.gender}</IonCol>
              <IonCol>{trainee.educational_attainment}</IonCol>
              <IonCol>
                {trainee.is_ip ? `IP (${trainee.ip_group})` : 'Not IP'}
              </IonCol>
              <IonCol>
                {trainee.training_types?.name || '-'}
              </IonCol>
            </IonRow>
          ))}

        </IonGrid>

      </IonContent>
    </IonPage>
  );
};

export default TraineeList;