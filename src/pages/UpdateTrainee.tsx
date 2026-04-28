import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel,
  IonSelect, IonSelectOption, IonButton, IonButtons, IonBackButton, IonInput, 
  IonList, IonLoading, IonGrid, IonRow, IonCol
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const courses = [
  "Barista", "Barangay Health Services NC II", "Bayong Making",
  "Beauty Care (Nail Care, Hair and Make-up)", "Bookkeeping NC III",
  "Bread and Pastry Production", "Community Nutrition Services",
  "Cookery", "Dressmaking NC II", "Driving NC II",
  "Electrical Installation and Maintenance NC II",
  "Emergency Medical Services NC II", "Food Processing",
  "Garbage Collection NC II", "Housekeeping NC II",
  "Masonry and Hallow Blocks", "Massage Therapy",
  "Organic Agriculture NC II", "Pineapple Processing",
  "Plumbing", "Scaffolding", "Security Services NC II",
  "Shielded Metal Arc Welding(SMAW) NC I",
  "Shielded Metal Arc Welding(SMAW) NC II"
];

const classifications = [
  "4Ps Beneficiary", "Agrarian Reform Beneficiary", "Balik Probinsya", "Displaced Workers",
  "Drug Dependents Surrenderees/Surrenderers","Family Members of AFP and PNP Killed-in-Action","Family Members of AFP and PNP Wounded-in-Action", "Farmers and Fishermen", 
  "Indigenous People & Cultural Communities", "Industry workers", "Inmates and Detainees", "MILF Beneficiary",
  "Out-of-School-Youth", "Overseas Filipino Workers (OFW) dependent",
  "RCEF-RESP", "Rebel Returnees/Decommissioned Combatants","Returning/Repatriated OFW", "Student", "TESDA Alumni", "TVET Trainers",
  "Uniformed Personnel", "Victim of Natural Disasters and Calamities","Wounded-in-Action AFP & PNP Peronnel","Others"
];

interface Params { id: string; }

const UpdateTrainee: React.FC = () => {
  const { id } = useParams<Params>();
  const history = useHistory();

  // States
  const [firstname, setFirstname] = useState('');
  const [middlename, setMiddlename] = useState('');
  const [lastname, setLastname] = useState('');
  const [extension, setExtension] = useState('');
  const [age, setAge] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [contact, setContactNo] = useState('');
  const [email, setEmail] = useState('');
  const [Gender, setGender] = useState('');
  const [civilStatus, setCivilStatus] = useState('');
  const [employment, setEmployment] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [birthplace_city, setBirthCity] = useState('');
  const [birthplace_province, setBirthProvince] = useState('');
  const [education, setEducation] = useState('');
  const [classification, setClassification] = useState<string[]>([]);
  const [otherClassification, setOtherClassification] = useState('');
  const [disability, setDisability] = useState('');
  const [otherDisability, setOtherDisability] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [batch, setBatch] = useState('');
  const [scholarship, setScholarship] = useState('');
  const [otherScholarship, setOtherScholarship] = useState('');
  const [yearEnrolled, setYearEnrolled] = useState('');
  const [Trainingstatus, setStatus] = useState(''); // BAG-O: Status State
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainee();
  }, [id]);

  const fetchTrainee = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('trainees')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      setFirstname(data.firstname || '');
      setMiddlename(data.middlename || '');
      setLastname(data.lastname || '');
      setExtension(data.extension || '');
      setAge(data.age || '');
      setBarangay(data.barangay || '');
      setCity(data.city || '');
      setProvince(data.province || '');
      setContactNo(data.contact || '');
      setEmail(data.email || '');
      setGender(data.gender || '');
      setCivilStatus(data.civil_status || '');
      setEmployment(data.employment || '');
      const monthMap: { [key: string]: string } = {
  January: '01',
  February: '02',
  March: '03',
  April: '04',
  May: '05',
  June: '06',
  July: '07',
  August: '08',
  September: '09',
  October: '10',
  November: '11',
  December: '12'
};

const rawMonth = data.birth_month;
const day = data.birth_day;
const year = data.birth_year;

const month =
  isNaN(rawMonth)
    ? monthMap[rawMonth] || '01'
    : String(rawMonth).padStart(2, '0');

