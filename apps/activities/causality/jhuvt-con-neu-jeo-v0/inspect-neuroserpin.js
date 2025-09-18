const logger = require('../../../../packages/logging/logger.js');
#!/usr/bin/env node

/**
 * Script to inspect the Neuroserpin6 MongoDB document structure
 * Shows current node positions and IDs for planning updates
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './.env.local' });

// Define the CustomFlowchart schema
const customFlowchartSchema = new mongoose.Schema({
  flowchart: String,
  name: { type: String, required: true },
  description: { type: String, default: "" },
  submissionInstance: Number,
  createdDate: Date,
  version: Number,
}, {
  timestamps: true,
});

const CustomFlowchart = mongoose.models.CustomFlowchart || mongoose.model("CustomFlowchart", customFlowchartSchema);

async function inspectNeuroserpin6() {
  try {
    logger.app.info('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    logger.app.info('✅ Connected to MongoDB');

    // Find the Neuroserpin6 document by exact ID
    logger.app.info('Fetching Neuroserpin6 document...');
    const flowchartDoc = await CustomFlowchart.findById("682f33b87a6b41356cee7202");

    if (!flowchartDoc) {
      logger.app.info('❌ Neuroserpin6 document not found with ID: 682f33b87a6b41356cee7202');
      return;
    }

    logger.app.info('✅ Found document:', flowchartDoc.name);
    logger.app.info('📄 Document details:');
    logger.app.info('  - ID:', flowchartDoc._id);
    logger.app.info('  - Name:', flowchartDoc.name);
    logger.app.info('  - Description:', flowchartDoc.description);
    logger.app.info('  - Created:', flowchartDoc.createdDate);

    // Parse and display flowchart structure
    const flowchartData = JSON.parse(flowchartDoc.flowchart);
    
    logger.app.info('\n📊 Current Node Positions:');
    logger.app.info('=' .repeat(50));
    
    flowchartData.nodes.forEach((node, index) => {
      const label = node.data?.elements?.label?.text || 'No label';
      logger.app.info(`${index + 1}. ID: "${node.id}"`);
      logger.app.info(`   Label: "${label}"`);
      logger.app.info(`   Position: (${node.position.x}, ${node.position.y})`);
      logger.app.info('');
    });

    logger.app.info('📝 Copy these node IDs to update positions in the main script:');
    logger.app.info('const positionUpdates = {');
    flowchartData.nodes.forEach(node => {
      logger.app.info(`  '${node.id}': { x: ${node.position.x}, y: ${node.position.y} },`);
    });
    logger.app.info('};');

  } catch (error) {
    logger.app.error('❌ Error inspecting document:', error);
  } finally {
    await mongoose.disconnect();
    logger.app.info('\n🔌 Disconnected from MongoDB');
  }
}

// Run the inspection
inspectNeuroserpin6();