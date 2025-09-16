"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, Tab, Box } from '@mui/material';

// Custom instruction modal just for this activity
import RigorFilesModal from "@/app/activityComponents/RigorFilesModal/RigorFilesModal";
import Header from "@/app/components/Header/Header";
import CustomButton from "@/app/components/CustomButton/CustomButton";
import "./advice.css";

// TabPanel component to handle content display
const TabPanel = ({ children, value, index }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            className="tab-panel"
        >
            {value === index && (
                <Box>
                    {children}
                </Box>
            )}
        </div>
    );
};

const AdvicePage = () => {
    const [tabValue, setTabValue] = useState(0);
    const [adviceSubmissions, setAdviceSubmissions] = useState([]);
    const searchParams = useSearchParams();
    const sessionID = searchParams.get('sessionID');
    const router = useRouter();

    useEffect(() => {
        const fetchAdviceData = async () => {
            try {
                const response = await fetch(`/api/rigorFilesAdviceApi?sessionID=${sessionID}`);
                // const response = await fetch(`/api/rigorFilesAdviceApi`);

                const data = await response.json();
                
                // data should now be an array of submissions 
                setAdviceSubmissions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch Advice Data:", error);
            }
        };

        if (sessionID) {
            fetchAdviceData();
        }
    }, [sessionID]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const renderAdviceTable = (adviceKey) => {
        // Reverse the order of adviceSubmissions
        const reversedSubmissions = [...adviceSubmissions].reverse();

        return (
            <table className="advice-table">
                <thead>
                    <tr>
                        <th>Advice</th>
                    </tr>
                </thead>
                <tbody>
                    {reversedSubmissions.map((submission, submissionIndex) => {
                        const adviceText = submission[adviceKey];
                        if (!adviceText) return null;
                        
                        const adviceLines = adviceText.split('\n').filter(line => line.trim());

                        return adviceLines.map((line, lineIndex) => (
                            <tr key={`${submission._id || submissionIndex}-${lineIndex}`}>
                                <td>
                                    <span className="advice-text">
                                        {line.trim()}
                                    </span>
                                </td>
                            </tr>
                        ));
                    })}
                </tbody>
            </table>
        );
    };

    return (
        <div className="full-page">
            <Header title="How might the mask fail?" />
            <div className="advice-page-content">
                <div className="tab-container">
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs 
                            value={tabValue} 
                            onChange={handleTabChange}
                            variant="fullWidth"
                        >
                            <Tab label="Study Team" />
                            <Tab label="Participants" />
                            <Tab label="Data Accumulation" />
                            <Tab label="Environmental" />
                        </Tabs>
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                        <h2>Study Team Advice</h2>
                        {renderAdviceTable('advice1')}
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <h2>Participants Advice</h2>
                        {renderAdviceTable('advice2')}
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                        <h2>Data Accumulation Advice</h2>
                        {renderAdviceTable('advice3')}
                    </TabPanel>

                    <TabPanel value={tabValue} index={3}>
                        <h2>Environmental Advice</h2>
                        {renderAdviceTable('advice4')}
                    </TabPanel>
                </div>
            </div>
            <div className="button-container">
                <CustomButton 
                    variant="primary"
                    onClick={() => router.push('/pages/checklist')}
                    customStyles={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        zIndex: 1000,
                        marginLeft: 'auto',
                    }}
                >
                    Go to Checklist
                </CustomButton>
            </div>
        </div>
    );
}

export default function AdvicePageWrapper() {
    return (
        <Suspense
            fallback={
                <div className="full-page">
                    <h2>Loading...</h2>
                </div>
            }
        >
            <AdvicePage />
        </Suspense>
    );
}

