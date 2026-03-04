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
} from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { printOutline, downloadOutline } from 'ionicons/icons';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Student {
  id: string;
  firstname: string;
  lastname: string;
  middlename: string | null;
  gender: string;
  barangay: string;
  school: string;
  course: string | null;
  year_level: string | null;
  is_ip: boolean;
  ip_group: string | null;
  scholarship_types: { name: string } | null;
}

const StudentList: React.FC = () => {

  const location = useLocation();
  const history = useHistory();
  const queryParams = new URLSearchParams(location.search);

  const typeQuery = queryParams.get('type');
  const searchQuery = queryParams.get('query');

  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetchStudents();
  }, [typeQuery, searchQuery]);

  const fetchStudents = async () => {

    let query = supabase
      .from('students')
      .select(`*, scholarship_types(name)`);

    if (typeQuery) {
      const { data: typeData } = await supabase
        .from('scholarship_types')
        .select('id')
        .eq('name', typeQuery)
        .single();

      if (typeData) {
        query = query.eq('scholarship_type_id', typeData.id);
      }
    }

    if (searchQuery) {
      query = query.or(
        `firstname.ilike.%${searchQuery}%,lastname.ilike.%${searchQuery}%,barangay.ilike.%${searchQuery}%,school.ilike.%${searchQuery}%`
      );
    }

    const { data } = await query.order('lastname');
    setStudents(data || []);
  };

  /* =========================
     🖨 CLEAN PRINT (DATA ONLY)
  ========================== */
  const handlePrint = () => {

    const printWindow = window.open('', '', 'width=1000,height=700');

    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Student List</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 5px; font-size: 12px; }
            th { background-color: #f2f2f2; }
            h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h2>Scholarship Student List</h2>
          <p>Date: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Barangay</th>
                <th>Name</th>
                <th>Gender</th>
                <th>School</th>
                <th>Course</th>
                <th>Year</th>
                <th>IP</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(s => `
                <tr>
                  <td>${s.barangay}</td>
                  <td>${s.lastname}, ${s.firstname} ${s.middlename || ''}</td>
                  <td>${s.gender}</td>
                  <td>${s.school}</td>
                  <td>${s.course || '-'}</td>
                  <td>${s.year_level || '-'}</td>
                  <td>${s.is_ip ? `IP (${s.ip_group})` : 'Not IP'}</td>
                  <td>${s.scholarship_types?.name || '-'}</td>
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
     📄 REAL PDF (NOT IMAGE)
  ========================== */
  const handleDownloadPDF = () => {

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Scholarship Student List', 105, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });

    const tableData = students.map(s => [
      s.barangay,
      `${s.lastname}, ${s.firstname} ${s.middlename || ''}`,
      s.gender,
      s.school,
      s.course || '-',
      s.year_level || '-',
      s.is_ip ? `IP (${s.ip_group})` : 'Not IP',
      s.scholarship_types?.name || '-'
    ]);

    autoTable(doc, {
      head: [[
        'Barangay',
        'Name',
        'Gender',
        'School',
        'Course',
        'Year',
        'IP',
        'Type'
      ]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save('scholarship_student_list.pdf');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>
            {typeQuery ? `${typeQuery.toUpperCase()} Scholars` : 'All Scholars'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <IonText>
          <h2>Total Displayed: {students.length}</h2>
        </IonText>

        <IonButton onClick={() => history.push('/scholarship')}>
          Back
        </IonButton>

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
            <IonCol>School</IonCol>
            <IonCol>Course</IonCol>
            <IonCol>Year</IonCol>
            <IonCol>IP</IonCol>
            <IonCol>Type</IonCol>
          </IonRow>

          {students.map(student => (
            <IonRow key={student.id}>
              <IonCol>{student.barangay}</IonCol>
              <IonCol>
                {student.lastname}, {student.firstname} {student.middlename || ''}
              </IonCol>
              <IonCol>{student.gender}</IonCol>
              <IonCol>{student.school}</IonCol>
              <IonCol>{student.course || '-'}</IonCol>
              <IonCol>{student.year_level || '-'}</IonCol>
              <IonCol>
                {student.is_ip ? `IP (${student.ip_group})` : 'Not IP'}
              </IonCol>
              <IonCol>
                {student.scholarship_types?.name || '-'}
              </IonCol>
            </IonRow>
          ))}

        </IonGrid>

      </IonContent>
    </IonPage>
  );
};

export default StudentList;