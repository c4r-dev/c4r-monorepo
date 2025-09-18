const fs = require('fs');
const path = require('path');
const logger = require('../../../../../packages/logging/logger.js');

function csvToJson(csvFilePath, jsonFilePath) {
    try {
        const csvData = fs.readFileSync(csvFilePath, 'utf8');
        
        if (csvData.trim() === '') {
            throw new Error('CSV file is empty');
        }
        
        const rows = parseCSV(csvData);
        
        if (rows.length === 0) {
            throw new Error('No valid rows found in CSV');
        }
        
        const headers = rows[0];
        const jsonArray = [];
        let currentStudy = null;
        
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i];
            
            // Check if this is a new study (has causal hypothesis)
            const hasCausalHypothesis = values[0] && values[0].trim() !== '';
            
            if (hasCausalHypothesis) {
                // Create new study object
                currentStudy = {
                    "Causal Hypothesis": values[0] || '',
                    studies: []
                };
                
                // Add the first study (Observational - Human)
                if (values[1] && values[1].trim() !== '') {
                    const study1 = {
                        type: values[1],
                        population: values[2] || '',
                        methodology: values[3] || '',
                        keyFindings: values[4] || '',
                        majorLimitations: values[5] ? [values[5]] : []
                    };
                    currentStudy.studies.push(study1);
                }
                
                // Add the second study (Experimental - Animal Model)
                if (values[6] && values[6].trim() !== '') {
                    const study2 = {
                        type: values[6],
                        population: values[7] || '',
                        methodology: values[8] || '',
                        keyFindings: values[9] || '',
                        majorLimitations: values[10] ? [values[10]] : []
                    };
                    currentStudy.studies.push(study2);
                }
                
                // Add hint content if present
                if (values[11]) {
                    currentStudy.hintContent = [values[11]];
                }
                
                jsonArray.push(currentStudy);
            } else if (currentStudy) {
                // This is additional data for the current study
                // Add to major limitations of study 1 if present
                if (values[5] && values[5].trim() !== '' && currentStudy.studies[0]) {
                    currentStudy.studies[0].majorLimitations.push(values[5]);
                }
                
                // Add to major limitations of study 2 if present
                if (values[10] && values[10].trim() !== '' && currentStudy.studies[1]) {
                    currentStudy.studies[1].majorLimitations.push(values[10]);
                }
                
                // Add to hint content if present
                if (values[11] && values[11].trim() !== '') {
                    if (!currentStudy.hintContent) {
                        currentStudy.hintContent = [];
                    }
                    currentStudy.hintContent.push(values[11]);
                }
            }
        }
        
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonArray, null, 2));
        logger.app.info(`✅ Successfully converted ${csvFilePath} to ${jsonFilePath}`);
        logger.app.info(`📊 Converted ${jsonArray.length} experiments`);
        
    } catch (error) {
        logger.app.error(`❌ Error converting CSV to JSON: ${error.message}`);
    }
}

function parseCSV(csvData) {
    const rows = [];
    const lines = csvData.split('\n');
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < lines.length) {
        const line = lines[i];
        let j = 0;
        
        while (j < line.length) {
            const char = line[j];
            
            if (char === '"') {
                if (inQuotes && j + 1 < line.length && line[j + 1] === '"') {
                    currentField += '"';
                    j += 2;
                } else {
                    inQuotes = !inQuotes;
                    j++;
                }
            } else if (char === ',' && !inQuotes) {
                currentRow.push(currentField.trim());
                currentField = '';
                j++;
            } else {
                currentField += char;
                j++;
            }
        }
        
        if (inQuotes) {
            currentField += '\n';
            i++;
        } else {
            currentRow.push(currentField.trim());
            if (currentRow.some(field => field !== '')) {
                rows.push(currentRow);
            }
            currentRow = [];
            currentField = '';
            i++;
        }
    }
    
    if (currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
    }
    
    return rows;
}

csvToJson(path.join(__dirname, 'data.csv'), path.join(__dirname, 'data.json'));