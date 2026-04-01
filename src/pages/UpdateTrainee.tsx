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
  "Drug Dependents Surrenderees/Surrenderers", "Farmers and Fishermen", 
  "Indigenous People & Cultural Communities", "Industry workers", "Inmates and Detainees",
  "Out-of-School-Youth", "Overseas Filipino Workers (OFW) dependent",
  "RCEF-RESP", "Returning/Repatriated OFW", "Student", "TESDA Alumni", "Others"
];

interface Params { id: string; }

const UpdateTrainee: React.FC = () => {
  const { id } = useParams<Params>();
  const history = useHistory();

  // States
  const [firstname, setFirstname] = useState('');
  const [middlename, setMiddlename] = useState('');
  const [lastname, setLastname] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [gender, setGender] = useState('');
  const [civilStatus, setCivilStatus] = useState('');
  const [employment, setEmployment] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [birthProvince, setBirthProvince] = useState('');
  const [education, setEducation] = useState('');
  const [classification, setClassification] = useState<string[]>([]);
  const [otherClassification, setOtherClassification] = useState('');
  const [disability, setDisability] = useState('');
  const [otherDisability, setOtherDisability] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [batch, setBatch] = useState('');
  const [scholarship, setScholarship] = useState('');
  const [otherScholarship, setOtherScholarship] = useState('');
  const [status, setStatus] = useState(''); // BAG-O: Status State
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainee();
  }, [id]);

  const fetchTrainee = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('trainees')
      .select('*, course(name)')
      .eq('id', id)
      .single();

    if (data) {
      setFirstname(data.firstname || '');
      setMiddlename(data.middlename || '');
      setLastname(data.lastname || '');
      setBarangay(data.barangay || '');
      setCity(data.city || '');
      setProvince(data.province || '');
      setContactNo(data.contact_no || '');
      setGender(data.gender || '');
      setCivilStatus(data.civil_status || '');
      setEmployment(data.employment || '');
      setBirthdate(data.birthdate || '');
      setBirthCity(data.birth_city || '');
      setBirthProvince(data.birth_province || '');
      setEducation(data.educational_attainment || '');
      setClassification(data.classification || []);
      setOtherClassification(data.other_classification || '');
      setDisability(data.disability || 'None');
      setOtherDisability(data.other_disability || '');
      setSelectedCourse(data.course?.name || '');
      setBatch(data.batch || '');
      setScholarship(data.scholarship_package || 'None');
      setOtherScholarship(data.other_scholarship || '');
      setStatus(data.status || 'Enrolled'); // Load status
    }
    setLoading(false);
  };

  const updateTrainee = async () => {
    const { data: trainingData } = await supabase
      .from('course')
      .select('id')
      .eq('name', selectedCourse)
      .single();

    if (!trainingData) {
      alert("Invalid Training Course Selected");
      return;
    }

    const { error } = await supabase
      .from('trainees')
      .update({
        firstname, middlename, lastname, barangay, city, province,
        contact_no: contactNo, gender, civil_status: civilStatus,
        employment, birthdate, birth_city: birthCity, birth_province: birthProvince,
        educational_attainment: education, classification, other_classification: otherClassification,
        disability, other_disability: otherDisability, 
        training_type_id: trainingData.id,
        batch,
        scholarship_package: scholarship, other_scholarship: otherScholarship,
        status // I-save ang status
      })
      .eq('id', id);

    if (error) alert(error.message);
    else history.goBack();
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
              <IonCol size="12" sizeMd="4">
                <IonItem><IonLabel position="stacked">Birth City</IonLabel><IonInput placeholder="City" value={birthCity} onIonInput={e => setBirthCity(e.detail.value!.toUpperCase())} /></IonItem>
              </IonCol>
              <IonCol size="12" sizeMd="4">
                <IonItem><IonLabel position="stacked">Birth Province</IonLabel><IonInput placeholder="Province" value={birthProvince} onIonInput={e => setBirthProvince(e.detail.value!.toUpperCase())} /></IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Contact, Batch, Gender, Civil Status */}
          <IonGrid className="ion-no-padding">
            <IonRow>
              <IonCol size="12" sizeMd="4"><IonItem><IonLabel position="stacked">Contact No.</IonLabel><IonInput type="tel" value={contactNo} onIonInput={e => setContactNo(e.detail.value!)} /></IonItem></IonCol>
              <IonCol size="12" sizeMd="4"><IonItem><IonLabel position="stacked">Batch No.</IonLabel><IonInput type="number" value={batch} onIonInput={e => setBatch(e.detail.value!)} /></IonItem></IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="12" sizeMd="4">
                <IonItem><IonLabel position="stacked">Gender</IonLabel>
                  <IonSelect interface="popover" value={gender} onIonChange={e => setGender(e.detail.value)}>
                    <IonSelectOption value="Male">Male</IonSelectOption>
                    <IonSelectOption value="Female">Female</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size="12" sizeMd="4">
                <IonItem><IonLabel position="stacked">Civil Status</IonLabel>
                  <IonSelect interface="popover" value={civilStatus} onIonChange={e => setCivilStatus(e.detail.value)}>
                    {["Single", "Married", "Widow/er", "Common Law"].map(s => <IonSelectOption key={s} value={s}>{s}</IonSelectOption>)}
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
              {["Elementary", "High School", "College Undergraduate", "College Graduate", "TVET Graduate"].map(s => <IonSelectOption key={s} value={s}>{s}</IonSelectOption>)}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Type of Training</IonLabel>
            <IonSelect interface="popover" value={selectedCourse} onIonChange={e => setSelectedCourse(e.detail.value)}>
              {courses.map(c => <IonSelectOption key={c} value={c}>{c}</IonSelectOption>)}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Scholarship Package</IonLabel>
            <IonSelect interface="popover" value={scholarship} onIonChange={e => setScholarship(e.detail.value)}>
              {["None", "TWSP", "STEP", "TTSP", "Others"].map(s => <IonSelectOption key={s} value={s}>{s}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          {scholarship === 'Others' && (
             <IonItem><IonInput placeholder="Specify scholarship" value={otherScholarship} onIonInput={e => setOtherScholarship(e.detail.value!)} /></IonItem>
          )}

          {/* Status Section - HIGHLIGHTED */}
          <IonLabel position="stacked" style={{color: '#10377a'}}>TRAINING STATUS</IonLabel>
            
            <IonSelect interface="popover" value={status} onIonChange={e => setStatus(e.detail.value)}>
              <IonSelectOption value="Enrolled">Enrolled</IonSelectOption>
              <IonSelectOption value="Completed">Completed</IonSelectOption>
              <IonSelectOption value="Dropped Out">Dropped Out</IonSelectOption>
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