declare module 'xlsx-js-style';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonText, IonButton, IonIcon,
  IonInput, IonSelect, IonSelectOption,
  IonPopover, IonList, IonItem, IonLabel, IonButtons
} from '@ionic/react';

import { useParams, useHistory, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';

import { jsPDF } from 'jspdf';
import * as XLSX from "xlsx-js-style";
import {  Document, Packer, Paragraph, Table, TableRow, TableCell, ImageRun, AlignmentType, HeadingLevel, ShadingType } from "docx";
import { saveAs } from "file-saver";
import headerImg from "../pics/header.png";
import { TextRun } from "docx";

import {
  printOutline,
  downloadOutline,
  funnelOutline,
  arrowBackOutline,
} from 'ionicons/icons';
import autoTable from 'jspdf-autotable';

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
  batch: string;
}

interface TrainingType {
  id: string;
  name: string;
}

interface BatchDetails {
  id: string;
  training_type_id: string;
  batch: string;
  start_date: string;
  end_date: string;
  duration_hours: number;
  trainor: string;
  venue: string;
}

const courseSlugMap: { [slug: string]: string } = {
  "barista": "Barista",
  "barangay-health": "Barangay Health Services NC II",
  "bayong-making": "Bayong Making",
  "beauty-care": "Beauty Care (Nail Care, Hair and Make-up)",
  "bread-pastry": "Bread and Pastry Production",
  "bookkeeping-nc3": "Bookkeeping NC III",
  "community-nutrition": "Community Nutrition Services",
  "cookery": "Cookery",
  "driving-nc2": "Driving NC II",
  "dressmaking-nc2": "Dressmaking NC II",
  "electrical-nc2": "Electrical Installation and Maintenance NC II",
  "emergency-medical": "Emergency Medical Services NC II",
  "food-processing": "Food Processing",
  "garbage-collection": "Garbage Collection NC II",
  "housekeeping-nc2": "Housekeeping NC II",
  "masonry-hallow": "Masonry and Hallow Blocks",
  "massage-therapy": "Massage Therapy",
  "organic-nc2": "Organic Agriculture NC II",
  "plumbing": "Plumbing",
  "pineapple-processing": "Pineapple Processing",
  "scaffolding": "Scaffolding",
  "security-nc2": "Security Services NC II",
  "smaw-nc1": "Shielded Metal Arc Welding(SMAW) NC I",
  "smaw-nc2": "Shielded Metal Arc Welding(SMAW) NC II"
};

const barangays = [
  "Agusan Canyon","Alae","Dahilayan" ,"Dalirig" ,"Damilag" ,"Dicklum","Guilang-Guilang","Kalugmanan",
  "Lindaban" ,"Lingion","Lunocan","Maluko", "Mambatangan" ,"Mampayag", "Minsuro" , "Mantibugao", 
  "San Miguel" , "Sankanan" ,"Santiago" , "Santo Niño" , "Tankulan (Pob.)","Ticala"
  
];

const TraineeList: React.FC = () => {

  const { slug, batch } = useParams<{ slug: string, batch?: string }>();
  const history = useHistory();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlSearch = queryParams.get('query') || '';

  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [batchDetails, setBatchDetails] = useState<BatchDetails | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [durationHours, setDurationHours] = useState<number | "">("");
  const [trainor, setTrainor] = useState("");
  const [venue, setVenue] = useState("");

  const [searchText, setSearchText] = useState(urlSearch);
  useEffect(() => {
    setSearchText(urlSearch);
  }, [urlSearch]);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [selectedTrainingType, setSelectedTrainingType] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('');
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);

  const [sortOption, setSortOption] = useState('date_desc');
  const [showFilter, setShowFilter] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

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
   FETCH UNIQUE BATCHES FROM TRAINEES
