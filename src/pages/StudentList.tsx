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
import { useLocation, useParams, useHistory } from 'react-router-dom';
import { ReactNode, useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { printOutline, downloadOutline } from 'ionicons/icons';

interface Student {
  gender: ReactNode;
  id: string;
  name: string;
  barangay: string;
  school: string;
  course: string | null;
  type: string;
  year: string | null;
  ip: boolean;
}

const StudentList: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const location = useLocation();
  const history = useHistory();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('query') || '';

  const [students, setStudents] = useState<Student[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      let query = supabase.from('students').select('*');

      if (type && type !== 'all') query = query.eq('type', type);

      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,barangay.ilike.%${searchQuery}%,school.ilike.%${searchQuery}%,course.ilike.%${searchQuery}%,type.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;
      if (error) {
        console.error(error);
        return;
      }
      setStudents(data || []);
    };

    fetchStudents();
  }, [type, searchQuery]);

  const handleDownloadPDF = async () => {
    if (!tableRef.current) return;

    try {
      const clone = tableRef.current.cloneNode(true) as HTMLElement;
      clone.style.background = '#ffffff';
      clone.style.width = `${tableRef.current.offsetWidth}px`;
      clone.style.padding = '10px';
      clone.style.color = '#000000';

      document.body.appendChild(clone);
      const canvas = await html2canvas(clone, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      document.body.removeChild(clone);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      const pdfWidth = pageWidth - margin * 2;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.setFontSize(16);
      pdf.text('Scholarship Student List', pageWidth / 2, 15, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text(`Date: ${new Date().toLocaleString()}`, pageWidth / 2, 22, { align: 'center' });

      pdf.addImage(imgData, 'PNG', margin, 30, pdfWidth, pdfHeight);
      pdf.save('scholarship_student_list.pdf');
    } catch (error) {
      console.error('PDF download failed:', error);
    }
  };

  const handlePrint = () => {
    if (!tableRef.current) return;
    const printContents = tableRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>
            {type === 'all' || !type ? 'All Scholars' : `${type.toUpperCase()} Scholars`}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonText>
          <h2>Total Displayed: {students.length}</h2>
        </IonText>

        <IonButton onClick={() => history.push('/scholarship')}>Back to Dashboard</IonButton>
         <IonButton color="secondary" fill="clear" onClick={handlePrint}>
            <IonIcon icon={printOutline} slot="icon-only" />
          </IonButton>
          <IonButton color="tertiary" fill="clear" onClick={handleDownloadPDF}>
            <IonIcon icon={downloadOutline} slot="icon-only" />
          </IonButton>

        {/* Table container */}
        <div ref={tableRef} style={{ marginTop: '15px' }}>
          <IonGrid>
            <IonRow
              style={{
                fontWeight: 'bold',
                borderBottom: '2px solid #333',
                backgroundColor: '#f2f2f2',
              }}
            >
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
              <IonRow key={student.id} style={{ borderBottom: '1px solid #ccc' }}>
                <IonCol>{student.barangay}</IonCol>
                <IonCol>{student.name}</IonCol>
                <IonCol>{student.gender}</IonCol>
                <IonCol>{student.school}</IonCol>
                <IonCol>{student.course || '-'}</IonCol>
                <IonCol>{student.year || '-'}</IonCol>
                <IonCol>{student.ip ? 'IP' : 'Not IP'}</IonCol>
                <IonCol>{student.type.toUpperCase()}</IonCol>
              </IonRow>
            ))}
          </IonGrid>
        </div>

        {/* Icon Buttons at bottom-left */}
       
      </IonContent>
    </IonPage>
  );
};

export default StudentList;