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
  IonButtons,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonPopover,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/react';

import {
  arrowBackOutline,
  printOutline,
  downloadOutline,
  funnelOutline
} from 'ionicons/icons';

import { useLocation, useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

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
  created_at: string;
  scholarship_types: { name: string } | null;
}

const barangays = [
  "Agusan Canyon","Alae","Dahilayan","Dalirig","Damilag","Diclum",
  "Guilang-guilang","Kalugmanan","Lindaban","Lingion","Lunocan",
  "Maluko","Mambatangan","Mampayag","Mantibugao","Minsuro",
  "San Miguel","Sankanan","Santiago","Santo Niño",
  "Tankulan (Pob.)","Ticala"
];

const StudentList: React.FC = () => {

  const location = useLocation();
  const history = useHistory();
  const queryParams = new URLSearchParams(location.search);
  const typeQuery = queryParams.get('type');
  const searchQuery = queryParams.get('query');

  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  const [searchText, setSearchText] = useState(searchQuery || '');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [sortOption, setSortOption] = useState('az');
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [selectedIP, setSelectedIP] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [typeQuery, searchQuery]);

  useEffect(() => {
    applyFilters();
  }, [
    students,
    searchText,
    selectedBarangay,
    selectedGender,
    selectedIP,
    selectedSchool,
    selectedCourse,
    sortOption
  ]);

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
      `lastname.ilike.%${searchQuery}%,firstname.ilike.%${searchQuery}%`
    );
  }

    const { data } = await query;
    setStudents(data || []);
  };

  const applyFilters = () => {

    let data = [...students];

    if (searchText) {
      data = data.filter(s =>
        `${s.lastname} ${s.firstname}`
          .toLowerCase()
          .includes(searchText.toLowerCase())
      );
    }

    if (selectedBarangay) {
      data = data.filter(s => s.barangay === selectedBarangay);
    }

    if (selectedGender) {
      data = data.filter(s => s.gender === selectedGender);
    }

    if (selectedIP) {
      data = data.filter(s =>
        selectedIP === 'IP' ? s.is_ip === true : s.is_ip === false
      );
    }

    if (selectedSchool) {
      data = data.filter(s => s.school === selectedSchool);
    }

    if (selectedCourse) {
      data = data.filter(s => s.course === selectedCourse);
    }

    switch (sortOption) {
      case 'az':
        data.sort((a, b) => a.lastname.localeCompare(b.lastname));
        break;
      case 'za':
        data.sort((a, b) => b.lastname.localeCompare(a.lastname));
        break;
      case 'date_desc':
        data.sort((a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
        break;
      case 'date_asc':
        data.sort((a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        );
        break;
    }

    setFilteredStudents(data);
  };

  const handleBack = () => {
    history.replace('/scholarship');
  };

  const resetFilters = () => {
    setSearchText('');
    setSelectedBarangay('');
    setSelectedGender('');
    setSortOption('az');
    setShowFilter(false);
  };

  /* PRINT */
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=1000,height=700');
    if (!printWindow) return;

    printWindow.document.write(generateHTMLTable(filteredStudents));
    printWindow.document.close();
    printWindow.print();
  };

  const generateHTMLTable = (data: Student[]) => `
    <html>
      <head>
        <style>
          body { font-family: Arial; padding:20px; }
          table { width:100%; border-collapse:collapse; }
          th,td { border:1px solid #000; padding:5px; font-size:12px; }
          th { background:#f2f2f2; }
        </style>
      </head>
      <body>
        <h2 style="text-align:center">Scholarship Student List</h2>
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
            ${data.map(s => `
              <tr>
                <td>${s.barangay}</td>
                <td>${s.lastname}, ${s.firstname}</td>
                <td>${s.gender}</td>
                <td>${s.school}</td>
                <td>${s.course || '-'}</td>
                <td>${s.year_level || '-'}</td>
                <td>${s.is_ip ? 'IP' : 'Not IP'}</td>
                <td>${s.scholarship_types?.name || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  /* PDF */
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    const tableData = filteredStudents.map(s => [
      s.barangay,
      `${s.lastname}, ${s.firstname}`,
      s.gender,
      s.school,
      s.course || '-',
      s.year_level || '-',
      s.is_ip ? 'IP' : 'Not IP',
      s.scholarship_types?.name || '-'
    ]);

    autoTable(doc, {
      head: [['Barangay','Name','Gender','School','Course','Year','IP','Type']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 }
    });

    doc.save('scholarship_student_list.pdf');
  };

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton onClick={handleBack}>
              <IonIcon icon={arrowBackOutline}/>
            </IonButton>
          </IonButtons>

          <IonTitle>
            {typeQuery ? `${typeQuery.toUpperCase()} Scholars` : 'All Scholars'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'15px'}}>

          <div>
            <IonButton fill="clear" onClick={handlePrint}>
              <IonIcon icon={printOutline}/>
            </IonButton>
            <IonButton fill="clear" onClick={handleDownloadPDF}>
              <IonIcon icon={downloadOutline}/>
            </IonButton>
          </div>

          <div style={{display:'flex',gap:'8px'}}>

            <IonInput
              placeholder="Search name..."
              value={searchText}
              onIonInput={e => setSearchText(e.detail.value!)}
              style={{border:'1px solid #ccc',borderRadius:'20px',paddingLeft:'10px'}}
            />

            <IonButton onClick={() => setShowFilter(true)}>
              <IonIcon icon={funnelOutline}/> Filter
            </IonButton>

            <IonSelect
              interface="popover"
              value={sortOption}
              onIonChange={e => setSortOption(e.detail.value)}
            >
              <IonSelectOption value="az">A to Z</IonSelectOption>
              <IonSelectOption value="za">Z to A</IonSelectOption>
              <IonSelectOption value="date_desc">Newest</IonSelectOption>
              <IonSelectOption value="date_asc">Oldest</IonSelectOption>
            </IonSelect>

          </div>
        </div>

        <IonPopover isOpen={showFilter} onDidDismiss={() => setShowFilter(false)}>
          <IonList style={{padding:'15px',minWidth:'250px'}}>

            <IonItem>
              <IonLabel position="stacked">Barangay</IonLabel>
              <IonSelect
                interface="popover"
                value={selectedBarangay}
                onIonChange={e => setSelectedBarangay(e.detail.value)}
              >
                {barangays.map(b => (
                  <IonSelectOption key={b} value={b}>{b}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Filter Type</IonLabel>
              <IonSelect
                interface="popover"
                value={filterType}
                onIonChange={e => {
                  setFilterType(e.detail.value);
                  setSelectedGender('');
                  setSelectedIP('');
                  setSelectedSchool('');
                  setSelectedCourse('');
                }}
              >
                <IonSelectOption value="gender">Gender</IonSelectOption>
                <IonSelectOption value="ip">IP</IonSelectOption>
                <IonSelectOption value="school">School</IonSelectOption>
                <IonSelectOption value="course">Course</IonSelectOption>
              </IonSelect>
            </IonItem>

            {filterType === 'gender' && (
<IonItem>
  <IonLabel position="stacked">Gender</IonLabel>
  <IonSelect
    interface="popover"
    value={selectedGender}
    onIonChange={e => {
      setSelectedGender(e.detail.value);
      setShowFilter(false);
    }}
  >
    <IonSelectOption value="Male">Male</IonSelectOption>
    <IonSelectOption value="Female">Female</IonSelectOption>
  </IonSelect>
</IonItem>
)}

{filterType === 'ip' && (
<IonItem>
  <IonLabel position="stacked">IP</IonLabel>
  <IonSelect
    interface="popover"
    value={selectedIP}
    onIonChange={e => {
      setSelectedIP(e.detail.value);
      setShowFilter(false);
    }}
  >
    <IonSelectOption value="IP">IP</IonSelectOption>
    <IonSelectOption value="NOT_IP">Not IP</IonSelectOption>
  </IonSelect>
</IonItem>
)}

{filterType === 'school' && (
<IonItem>
  <IonLabel position="stacked">School</IonLabel>
  <IonSelect
    interface="popover"
    value={selectedSchool}
    onIonChange={e => {
      setSelectedSchool(e.detail.value);
      setShowFilter(false);
    }}
  >
    {[...new Set(students.map(s => s.school))].map(school => (
      <IonSelectOption key={school} value={school}>
        {school}
      </IonSelectOption>
    ))}
  </IonSelect>
</IonItem>
)}

{filterType === 'course' && (
<IonItem>
  <IonLabel position="stacked">Course</IonLabel>
  <IonSelect
    interface="popover"
    value={selectedCourse}
    onIonChange={e => {
      setSelectedCourse(e.detail.value);
      setShowFilter(false);
    }}
  >
    {[...new Set(students.map(s => s.course).filter(Boolean))].map(course => (
      <IonSelectOption key={course} value={course}>
        {course}
      </IonSelectOption>
    ))}
  </IonSelect>
</IonItem>
)}

            <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
              <IonButton expand="block" color="medium" onClick={resetFilters}>
                Reset
              </IonButton>

              <IonButton expand="block" onClick={() => setShowFilter(false)}>
                Ok
              </IonButton>
            </div>

          </IonList>
        </IonPopover>

        <IonText>
          <h2>Total Displayed: {filteredStudents.length}</h2>
        </IonText>

        <IonGrid>
          <IonRow style={{fontWeight:'bold',borderBottom:'2px solid #000'}}>
            <IonCol>Barangay</IonCol>
            <IonCol>Name</IonCol>
            <IonCol>Gender</IonCol>
            <IonCol>School</IonCol>
            <IonCol>Course</IonCol>
            <IonCol>Year</IonCol>
            <IonCol>IP</IonCol>
            <IonCol>Type</IonCol>
          </IonRow>

          {filteredStudents.map(student => (
            <IonRow key={student.id}>
              <IonCol>{student.barangay}</IonCol>
              <IonCol>{student.lastname}, {student.firstname}</IonCol>
              <IonCol>{student.gender}</IonCol>
              <IonCol>{student.school}</IonCol>
              <IonCol>{student.course || '-'}</IonCol>
              <IonCol>{student.year_level || '-'}</IonCol>
              <IonCol>{student.is_ip ? 'IP' : 'Not IP'}</IonCol>
              <IonCol>{student.scholarship_types?.name || '-'}</IonCol>
            </IonRow>
          ))}

        </IonGrid>

      </IonContent>
    </IonPage>
  );
};

export default StudentList;