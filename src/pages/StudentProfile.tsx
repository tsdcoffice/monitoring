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
} from '@ionic/react';

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface ScholarshipType {
  id: string;
  name: string;
}

const StudentProfile: React.FC = () => {

  const barangays = [
    "Agusan Canyon","Alae","Dahilayan","Dalirig","Damilag","Diclum",
    "Guilang-guilang","Kalugmanan","Lindaban","Lingion","Lunocan",
    "Maluko","Mambatangan","Mampayag","Mantibugao","Minsuro",
    "San Miguel","Sankanan","Santiago","Santo Niño",
    "Tankulan (Pob.)","Ticala"
  ];

  const ipTribes = [
    "BUKIDNON",
    "HIGAONON",
    "MANOBO",
    "MATIGSALUG",
    "TALAANDIG",
    "TIGWAHANON",
    "UMAYAMNON"
  ];

  const initialFormState = {
    lastname: '',
    firstname: '',
    middlename: '',
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

    // Fields nga gusto nato i ALL CAPS
    const uppercaseFields = [
      'lastname',
      'firstname',
      'middlename',
      'school',
      'course',
      'ip_group'
    ];

    if (uppercaseFields.includes(field) && value) {
      value = value.toUpperCase();
    }

    setFormData({ ...formData, [field]: value });
  };

  const saveStudent = async () => {

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

    const { error } = await supabase.from('students').insert([
      formData
    ]);

    if (error) {
      console.error(error);
      alert("Error saving student.");
      return;
    }

    setShowToast(true);

    // RESET FORM
    setFormData(initialFormState);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Student Profiling</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        {/* LASTNAME */}
        <IonItem>
          <IonLabel position="stacked">Last Name *</IonLabel>
          <IonInput
            placeholder="LASTNAME"
            value={formData.lastname}
            onIonChange={e => handleChange('lastname', e.detail.value)}
          />
        </IonItem>

        {/* FIRSTNAME */}
        <IonItem>
          <IonLabel position="stacked">First Name *</IonLabel>
          <IonInput
            placeholder="FIRSTNAME"
            value={formData.firstname}
            onIonChange={e => handleChange('firstname', e.detail.value)}
          />
        </IonItem>

        {/* MIDDLENAME */}
        <IonItem>
          <IonLabel position="stacked">Middle Name</IonLabel>
          <IonInput
            placeholder="MIDDLENAME"
            value={formData.middlename}
            onIonChange={e => handleChange('middlename', e.detail.value)}
          />
        </IonItem>

        {/* GENDER */}
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

        {/* BARANGAY */}
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

        {/* SCHOOL */}
        <IonItem>
          <IonLabel position="stacked">School Name *</IonLabel>
          <IonInput
            placeholder="DON'T ABBREVIATE"
            value={formData.school}
            onIonChange={e => handleChange('school', e.detail.value)}
          />
        </IonItem>

        {/* COURSE */}
        <IonItem>
          <IonLabel position="stacked">Course *</IonLabel>
          <IonInput
            placeholder="DON'T ABBREVIATE"
            value={formData.course}
            onIonChange={e => handleChange('course', e.detail.value)}
          />
        </IonItem>

        {/* YEAR LEVEL */}
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

        {/* IP YES/NO */}
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

        {/* IP TRIBE */}
        {formData.is_ip && (
          <IonItem>
            <IonLabel position="stacked">IP Tribe *</IonLabel>
            <IonSelect
              interface="popover"
              value={formData.ip_group}
              onIonChange={e => handleChange('ip_group', e.detail.value)}
            >
              {ipTribes.map(tribe => (
                <IonSelectOption key={tribe} value={tribe}>
                  {tribe}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        )}

        {/* SCHOLARSHIP TYPE */}
        <IonItem>
          <IonLabel position="stacked">Type of Scholarship *</IonLabel>
          <IonSelect
            interface="popover"
            value={formData.scholarship_type_id}
            onIonChange={e => handleChange('scholarship_type_id', e.detail.value)}
          >
            {scholarshipTypes.map(type => (
              <IonSelectOption key={type.id} value={type.id}>
                {type.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonButton expand="block" onClick={saveStudent} className="ion-margin-top">
          Save Student
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