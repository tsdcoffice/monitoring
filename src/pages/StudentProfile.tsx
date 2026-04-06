import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonToast,
  IonButtons,
  IonIcon,
  IonCol
} from '@ionic/react';

import { arrowBack } from 'ionicons/icons';
import { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface ScholarshipType {
  id: string;
  name: string;
}

const StudentProfile: React.FC = () => {

  const history = useHistory();

  const firstNameRef = useRef<HTMLIonInputElement>(null);
  const middleNameRef = useRef<HTMLIonInputElement>(null);
  const suffixRef = useRef<HTMLIonInputElement>(null);
  const schoolRef = useRef<HTMLIonInputElement>(null);
  const courseRef = useRef<HTMLIonInputElement>(null);

  const barangays = [
    "Agusan Canyon","Alae","Dahilayan","Dalirig","Damilag","Dicklum",
    "Guilang-guilang","Kalugmanan","Lindaban","Lingion","Lunocan",
    "Maluko","Mambatangan","Mampayag","Mantibugao","Minsuro",
    "San Miguel","Sankanan","Santiago","Santo Niño",
    "Tankulan (Pob.)","Ticala"
  ];

  const ipTribes = [
    "BUKIDNON","HIGAONON","MANOBO","MATIGSALUG",
    "TALAANDIG","TIGWAHANON","UMAYAMNON"
  ];

  const initialFormState = {
    lastname: '',
    firstname: '',
    middlename: '',
    suffix: '',
    gender: '',
    barangay: '',
    school: '',
    course: '',
    year_level: '',
    is_ip: false,
    ip_group: '',
    scholarship_type_id: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [scholarshipTypes, setScholarshipTypes] = useState<ScholarshipType[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchScholarshipTypes();
  }, []);

  const fetchScholarshipTypes = async () => {
    const { data, error } = await supabase
      .from('scholarship_types')
      .select('*')
      .order('name');

    if (!error && data) {
      setScholarshipTypes(data);
    }
  };

  const handleChange = (field: string, value: any) => {
    const uppercaseFields = ['lastname','firstname','middlename','suffix', 'school','course','ip_group'];

    if (uppercaseFields.includes(field) && value) {
      value = value.toUpperCase();
    }

    setFormData({ ...formData, [field]: value });
  };

  const handleEnter = (nextRef: React.RefObject<HTMLIonInputElement | null>) => (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextRef.current?.setFocus();
    }
  };

  const saveStudent = async () => {

  if (isSaving) return; // ✅ prevents double click

  setIsSaving(true);

  try {

    if (
      !formData.lastname ||
      !formData.firstname ||
      !formData.gender ||
      !formData.barangay ||
      !formData.school ||
      !formData.year_level ||
      !formData.scholarship_type_id
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (formData.is_ip && !formData.ip_group) {
      alert("Please select IP Tribe.");
      return;
    }

    const { error } = await supabase.from('students').insert([formData]);

    if (error) throw error;

    setShowToast(true);
    setFormData(initialFormState);
  }catch (err:any) {

    console.error(err);
    alert("Error saving student.");

  } finally {

    setIsSaving(false); // ✅ unlock button

  }
};

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar style={{ '--background': '#10377a', '--color': '#ffffff' }}>

          {/* BACK BUTTON DIRECT TO DASHBOARD */}
          <IonButtons slot="start">
            <IonButton onClick={() => history.push('/dashboard')}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>

          <IonTitle style={{ fontWeight: 600 }}>STUDENT PROFILING FORM</IonTitle>

        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <IonItem>
          <IonLabel position="stacked">Last Name *</IonLabel>
          <IonInput
            placeholder="LASTNAME"
            value={formData.lastname}
            onIonChange={e => handleChange('lastname', e.detail.value)}
            onKeyDown={handleEnter(firstNameRef)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">First Name *</IonLabel>
          <IonInput
            ref={firstNameRef}
            placeholder="FIRSTNAME"
            value={formData.firstname}
            onIonChange={e => handleChange('firstname', e.detail.value)}
            onKeyDown={handleEnter(middleNameRef)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Middle Name</IonLabel>
          <IonInput
            ref={middleNameRef}
            placeholder="MIDDLENAME"
            value={formData.middlename}
            onIonChange={e => handleChange('middlename', e.detail.value)}
            onKeyDown={handleEnter(suffixRef)}
          />
        </IonItem>

  
      <IonCol size="4">
        <IonItem>
          <IonLabel position="stacked">Suffix</IonLabel>
            <IonInput
              ref={suffixRef}
              placeholder="e.g. Jr., Sr., III"
              value={formData.suffix}
              onIonChange={e => handleChange('suffix', e.detail.value)}
              onKeyDown={handleEnter(schoolRef)} // <--- Mo-focus sa School
            />
        </IonItem>
      </IonCol>

        <IonItem>
          <IonLabel position="stacked">Gender *</IonLabel>
          <IonSelect
            interface="popover"
            value={formData.gender}
            onIonChange={e => handleChange('gender', e.detail.value)}
          >
            <IonSelectOption value="Male">Male</IonSelectOption>
            <IonSelectOption value="Female">Female</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Barangay Address *</IonLabel>
          <IonSelect
            interface="popover"
            value={formData.barangay}
            onIonChange={e => handleChange('barangay', e.detail.value)}
          >
            {barangays.map(b => (
              <IonSelectOption key={b} value={b}>{b}</IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">School Name *</IonLabel>
          <IonInput
            ref={schoolRef}
            placeholder="DON'T ABBREVIATE"
            value={formData.school}
            onIonChange={e => handleChange('school', e.detail.value)}
            onKeyDown={handleEnter(courseRef)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Course *</IonLabel>
          <IonInput
            ref={courseRef}
            placeholder="DON'T ABBREVIATE"
            value={formData.course}
            onIonChange={e => handleChange('course', e.detail.value)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Year Level *</IonLabel>
          <IonSelect
            interface="popover"
            value={formData.year_level}
            onIonChange={e => handleChange('year_level', e.detail.value)}
          >
            <IonSelectOption value="1st Year">1st Year</IonSelectOption>
            <IonSelectOption value="2nd Year">2nd Year</IonSelectOption>
            <IonSelectOption value="3rd Year">3rd Year</IonSelectOption>
            <IonSelectOption value="4th Year">4th Year</IonSelectOption>
            <IonSelectOption value="5th Year">5th Year</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Are you IP?</IonLabel>
          <IonSelect
            interface="popover"
            value={formData.is_ip}
            onIonChange={e => handleChange('is_ip', e.detail.value)}
          >
            <IonSelectOption value={true}>Yes</IonSelectOption>
            <IonSelectOption value={false}>No</IonSelectOption>
          </IonSelect>
        </IonItem>

        {formData.is_ip && (
          <IonItem>
            <IonLabel position="stacked">IP Tribe *</IonLabel>
            <IonSelect
              interface="popover"
              value={formData.ip_group}
              onIonChange={e => handleChange('ip_group', e.detail.value)}
            >
              {ipTribes.map(tribe => (
                <IonSelectOption key={tribe} value={tribe}>{tribe}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        )}

        <IonItem>
          <IonLabel position="stacked">Type of Scholarship *</IonLabel>
          <IonSelect
            interface="popover"
            value={formData.scholarship_type_id}
            onIonChange={e => handleChange('scholarship_type_id', e.detail.value)}
          >
            {scholarshipTypes.map(type => (
              <IonSelectOption key={type.id} value={type.id}>{type.name}</IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonButton expand="block" onClick={saveStudent} disabled={isSaving} className="ion-margin-top"> {isSaving ? "Saving..." : "Save Student"}
        </IonButton>

        <IonToast
          isOpen={showToast}
          message="Student saved successfully!"
          duration={1500}
          onDidDismiss={() => setShowToast(false)}
        />

      </IonContent>
    </IonPage>
  );
};

export default StudentProfile;