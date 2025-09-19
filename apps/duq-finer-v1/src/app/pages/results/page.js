'"use client"';

"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./results.module.css";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Header from "@/app/components/Header/Header";
import CustomModal from "@/app/components/CustomModal/CustomModal";
import CustomButton from "@/app/components/CustomButton/CustomButton";

import { Alert } from "@mui/material";
import { Snackbar } from "@mui/material";

import ravenIcon1 from "@/app/assets/raven-icon-1.svg";
import NextImage from "next/image";

import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable'

/*
Results:
- Fetch all data regarding a given session. 
- Sort each entry into groups regarding each criteria
- Sort each of these groups into subgroups regarding the selected feature
- Display the number of entries in each subgroup

Implement a table displaying this data
Each group of criteria+feature combinations will get its own row of the table

Table headers
- Criteria (questionNumber from database)  (Note: can repeat)
- Feature (areaOption from database) (Note: can repeat. What matters is that each row is a unique combination of criteria and feature)
- Ratings / Comments
    - May contain multiple rating items that belong to the same criteria and feature
- Group Notes : make it a text area
*/

function RatingCell({ evaluation, elaboration }) {
    // Function to determine the color based on evaluation
    const getColorForEvaluation = (evaluation) => {
        switch (evaluation.toLowerCase()) {
            case 'positive':
                return 'green';
            case 'neutral':
                return 'gray';
            case 'negative':
                return 'red';
            case 'uncertain':
                return 'orange';
            default:
                return 'black'; // Default color
        }
    };

    const evaluationColor = getColorForEvaluation(evaluation);

    if (elaboration !== "" && elaboration !== null) {
        return (
            <div className={styles.ratingCellContent}>
                <div className={styles.ratingCellTopRow}>
                    <NextImage src={ravenIcon1} alt="Raven Icon 1" width={16} height={16} />
                    <p style={{ color: evaluationColor }}>{evaluation.toUpperCase()}&#10;&#13;</p>
                </div>
                <p>{elaboration}&#10;&#13;</p>
            </div>
        );
    } else {
        return (
            <div className={styles.ratingCellContent}>
                <div className={styles.ratingCellTopRow}>
                    <NextImage src={ravenIcon1} alt="Raven Icon 1" width={16} height={16} />
                    <p style={{ color: evaluationColor }}>{evaluation.toUpperCase()}&#10;&#13;</p>
                </div>
            </div>
        );
    }
}