========================== */
useEffect(() => {
  const fetchAvailableBatches = async () => {
    // If no training type is selected, hide batches and reset filter
    if (!selectedTrainingType) {
      setAvailableBatches([]);
      setSelectedBatchFilter('');
      return;
    }

    // Fetch unique batches that are actually registered in profiling
    const { data } = await supabase
      .from('trainees')
      .select('batch')
      .eq('training_type_id', selectedTrainingType)
      .not('batch', 'is', null);

    if (data) {
      const uniqueBatches = Array.from(new Set(data.map(item => item.batch))).sort();
      setAvailableBatches(uniqueBatches);
    }
  };

  fetchAvailableBatches();
}, [selectedTrainingType]);

// I-paste kini pagkahuman sa availableBatches useEffect
useEffect(() => {
  const fetchSelectedBatchDetails = async () => {
    // Kung wala'y napili nga training type OR batch filter, i-clear ang details
    if (!selectedTrainingType || !selectedBatchFilter) {
      setBatchDetails(null);
      return;
    }

    const { data } = await supabase
      .from('training_batches')
      .select('*')
      .eq('training_type_id', selectedTrainingType)
      .eq('batch', selectedBatchFilter)
      .maybeSingle();

    if (data) {
      setBatchDetails(data);
    } else {
      setBatchDetails(null);
    }
  };
  fetchSelectedBatchDetails();
}, [selectedTrainingType, selectedBatchFilter]);

  /* =========================
     FETCH TRAINEES
  ========================== */
  useEffect(() => {

    const fetchTrainees = async () => {

      let query = supabase.from('trainees').select('*');

      if (slug && slug !== 'all') {

        const trainingName = courseSlugMap[slug];

        const { data: typeData } = await supabase
          .from('training_types')
          .select('id')
          .eq('name', trainingName)
          .single();

        if (!typeData) {
          setTrainees([]);
          return;
        }
          query = query.eq('training_type_id', typeData.id);

            if(batch){
              query = query.eq("batch", batch)
            }
        

      }

        if (debouncedSearch || urlSearch) {
          const searchValue = debouncedSearch || urlSearch;

          query = query.or(
            `firstname.ilike.%${searchValue}%,lastname.ilike.%${searchValue}%`
          );
        }

      if (selectedBarangay) {
        query = query.eq('barangay', selectedBarangay);
      }

      if (selectedTrainingType) {
        query = query.eq('training_type_id', selectedTrainingType);
      }

      if (selectedBatchFilter) {
        query = query.eq('batch', selectedBatchFilter);
      }

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
    urlSearch,
    selectedBarangay,
    selectedTrainingType,
    selectedBatchFilter,
    sortOption
  ]);

  useEffect(() => {

  const fetchBatchDetails = async () => {

    if (!slug || !batch) return;

    const trainingName = courseSlugMap[slug];

    const { data: typeData } = await supabase
      .from('training_types')
      .select('id')
      .eq('name', trainingName)
      .single();

    if (!typeData) return;

    const { data } = await supabase
      .from('training_batches')
      .select('*')
      .eq('training_type_id', typeData.id)
      .eq('batch', batch)
      .single();

    if (data) {
      setBatchDetails(data);
      setStartDate(data.start_date || "");
    setEndDate(data.end_date || "");
    setDurationHours(data.duration_hours || "");
    setTrainor(data.trainor || "");
    setVenue(data.venue || "");
    }

  };

  fetchBatchDetails();

}, [slug, batch]);

  const resetFilters = () => {
    setSelectedBarangay('');
    setSelectedTrainingType('');
    setSelectedBatchFilter('');
    setSearchText('');
    setSortOption('date_desc');
  };

  /* PRINT */
const handlePrint = () => {
  if (!tableRef.current) return;

  const printWindow = window.open('', '', 'width=900,height=700');
  if (!printWindow) return;

  // 1. Isuwat ang content (apil ang image)
  printWindow.document.write(`
    <html>
      <head>
        <title>TSDC Trainee List</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { text-align:center; margin-top:10px; }
          .generated { text-align:center; font-size:12px; margin-bottom:15px; }
          table { width:100%; border-collapse:collapse; }
          th, td { border:1px solid #333; padding:6px; font-size:12px; text-align:center; }
          th { background:#10377a; color:white; }
        </style>
      </head>
      <body>
        <img id="print-header" src="${headerImg}" style="width:100%; max-height:120px; object-fit:contain;" />
        <h2>TSDC Trainee List</h2>

<div class="generated" style="margin-bottom:15px;">
Generated: ${new Date().toLocaleDateString()}
</div>

${batchDetails ? `
<div style="margin-bottom:15px;font-size:12px">

<div style="margin-bottom:15px;font-size:12px">

<div style="display:flex;">
<div style="width:33%"><b>Batch:</b> ${batchDetails.batch}</div>
<div style="width:33%"><b>Start Date:</b> ${batchDetails.start_date}</div>
<div style="width:33%"><b>End Date:</b> ${batchDetails.end_date}</div>
</div>

<div style="display:flex;margin-top:5px;">
<div style="width:33%"><b>Duration:</b> ${batchDetails.duration_hours} hrs</div>
<div style="width:33%"><b>Trainor:</b> ${batchDetails.trainor}</div>
<div style="width:33%"><b>Venue:</b> ${batchDetails.venue}</div>
</div>

</div>

</div>
` : ""}
        <table>
          ${generateTableRows()}
        </table>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // 2. KINI ANG IMPORTANTE:
  // Maghulat ta nga ma-load ang image sa dili pa i-print
  const header = printWindow.document.getElementById('print-header') as HTMLImageElement;
  
  if (header) {
    header.onload = () => {
      printWindow.print();
      // printWindow.close(); // Optional: i-close ang window after print/cancel
    };

    // Para sa mga browser nga paspas kaayo o naka-cache na ang image
    if (header.complete) {
      header.onload(new Event('load'));
    }
  } else {
    // Backup kung pananglitan naay error sa image
    printWindow.print();
  }
};

  /* PDF DOWNLOAD */
const handleDownloadPDF = () => {
  const pdf = new jsPDF('p', 'mm', 'a4');

  const img = new Image();
  img.src = headerImg;

pdf.addImage(img, "PNG", 10, 5, 190, 30);

  pdf.setFontSize(16);
pdf.text('TSDC Trainee List', 105, 40, { align: 'center' });

pdf.setFontSize(10);
pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 46, { align: 'center' });
let startY = 60;

if(batchDetails){

autoTable(pdf, {
  startY: startY,

  body: [
    [
      `Batch: ${batchDetails.batch}`,
      `Start Date: ${batchDetails.start_date}`,
      `End Date: ${batchDetails.end_date}`
    ],
    [
      `Duration: ${batchDetails.duration_hours} hrs`,
      `Trainor: ${batchDetails.trainor}`,
      `Venue: ${batchDetails.venue}`
    ]
  ],

  theme: "plain",

  styles:{
    fontSize:10,
    halign:"left"
  },

  columnStyles:{
    0:{cellWidth:63},
    1:{cellWidth:63},
    2:{cellWidth:63}
  }

});

startY = (pdf as any).lastAutoTable.finalY + 5;
}

  const tableColumn = [
    "No.",
    "Barangay",
    "Name",
    "Gender",
    "Education",
    "IP",
    "Date",
    "Training Type"
  ];

 const tableRows = trainees.map((t, index) => {
  const typeName = trainingTypes.find(tt => tt.id === t.training_type_id)?.name || '';
  const trainingDisplay = !selectedBatchFilter ? `${typeName} (Batch ${t.batch})` : typeName;

  return [
    index + 1,
    t.barangay,
    `${t.lastname}, ${t.firstname} ${t.middlename || ''}`,
    t.gender,
    t.educational_attainment,
    t.is_ip ? 'IP' : 'Not IP',
    new Date(t.created_at).toLocaleDateString(),
    trainingDisplay
  ];
});

  autoTable(pdf, {
  head: [tableColumn],
  body: tableRows,
  startY: startY,
  showHead: "everyPage",

  

  styles: {
    fontSize:8,
    halign:'center',
    valign:'middle'
  },

  headStyles:{
    fillColor:[16,55,122],
    textColor:255,
    fontStyle:'bold',
    halign:'center'
  },

  alternateRowStyles:{
    fillColor:[245,245,245]
  }
});

  pdf.save('tsdc_trainee_list.pdf');
};

const generateTableRows = () => {
  const header = `
      <thead>
      <tr>
        <th>No.</th>
        <th>Barangay</th>
        <th>Name</th>
        <th>Gender</th>
        <th>Education</th>
        <th>IP</th>
        <th>Date</th>
        <th>Training Type</th>
      </tr>
      </thead>
      <tbody>
  `;

  const rows = trainees.map((t, index) => {
    const typeName = trainingTypes.find(tt => tt.id === t.training_type_id)?.name || '';
    // KINI ANG LOGIC: Kung wala gi-filter ang batch, ipakita ang Batch No. tapad sa Training Type
    const trainingDisplay = !selectedBatchFilter ? `${typeName} (Batch ${t.batch})` : typeName;

    return `
    <tr>
      <td>${index + 1}</td>
      <td>${t.barangay}</td>
      <td>${t.lastname}, ${t.firstname} ${t.middlename || ''}</td>
      <td>${t.gender}</td>
      <td>${t.educational_attainment}</td>
      <td>${t.is_ip ? 'IP' : 'Not IP'}</td>
      <td>${new Date(t.created_at).toLocaleDateString()}</td>
      <td>${trainingDisplay}</td>
    </tr>
  `}).join('');

  return header + rows + "</tbody>";
};

   const downloadExcel = () => {

const data = trainees.map((t, index) => {
  const typeName = trainingTypes.find(tt => tt.id === t.training_type_id)?.name || "";
  return {
    "No.": index + 1,
    Barangay: t.barangay,
    Name: `${t.lastname}, ${t.firstname} ${t.middlename || ""}`,
    Gender: t.gender,
    Education: t.educational_attainment,
    IP: t.is_ip ? "IP" : "Not IP",
    Date: new Date(t.created_at).toLocaleDateString(),
    "Training Type": !selectedBatchFilter ? `${typeName} (Batch ${t.batch})` : typeName
  };
});

 const worksheet = XLSX.utils.json_to_sheet([]);

// Add title + batch details
XLSX.utils.sheet_add_aoa(
  worksheet,
  [
    ["TSDC Trainee List"],
    [`Generated: ${new Date().toLocaleDateString()}`],
    [],
    
    ...(batchDetails ? [
  [
    `Batch: ${batchDetails.batch}`,
    "",
    `Start Date: ${batchDetails.start_date}`,
    "",
    "",
    `End Date: ${batchDetails.end_date}`
  ],
  [
    `Duration: ${batchDetails.duration_hours} hrs`,
    "",
    `Trainor: ${batchDetails.trainor}`,
    "",
    "",
    `Venue: ${batchDetails.venue}`
  ],
  []
] : [])
  ],
  { origin: "A1" }
);

worksheet["!merges"] = [

  // TITLE
  { s:{r:0,c:0}, e:{r:0,c:7} },

  // GENERATED
  { s:{r:1,c:0}, e:{r:1,c:7} },

  // BATCH / START / END
  { s:{r:3,c:0}, e:{r:3,c:1} },
  { s:{r:3,c:2}, e:{r:3,c:4} },
  { s:{r:3,c:5}, e:{r:3,c:7} },

  // DURATION / TRAINOR / VENUE
  { s:{r:4,c:0}, e:{r:4,c:1} },
  { s:{r:4,c:2}, e:{r:4,c:4} },
  { s:{r:4,c:5}, e:{r:4,c:7} }

];

worksheet["A1"].s = {
  font:{ bold:true, sz:16 },
  alignment:{ horizontal:"center", vertical:"center" }
};

worksheet["A2"].s = {
  alignment:{ horizontal:"center", vertical:"center" }
};

// Header row
const headerRow = ["No.", "Barangay", "Name", "Gender", "Education", "IP", "Date", "Training Type"];

XLSX.utils.sheet_add_aoa(
  worksheet,
  [headerRow],
  { origin: "A6" }
);

// Add data rows
XLSX.utils.sheet_add_json(
  worksheet,
  data,
  { origin: "A7", skipHeader: true }
);

// Style header cells
const headerStyle = {
  fill: { fgColor: { rgb: "10377A" } },
  font: { bold: true, color: { rgb: "FFFFFF" } },
  alignment: { horizontal: "center", vertical: "center" }
};

for (let C = 0; C < headerRow.length; C++) {
  const cellAddress = XLSX.utils.encode_cell({ r: 5, c: C }); // row 10
  if (!worksheet[cellAddress]) continue;
  worksheet[cellAddress].s = headerStyle;
}

// Auto column width
worksheet["!cols"] = [
  { wch: 5 },
  { wch: 18 },
  { wch: 30 },
  { wch: 10 },
  { wch: 20 },
  { wch: 10 },
  { wch: 12 },
  { wch: 30 }
];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Trainees");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });

  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  saveAs(blob, "tsdc_trainee_list.xlsx");

  setShowDownload(false);
};

const saveBatchDetails = async () => {

  if (!slug || !batch) return;

  const trainingName = courseSlugMap[slug];

  const { data: typeData } = await supabase
    .from("training_types")
    .select("id")
    .eq("name", trainingName)
    .single();

  if (!typeData) return;

  const payload = {
    training_type_id: typeData.id,
    batch: batch,
    start_date: startDate,
    end_date: endDate,
    duration_hours: durationHours,
    trainor: trainor,
    venue: venue
  };

  const { error } = await supabase
    .from("training_batches")
    .upsert(payload, {
      onConflict: "training_type_id,batch"
    });

  if (!error) {
    alert("Batch details saved!");
  }
};

  const downloadWord = async () => {
    const generatedDate = new Date().toLocaleDateString();

  const rows = [

    new TableRow({
  tableHeader: true,
  children: [

    new TableCell({
      shading:{ fill:"10377A", type:ShadingType.CLEAR },
      children:[new Paragraph("No.")]
    }),

    new TableCell({
      shading:{ fill:"10377A", type:ShadingType.CLEAR },
      children:[new Paragraph("Barangay")]
    }),

    new TableCell({
      shading:{ fill:"10377A", type:ShadingType.CLEAR },
      children:[new Paragraph("Name")]
    }),

    new TableCell({
      shading:{ fill:"10377A", type:ShadingType.CLEAR },
      children:[new Paragraph("Gender")]
    }),

    new TableCell({
      shading:{ fill:"10377A", type:ShadingType.CLEAR },
      children:[new Paragraph("Education")]
    }),

    new TableCell({
      shading:{ fill:"10377A", type:ShadingType.CLEAR },
      children:[new Paragraph("IP")]
    }),

    new TableCell({
      shading:{ fill:"10377A", type:ShadingType.CLEAR },
      children:[new Paragraph("Date")]
    }),

    new TableCell({
      shading:{ fill:"10377A", type:ShadingType.CLEAR },
      children:[new Paragraph("Training Type")]
    })

  ]
  
}),

...trainees.map((t, index) => {
  const typeName = trainingTypes.find(tt => tt.id === t.training_type_id)?.name || "";
  // I-append ang Batch No. kung wala'y filter
  const trainingDisplay = !selectedBatchFilter ? `${typeName} (Batch ${t.batch})` : typeName;

  return new TableRow({
    children: [
      new TableCell({children:[new Paragraph(String(index + 1))]}),
      new TableCell({children:[new Paragraph(t.barangay)]}),
      new TableCell({children:[new Paragraph(`${t.lastname}, ${t.firstname} ${t.middlename || ""}`)]}),
      new TableCell({children:[new Paragraph(t.gender)]}),
      new TableCell({children:[new Paragraph(t.educational_attainment)]}),
      new TableCell({children:[new Paragraph(t.is_ip ? "IP" : "Not IP")]}),
      new TableCell({children:[new Paragraph(new Date(t.created_at).toLocaleDateString())]}),
      new TableCell({children:[new Paragraph(trainingDisplay)]}) 
    ]
  });
})
  ];

  

  const doc = new Document({
    sections: [{
      children: [

  new Paragraph({
    children: [
      new ImageRun({
        data: await fetch(headerImg).then(r => r.arrayBuffer()),
        transformation: {
          width: 500,
          height: 100
        },
        type: "png"
      })
    ]
  }),

  new Paragraph({
  text: "TSDC Trainee List",
  heading: HeadingLevel.HEADING_1,
  alignment: AlignmentType.CENTER
}),

new Paragraph({
  text: `Generated: ${generatedDate}`,
  alignment: AlignmentType.CENTER
}),

...(batchDetails ? [

new Paragraph(" "), // space after generated date

new Table({
  width: { size: 100, type: "pct" },

  borders: {
    top: { style: "none", size: 0, color: "FFFFFF" },
    bottom: { style: "none", size: 0, color: "FFFFFF" },
    left: { style: "none", size: 0, color: "FFFFFF" },
    right: { style: "none", size: 0, color: "FFFFFF" },
    insideHorizontal: { style: "none", size: 0, color: "FFFFFF" },
    insideVertical: { style: "none", size: 0, color: "FFFFFF" }
  },

  rows: [

    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph(`Batch: ${batchDetails.batch}`)]
        }),
        new TableCell({
          children: [new Paragraph(`Start Date: ${batchDetails.start_date}`)]
        }),
        new TableCell({
          children: [new Paragraph(`End Date: ${batchDetails.end_date}`)]
        })
      ]
    }),

    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph(`Duration: ${batchDetails.duration_hours} hrs`)]
        }),
        new TableCell({
          children: [new Paragraph(`Trainor: ${batchDetails.trainor}`)]
        }),
        new TableCell({
          children: [new Paragraph(`Venue: ${batchDetails.venue}`)]
        })
      ]
    })

  ]
}),

new Paragraph(" "),

] : []),

new Paragraph(" "),

  new Table({
  rows,
  width: {
    size: 100,
    type: "pct"
  }
})

]
    }]
  });

  const blob = await Packer.toBlob(doc);

  saveAs(blob, "tsdc_trainee_list.docx");

  setShowDownload(false);
};

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
              <IonButton
  fill="clear"
  onClick={() => {
    resetFilters();
    if (slug && batch) {
      // If we are looking at a specific batch, go back to that Batch List
      history.push(`/batch/${slug}`);
    } else {
      // Otherwise (All Trainees), go back to the main Training dashboard
      history.push('/training');
    }
  }}
>
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

        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'15px'}}>
          <div style={{display:'flex',gap:'8px'}}>
            <IonButton fill="clear" onClick={handlePrint}>
              <IonIcon icon={printOutline}/>
            </IonButton>
            <IonButton fill="clear" onClick={() => setShowDownload(true)}>
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

            {/* SORT - NO CANCEL/OK */}
            <IonSelect
              interface="popover"
              value={sortOption}
              onIonChange={e => setSortOption(e.detail.value)}
            >
              <IonSelectOption value="az">A-Z</IonSelectOption>
              <IonSelectOption value="za">Z-A</IonSelectOption>
              <IonSelectOption value="date_desc">Newest</IonSelectOption>
              <IonSelectOption value="date_asc">Oldest</IonSelectOption>
            </IonSelect>

          </div>
        </div>

        {/* FILTER POPOVER */}
        <IonPopover
          isOpen={showFilter}
          onDidDismiss={() => setShowFilter(false)}
        >
          <IonList style={{ padding: 15, minWidth: 250 }}>

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
              <IonLabel position="stacked">Training Type</IonLabel>
              <IonSelect
                interface="popover"
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

            {selectedTrainingType && availableBatches.length > 0 && (
              <IonItem>
                <IonLabel position="stacked">Batch</IonLabel>
                <IonSelect
                  interface="popover"
                  value={selectedBatchFilter}
                  onIonChange={e => setSelectedBatchFilter(e.detail.value)}
                  placeholder="All Batches"
                >
                  <IonSelectOption value="">All Batches</IonSelectOption>
                  {availableBatches.map(b => (
                    <IonSelectOption key={b} value={b}>Batch {b}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            )}

            {/* RESET + OK BUTTON */}
            <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
              <IonButton expand="block" color="medium" onClick={resetFilters}>
                Reset
              </IonButton>
              <IonButton expand="block" onClick={() => setShowFilter(false)}>
                OK
              </IonButton>
            </div>

          </IonList>
        </IonPopover>

        <IonText>
  <h2>Total Displayed: {trainees.length}</h2>
</IonText>

{/* BATCH DETAILS TABLE */}

{slug !== "all" && batch && (

<IonGrid style={{
border:"1px solid #ccc",
marginBottom:"15px",
padding:"10px",
borderRadius:"6px"
}}>

<IonRow style={{fontWeight:"bold", background:"#10377a", color:"white"}}>
<IonCol>Batch</IonCol>
<IonCol>Start Date</IonCol>
<IonCol>End Date</IonCol>
<IonCol>Duration (hrs)</IonCol>
<IonCol>Trainor</IonCol>
<IonCol>Venue</IonCol>
<IonCol>Action</IonCol>
</IonRow>

<IonRow>

<IonCol>{batch}</IonCol>

<IonCol>
<IonInput
type="date"
value={startDate}
onIonChange={e => setStartDate(e.detail.value!)}
/>
</IonCol>

<IonCol>
<IonInput
type="date"
value={endDate}
onIonChange={e => setEndDate(e.detail.value!)}
/>
</IonCol>

<IonCol>
<IonInput
type="number"
value={durationHours}
onIonChange={e => setDurationHours(Number(e.detail.value))}
placeholder="Hours"
/>
</IonCol>

<IonCol>
<IonInput
value={trainor}
onIonChange={e => setTrainor(e.detail.value!)}
placeholder="Trainor"
/>
</IonCol>

<IonCol>
<IonInput
value={venue}
onIonChange={e => setVenue(e.detail.value!)}
placeholder="Venue"
/>
</IonCol>

<IonCol>
<IonButton size="small" onClick={saveBatchDetails}>
Save
</IonButton>
</IonCol>

</IonRow>

</IonGrid>
)}



        <div ref={tableRef}>
          <IonGrid>
            <IonRow style={{
              fontWeight:'bold',
              borderBottom:'2px solid #333',
              background:'#10377a',
              color:'white',
              textAlign:'center'
            }}>
              <IonCol size="1">No.</IonCol>
              <IonCol>Barangay</IonCol>
              <IonCol>Name</IonCol>
              <IonCol>Gender</IonCol>
              <IonCol>Education</IonCol>
              <IonCol>IP</IonCol>
              <IonCol>Date</IonCol>
              <IonCol>Training Type</IonCol>
            </IonRow>

            {trainees.map((t, index) => (
              <IonRow key={t.id}>
                <IonCol size="1">{index + 1}</IonCol>
                <IonCol>{t.barangay}</IonCol>
                <IonCol>
                  {t.lastname}, {t.firstname} {t.middlename || ''}
                </IonCol>
                <IonCol>{t.gender}</IonCol>
                <IonCol>{t.educational_attainment}</IonCol>
                <IonCol>{t.is_ip ? 'IP' : 'Not IP'}</IonCol>
                <IonCol>
                  {new Date(t.created_at).toLocaleDateString()}
                </IonCol>
                <IonCol>
                  {trainingTypes.find(tt => tt.id === t.training_type_id)?.name || ''}
                  {!selectedBatchFilter && t.batch ? ` (Batch ${t.batch})` : ''}
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>
        </div>

      </IonContent>
      <IonPopover
  isOpen={showDownload}
  onDidDismiss={() => setShowDownload(false)}
>
  <IonList style={{minWidth:'200px'}}>

    <IonItem button onClick={downloadExcel}>
      <IonLabel>Download as Excel</IonLabel>
    </IonItem>

    <IonItem button onClick={handleDownloadPDF}>
      <IonLabel>Download as PDF</IonLabel>
    </IonItem>

    <IonItem button onClick={downloadWord}>
      <IonLabel>Download as Word</IonLabel>
    </IonItem>

  </IonList>
</IonPopover>
    </IonPage>
  );
};

export default TraineeList;

