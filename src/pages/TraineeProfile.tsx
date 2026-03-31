import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonInput, IonSelect, IonSelectOption,
  IonButton, IonToast, IonButtons, IonIcon,
  IonGrid, IonRow, IonCol
} from '@ionic/react';

import { arrowBack } from 'ionicons/icons';
import { useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const TraineeProfile: React.FC = () => {

  const history = useHistory();

  // ✅ COMPLETE TRAININGS
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

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const classificationOptions = [
    "4Ps Beneficiary","Displaced Workers","Family Members of AFP and PNP Wounded in-Action",
    "Industry Workers","Out-of-School Youth","Rebel Returnees/Decommissioned Combatants",
    "TESDA Alumni","Victim of Natural Disasters and Calamities",
    "Agrarian Reform Beneficiary","Drug Dependents Surrenderees/Surrenderers",
    "Farmers and Fishermen","Inmates and Detainees",
    "OFW Dependent","TVET Trainers","Wounded-in-Action AFP & PNP Personnel",
    "Balik Probinsya","Family Members of AFP and PNP Killed-in-Action",
    "IP & Cultural Communities","MILF Beneficiary","RCEF-RESP","Student","Uniformed Personnel"
  ];

  const disabilityOptions = [
    "Mental/Intellectual","Hearing Disability","Psychosocial Disability",
    "Visual Disability","Speech Impairment","Disability Due to Chronic Illness",
    "Orthopedic Disability","Multiple Disabilities","Learning Disability","Other"
  ];

  const scholarshipOptions = ["TWSP","PESFA","STEP","TTSP","Other"];
  const educationOptions = [
  "No Grade Completed",
  "Elementary Undergraduate",
  "Elementary Graduate",
  "High School Undergraduate",
  "High School Graduate",
  "Junior High (K-12)",
  "Senior High (K-12)",
  "Post-Secondary Non-Tertiary/ Technical Vocational Course Undergraduate",
  "Post-Secondary Non-Tertiary/ Technical Vocational Course Graduate",
  "College Undergraduate",
  "College Graduate",
  "Masteral",
  "Doctorate"
];

  // FORM DATA
  const [formData, setFormData] = useState<any>({
    lastname:'', firstname:'', middlename:'', extension:'',
    barangay:'', city:'', province:'', email:'', contact:'', 
    gender:'', civil_status:'', employment:'',
    birth_month:'', birth_day:'', birth_year:'', age:'',
    birthplace_city:'', birthplace_province:'',
    educational_attainment: '',
    classification:[],
    disability:'', disability_other:'',
    course:'',
    batch:'', // manual input now
    scholarship:'', scholarship_other:'',
    year_enrolled: ''
  });

  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ AUTO CAPSLOCK for text inputs ONLY
  const handleChange = (field: string, value: any, isTextInput = true) => {
    if (isTextInput && typeof value === "string") value = value.toUpperCase();
    setFormData({ ...formData, [field]: value });
  };

  // ✅ ENTER KEY TO NEXT FIELD
  const inputRefs: any = {
    lastname: useRef<HTMLIonInputElement>(null),
    firstname: useRef<HTMLIonInputElement>(null),
    middlename: useRef<HTMLIonInputElement>(null),
    extension: useRef<HTMLIonInputElement>(null),
    barangay: useRef<HTMLIonInputElement>(null),
    city: useRef<HTMLIonInputElement>(null),
    province: useRef<HTMLIonInputElement>(null),
    email: useRef<HTMLIonInputElement>(null),
    contact: useRef<HTMLIonInputElement>(null),
    batch: useRef<HTMLIonInputElement>(null)
  };

  const handleEnter = (e: any, nextRef: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextRef.current?.setFocus();
    }
  };



  // ✅ SAVE TRAINEE
  const saveTrainee = async () => {
    if (!formData.year_enrolled) {
  alert("Year Enrolled is required!");
  return;
}

  if (isSaving) return;
  setIsSaving(true);

  try {
    const { error } = await supabase.from('trainees').insert([
      {
        lastname: formData.lastname,
        firstname: formData.firstname,
        middlename: formData.middlename,
        extension: formData.extension,

        barangay: formData.barangay,
        city: formData.city,
        province: formData.province,
        email: formData.email,
        contact: formData.contact,
      

        gender: formData.gender,
        civil_status: formData.civil_status,
        employment: formData.employment,

        birth_month: formData.birth_month,
        birth_day: Number(formData.birth_day),
        birth_year: Number(formData.birth_year),
        age: Number(formData.age),

        birthplace_city: formData.birthplace_city,
        birthplace_province: formData.birthplace_province,

        educational_attainment: formData.educational_attainment,

        classification: formData.classification || [],

        disability: formData.disability,
        disability_other: formData.disability_other,

        course: formData.course,
        batch: Number(formData.batch),

        scholarship: formData.scholarship,
        scholarship_other: formData.scholarship_other,

        year_enrolled: Number(formData.year_enrolled),
      }
    ]);
    

    if (error) throw error;

    setShowToast(true);

    // RESET FORM
    setFormData({
      lastname:'', firstname:'', middlename:'', extension:'',
      barangay:'', city:'', province:'', email:'', contact:'', 
      gender:'', civil_status:'', employment:'',
      birth_month:'', birth_day:'', birth_year:'', age:'',
      birthplace_city:'', birthplace_province:'',
      classification:[],
      disability:'', disability_other:'',
      course:'', batch:'',
      scholarship:'', scholarship_other:'',
      educational_attainment: '',
      year_enrolled: ''
    });

  } catch (err:any) {
    alert(err.message);
  } finally {
    setIsSaving(false);
  }
};

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar style={{ '--background': '#10377a', '--color': '#fff' }}>
          <IonButtons slot="start">
            <IonButton onClick={() => history.replace('/dashboard')}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>LEARNERS PROFILE FORM</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        {/* 1 PROFILE */}
        <h3>1. LEARNER / MANPOWER PROFILE</h3>

        <IonGrid>
          <IonRow>
            <IonCol>
              <IonInput
                ref={inputRefs.lastname}
                placeholder="LAST NAME"
                value={formData.lastname}
                onIonChange={e=>handleChange('lastname',e.detail.value)}
                onKeyDown={e=>handleEnter(e,inputRefs.firstname)}
              />
            </IonCol>
            <IonCol>
              <IonInput
                ref={inputRefs.firstname}
                placeholder="FIRST NAME"
                value={formData.firstname}
                onIonChange={e=>handleChange('firstname',e.detail.value)}
                onKeyDown={e=>handleEnter(e,inputRefs.middlename)}
              />
            </IonCol>
            <IonCol>
              <IonInput
                ref={inputRefs.middlename}
                placeholder="MIDDLE NAME"
                value={formData.middlename}
                onIonChange={e=>handleChange('middlename',e.detail.value)}
                onKeyDown={e=>handleEnter(e,inputRefs.extension)}
              />
            </IonCol>
            <IonCol>
              <IonInput
                ref={inputRefs.extension}
                placeholder="EXTENSION"
                value={formData.extension}
                onIonChange={e=>handleChange('extension',e.detail.value)}
              />
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <IonInput
                ref={inputRefs.barangay}
                placeholder="BARANGAY"
                value={formData.barangay}
                onIonChange={e=>handleChange('barangay',e.detail.value)}
                onKeyDown={e=>handleEnter(e,inputRefs.city)}
              />
            </IonCol>
            <IonCol>
              <IonInput
                ref={inputRefs.city}
                placeholder="CITY"
                value={formData.city}
                onIonChange={e=>handleChange('city',e.detail.value)}
                onKeyDown={e=>handleEnter(e,inputRefs.province)}
              />
            </IonCol>
            <IonCol>
              <IonInput
                ref={inputRefs.province}
                placeholder="PROVINCE"
                value={formData.province}
                onIonChange={e=>handleChange('province',e.detail.value)}
              />
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <IonInput
                ref={inputRefs.email}
                placeholder="EMAIL / FACEBOOK"
                value={formData.email}
                onIonChange={e=>handleChange('email',e.detail.value)}
              />
            </IonCol>
            <IonCol>
              <IonInput
                ref={inputRefs.contact}
                type="number"
                placeholder="CONTACT NO."
                value={formData.contact}
                onIonChange={e=>handleChange('contact',e.detail.value)}
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* 2 PERSONAL */}
        <h3>2. PERSONAL INFORMATION</h3>

        <IonGrid>
          <IonRow>
            <IonCol>
              <IonSelect
                placeholder="SEX"
                value={formData.gender}
                onIonChange={e=>handleChange('gender', e.detail.value, false)}
              >
                <IonSelectOption value="MALE">Male</IonSelectOption>
                <IonSelectOption value="FEMALE">Female</IonSelectOption>
              </IonSelect>
            </IonCol>

            <IonCol>
              <IonSelect
                placeholder="CIVIL STATUS"
                value={formData.civil_status}
                onIonChange={e=>handleChange('civil_status', e.detail.value, false)}
              >
                <IonSelectOption value="SINGLE">Single</IonSelectOption>
                <IonSelectOption value="MARRIED">Married</IonSelectOption>
                <IonSelectOption value="SEPARATED/DIVORCED/ANNULLED">Separated/Divorced/Annulled</IonSelectOption>
                <IonSelectOption value="WIDOW/ER">Widow/er</IonSelectOption>
                <IonSelectOption value="COMMON LAW/LIVE-IN">Common Law/Live-in</IonSelectOption>
              </IonSelect>
            </IonCol>

            <IonCol>
              <IonSelect
                placeholder="EMPLOYMENT"
                value={formData.employment}
                onIonChange={e=>handleChange('employment', e.detail.value, false)}
              >
                <IonSelectOption value="WAGE-EMPLOYED">Wage-Employed</IonSelectOption>
                <IonSelectOption value="UNDEREMPLOYED">Underemployed</IonSelectOption>
                <IonSelectOption value="SELF-EMPLOYED">Self-Employed</IonSelectOption>
                <IonSelectOption value="UNEMPLOYED">Unemployed</IonSelectOption>
              </IonSelect>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <IonSelect
                placeholder="MONTH"
                value={formData.birth_month}
                onIonChange={e=>handleChange('birth_month', e.detail.value, false)}
              >
                {months.map(m => <IonSelectOption key={m} value={m}>{m}</IonSelectOption>)}
              </IonSelect>
            </IonCol>

            <IonCol>
              <IonSelect
                placeholder="DAY"
                value={formData.birth_day}
                onIonChange={e=>handleChange('birth_day', e.detail.value, false)}
              >
                {days.map(d => <IonSelectOption key={d} value={d}>{d}</IonSelectOption>)}
              </IonSelect>
            </IonCol>

            <IonCol>
              <IonInput
                type="number"
                placeholder="YEAR"
                value={formData.birth_year}
                onIonChange={e=>handleChange('birth_year', e.detail.value, false)}
              />
            </IonCol>

            <IonCol>
              <IonInput
                type="number"
                placeholder="AGE"
                value={formData.age}
                onIonChange={e=>handleChange('age', e.detail.value, false)}
              />
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <IonInput
                placeholder="BIRTHPLACE CITY"
                value={formData.birthplace_city}
                onIonChange={e=>handleChange('birthplace_city', e.detail.value)}
              />
            </IonCol>
            <IonCol>
              <IonInput
                placeholder="BIRTHPLACE PROVINCE"
                value={formData.birthplace_province}
                onIonChange={e=>handleChange('birthplace_province', e.detail.value)}
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonRow>
  <IonCol>
    <IonSelect
      placeholder="EDUCATIONAL ATTAINMENT"
      value={formData.educational_attainment}
      onIonChange={e=>handleChange('educational_attainment', e.detail.value, false)}
    >
      {educationOptions.map(e => (
        <IonSelectOption key={e} value={e}>{e}</IonSelectOption>
      ))}
    </IonSelect>
  </IonCol>