function ResultsTable({ featureGroups, tableContainerVariableStyles }) {
    const criteriaArray = ["Feasible", "Interesting", "Novel", "Ethical", "Relevant"];



// Make this reusable
/*
<TableCell
    sx={{
        '& > *': {
            backgroundColor: '#ffffff',
            padding: '5px',
            borderRadius: '8px',
            width: 'fit-content',
        },
    }}
>
    */

    // const tableCellRootStyles = {
    //     '& > *': {
    //         padding: "5px",
    //         borderRadius: "8px",
    //         width: "fit-content",
    //         backgroundColor: "#ffffff",
    //         width: "fit-content",
    //     },
    // };

    // const tableCellContentStyles = {
    //     padding: "5px",
    //     borderRadius: "8px",
    //     width: "fit-content",
    //     backgroundColor: "#ffffff",
    //     width: "fit-content",
    // };

    const tableStyles = {
        // border: "5px solid #FF0000",
        borderCollapse: "collapse",
        // fontFamily: "var(--font-general-sans-semi-bold)",
    };

    const rowStyles = {
        borderBottom: "1.5px solid white",
    };

    const cellContentStyles = {
        '& > *': {
            backgroundColor: "#ffffff",
            padding: "5px",
            borderRadius: "8px",
            width: "fit-content",
        },
    };
    const ratingCellStyles = {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        '& > *': {
            backgroundColor: "#ffffff",
            padding: "5px",
            borderRadius: "8px",
            width: "fit-content",
        },
    };

    const headerCellStyles = {
        // borderBottom: "1.5px solid white",
        backgroundColor: "#E0E0E0",
        borderBottom: "1.5px solid white",
        color: "#8E8E8E",
        fontWeight: "bold",
        fontFamily: "var(--font-general-sans-semi-bold)",
    };

    // Create a map to store unique criteria/feature pairs
    const uniquePairs = {};

    // Populate the map with unique pairs
    Object.entries(featureGroups).forEach(([feature, entries]) => {
        entries.forEach(entry => {
            const criteria = criteriaArray[entry.questionNumber - 1];
            const key = `${criteria}-${feature}`;
            if (!uniquePairs[key]) {
                uniquePairs[key] = [];
            }
            uniquePairs[key].push(entry);
        });
    });

    return (
        <TableContainer sx={tableContainerVariableStyles}>
            <Table className={styles.resultsTable} stickyHeader sx={tableStyles} id="my-table">
                <TableHead>
                    <TableRow>
                        <TableCell sx={headerCellStyles}>Criteria</TableCell>
                        <TableCell sx={headerCellStyles}>Feature</TableCell>
                        <TableCell sx={headerCellStyles}>Ratings / Comments</TableCell>
                        <TableCell sx={headerCellStyles}>Group Notes</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(uniquePairs).map(([key, entries]) => {
                        const [criteria, feature] = key.split('-');
                        return (
                            <TableRow key={key} sx={rowStyles}>
                                <TableCell sx={cellContentStyles}><p>{criteria}</p></TableCell>
                                <TableCell sx={cellContentStyles}><p>{feature}</p></TableCell>
                                <TableCell sx={ratingCellStyles}>
                                    {entries.map(subEntry => (
                                        <div key={subEntry._id}>
                                            <RatingCell evaluation={subEntry.evaluation} elaboration={subEntry.elaboration} />
                                        </div>
                                    ))}
                                </TableCell>
                                <TableCell sx={cellContentStyles}>
                                    <textarea placeholder="Enter group notes here"></textarea>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

function ResultsContent() {

    const [resultsData, setResultsData] = useState([]);
    const [featureGroups, setFeatureGroups] = useState({});
    const [tableContainerVariableStyles, setTableContainerVariableStyles] = useState({maxHeight: '800px'});   

    const router = useRouter();

    // State to manage the guide modal visibility
    const [isGuideModalVisible, setIsGuideModalVisible] = useState(false);
    // State to manage the error snackbar visibility and message
    const [isErrorSnackbarOpen, setIsErrorSnackbarOpen] = useState(false);
    const [errorSnackbarMessage, setErrorSnackbarMessage] = useState("");
    
    const closeModal = () => {
        setIsGuideModalVisible(false);
    };
    const openModal = () => {
        setIsGuideModalVisible(true);
    };
    const handleGuideBtn = () => {
        logger.app.info("Guide button clicked");
        openModal(true);
    };
    const handleErrorSnackbarClose = () => {
        setIsErrorSnackbarOpen(false);
    };

    const searchParams = useSearchParams();
    const userID = searchParams.get("userID");
    const sessionID = searchParams.get("sessionID");
    const researchQuestion = searchParams.get("researchQuestion");




    // const questionNumber = searchParams.get("questionNumber");

    const fetchResultsData = async () => {
        const res = await fetch(`/api/finerAnswerApi`);
        const data = await res.json();
        // Filter data to only include entries with the given sessionID
        const filteredData = data.filter(entry => entry.sessionID === sessionID);
        logger.app.info("Filtered data:", filteredData);
        setResultsData(filteredData);


        // Sort each entry into groups regarding each criteria  
        const criteriaGroups = {};
        filteredData.forEach(entry => {
            if (!criteriaGroups[entry.questionNumber]) {
                criteriaGroups[entry.questionNumber] = [];
            }
            criteriaGroups[entry.questionNumber].push(entry);
        });
        logger.app.info("Criteria groups:", criteriaGroups);

        // For each of the 5 entries in the criteriaGroups, sort them into subgroups regarding the selected feature
        // For example, criteriaGroup[1] should have 5 subgroups, some with areaOption "Time & Money", some with "Skills", etc.
        // If criteriaGroup[1] has 3 entries with the areaOption "Time & Money" and 2 with "Skills", then the 5 entries should be split into 2 subgroups:
        // one with 3 entries with the areaOption "Time & Money" and one with 2 entries with the areaOption "Skills"

        const tempFeatureGroups = {};
        Object.keys(criteriaGroups).forEach(questionNumber => {
            const criteriaGroup = criteriaGroups[questionNumber];
            criteriaGroup.forEach(entry => {
                if (!tempFeatureGroups[entry.areaOption]) {
                    tempFeatureGroups[entry.areaOption] = [];
                }
                tempFeatureGroups[entry.areaOption].push(entry);
            });
        });
        logger.app.info("Feature groups:", tempFeatureGroups);
        setFeatureGroups(tempFeatureGroups);
        // Display the number of entries in each subgroup       
    }

    useEffect(() => {
        logger.app.info("Fetching results data");
        fetchResultsData();
    }, []);

    function addWrappedText({text, textWidth, doc, fontSize = 10, fontType = 'normal', lineSpacing = 7, xPosition = 10, initialYPosition = 10, pageWrapInitialYPosition = 10}) {
        // doc.setFontType(fontType);
        // doc.setFontSize(fontSize);
        var textLines = doc.splitTextToSize(text, textWidth); // Split the text into lines
        var pageHeight = doc.internal.pageSize.height;        // Get page height, we'll use this for auto-paging. TRANSLATE this line if using units other than `pt`
        var cursorY = initialYPosition;
      
        textLines.forEach(lineText => {
          if (cursorY > pageHeight) { // Auto-paging
            doc.addPage();
            cursorY = pageWrapInitialYPosition;
          }
          doc.text(xPosition, cursorY, lineText);
          cursorY += lineSpacing;
        })
      }

    const exportToPdf2 = () => {
        logger.app.info("Exporting to PDF");
        // const doc = new jsPDF();
        // const fullPage = document.getElementById("results-full-page");
        // doc.html(fullPage.innerHTML, {
        //     callback: function (doc) {
        //         doc.save("results.pdf");
        //     },
        // });

        const doc = new jsPDF();

        addWrappedText({
            text: "FINER Evaluation Group Summary", // Put a really long string here
            textWidth: 120,
            doc,
          
            // Optional
            fontSize: '12',
            fontType: 'normal',
            lineSpacing: 7,               // Space between lines
            xPosition: 10,                // Text offset from left of document
            initialYPosition: 10,         // Initial offset from top of document; set based on prior objects in document
            pageWrapInitialYPosition: 10  // Initial offset from top of document when page-wrapping
          });  

        addWrappedText({
            text: "Research Question: " + researchQuestion, // Put a really long string here
            textWidth: 160,
            doc,
          
            // Optional
            fontSize: '12',
            fontType: 'normal',
            lineSpacing: 7,               // Space between lines
            xPosition: 10,                // Text offset from left of document
            initialYPosition: 20,         // Initial offset from top of document; set based on prior objects in document
            pageWrapInitialYPosition: 10  // Initial offset from top of document when page-wrapping
          });  

        // Append some text to the top of the PDF
        // doc.text("FINER Evaluation Group Summary", 10, 10);
        // doc.text("Research Question: " + researchQuestion, 10, 20);

        // autoTable.default(doc, { html: '#my-table' })
        autoTable(doc, { html: '#my-table' })

        doc.setFontSize(18)
        doc.text('With content', 14, 22)
        doc.setFontSize(11)
        doc.setTextColor(100)

        // jsPDF 1.4+ uses getWidth, <1.4 uses .width
        var pageSize = doc.internal.pageSize
        var pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth()
        var text = doc.splitTextToSize(faker.lorem.sentence(45), pageWidth - 35, {})
        doc.text(text, 14, 30)       



        doc.save("results.pdf");

    }

    const exportToPdf3 = () => {
        const doc = new jsPDF();


        doc.setFontSize(18)
        doc.text('FINER Evaluation Group Summary', 14, 22)
        doc.setFontSize(11)
        doc.setTextColor(100)

        // jsPDF 1.4+ uses getWidth, <1.4 uses .width
        var pageSize = doc.internal.pageSize
        var pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth()
        var text = doc.splitTextToSize("Research Question: " + researchQuestion, pageWidth - 35, {})
        doc.text(text, 14, 30)   

        // doc.autoTable({
        //     head: headRows(),
        //     body: bodyRows(40),
        //     startY: 50,
        //     showHead: 'firstPage',
        //   })

        autoTable(doc, { html: '#my-table', startY: 50, showHead: 'firstPage' })

        

        doc.save("results.pdf");
    }

    const exportToPdf = () => {
        setTableContainerVariableStyles({maxHeight: '10000px'});

        // Wait for 1 second before printing
        setTimeout(() => {
            window.print();
        }, 1000);

        setTimeout(() => {
            setTableContainerVariableStyles({maxHeight: '800px'});
        }, 2000);   

        // window.print();

        // setTableContainerVariableStyles({maxHeight: '800px'});

    }


    return (
        <div className={styles.resultsFullPage} id="results-full-page">
            <Header />
            <div className={styles.resultsContentContainer}>
                
                <h1>FINER Report</h1>
                <h1>Group Summary</h1>
                <h2>RESEARCH QUESTION</h2>
                <p>{researchQuestion}</p>
                <ResultsTable featureGroups={featureGroups} tableContainerVariableStyles={tableContainerVariableStyles}/>
            </div>
            <CustomButton onClick={exportToPdf3}>Export to PDF</CustomButton>
            <CustomButton onClick={exportToPdf}>Export to PDF (Keep style / Print)</CustomButton>

        </div>
    );
}

export default function Results() {
    return (
        <Suspense
            fallback={
                <div className={styles.fullPage}>
                    <h2>Loading...</h2>
                </div>
            }
        >
            {/* Actual content */}
            <ResultsContent />
        </Suspense>
    );
}