if (month && day && year) {
  setBirthdate(`${year}-${month}-${String(day).padStart(2, '0')}`);
} else {
  setBirthdate('');
}
      setBirthCity(data.birthplace_city || '');
      setBirthProvince(data.birthplace_province || '');
      setEducation(data.educational_attainment || '');
      setClassification(data.classification || []);
      setOtherClassification(data.other_classification || '');
      setDisability(data.disability || 'None');
      setOtherDisability(data.disability_other || '');
      setSelectedCourse(data.course || '');
      setBatch(data.batch || '');
      setScholarship(data.scholarship || 'None');
      setOtherScholarship(data.scholarship_other || '');
      setYearEnrolled(data.year_enrolled || '');
      setStatus(data.status || 'ENROLLED'); // Load status
    }
    setLoading(false);
  };

  const updateTrainee = async () => {
    let year = null;  
let month = null;
let day = null;

const reverseMonthMap: { [key: string]: string } = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December'
};

if (birthdate) {
  [year, month, day] = birthdate.split('-');
  month = reverseMonthMap[month] || month;
}

    const { error } = await supabase
    .from('trainees')
    .update({
      firstname,
      middlename,
      lastname,
      age,  
      extension,
      barangay,
      city,
      province,
      contact: contact,
      email,
      gender: Gender,
      civil_status: civilStatus,
      employment,
      birth_month: month || null,
birth_day: day || null,
birth_year: year || null,
      birthplace_city: birthplace_city,
      birthplace_province: birthplace_province,
      educational_attainment: education,
      classification,
      other_classification: otherClassification,
      disability,
      disability_other: otherDisability,
      course: selectedCourse,
      batch,
      scholarship,
      scholarship_other: otherScholarship,
      year_enrolled: yearEnrolled,
      status: Trainingstatus
    })
    .eq('id', id);

  if (error) {
    alert(error.message);
  } else {
    history.goBack();
  }
};


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': '#10377a', '--color': '#ffffff' }}>
          <IonButtons slot="start"><IonBackButton defaultHref="/training"/></IonButtons>
          <IonTitle>Update Trainee Profile</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonLoading isOpen={loading} message={"Fetching trainee data..."} />
        
        <IonList>
          {/* Name Section */}
          <IonGrid className="ion-no-padding">
            <IonRow>
              <IonCol size="12" sizeMd="4"><IonItem><IonLabel position="stacked">First Name</IonLabel><IonInput value={firstname} onIonInput={e => setFirstname(e.detail.value!.toUpperCase())} /></IonItem></IonCol>
              <IonCol size="12" sizeMd="4"><IonItem><IonLabel position="stacked">Middle Name</IonLabel><IonInput value={middlename} onIonInput={e => setMiddlename(e.detail.value!.toUpperCase())} /></IonItem></IonCol>
              <IonCol size="12" sizeMd="4"><IonItem><IonLabel position="stacked">Last Name</IonLabel><IonInput value={lastname} onIonInput={e => setLastname(e.detail.value!.toUpperCase())} /></IonItem></IonCol>
              <IonCol size="12" sizeMd="3"><IonItem><IonLabel position="stacked">Extension</IonLabel><IonInput value={extension} onIonInput={e => setExtension(e.detail.value!.toUpperCase())}/></IonItem></IonCol>
            </IonRow>
          </IonGrid>


          {/* Current Address Section - HORIZONTAL LAYOUT */}
          <h5 style={{ paddingLeft: '16px', marginTop: '20px', color: '#10377a', fontWeight: 'bold' }}>Current Address</h5>
          <IonGrid className="ion-no-padding">
            <IonRow>
              <IonCol size="12" sizeMd="4">
                <IonItem><IonLabel position="stacked">Barangay</IonLabel><IonInput placeholder="Barangay" value={barangay} onIonInput={e => setBarangay(e.detail.value!.toUpperCase())} /></IonItem>
              </IonCol>
              <IonCol size="12" sizeMd="4">
                <IonItem><IonLabel position="stacked">City/Municipality</IonLabel><IonInput placeholder="City" value={city} onIonInput={e => setCity(e.detail.value!.toUpperCase())} /></IonItem>
              </IonCol>
              <IonCol size="12" sizeMd="4">
                <IonItem><IonLabel position="stacked">Province</IonLabel><IonInput placeholder="Province" value={province} onIonInput={e => setProvince(e.detail.value!.toUpperCase())} /></IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Birth Details - HORIZONTAL LAYOUT */}
          <h5 style={{ paddingLeft: '16px', marginTop: '20px', color: '#10377a', fontWeight: 'bold' }}>Birth Details</h5>
          <IonGrid className="ion-no-padding">
            <IonRow>
              <IonCol size="12" sizeMd="4">
                <IonItem><IonLabel position="stacked">Birthdate</IonLabel><IonInput type="date" value={birthdate} onIonChange={e => setBirthdate(e.detail.value!)} /></IonItem>
              </IonCol>
              <IonCol size="12" sizeMd="3">
                <IonItem><IonLabel position="stacked">Age</IonLabel><IonInput type="number" value={age} onIonInput={e => setAge(e.detail.value!)}/></IonItem>
              </IonCol>
              <IonCol size="12" sizeMd="4">
                <IonItem><IonLabel position="stacked">Birth City</IonLabel><IonInput placeholder="City" value={birthplace_city} onIonInput={e => setBirthCity(e.detail.value!.toUpperCase())} /></IonItem>
              </IonCol>
              <IonCol size="12" sizeMd="4">
                <IonItem><IonLabel position="stacked">Birth Province</IonLabel><IonInput placeholder="Province" value={birthplace_province} onIonInput={e => setBirthProvince(e.detail.value!.toUpperCase())} /></IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Contact, Batch, Gender, Civil Status */}
          <IonGrid className="ion-no-padding">
            <IonRow>
              <IonCol size="12" sizeMd="4"><IonItem><IonLabel position="stacked">Contact No.</IonLabel><IonInput type="tel" value={contact} onIonInput={e => setContactNo(e.detail.value!)} /></IonItem></IonCol>
              <IonCol size="12" sizeMd="4"><IonItem><IonLabel position="stacked">Batch No.</IonLabel><IonInput type="number" value={batch} onIonInput={e => setBatch(e.detail.value!)} /></IonItem></IonCol>
            </IonRow>
            <IonRow>
  <IonCol size="12" sizeMd="6">
    <IonItem>
      <IonLabel position="stacked">Email</IonLabel>
      <IonInput
        type="email"
        value={email}
        onIonInput={e => setEmail(e.detail.value!)}
      />
    </IonItem>
  </IonCol>

  <IonCol size="12" sizeMd="6">
    <IonItem>
      <IonLabel position="stacked">Employment</IonLabel>
      <IonSelect
        interface="popover"
        value={employment}
        onIonChange={e => setEmployment(e.detail.value)}
      >
        <IonSelectOption value="EMPLOYED">Wage-Employed</IonSelectOption>
        <IonSelectOption value="UNEMPLOYED">Underemployed</IonSelectOption>
        <IonSelectOption value="SELF-EMPLOYED">Self-Employed</IonSelectOption>
        <IonSelectOption value="SELF-EMPLOYED">Unemployed</IonSelectOption>
      </IonSelect>
    </IonItem>
  </IonCol>
