const fs = require('fs');
const path = require('path');

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
        let currentExperiment = null;
        let currentKeyFinding = null;
        
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i];
            
            // Check if this is a new experiment (Example is not null)
            const hasExample = values[0] && values[0].trim() !== '';
            
            if (hasExample) {
                // Create new experiment object with main fields
                currentExperiment = {
                    "Example": values[0] || '',
                    "Study Description": values[1] || '',
                    "Key Findings": []
                };
                
                // Add initial key finding if present
                if (values[2] && values[2].trim() !== '') {
                    const keyFindingText = values[2];
                    
                    // Check if this contains additional findings (multi-line content)
                    if (keyFindingText.includes('\n')) {
                        const lines = keyFindingText.split('\n');
                        const mainFinding = lines[0].trim();
                        const additionalFindings = lines.slice(1)
                            .map(line => line.trim())
                            .filter(line => line !== '' && line !== ',,,')
                            .map(line => line.startsWith(',,,') ? line.substring(3).trim() : line);
                        
                        currentKeyFinding = {
                            "finding": mainFinding,
                            "additional_findings": additionalFindings
                        };
                    } else {
                        currentKeyFinding = {
                            "finding": keyFindingText,
                            "additional_findings": []
                        };
                    }
                    currentExperiment["Key Findings"].push(currentKeyFinding);
                }
                
                jsonArray.push(currentExperiment);
            } else if (currentExperiment) {
                // This is additional data for current experiment
                // Check Key Findings column (index 2)
                if (values[2] && values[2].trim() !== '') {
                    const keyFindingText = values[2];
                    
                    // Check if this contains additional findings (multi-line content)
                    if (keyFindingText.includes('\n')) {
                        const lines = keyFindingText.split('\n');
                        const mainFinding = lines[0].trim();
                        const additionalFindings = lines.slice(1)
                            .map(line => line.trim())
                            .filter(line => line !== '' && line !== ',,,')
                            .map(line => line.startsWith(',,,') ? line.substring(3).trim() : line);
                        
                        currentKeyFinding = {
                            "finding": mainFinding,
                            "additional_findings": additionalFindings
                        };
                    } else {
                        currentKeyFinding = {
                            "finding": keyFindingText,
                            "additional_findings": []
                        };
                    }
                    currentExperiment["Key Findings"].push(currentKeyFinding);
                }
                
                // Check Additional Findings column (index 3) - these belong to the most recent key finding
                if (values[3] && values[3].trim() !== '') {
                    if (currentExperiment["Key Findings"].length > 0) {
                        // Add to the most recent key finding
                        const lastFinding = currentExperiment["Key Findings"][currentExperiment["Key Findings"].length - 1];
                        lastFinding["additional_findings"].push(values[3]);
                    }
                }
            }
        }
        
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonArray, null, 2));
        console.log(`✅ Successfully converted ${csvFilePath} to ${jsonFilePath}`);
        console.log(`📊 Converted ${jsonArray.length} experiments`);
        
    } catch (error) {
        console.error(`❌ Error converting CSV to JSON: ${error.message}`);
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