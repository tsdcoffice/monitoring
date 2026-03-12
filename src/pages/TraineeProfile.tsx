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
  IonIcon
} from '@ionic/react';

import { arrowBack } from 'ionicons/icons';
import { useState, useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const TraineeProfile: React.FC = () => {

  const history = useHistory();

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

  const trainings = [
    "Barista","Barangay Health Services NC II","Bayong Making",
    "Beauty Care (Nail Care, Hair and Make-up)","Bookkeeping NC III",
    "Bread and Pastry Production","Community Nutrition Services",
    "Cookery","Dressmaking NC II","Driving NC II",
    "Electrical Installation and Maintenance NC II",
    "Emergency Medical Services NC II","Food Processing",
    "Garbage Collection NC II","Housekeeping NC II",
    "Masonry and Hallow Blocks","Massage Therapy",
    "Organic Agriculture NC II","Pineapple Processing",
    "Plumbing","Scaffolding","Security Services NC II",
    "Shielded Metal Arc Welding(SMAW) NC I",
    "Shielded Metal Arc Welding(SMAW) NC II"
  ];

  const educationalAttainmentOptions = [
    "Elementary Level","Elementary Graduate",
    "High School Level","High School Graduate",
    "Senior High School Graduate","College Level",
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
    course: '',
    batch: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [showToast, setShowToast] = useState(false);
   const [isSaving, setIsSaving] = useState(false);

  const firstRef = useRef<HTMLIonInputElement>(null);
  const middleRef = useRef<HTMLIonInputElement>(null);
  const buttonRef = useRef<HTMLIonButtonElement>(null);

  const handleChange = (field: string, value: any) => {

    const uppercaseFields = ['lastname','firstname','middlename','ip_group'];

    if (uppercaseFields.includes(field) && value) {
      value = value.toUpperCase();
    }

    setFormData({ ...formData, [field]: value });
  };

  const handleEnterNext = (nextRef: any) => (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.setFocus();
    }
  };

  // ✅ WRAP THE LOGIC IN THIS FUNCTION
  const saveTrainee = async () => {
    if (isSaving) return;

    const requiredFields = [
      formData.lastname,
      formData.firstname,
      formData.gender,
      formData.barangay,
      formData.educational_attainment,
      formData.course,
      formData.batch
    ];

    if (requiredFields.some(v => v === '' || v === null || v === undefined)) {
      alert("Please fill in all required fields.");
      return;
    }

    if (formData.is_ip && !formData.ip_group) {
      alert("Please select IP Tribe.");
      return;
    }

    setIsSaving(true);

    try {
      const { data: trainingData, error: trainingError } = await supabase
        .from('training_types')
        .select('id')
        .eq('name', formData.course)
        .single();

      if (trainingError || !trainingData) {
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
          training_type_id: trainingData.id,
          batch: formData.batch
        }
      ]);

      if (error) throw error;

      setShowToast(true);
      setFormData(initialFormState); // Optional: clear form after success

    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar style={{ '--background': '#10377a', '--color': '#ffffff' }}>

          {/* DIRECT DASHBOARD BACK BUTTON */}
          <IonButtons slot="start">
            <IonButton onClick={() => history.replace('/dashboard')}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>

          <IonTitle style={{ fontWeight: 600 }}>TRAINEE PROFILING FORM</IonTitle>

        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <IonItem>
          <IonLabel position="stacked">Last Name *</IonLabel>
          <IonInput
            placeholder="LASTNAME"
            value={formData.lastname}
            onIonChange={e => handleChange('lastname', e.detail.value)}
            onKeyDown={handleEnterNext(firstRef)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">First Name *</IonLabel>
          <IonInput
            ref={firstRef}
            placeholder="FIRSTNAME"
            value={formData.firstname}
            onIonChange={e => handleChange('firstname', e.detail.value)}
            onKeyDown={handleEnterNext(middleRef)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Middle Name</IonLabel>
          <IonInput
            ref={middleRef}
            placeholder="MIDDLENAME"
            value={formData.middlename}
            onIonChange={e => handleChange('middlename', e.detail.value)}
          />
        </IonItem>

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
            interface="popover"
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

        <style>
  {`
    ion-action-sheet.no-cancel-sheet .action-sheet-cancel {
      display: none !important;
    }
  `}
</style>

<IonItem>
  <IonLabel position="stacked">Type of Training *</IonLabel>
  <IonSelect
    interface="action-sheet"
    interfaceOptions={{
      cssClass: 'no-cancel-sheet' // Importante ni para kini ra nga select ang ma-apektuhan
    }}
    
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

<IonItem>
  <IonLabel position="stacked">Batch *</IonLabel>
  <IonInput
  type="number"
  min="1"
  max="1000"
  placeholder="Enter Batch Number"
  value={formData.batch}

  onIonChange={e => {
    const value = e.detail.value;

    if (!value) {
      handleChange('batch', '');
      return;
    }

    const num = parseInt(value);

    if (num >= 1 && num <= 1000) {
      handleChange('batch', num);
    }
  }}

  onKeyDown={(e:any)=>{
    if(e.key === "Enter"){
      e.preventDefault()
       setTimeout(()=>{
      saveTrainee()
      },100)
    }
  }}
/>
</IonItem>

        <IonButton ref={buttonRef} expand="block" onClick={saveTrainee} disabled={isSaving} className="ion-margin-top">  {isSaving ? "Saving..." : "Save Trainee"}
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