</IonRow>
            <IonRow>
              <IonCol size="12" sizeMd="4">
                <IonItem><IonLabel position="stacked">Gender</IonLabel>
                  <IonSelect interface="popover" value={Gender} onIonChange={e => setGender(e.detail.value)}>
                    <IonSelectOption value="MALE">MALE</IonSelectOption>
                    <IonSelectOption value="FEMALE">FEMALE</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size="12" sizeMd="4">
                <IonItem><IonLabel position="stacked">Civil Status</IonLabel>
                  <IonSelect interface="popover" value={civilStatus} onIonChange={e => setCivilStatus(e.detail.value)}>
                    {["SINGLE", "MARRIED","SEPARATED/DIVORSED/ANNULLED", "WIDOW/ER", "COMMON LAW/LIVE IN"].map(s => <IonSelectOption key={s} value={s}>{s}</IonSelectOption>)}
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Classification - PLASTAR NGA TAN-AWON */}
          <IonItem className="ion-margin-top">
            <IonLabel position="stacked">Classification (Select all that apply)</IonLabel>
            <IonSelect 
              interface="alert" 
              multiple={true} 
              value={classification} 
              onIonChange={e => setClassification(e.detail.value)}
              placeholder="Tap to select"
            >
              {classifications.map(c => <IonSelectOption key={c} value={c}>{c}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          {/* Display selected chips for better visualization */}
          <div style={{ padding: '0 16px', fontSize: '0.8rem', color: '#666' }}>
            {classification.length > 0 && `Selected: ${classification.join(', ')}`}
          </div>
          {classification.includes('Others') && (
            <IonItem><IonInput placeholder="Specify classification" value={otherClassification} onIonInput={e => setOtherClassification(e.detail.value!)} /></IonItem>
          )}

          {/* Education & Training */}
          <IonItem>
            <IonLabel position="stacked">Educational Attainment</IonLabel>
            <IonSelect interface="popover" value={education} onIonChange={e => setEducation(e.detail.value)}>
              {["No Grade Completed","Elementary Undergraduate","Elementary Graduate", "High School Undergraduate", "High School Graduate",
                "Junior High(K-12)","Senior High(K-12)", "Post-Secondary Non-Tertiary/ Technical Vocational Course Undergraduate",
                "Post-Secondary Non-Tertiary/ Technical Vocational Course Graduate","College Undergraduate", "College Graduate", "Masteral", "Doctorate"].map(s => <IonSelectOption key={s} value={s}>{s}</IonSelectOption>)}
            </IonSelect>
          </IonItem>

          <IonItem>
  <IonLabel position="stacked">Type of Disability</IonLabel>
  <IonSelect
    interface="popover"
    value={disability}
    onIonChange={e => setDisability(e.detail.value)}
  >
    <IonSelectOption value="None">None</IonSelectOption>
    <IonSelectOption value="Visual">Mental/Intellectual</IonSelectOption>
    <IonSelectOption value="Hearing">Hearing Disability</IonSelectOption>
    <IonSelectOption value="Physical">Psychological Disability</IonSelectOption>
    <IonSelectOption value="Mental">Visual Disabilty</IonSelectOption>
    <IonSelectOption value="Mental">Speech Impairment</IonSelectOption>
    <IonSelectOption value="Mental">Disabilty Due to Chronic Illness</IonSelectOption>
    <IonSelectOption value="Mental">Orthopic Disability</IonSelectOption>
    <IonSelectOption value="Mental">Multiple Disabilty</IonSelectOption>
    <IonSelectOption value="Mental">Learning Disabilty</IonSelectOption>
    <IonSelectOption value="Others">Others</IonSelectOption>
  </IonSelect>
</IonItem>

          <IonItem>
            <IonLabel position="stacked">Type of Training</IonLabel>
            <IonSelect interface="popover" value={selectedCourse} onIonChange={e => setSelectedCourse(e.detail.value)}>
              {courses.map(c => <IonSelectOption key={c} value={c}>{c}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonCol size="12" sizeMd="4">
  <IonItem>
    <IonLabel position="stacked">Year Enrolled</IonLabel>
    <IonInput
      type="number"
      value={yearEnrolled}
      onIonInput={e => setYearEnrolled(e.detail.value!)}
    />
  </IonItem>
</IonCol>

          <IonItem>
            <IonLabel position="stacked">Type of Scholarship</IonLabel>
            <IonSelect interface="popover" value={scholarship} onIonChange={e => setScholarship(e.detail.value)}>
              {["None", "TWSP", "PESFA", "STEP", "TTSP", "Others"].map(s => <IonSelectOption key={s} value={s}>{s}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          {scholarship === 'Others' && (
             <IonItem><IonInput placeholder="Specify scholarship" value={otherScholarship} onIonInput={e => setOtherScholarship(e.detail.value!)} /></IonItem>
          )}

          {/* Status Section - HIGHLIGHTED */}
          <IonLabel position="stacked" style={{color: '#10377a'}}>TRAINING STATUS</IonLabel>
            
            <IonSelect interface="popover" value={Trainingstatus} onIonChange={e => setStatus(e.detail.value)}>
              <IonSelectOption value="ENROLLED">ENROLLED</IonSelectOption>
              <IonSelectOption value="COMPLETED">COMPLETED</IonSelectOption>
              <IonSelectOption value="DROPPED OUT">DROPPED OUT</IonSelectOption>
            </IonSelect>
          


        </IonList>

        <div style={{ marginTop: '30px', paddingBottom: '20px' }}>
          <IonButton expand="block" onClick={updateTrainee} style={{ '--background': '#10377a' }}>
            Update Trainee Record
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default UpdateTrainee;