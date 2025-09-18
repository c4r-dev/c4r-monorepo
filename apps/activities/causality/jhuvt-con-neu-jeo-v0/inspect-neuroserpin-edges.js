const logger = require('../../../../packages/logging/logger.js');
#!/usr/bin/env node

/**
 * Script to inspect the Neuroserpin6 MongoDB document edges (connecting lines)
 * Shows current connections between nodes for planning updates
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

async function inspectNeuroserpin6Edges() {
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

    // Parse and display flowchart structure
    const flowchartData = JSON.parse(flowchartDoc.flowchart);
    
    // Create node lookup for better display
    const nodeLabels = {};
    flowchartData.nodes.forEach(node => {
      const label = node.data?.elements?.label?.text || 'No label';
      nodeLabels[node.id] = label;
    });

    logger.app.info('\n🔗 Current Edge Connections:');
    logger.app.info('=' .repeat(80));
    
    if (!flowchartData.edges || flowchartData.edges.length === 0) {
      logger.app.info('❌ No edges found in the flowchart');
      return;
    }

    flowchartData.edges.forEach((edge, index) => {
      const sourceLabel = nodeLabels[edge.source] || edge.source;
      const targetLabel = nodeLabels[edge.target] || edge.target;
      
      logger.app.info(`${index + 1}. Edge ID: "${edge.id}"`);
      logger.app.info(`   From: "${edge.source}" (${sourceLabel})`);
      logger.app.info(`   To:   "${edge.target}" (${targetLabel})`);
      logger.app.info(`   Source Handle: ${edge.sourceHandle || 'default'}`);
      logger.app.info(`   Target Handle: ${edge.targetHandle || 'default'}`);
      
      // Show additional edge properties if they exist
      logger.app.info(`   Type: ${edge.type || 'default'}`);
      if (edge.label) logger.app.info(`   Label: ${edge.label}`);
      
      // Always show style information (even if empty/default)
      logger.app.info(`   Style:`, edge.style ? JSON.stringify(edge.style) : 'default');
      if (edge.style) {
        if (edge.style.stroke) logger.app.info(`     - Stroke Color: ${edge.style.stroke}`);
        if (edge.style.strokeWidth) logger.app.info(`     - Stroke Width: ${edge.style.strokeWidth}`);
        if (edge.style.strokeDasharray) logger.app.info(`     - Dash Pattern: ${edge.style.strokeDasharray}`);
        if (edge.style.opacity) logger.app.info(`     - Opacity: ${edge.style.opacity}`);
      }
      
      // Always show marker end information (even if empty/default)
      logger.app.info(`   Marker End:`, edge.markerEnd ? JSON.stringify(edge.markerEnd) : 'none');
      if (edge.markerEnd) {
        if (edge.markerEnd.type) logger.app.info(`     - Type: ${edge.markerEnd.type}`);
        if (edge.markerEnd.width) logger.app.info(`     - Width: ${edge.markerEnd.width}`);
        if (edge.markerEnd.height) logger.app.info(`     - Height: ${edge.markerEnd.height}`);
        if (edge.markerEnd.color) logger.app.info(`     - Color: ${edge.markerEnd.color}`);
      }
      
      logger.app.info('');
    });

    logger.app.info('\n📝 Template for edge updates:');
    logger.app.info('const edgeUpdates = [');
    flowchartData.edges.forEach(edge => {
      logger.app.info(`  {`);
      logger.app.info(`    id: '${edge.id}',`);
      logger.app.info(`    source: '${edge.source}',`);
      logger.app.info(`    target: '${edge.target}',`);
      logger.app.info(`    sourceHandle: '${edge.sourceHandle || 'output'}',`);
      logger.app.info(`    targetHandle: '${edge.targetHandle || 'input'}',`);
      logger.app.info(`    type: '${edge.type || 'default'}',`);
      logger.app.info(`    style: ${edge.style ? JSON.stringify(edge.style) : '{ stroke: "#333", strokeWidth: 2 }'},`);
      logger.app.info(`    markerEnd: ${edge.markerEnd ? JSON.stringify(edge.markerEnd) : '{ type: "arrowclosed" }'},`);
      if (edge.label) logger.app.info(`    label: '${edge.label}',`);
      logger.app.info(`    // Common types: 'default', 'straight', 'step', 'smoothstep', 'bezier'`);
      logger.app.info(`    // Common markers: 'arrowclosed', 'arrow', 'arrowopen'`);
      logger.app.info(`  },`);
    });
    logger.app.info('];');

    logger.app.info('\n📊 Node Reference:');
    logger.app.info('Available Node IDs and Labels:');
    flowchartData.nodes.forEach(node => {
      logger.app.info(`  - "${node.id}" → "${nodeLabels[node.id]}"`);
    });

  } catch (error) {
    logger.app.error('❌ Error inspecting edges:', error);
  } finally {
    await mongoose.disconnect();
    logger.app.info('\n🔌 Disconnected from MongoDB');
  }
}

// Run the inspection
inspectNeuroserpin6Edges();