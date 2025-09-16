'use client'; 

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import RandomizationQuestionsScreen from './StudyQuestion'; 
import { Box, CircularProgress, Typography, Container } from '@mui/material'; 

// Define different study details based on selectedSection
const studyDetailsMap = {
  '1': {
    name: "Does exercise improve performance on cognitive inhibition tasks?",
    description: `Based on sample size calculations, we aim to recruit at least 30 participants to this crossover randomized controlled trial. Each participant will experience some sequence of the four conditions: low–intensity resistance exercise (LRE), moderate–intensity resistance exercise (MRE), high–intensity resistance exercise (HRE), and control condition (Con). A Latin square design will be implemented to reduce the possible sequences from 24 (4 × 3 × 2 × 1) to 4 (1: Con → LRE → MRE → HRE; 2: LRE → MRE → HRE → Con; 3: MRE → HRE → Con → LRE; 4: HRE → Con → LRE → MRE) to control for the risk of imbalanced allocation.\n\nBlock randomization will be performed to ensure that each participant has an equal chance of assignment to each sequence and that each sequence contains a similar number of participants. Random numbers will be generated and concealed by author XYZ. XYZ will disclose the assigned individual sequence on the first intervention day (the third visit) to minimize recruitment and allocation biases.\n\nTo reduce the threat of the placebo effect, we will ask participants for their expectations on cognitive performance, and these will be incorporated into our statistical analysis. Blinding of the outcome assessors is also not possible. However, all measurements of cognitive performance will be computerized and not involve human judgment. The data analyzers will not be blinded but will follow a pre–written computer script for statistical analysis. These procedures will reduce the risk of bias arising from the lack of blinding of participants, experimenters, assessors, and data analyzers and the threat from researchers' degrees of freedom.`
  },
  '2': {
    name: "Does early administration of pharmaceuticals improve neurological outcomes following spinal cord injury?",
    description: `The study is composed of 4 groups (Riluzole, Glibenclamide, GlyH-101, and Control). All animals will receive a spinal cord contusion injury at C5. The severity of injury (weight height) will be block randomized between 5 and 25 mm to ensure injury severity is fully balanced across different treatment groups and by sex. Equal numbers of male and female animals will be included in each treatment group and injury severity.\n\nThe target sample size is n=30 animals per treatment group for a total of 120 animals for the full study. We will use block randomization where each animal will be randomly assigned to 1 of 4 treatment groups and 1 of 15 injury severities (n=15 animals per treatment group per sex). The random number generator in MS Excel will be used.`
  },
  '3': {
    name: "How is emotional processing of faces influenced by medication and expectations in patients with depression?",
    description: `The study employs a between-group design with two factors, Medication (esketamine vs. placebo) and outcome expectation (high vs. low). Neural activity is measured by conducting an fMRI emotion processing paradigm.\n\nHuman subjects are randomized into one of the four experimental conditions (n= 4 x 44), and ensuring that the numbers of participants to be assigned to each of the comparison groups will be balanced.\n\nIn total 176 patients with acute major depression disorder are recruited (n=4 x 36 + 20% estimated dropout rate)`
  },
  'default': {
    name: "Fakepaper 3",
    description: "This randomized controlled trial aims to evaluate the effectiveness of a new intervention compared to the standard care. Participants meeting eligibility criteria will be randomly assigned to either the intervention group or the control group."
  }
};

// Define a loading component to show while RandomizationQuestionsScreen suspends
function LoadingFallback() {
  return (
    <Container maxWidth="md" sx={{ py: 3 }}> {/* Match container width */}
        <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh" // Adjust height as needed
        textAlign="center"
        sx={{
            bgcolor: '#f5f5f5', // Match background of sections
            p: { xs: 2, sm: 4 },
            borderRadius: 2,
            border: (theme) => `1px dashed ${theme.palette.divider}`
        }}
        >
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading Study Interface... 
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Please wait while we prepare the randomization questions section.
        </Typography>
        </Box>
    </Container>
  );
}

// Your Page Component
function StudyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [studyDetails, setStudyDetails] = useState(studyDetailsMap.default);
  const [selectedSection, setSelectedSection] = useState(null);
  
  // Get the selectedSection from URL params and set the appropriate study details
  useEffect(() => {
    const sectionParam = searchParams.get('selectedSection');
    
    if (sectionParam && studyDetailsMap[sectionParam]) {
      setStudyDetails(studyDetailsMap[sectionParam]);
      setSelectedSection(sectionParam);
      console.log(`Loaded study details for section: ${sectionParam}`);
    } else {
      setStudyDetails(studyDetailsMap.default);
      setSelectedSection(null);
      console.log('Using default study details (no valid selectedSection found)');
    }
  }, [searchParams]);

// Updated handler function to receive data when user clicks "Continue"
const handleQuestionsContinue = (submittedQuestions, userId, sectionParam) => {
  console.log("Continuing from questions screen...");
  console.log("User ID:", userId);
  console.log("Submitted Questions:", submittedQuestions);
  
  // Use the passed selectedSection parameter first, then fall back to state
  const finalSelectedSection = sectionParam || selectedSection;
  console.log("Selected Section:", finalSelectedSection);
  
  // Create new URLSearchParams object
  const params = new URLSearchParams();
  
  // Add userId if available
  if (userId) {
    params.set('userId', userId);
  }
  
  // IMPORTANT: Add selectedSection to the navigation params
  if (finalSelectedSection) {
    params.set('selectedSection', finalSelectedSection);
    console.log(`Adding selectedSection=${finalSelectedSection} to navigation params`);
  }
  
  // Add submittedQuestions count
  params.set('questionCount', submittedQuestions.length.toString());

  // Add sessionId from URL if available
  const sessionId = searchParams.get('sessionID');
  if (sessionId) {
    params.set('sessionId', sessionId);
    console.log(`Adding sessionId=${sessionId} to navigation params`);
  }
  
  // Log the full URL we're navigating to for debugging
  const targetUrl = `/DragDropInterface?${params.toString()}`;
  console.log("Navigating to:", targetUrl);
  
  // Navigate to DragDropInterface with the parameters
  router.push(targetUrl);
};

  return (
    // Using a main container or fragment
    <Box sx={{ my: 4 }}> {/* Add some margin */}
      {/* You might have other content on this page */}
      <Container maxWidth="lg"> {/* Use a wider container for the overall page */}
        <Typography variant="h4" component="h1" gutterBottom align="center">
            Participate in Our Study
        </Typography>
        {/* Other introductory text or components */}
      </Container>

      {/* RandomizationQuestionsScreen component with onContinue handler */}
      <RandomizationQuestionsScreen 
        studyName={studyDetails.name}
        studyDescription={studyDetails.description}
        onContinue={handleQuestionsContinue} // Pass the handler function
      />

      {/* You might have other content after the suspended component */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
         <Typography variant="body2" color="text.secondary" align="center">
            Thank you for your participation.
         </Typography>
      </Container>
    </Box>
  );
}

// Main component with Suspense boundary
export default function YourStudyPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <StudyPageContent />
    </Suspense>
  );
}