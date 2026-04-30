import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonButton,
  IonIcon,
  IonButtons,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  useIonViewWillEnter
} from '@ionic/react';

import {
  arrowBackOutline,
  printOutline,
  downloadOutline,
  funnelOutline
} from 'ionicons/icons';

import { useLocation, useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from "xlsx-js-style";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, AlignmentType, HeadingLevel, PageOrientation, TextRun } from "docx";
import { saveAs } from "file-saver";
import headerImg from "../pics/header.png";
import { ImageRun } from "docx";
import { ShadingType } from "docx";
import { WidthType } from "docx";


interface Student {
  id: string;
  lastname: string;
  firstname: string;
  middlename: string | null;
  suffix: string;
  gender: string;
  barangay: string;
  school: string;
  course: string | null;
  year_level: string | null;
  is_ip: boolean;
  ip_group: string | null;
  created_at: string;
  scholarship_types: { name: string } | null;
  status: string | null;
  remarks: string | null;
}

const barangays = [
  "Agusan Canyon","Alae","Dahilayan","Dalirig","Damilag","Dicklum",
  "Guilang-guilang","Kalugmanan","Lindaban","Lingion","Lunocan",
  "Maluko","Mambatangan","Mampayag","Mantibugao","Minsuro",
  "San Miguel","Sankanan","Santiago","Santo Niño",
  "Tankulan (Pob.)","Ticala"
];

