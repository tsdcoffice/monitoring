import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonText, IonButton, IonIcon,
  IonInput, IonSelect, IonSelectOption,
  IonPopover, IonList, IonItem, IonLabel, IonButtons
} from '@ionic/react';

import { useParams, useHistory } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import {
  printOutline,
  downloadOutline,
  funnelOutline,
  arrowBackOutline,
} from 'ionicons/icons';

interface Trainee {
  id: string;
  firstname: string;
  lastname: string;
  middlename: string | null;
  barangay: string;
  gender: string;
  educational_attainment: string;
  is_ip: boolean;
  created_at: string;
  training_type_id: string;
}

interface TrainingType {
  id: string;
  name: string;
}

const barangays = [
  "Agusan Canyon","Alae","Dahilayan","Guilang-Guilang","Kalugmanan",
  "Lingion","Lunocan","Maluko","Mampayag","Mantibugao",
  "North Poblacion","Santiago","Sankanan","San Miguel","South Poblacion",
  "Tankulan","Ticalaan","Dicklum","Dalirig","Damilag",
  "Pagalungan","Lingi-on"
];

const TraineeList: React.FC = () => {

  const { slug } = useParams<{ slug: string }>();
  const history = useHistory();

  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [selectedTrainingType, setSelectedTrainingType] = useState('');

  const [sortOption, setSortOption] = useState('date_desc');
  const [showFilter, setShowFilter] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);

  /* =========================
     SEARCH DEBOUNCE
  ========================== */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchText]);

  /* =========================
     FETCH TRAINING TYPES
  ========================== */
  useEffect(() => {
    const fetchTypes = async () => {
      const { data } = await supabase
        .from('training_types')
        .select('*')
        .order('name');
      setTrainingTypes(data || []);
    };
    fetchTypes();
  }, []);

  /* =========================
     FETCH TRAINEES
  ========================== */
  useEffect(() => {

    const fetchTrainees = async () => {

      let query = supabase.from('trainees').select('*');

      // slug filter (from route)
      if (slug && slug !== 'all') {
        const formatted = slug.replace(/-/g, ' ');
        const { data: typeData } = await supabase
          .from('training_types')
          .select('id')
          .ilike('name', formatted)
          .single();

        if (typeData) {
          query = query.eq('training_type_id', typeData.id);
        }
      }

      // search
      if (debouncedSearch) {
        query = query.or(
          `firstname.ilike.%${debouncedSearch}%,lastname.ilike.%${debouncedSearch}%`
        );
      }

      // barangay filter
      if (selectedBarangay) {
        query = query.eq('barangay', selectedBarangay);
      }

      // training type filter
      if (selectedTrainingType) {
        query = query.eq('training_type_id', selectedTrainingType);
      }

      // sort
      switch (sortOption) {
        case 'az':
          query = query.order('lastname', { ascending: true });
          break;
        case 'za':
          query = query.order('lastname', { ascending: false });
          break;
        case 'date_asc':
          query = query.order('created_at', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data } = await query;
      setTrainees(data || []);
    };

    fetchTrainees();

  }, [
    slug,
    debouncedSearch,
    selectedBarangay,
    selectedTrainingType,
    sortOption
  ]);

  const resetFilters = () => {
    setSelectedBarangay('');
    setSelectedTrainingType('');
    setSearchText('');
    setSortOption('date_desc');
    setShowFilter(false);
  };

  /* =========================
     PRINT
  ========================== */
  const handlePrint = () => {
    if (!tableRef.current) return;
    const printContents = tableRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  /* =========================
     PDF DOWNLOAD
  ========================== */
  const handleDownloadPDF = async () => {
    if (!tableRef.current) return;

    const canvas = await html2canvas(tableRef.current, {
      scale: 2,
      backgroundColor: '#fff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const pdfWidth = pageWidth - margin * 2;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.text('TSDC Trainee List', pageWidth / 2, 15, { align: 'center' });
    pdf.addImage(imgData, 'PNG', margin, 25, pdfWidth, pdfHeight);
    pdf.save('tsdc_trainee_list.pdf');
  };

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.push('/training')}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>
            {slug === 'all' || !slug
              ? 'All Trainees'
              : `${slug.replace(/-/g,' ').toUpperCase()} Trainees`}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        {/* TOP BAR */}
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'15px'}}>
          <div style={{display:'flex',gap:'8px'}}>
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
              style={{
                width:'180px',
                border:'1px solid #ccc',
                borderRadius:'20px',
                paddingLeft:'10px'
              }}
            />

            <IonButton onClick={() => setShowFilter(true)}>
              <IonIcon icon={funnelOutline}/> Filter
            </IonButton>

            <IonSelect value={sortOption}
              onIonChange={e => setSortOption(e.detail.value)}>
              <IonSelectOption value="az">A-Z</IonSelectOption>
              <IonSelectOption value="za">Z-A</IonSelectOption>
              <IonSelectOption value="date_desc">Newest</IonSelectOption>
              <IonSelectOption value="date_asc">Oldest</IonSelectOption>
            </IonSelect>

          </div>
        </div>

        {/* FILTER POPOVER */}
        <IonPopover isOpen={showFilter}
          onDidDismiss={() => setShowFilter(false)}>
          <IonList style={{ padding: 15, minWidth: 250 }}>

            <IonItem>
              <IonLabel position="stacked">Barangay</IonLabel>
              <IonSelect
                value={selectedBarangay}
                onIonChange={e => setSelectedBarangay(e.detail.value)}
              >
                {barangays.map(b => (
                  <IonSelectOption key={b} value={b}>{b}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Training Type</IonLabel>
              <IonSelect
                value={selectedTrainingType}
                onIonChange={e => setSelectedTrainingType(e.detail.value)}
              >
                {trainingTypes.map(t => (
                  <IonSelectOption key={t.id} value={t.id}>
                    {t.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonButton expand="block" color="medium"
              onClick={resetFilters}>
              Reset
            </IonButton>

          </IonList>
        </IonPopover>

        <IonText>
          <h2>Total Displayed: {trainees.length}</h2>
        </IonText>

        <div ref={tableRef}>
          <IonGrid>
            <IonRow style={{
              fontWeight:'bold',
              borderBottom:'2px solid #333',
              background:'#f2f2f2'
            }}>
              <IonCol>Name</IonCol>
              <IonCol>Barangay</IonCol>
              <IonCol>Gender</IonCol>
              <IonCol>Education</IonCol>
              <IonCol>IP</IonCol>
              <IonCol>Date</IonCol>
            </IonRow>

            {trainees.map(t => (
              <IonRow key={t.id}>
                <IonCol>
                  {t.lastname}, {t.firstname} {t.middlename || ''}
                </IonCol>
                <IonCol>{t.barangay}</IonCol>
                <IonCol>{t.gender}</IonCol>
                <IonCol>{t.educational_attainment}</IonCol>
                <IonCol>{t.is_ip ? 'IP' : 'Not IP'}</IonCol>
                <IonCol>
                  {new Date(t.created_at).toLocaleDateString()}
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default TraineeList;