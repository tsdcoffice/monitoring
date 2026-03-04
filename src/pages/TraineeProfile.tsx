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

import { useState } from 'react';
import { supabase } from '../supabaseClient';

const TraineeProfile: React.FC = () => {

  const barangays = [
    "Agusan Canyon","Alae","Dahilayan","Dalirig","Damilag","Diclum",
    "Guilang-guilang","Kalugmanan","Lindaban","Lingion","Lunocan",
    "Maluko","Mambatangan","Mampayag","Mantibugao","Minsuro",
    "San Miguel","Sankanan","Santiago","Santo Niño",
    "Tankulan (Pob.)","Ticala"
  ];

  const ipTribes = [
    "BUKIDNON","HIGAONON","MANOBO","MATIGSALUG",
    "TALAANDIG","TIGWAHANON","UMAYAMNON"
  ];

  const trainings = [
    "Barista",
    "Barangay Health Services NCII",
    "Bayong Making",
    "Beauty Care (Nail Care, Hair and Make-up)",
    "Bookkeeping NC III",
    "Bread and Pastry Production",
    "Community Nutrition Services",
    "Cookery",
    "Dressmaking NCII",
    "Driving NCII",
    "Electrical Installation and Maintenance NC II",
    "Emergency Medical Services NCII",
    "Food Processing",
    "Garbage Collection NCII",
    "Housekeeping NC II",
    "Masonry and Hallow Blocks",
    "Massage Therapy",
    "Organic Agriculture NC II",
    "Pineapple Processing",
    "Plumbing",
    "Scaffolding",
    "Security Services NCII",
    "Shielded Metal Arc Welding(SMAW) NC I",
    "Shielded Metal Arc Welding(SMAW) NC II"
  ];

  const educationalAttainmentOptions = [
    "Elementary Level",
    "Elementary Graduate",
    "High School Level",
    "High School Graduate",
    "Senior High School Graduate",
    "College Level",
    "College Graduate"
  ];

  const initialFormState = {
    lastname: '',
    firstname: '',
    middlename: '',
    gender: '',
    barangay: '',
    is_ip: false,
    ip_group: '',
    educational_attainment: '',
    course: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [showToast, setShowToast] = useState(false);

  const handleChange = (field: string, value: any) => {
    const uppercaseFields = ['lastname','firstname','middlename','ip_group'];

    if (uppercaseFields.includes(field) && value) {
      value = value.toUpperCase();
    }

    setFormData({ ...formData, [field]: value });
  };

  const saveTrainee = async () => {

    if (
      !formData.lastname ||
      !formData.firstname ||
      !formData.gender ||
      !formData.barangay ||
      !formData.educational_attainment ||
      !formData.course
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (formData.is_ip && !formData.ip_group) {
      alert("Please select IP Tribe.");
      return;
    }

    // 🔥 GET TRAINING TYPE ID
    const { data: trainingData, error: trainingError } = await supabase
      .from('training_types')
      .select('id')
      .eq('name', formData.course)
      .single();

    if (trainingError || !trainingData) {
      console.error(trainingError);
      alert("Training type not found in database.");
      return;
    }

    const { error } = await supabase.from('trainees').insert([
      {
        lastname: formData.lastname,
        firstname: formData.firstname,
        middlename: formData.middlename,
        gender: formData.gender,
        barangay: formData.barangay,
        is_ip: formData.is_ip,
        ip_group: formData.is_ip ? formData.ip_group : null,
        educational_attainment: formData.educational_attainment,
        training_type_id: trainingData.id   // ✅ foreign key insert
      }
    ]);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setShowToast(true);
    setFormData(initialFormState);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Trainee Profiling Form</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <IonItem>
          <IonLabel position="stacked">Last Name *</IonLabel>
          <IonInput
            value={formData.lastname}
            onIonChange={e => handleChange('lastname', e.detail.value)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">First Name *</IonLabel>
          <IonInput
            value={formData.firstname}
            onIonChange={e => handleChange('firstname', e.detail.value)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Middle Name</IonLabel>
          <IonInput
            value={formData.middlename}
            onIonChange={e => handleChange('middlename', e.detail.value)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Gender *</IonLabel>
          <IonSelect
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
            value={formData.barangay}
            onIonChange={e => handleChange('barangay', e.detail.value)}
          >
            {barangays.map(b => (
              <IonSelectOption key={b} value={b}>{b}</IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Are you IP?</IonLabel>
          <IonSelect
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

        <IonItem>
          <IonLabel position="stacked">Educational Attainment *</IonLabel>
          <IonSelect
            value={formData.educational_attainment}
            onIonChange={e => handleChange('educational_attainment', e.detail.value)}
          >
            {educationalAttainmentOptions.map(level => (
              <IonSelectOption key={level} value={level}>
                {level}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Type of Training *</IonLabel>
          <IonSelect
            value={formData.course}
            onIonChange={e => handleChange('course', e.detail.value)}
          >
            {trainings.map(training => (
              <IonSelectOption key={training} value={training}>
                {training}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonButton expand="block" onClick={saveTrainee} className="ion-margin-top">
          Save Trainee
        </IonButton>

        <IonToast
          isOpen={showToast}
          message="Trainee saved successfully!"
          duration={1500}
          onDidDismiss={() => setShowToast(false)}
        />

      </IonContent>
    </IonPage>
  );
};

export default TraineeProfile;