const StudentList: React.FC = () => {

  const location = useLocation();
  const history = useHistory();
  const queryParams = new URLSearchParams(location.search);
  const typeQuery = queryParams.get('type');
  const searchQuery = queryParams.get('query');

  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  const [searchText, setSearchText] = useState(searchQuery || '');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [selectedIP, setSelectedIP] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [bulkYear, setBulkYear] = useState('');
  const [showSelect, setShowSelect] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  

  useEffect(() => {
    fetchStudents();
  }, [typeQuery, searchQuery]);

  useIonViewWillEnter(() => {
  fetchStudents();
});

  useEffect(() => {
    applyFilters();
  }, [
    students,
    searchText,
    selectedBarangay,
    selectedGender,
    selectedIP,
    selectedSchool,
    selectedCourse,
    selectedYear,
    selectedStatus,
    sortOption
  ]);

  const fetchStudents = async () => {

    let query = supabase
      .from('students')
      .select(`*, scholarship_types(name)`);

    if (typeQuery) {
      const { data: typeData } = await supabase
        .from('scholarship_types')
        .select('id')
        .eq('name', typeQuery)
        .single();

      if (typeData) {
        query = query.eq('scholarship_type_id', typeData.id);
      }
    }
     if (searchQuery) {
    query = query.or(
      `lastname.ilike.%${searchQuery}%,firstname.ilike.%${searchQuery}%`
    );
  }

    const { data } = await query;

if (data) {

  const updated = data.map((s: Student) => {

    if (s.status === 'Graduated' && s.year_level !== 'Graduated') {

      // auto update database
      supabase
        .from('students')
        .update({ year_level: 'Graduated' })
        .eq('id', s.id);

      return { ...s, year_level: 'Graduated' };
    }

    return s;
  });

  setStudents(updated);

} else {
  setStudents([]);
}
  };

  const applyFilters = () => {

    let data = [...students];

    if (searchText) {
      data = data.filter(s =>
        `${s.lastname} ${s.firstname}`
          .toLowerCase()
          .includes(searchText.toLowerCase())
      );
    }

    if (selectedBarangay) {
      data = data.filter(s => s.barangay === selectedBarangay);
    }

    if (selectedGender) {
      data = data.filter(s => s.gender === selectedGender);
    }

    if (selectedIP) {
      data = data.filter(s =>
        selectedIP === 'IP' ? s.is_ip === true : s.is_ip === false
      );
    }

    if (selectedSchool) {
      data = data.filter(s => s.school === selectedSchool);
    }

    if (selectedCourse) {
      data = data.filter(s => s.course === selectedCourse);
    }

    if (selectedStatus) {
      data = data.filter(s => (s.status || 'On-going') === selectedStatus);
    }

    if (selectedYear) {
  data = data.filter(s => s.year_level === selectedYear);
}

    switch (sortOption) {
  case 'date_desc': // Kini ang "Newest"
    data.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    break;
  case 'date_asc': // Kini ang "Oldest"
    data.sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    break;
  case 'az':
    data.sort((a, b) => a.lastname.localeCompare(b.lastname));
    break;
  case 'za':
    data.sort((a, b) => b.lastname.localeCompare(a.lastname));
    break;
}

    setFilteredStudents(data);
  };

  const handleBack = () => {
    history.replace('/scholarship');
  };

  const resetFilters = () => {
  setSearchText('');
  setSelectedBarangay('');
  setSelectedGender('');
  setSelectedIP('');
  setSelectedSchool('');
  setSelectedCourse('');
  setSelectedYear('');
  setSelectedStatus('');
  setSortOption('date_desc');
  setSelectedStudents([]); // clear selected rows
  setShowSelect(false); // hide select column
  setShowFilter(false);
};

/* PRINT */
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=1000,height=700');
    if (!printWindow) return;

    printWindow.document.write(generateHTMLTable(filteredStudents));
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  const generateHTMLTable = (data: Student[]) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  const reportTitle = typeQuery ? `${typeQuery.toUpperCase()} SCHOLARS` : "ALL SCHOLARS LIST";

  return `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 10px; }
        .header-info { text-align: center; margin-bottom: 15px; }
        .timestamp { text-align: center; font-size: 12px; margin-bottom: 15px; color: #1a1a1a; }

        @media print {
          @page {
            /* Kini mopugos sa printer settings nga walay extra margin */
              margin: 5mm; 
              
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
        
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        
        th, td { 
          border: 1px solid #000; 
          padding: 4px; 
          font-size: 9px; 
          word-wrap: break-word; 
          text-align: center; 
        }
        
        th { 
          background: #10377a !important; 
          color: white !important; 
          font-weight: bold; 
          text-transform: uppercase;
          -webkit-print-color-adjust: exact;
        }

        .text-left { text-align: left; padding-left: 5px; }

        /* Color classes para sa printing */
        .status-graduated { color: green !important; -webkit-print-color-adjust: exact; font-size: 8px; }
        .status-stopped { color: red !important; -webkit-print-color-adjust: exact; font-size: 8px; }
        .status-ongoing { color: gray !important; -webkit-print-color-adjust: exact; font-size: 8px; }

        .col-no { width: 3%; }
        .col-brgy { width: 8%; }
        .col-lastname {width: 7%}
        .col-name { width: 6%; }
        .col-school { width: 11%; }
        .col-gender { width: 7%; }
        .col-course { width: 12%; }
        .col-ip { width: 6%;}
        .col-type { width: 5%;}
        .col-remarks { width: 5%;}
        .col-year { width: 4%;}
        
        

      </style>
    </head>
    <body>
      <div class="header-info">
        <img src="${headerImg}" style="width: 100%; max-width: 700px;" />
        <h2 style="color: #07152e; margin: 10px 0;">${reportTitle}</h2>
      </div>

      <div class="timestamp">
        Generated: ${dateStr}
      </div>

      <table>
        <thead>
          <tr>
            <th class="col-no">No.</th>
            <th class="col-brgy">Barangay</th>
            <th class="col-lastname">Last Name</th>
            <th class="col-name">First Name</th>
            <th class="col-name">Middle</th>
            <th class="col-no">Suffix</th>
            <th>Gender</th>
            <th class="col-school">School</th>
            <th class="col-course">Course</th>
            <th class="col-year">Year</th>
            <th class="col-ip">IP</th>
            <th class="col-type">Type</th>
            <th>Status</th>
            <th class="col-remarks">Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((s, i) => {
            // I-determine ang color class base sa status
            const statusClass = (s.status || 'On-going') === 'Graduated' ? 'status-graduated' : 
                               (s.status || 'On-going') === 'Stopped' ? 'status-stopped' : 'status-ongoing';
            
            return `
              <tr>
                <td>${i + 1}</td>
                <td>${s.barangay}</td>
                <td>${s.lastname}</td>
                <td>${s.firstname}</td>
                <td>${s.middlename || '-'}</td>
                <td>${s.suffix || '-'}</td>
                <td>${s.gender}</td>
                <td>${s.school}</td>
                <td>${s.course || '-'}</td>
                <td>${s.year_level || '-'}</td>
                <td>
                  ${s.is_ip 
                  ? `IP <br/> <small style="font-size: 7px; font-style: italic;">
                  (${s.ip_group ? s.ip_group.charAt(0).toUpperCase() + s.ip_group.slice(1).toLowerCase() : '-'})` 
                  : 'Not IP'}
                  </td>
                <td>${s.scholarship_types?.name || '-'}</td>
                <td class="${statusClass}">
                  ${s.status || 'On-going'}
                </td>
                <td class="text-left">${s.remarks || '-'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      <div style="margin-top: 15px; font-weight: bold; font-size: 11px;">
        Total Records: ${data.length}
      </div>
    </body>
  </html>
  `;
};

  /* PDF */
const handleDownloadPDF = () => {
  setShowDownload(false);
  const pdf = new jsPDF('l', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();

  const img = new Image();
  img.src = headerImg;

  // 1. Header Image
  const imgWidth = 190;
  const imgHeight = 30;
  const x = (pageWidth - imgWidth) / 2;
    pdf.addImage(img, "PNG", x, 5, imgWidth, imgHeight);

  // 2. Report Title
  pdf.setFontSize(16);
  const reportTitle = typeQuery ? `${typeQuery.toUpperCase()} SCHOLARS` : "ALL SCHOLARS LIST";
  pdf.text(reportTitle, pageWidth / 2, 40, { align: 'center' });

  // 3. Date Generated
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 46, { align: 'center' });
  let startY = 55;

  // 4. Columns (Gidugang ang Remarks sa tumoy)
  const tableColumn = [
    "No.", "Barangay", "Last Name","First Name", "Middle Name", "Suffix", "Gender", "School", "Course", "Year", "IP", "Type", "Status", "Remarks"
  ];

  // 5. Rows (Gidugang ang s.remarks)
  const tableRows = filteredStudents.map((s, index) => [
    index + 1,
    s.barangay,
    s.lastname,
    s.firstname,
    s.middlename || '-',
    s.suffix,
    s.gender,
    s.school,
    s.course || '-',
    s.year_level || '-',
    s.is_ip 
    ? `IP\n(${s.ip_group ? s.ip_group.charAt(0).toUpperCase() + s.ip_group.slice(1).toLowerCase() : '-'})` 
    : 'Not IP',
    s.scholarship_types?.name || '-',
    s.status || 'On-going',
    s.remarks || '-' // Diri ang remarks value
  ]);

  autoTable(pdf, {
    head: [tableColumn],
    body: tableRows,
    startY: startY,
    showHead: "everyPage",
    styles: {
      fontSize: 6.5, // Gipagamyan pa gyud aron maigo ang 11 columns
      halign: 'center',
      valign: 'middle',
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [16, 55, 122],
      textColor: 255,
      fontStyle: 'bold'
    },
    // I-manage ang gilapdon sa matag column
    columnStyles: {
      0: { cellWidth: 7 },  // No.
      3: { cellWidth: 22 },  // First Name
      7: { cellWidth: 35 },  // school
      8: { cellWidth: 35 },  // course
      11: { halign: 'center', cellWidth: 18 }, // IP
      13: { cellWidth: 15 }, // Remarks
      
    },
    didParseCell: function (data) {
      if (data.section === 'body') {
        const status = data.row.cells[12].raw; // Index 9 gihapon ang Status

        

        // Text color styling para sa Status column
        if (data.column.index === 12) {
          if (status === 'Graduated') data.cell.styles.textColor = [0, 128, 0];
          if (status === 'Stopped') data.cell.styles.textColor = [200, 0, 0];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  // Optional: Add Total Records sa pinakaubos
  const finalY = (pdf as any).lastAutoTable.finalY || startY;
  pdf.setFontSize(10);
  pdf.text(`Total Records: ${filteredStudents.length}`, 14, finalY + 10);

  pdf.save('Scholarship_Student_List.pdf');
};


    const getStatusColor = (status: string | null) => {
      if (status === 'Graduated') return 'success';
      if (status === 'Stopped') return 'danger';
      return 'medium'; // On-going
    };

    const getRowColor = (status: string | null) => {

  if (status === 'Graduated') return '#d4edda'; // green

  if (status === 'Stopped') return '#f8d7da'; // red

  return ''; // ongoing
};

    const handleUpdate = (studentId: string) => {
  history.push(`/update-student/${studentId}`);
};

const handleDelete = async (id: string) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this student?");
  if (!confirmDelete) return;

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Delete error:", error.message);
    alert("Failed to delete!");
    return;
  }
    alert("Deleted Succesfully!");

    await fetchStudents();
};

const toggleSelectStudent = (id: string) => {
  setSelectedStudents(prev =>
    prev.includes(id)
      ? prev.filter(s => s !== id)
      : [...prev, id]
  );
};

const updateYearLevel = async (studentId: string, year: string) => {
  await supabase
    .from('students')
    .update({ year_level: year })
    .eq('id', studentId);

  fetchStudents();
};

const updateTribe = async (studentId: string, tribe: string) => {
  await supabase
    .from('students')
    .update({ ip_group: tribe })
    .eq('id', studentId);
  
  // Optional: Refresh local state para makita ang update
  fetchStudents();
};

const handleBulkUpdate = async () => {

  if (!bulkYear || selectedStudents.length === 0) return;

  await supabase
    .from('students')
    .update({ year_level: bulkYear })
    .in('id', selectedStudents);

  setSelectedStudents([]);
  setBulkYear('');

  fetchStudents();
};


// EXCEL
const downloadExcel = () => {
  // 1. Data Mapping (11 Columns)
  const data = filteredStudents.map((s, i) => ({
    "No.": i + 1,
    Barangay: s.barangay,
    "Last Name": s.lastname,
    "First Name": s.firstname,
    "Middle Name": s.middlename || "-",
    "Suffix": s.suffix || "-",
    Gender: s.gender,
    School: s.school,
    Course: s.course || "-",
    Year: s.year_level || "-",
    IP: s.is_ip ? `IP (${s.ip_group || "-"})` : "Not IP",
    Type: s.scholarship_types?.name || "-",
    Status: s.status || "On-going",
    Remarks: s.remarks || "-"
  }));

  const worksheet = XLSX.utils.json_to_sheet([]);

  // 2. Add Title & Generated Date
  const reportTitle = typeQuery ? `${typeQuery.toUpperCase()} SCHOLARS` : "ALL SCHOLARS LIST";
  
  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      [reportTitle], // Row 1
      [`Generated: ${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}`], // Row 2
      [] // Row 3 (Space)
    ],
    { origin: "A1" }
  );

  // 3. KINI ANG IMPORTANTE: Merging para ma-center ang Title (Column A to K)
  // Index c:0 (Column A) hangtod c:10 (Column K)
  worksheet["!merges"] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } }, // Title (A → N)
  { s: { r: 1, c: 0 }, e: { r: 1, c: 13 } }  // Date (A → N)
];

  // 4. Center Styling para sa Title ug Date
  // Note: Kinahanglan ang xlsx-js-style library para mugana ang .s
  if (worksheet["A1"]) {
    worksheet["A1"].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: "center", vertical: "center" }
    };
  }
  if (worksheet["A2"]) {
    worksheet["A2"].s = {
      font: { sz: 10 },
      alignment: { horizontal: "center", vertical: "center" }
    };
  }

  // 5. Header Row (Row 4)
  const headerRow = ["No.", "Barangay", "Last Name","First Name", "Middle Name", "Suffix", "Gender", "School", "Course", "Year", "IP", "Type", "Status", "Remarks"];
  XLSX.utils.sheet_add_aoa(worksheet, [headerRow], { origin: "A4" });

  // 6. Data Rows (Row 5 onwards)
  XLSX.utils.sheet_add_json(worksheet, data, { origin: "A5", skipHeader: true });
      // ✅ STATUS TEXT COLOR (INSERT THIS PART)
      const startRow = 4; // Row 5 in Excel (0-based)

      data.forEach((row, i) => {
        const excelRow = startRow + i;
        const statusCell = XLSX.utils.encode_cell({ r: excelRow, c: 12 });

         if (worksheet[statusCell]) {
          let fontColor = "000000";

        if (row.Status === "Graduated") {
          fontColor = "00B050"; // Green
        } else if (row.Status === "Stopped") {
          fontColor = "C00000"; // Red
        } else if (row.Status === "On-going") {
          fontColor = "7F7F7F"; // Grayish
        }

    worksheet[statusCell].s = {
      alignment: { horizontal: "left", vertical: "center" },
      font: {
        bold: true,
        color: { rgb: fontColor }
      }
    };
  }
});

  // 7. Styling Table Header (Blue Style)
  const headerStyle = {
    fill: { fgColor: { rgb: "10377A" } },
    font: { bold: true, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: "left", vertical: "center" }
  };

  for (let C = 0; C < headerRow.length; C++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 3, c: C });
    if (worksheet[cellAddress]) worksheet[cellAddress].s = headerStyle;
  }

  // 8. Column Widths
  worksheet["!cols"] = [
  { wch: 6 },   // No.
  { wch: 20 },  // Barangay
  { wch: 16 },  // Last Name
  { wch: 16 },  // First Name
  { wch: 16 },  // Middle Name
  { wch: 6 },   // Suffix
  { wch: 10 },  // Gender
  { wch: 25 },  // School
  { wch: 22 },  // Course
  { wch: 14 },  // Year
  { wch: 18 },  // IP
  { wch: 12 },  // Type
  { wch: 12 },  // Status
  { wch: 25 }   // Remarks (longest)
];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Scholars");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `Scholarship_Student_List.xlsx`);
  setShowDownload(false);
};


  //WORD
  const downloadWord = async () => {
  const generatedDate = new Date().toLocaleDateString();
  const reportTitle = typeQuery ? `${typeQuery.toUpperCase()} SCHOLARS` : "ALL SCHOLARS LIST";

  const hCell = (text: string) =>
  new TableCell({
    shading: { fill: "10377A", type: ShadingType.CLEAR },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 14 })]
    })]
  });

const dCell = (text: string) =>
  new TableCell({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: String(text ?? "-"), size: 14 })]
    })]
  });

const rows = [
  new TableRow({
    tableHeader: true,
    children: [
      hCell("No."), hCell("Barangay"), hCell("Last Name"), hCell("First Name"),
      hCell("Middle"), hCell("Suffix"), hCell("Gender"), hCell("School"),
      hCell("Course"), hCell("Year"), hCell("IP"), hCell("Type"),
      hCell("Status"), hCell("Remarks")
    ]
  }),
  ...filteredStudents.map((s, i) =>
    new TableRow({
      children: [
        dCell(String(i + 1)),
        dCell(s.barangay),
        dCell(s.lastname),
        dCell(s.firstname),
        dCell(s.middlename || "-"),
        dCell(s.suffix || "-"),
        dCell(s.gender),
        dCell(s.school),
        dCell(s.course || "-"),
        dCell(s.year_level || "-"),
        dCell(s.is_ip ? `IP (${s.ip_group || "-"})` : "Not IP"),
        dCell(s.scholarship_types?.name || "-"),
        new TableCell({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({
              text: s.status || "On-going",
              size: 14,
              bold: true,
              color:
                s.status === "Graduated" ? "28A745" :
                s.status === "Stopped"   ? "FF0000" : "808080"
            })]
          })]
        }),
        dCell(s.remarks || "-")
      ]
    })
  )
];

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            orientation: PageOrientation.LANDSCAPE, // Mas maayo ang Landscape kay 11 columns ni
          },
        },
      },
      children: [
        // 1. Header Image
        new Paragraph({
          children: [
            new ImageRun({
              data: await fetch(headerImg).then(r => r.arrayBuffer()),
              transformation: {
                width: 600,
                height: 120
              },
              type: "png"
            })
          ],
          alignment: AlignmentType.CENTER
        }),

        new Paragraph(" "),

        // 2. Centered Title
        new Paragraph({
          text: reportTitle,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER
        }),

        // 3. Centered Generated Date
        new Paragraph({
          text: `Generated: ${generatedDate}`,
          alignment: AlignmentType.CENTER
        }),

        new Paragraph(" "), // Space before table

        // 4. Main Table
        new Table({
  rows,
  width: { size: 100, type: "pct" },
  columnWidths: [
    500,   // No.
    1800,  // Barangay
    1800,  // Last Name
    1800,  // First Name
    1800,  // Middle
    800,   // Suffix
    900,   // Gender
    2800,  // School
    2800,  // Course
    900,   // Year
    1000,  // IP
    900,   // Type
    1000,  // Status
    1500,  // Remarks
  ]
})
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Sholarship_Scholarship_List.docx");
  setShowDownload(false);
};

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar style={{ '--background': '#10377a', '--color': '#ffffff' }}>
          <IonButtons slot="start">
            <IonButton onClick={handleBack}>
              <IonIcon icon={arrowBackOutline}/>
            </IonButton>
          </IonButtons>

          <IonTitle>
            {typeQuery ? `${typeQuery.toUpperCase()} Scholars` : 'All Scholars'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'15px'}}>

          <div>
            <IonButton fill="clear" onClick={handlePrint}>
              <IonIcon icon={printOutline} style={{ fontSize: '28px' }}/>
            </IonButton>
          <IonButton fill="clear" onClick={() => setShowDownload(true)}>
  <IonIcon icon={downloadOutline} style={{ fontSize: '28px' }}/>
</IonButton>
          </div>

          <div style={{display:'flex',gap:'8px'}}>

            <IonInput
              placeholder="Search name..."
              value={searchText}
              onIonInput={e => setSearchText(e.detail.value!)}
              style={{border:'1px solid #ccc',borderRadius:'20px',paddingLeft:'10px'}}
            />

            <IonButton onClick={() => setShowFilter(true)}>
              <IonIcon icon={funnelOutline}/> Filter
            </IonButton>

            <IonSelect
              interface="popover"
              value={sortOption}
              onIonChange={e => setSortOption(e.detail.value)}
            >
              <IonSelectOption value="date_desc">Newest</IonSelectOption>
              <IonSelectOption value="date_asc">Oldest</IonSelectOption>
              <IonSelectOption value="az">A to Z</IonSelectOption>
              <IonSelectOption value="za">Z to A</IonSelectOption>
            </IonSelect>

          </div>
        </div>

        <IonPopover isOpen={showFilter} onDidDismiss={() => setShowFilter(false)}>
          <IonList style={{padding:'15px',minWidth:'250px'}}>

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
              <IonLabel position="stacked">Filter Type</IonLabel>
              <IonSelect
                interface="popover"
                value={filterType}
                onIonChange={e => {
                  setFilterType(e.detail.value);
                  setSelectedGender('');
                  setSelectedIP('');
                  setSelectedSchool('');
                  setSelectedCourse('');
                }}
              >
                <IonSelectOption value="gender">Gender</IonSelectOption>
                <IonSelectOption value="ip">IP</IonSelectOption>
                <IonSelectOption value="school">School</IonSelectOption>
                <IonSelectOption value="course">Course</IonSelectOption>
                <IonSelectOption value="year">Year Level</IonSelectOption>
                <IonSelectOption value="status">Status</IonSelectOption>
              </IonSelect>
            </IonItem>

            {filterType === 'gender' && (
<IonItem>
  <IonLabel position="stacked">Gender</IonLabel>
  <IonSelect
    interface="popover"
    value={selectedGender}
    onIonChange={e => {
      setSelectedGender(e.detail.value);
      setShowFilter(false);
    }}
  >
    <IonSelectOption value="Male">Male</IonSelectOption>
    <IonSelectOption value="Female">Female</IonSelectOption>
  </IonSelect>
</IonItem>
)}

{filterType === 'ip' && (
<IonItem>
  <IonLabel position="stacked">IP</IonLabel>
  <IonSelect
    interface="popover"
    value={selectedIP}
    onIonChange={e => {
      setSelectedIP(e.detail.value);
      setShowFilter(false);
    }}
  >
    <IonSelectOption value="IP">IP</IonSelectOption>
    <IonSelectOption value="NOT_IP">Not IP</IonSelectOption>
  </IonSelect>
</IonItem>
)}

{filterType === 'school' && (
<IonItem>
  <IonLabel position="stacked">School</IonLabel>
  <IonSelect
    interface="popover"
    value={selectedSchool}
    onIonChange={e => {
      setSelectedSchool(e.detail.value);
      setShowFilter(false);
    }}
  >
    {[...new Set(students.map(s => s.school))].map(school => (
      <IonSelectOption key={school} value={school}>
        {school}
      </IonSelectOption>
    ))}
  </IonSelect>
</IonItem>
)}

{filterType === 'course' && (
<IonItem>
  <IonLabel position="stacked">Course</IonLabel>
  <IonSelect
    interface="popover"
    value={selectedCourse}
    onIonChange={e => {
      setSelectedCourse(e.detail.value);
      setShowFilter(false);
    }}
  >
    {[...new Set(students.map(s => s.course).filter(Boolean))].map(course => (
      <IonSelectOption key={course} value={course}>
        {course}
      </IonSelectOption>
    ))}
  </IonSelect>
</IonItem>
)}

{filterType === 'year' && (
<IonItem>
  <IonLabel position="stacked">Year Level</IonLabel>
  <IonSelect
    interface="popover"
    value={selectedYear}
    onIonChange={e => {

  const year = e.detail.value;

  setSelectedYear(year);
  setShowFilter(false);

  if (year) {

    setShowSelect(true);

    const ids = students
      .filter(s => s.year_level === year)
      .map(s => s.id);

    setSelectedStudents(ids);

  } else {

    setShowSelect(false);
    setSelectedStudents([]);

  }

}}
  >
    <IonSelectOption value="1st Year">1st Year</IonSelectOption>
    <IonSelectOption value="2nd Year">2nd Year</IonSelectOption>
    <IonSelectOption value="3rd Year">3rd Year</IonSelectOption>
    <IonSelectOption value="4th Year">4th Year</IonSelectOption>
    <IonSelectOption value="5th Year">5th Year</IonSelectOption>
  </IonSelect>
</IonItem>
)}

{filterType === 'status' && (
<IonItem>
  <IonLabel position="stacked">Student Status</IonLabel>
  <IonSelect
    interface="popover"
    value={selectedStatus}
    onIonChange={e => {
      setSelectedStatus(e.detail.value);
      setShowFilter(false);
    }}
  >
    <IonSelectOption value="On-going">On-going</IonSelectOption>
    <IonSelectOption value="Graduated">Graduated</IonSelectOption>
    <IonSelectOption value="Stopped">Stopped</IonSelectOption>
  </IonSelect>
</IonItem>
)}

            <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
              <IonButton expand="block" color="medium" onClick={resetFilters}>
                Reset
              </IonButton>

              <IonButton expand="block" onClick={() => setShowFilter(false)}>
                Ok
              </IonButton>
            </div>

          </IonList>
        </IonPopover>

        <IonText>
          <h2>Total Displayed: {filteredStudents.length}</h2>
        </IonText>

{showSelect && (
<div style={{display:'flex',gap:'10px',marginBottom:'10px'}}>

<IonSelect
  placeholder="Change Year Level"
  value={bulkYear}
  onIonChange={e => setBulkYear(e.detail.value)}
>
  <IonSelectOption value="1st Year">1st Year</IonSelectOption>
  <IonSelectOption value="2nd Year">2nd Year</IonSelectOption>
  <IonSelectOption value="3rd Year">3rd Year</IonSelectOption>
  <IonSelectOption value="4th Year">4th Year</IonSelectOption>
  <IonSelectOption value="5th Year">5th Year</IonSelectOption>
</IonSelect>

<IonButton
  disabled={selectedStudents.length === 0}
  onClick={handleBulkUpdate}
>
  Update Selected
</IonButton>

</div>
)}

<div style={{ overflowX: 'auto', width: '100%' }}>
  <IonGrid style={{ minWidth: '1300px', width: '100%' }}>
    
    {/* HEADER ROW - Kinahanglan naay matching sizes sa Data Row */}
    <IonRow style={{ fontWeight: 'bold', borderBottom: '2px solid #000', background: '#10377a', color: '#ffffff' }}>
      {showSelect && <IonCol size="0.4">Select</IonCol>}
      <IonCol size="0.4">No.</IonCol>
      <IonCol size="1">Barangay</IonCol>
      <IonCol size="1">Last Name</IonCol>
      <IonCol size="1">First Name</IonCol>
      <IonCol size="0.9">Middle</IonCol>
      <IonCol size="0.5">Suffix</IonCol>
      <IonCol size="0.6">Gender</IonCol>
      <IonCol size="1.3">School</IonCol>
      <IonCol size="1.3">Course</IonCol>
      <IonCol size="0.6">Year</IonCol>
      <IonCol size="0.7">IP Status</IonCol>
      <IonCol size="0.6">Type</IonCol>
      <IonCol size="0.9">Status</IonCol>
      <IonCol size="0.5" className="ion-text-center">Action</IonCol>
    </IonRow>

    {filteredStudents.map((student, index) => (
      <IonRow key={student.id} style={{ backgroundColor: getRowColor(student.status), borderBottom: '1px solid #ddd', alignItems: 'center' }}>
        
        {showSelect && (
          <IonCol size="0.4" style={{ textAlign: 'center' }}>
            <input
              type="checkbox"
              checked={selectedStudents.includes(student.id)}
              onChange={() => toggleSelectStudent(student.id)}
            />
          </IonCol>
        )}

        <IonCol size="0.4">{index + 1}</IonCol>
        <IonCol size="1">{student.barangay}</IonCol>
        <IonCol size="1">{student.lastname}</IonCol>
        <IonCol size="1">{student.firstname}</IonCol>
        <IonCol size="0.9">{student.middlename || '-'}</IonCol>
        <IonCol size="0.5">{student.suffix || '-'}</IonCol>
        <IonCol size="0.6">{student.gender}</IonCol>
        
        {/* Consistent Size para sa School */}
        <IonCol size="1.3">{student.school}</IonCol>
        
        <IonCol size="1.3">{student.course || '-'}</IonCol>
        
        <IonCol size="0.6">
          {student.status === 'Graduated' ? (
            <IonText color="success"><b>Graduated</b></IonText>
          ) : showSelect ? (
            <IonSelect
              interface="popover"
              value={student.year_level}
              onIonChange={e => updateYearLevel(student.id, e.detail.value)}
              
            >
              <IonSelectOption value="1st Year">1st Yr</IonSelectOption>
              <IonSelectOption value="2nd Year">2nd Yr</IonSelectOption>
              <IonSelectOption value="3rd Year">3rd Yr</IonSelectOption>
              <IonSelectOption value="4th Year">4th Yr</IonSelectOption>
              <IonSelectOption value="5th Year">5th Yr</IonSelectOption>
              
            </IonSelect>
          ) : (
            <IonText >{student.year_level || '-'}</IonText>
          )}
        </IonCol>

        <IonCol size="0.7">
          <IonText>{student.is_ip ? 'IP' : 'Not IP'}</IonText>
          {student.is_ip && <div style={{ fontSize: '9px', color: '#666' }}>{student.ip_group}</div>}
        </IonCol>

        <IonCol size="0.6">{student.scholarship_types?.name || '-'}</IonCol>
        
        <IonCol size="1">
          <IonText color={getStatusColor(student.status)} style={{ fontWeight: 'bold' }}>
            {student.status || 'On-going'}
          </IonText>
        </IonCol>

        <IonCol size="0.5"> {/* Gi-adjust ang size gikan 0.8 ngadto sa 1.2 para naay space ang duha ka button */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '4px', justifyContent: 'center' }}>
            <IonButton 
              size="small" 
              color="primary" 
              onClick={() => handleUpdate(student.id)} 
              style={{ fontSize: '10px', height: '28px', margin: 0, flex: '1' }}
              >
             Update
            </IonButton>
    
            <IonButton 
              size="small" 
              color="danger" 
              onClick={() => handleDelete(student.id)} 
              style={{ fontSize: '10px', height: '28px', margin: 0, flex: '1' }}
              >
              Delete
            </IonButton>
          </div>
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

export default StudentList;