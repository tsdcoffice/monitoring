import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonButtons,
  IonBackButton,
  IonInput
} from '@ionic/react';

import { useParams, useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const barangays = [
  "Agusan Canyon","Alae","Dahilayan","Dalirig","Damilag","Dicklum",
  "Guilang-guilang","Kalugmanan","Lindaban","Lingion","Lunocan",
  "Maluko","Mambatangan","Mampayag","Mantibugao","Minsuro",
  "San Miguel","Sankanan","Santiago","Santo Niño",
  "Tankulan (Pob.)","Ticala"
];

interface Params {
  id: string;
}


const UpdateStudent: React.FC = () => {

  const { id } = useParams<Params>();
  const history = useHistory();

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [middlename, setMiddlename] = useState('');
  const [gender, setGender] = useState('');
  const [barangay, setBarangay] = useState('');
  const [school, setSchool] = useState('');
  const [course, setCourse] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [isIP, setIsIP] = useState(false);
  const [status, setStatus] = useState('');
  
  // 1. I-ADD ANG STATE PARA SA REMARKS
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchStudent();
  }, []);

  const fetchStudent = async () => {
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      setFirstname(data.firstname);
      setLastname(data.lastname);
      setMiddlename(data.middlename || '');
      setGender(data.gender);
      setBarangay(data.barangay);
      setSchool(data.school);
      setCourse(data.course || '');
      setYearLevel(data.year_level || '1st Year');
      setIsIP(data.is_ip);
      setStatus(data.status || 'On-going');
      
      // 2. I-LOAD ANG REMARKS GIKAN SA DATABASE
      setRemarks(data.remarks || '');
    }
  };

  const updateStudent = async () => {
    await supabase
      .from('students')
      .update({
        firstname,
        lastname,
        middlename,
        gender,
        barangay,
        school,
        course,
        year_level: yearLevel,
        is_ip: isIP,
        status,
        // 3. I-SAVE ANG REMARKS KUNG STOPPED, ELSE NULL
        remarks: status === 'Stopped' ? remarks : null
      })
      .eq('id', id);

    history.goBack();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': '#10377a', '--color': '#ffffff' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/student-list"/>
          </IonButtons>
          <IonTitle>Update Student</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">First Name</IonLabel>
          <IonInput value={firstname} onIonInput={e => setFirstname(e.detail.value!)} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Last Name</IonLabel>
          <IonInput value={lastname} onIonInput={e => setLastname(e.detail.value!)} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Middle Name</IonLabel>
          <IonInput value={middlename} onIonInput={e => setMiddlename(e.detail.value!)} />
        </IonItem>

        <IonItem>
          <IonLabel>Gender</IonLabel>
          <IonSelect interface="popover" value={gender} onIonChange={e => setGender(e.detail.value)}>
            <IonSelectOption value="Male">Male</IonSelectOption>
            <IonSelectOption value="Female">Female</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel>Barangay</IonLabel>
          <IonSelect interface="popover" value={barangay} onIonChange={e => setBarangay(e.detail.value)}>
            {barangays.map(b => (
              <IonSelectOption key={b} value={b}>{b}</IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">School</IonLabel>
          <IonInput value={school} onIonInput={e => setSchool(e.detail.value!)} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Course</IonLabel>
          <IonInput value={course} onIonInput={e => setCourse(e.detail.value!)} />
        </IonItem>

        <IonItem>
          <IonLabel>Year Level</IonLabel>
          <IonSelect interface="popover" value={yearLevel} onIonChange={e => setYearLevel(e.detail.value)}>
            <IonSelectOption value="1st Year">1st Year</IonSelectOption>
            <IonSelectOption value="2nd Year">2nd Year</IonSelectOption>
            <IonSelectOption value="3rd Year">3rd Year</IonSelectOption>
            <IonSelectOption value="4th Year">4th Year</IonSelectOption>
            <IonSelectOption value="5th Year">5th Year</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel>IP Status</IonLabel>
          <IonSelect interface="popover" value={isIP ? 'IP' : 'NOT_IP'} onIonChange={e => setIsIP(e.detail.value === 'IP')}>
            <IonSelectOption value="IP">IP</IonSelectOption>
            <IonSelectOption value="NOT_IP">Not IP</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel>Status</IonLabel>
          <IonSelect interface="popover" value={status} onIonChange={e => setStatus(e.detail.value)}>
            <IonSelectOption value="On-going">On-going</IonSelectOption>
            <IonSelectOption value="Graduated">Graduated</IonSelectOption>
            <IonSelectOption value="Stopped">Stopped</IonSelectOption>
          </IonSelect>
        </IonItem>

        {/* 4. CONDITIONAL REMARKS INPUT */}
        {status === 'Stopped' && (
          <IonItem lines="full">
            <IonLabel position="stacked" color="danger">Reason for Stopping (Remarks)</IonLabel>
            <IonInput 
              value={remarks} 
              placeholder="Enter reason here..." 
              onIonInput={e => setRemarks(e.detail.value!)} 
            />
          </IonItem>
        )}

        <div style={{ marginTop: '20px' }}>
          <IonButton expand="block" onClick={updateStudent} style={{ '--background': '#10377a' }}>
            Save Update
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default UpdateStudent;