</IonRow>


        {/* 3 CLASSIFICATION */}
        <h3>3. CLASSIFICATION</h3>
        <IonSelect
          multiple
          value={formData.classification}
          onIonChange={e=>handleChange('classification', e.detail.value, false)}
        >
          {classificationOptions.map(c=><IonSelectOption key={c} value={c}>{c}</IonSelectOption>)}
        </IonSelect>

        {/* 4 DISABILITY */}
        <h3>4. TYPE OF DISABILITY</h3>
        <IonSelect
          value={formData.disability}
          onIonChange={e=>handleChange('disability', e.detail.value, false)}
        >
          {disabilityOptions.map(d=><IonSelectOption key={d} value={d}>{d}</IonSelectOption>)}
        </IonSelect>

        {formData.disability === "Other" && (
          <IonInput
            placeholder="SPECIFY"
            onIonChange={e=>handleChange('disability_other', e.detail.value)}
          />
        )}

        {/* 5 COURSE */}
        <h3>5. COURSE / QUALIFICATION</h3>
        <IonSelect
          value={formData.course}
          onIonChange={e=>handleChange('course', e.detail.value, false)}
        >
          {trainings.map(t=><IonSelectOption key={t} value={t}>{t}</IonSelectOption>)}
        </IonSelect>

        {/* BATCH MANUAL INPUT */}
        {formData.course && (
          <IonInput
            ref={inputRefs.batch}
            type="number"
            min={1}
            max={1000}
            placeholder="BATCH (1-1000)"
            value={formData.batch}
            onIonChange={e=>handleChange('batch', e.detail.value, false)}
          />
        )}

        {/* 6 SCHOLARSHIP */}
        <h3>6. TYPE OF SCHOLARSHIP (OPTIONAL)</h3>
        <IonSelect
          value={formData.scholarship}
          onIonChange={e=>handleChange('scholarship', e.detail.value, false)}
        >
          {scholarshipOptions.map(s=><IonSelectOption key={s} value={s}>{s}</IonSelectOption>)}
        </IonSelect>

        {formData.scholarship === "Other" && (
          <IonInput
            placeholder="SPECIFY"
            onIonChange={e=>handleChange('scholarship_other', e.detail.value)}
          />
        )}

        <IonInput
  type="number"
  placeholder="YEAR ENROLLED (e.g. 2025)"
  value={formData.year_enrolled}
  onIonChange={e=>handleChange('year_enrolled', e.detail.value, false)}
/>

        <IonButton expand="block" onClick={saveTrainee} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Trainee"}
        </IonButton>

        <IonToast
          isOpen={showToast}
          message="Saved successfully!"
          duration={1500}
          onDidDismiss={()=>setShowToast(false)}
        />

      </IonContent>
    </IonPage>
  );
};

export default TraineeProfile;