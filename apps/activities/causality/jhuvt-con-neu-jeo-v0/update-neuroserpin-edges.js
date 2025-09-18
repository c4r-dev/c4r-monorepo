const logger = require('../../../../packages/logging/logger.js');
#!/usr/bin/env node

/**
 * Script to update MongoDB document edges (connecting lines) for Neuroserpin6 flowchart
 * This updates the connections between nodes, handles, styles, and other edge properties
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

// Edge updates - modify these as needed
// You can: add new edges, modify existing edges, or set to null to delete edges
const edgeUpdates = [
  {
    id: 'xy-edge__yLCcPE2zfUyKmGQPa0mg7output-bottom-mgLU4ZtExIeo0oXA3yVayinput-top',
    source: 'yLCcPE2zfUyKmGQPa0mg7',
    target: 'mgLU4ZtExIeo0oXA3yVay',
    sourceHandle: 'output-bottom',
    targetHandle: 'input-right',
    type: 'default',
    style: { stroke: "#333", strokeWidth: 2 },
    markerEnd: { type: "arrowclosed" },
  },
]

// {
//   id: 'xy-edge__WFgunJwZz89Ngb89ixw4poutput-bottom-mgLU4ZtExIeo0oXA3yVayinput-top',
//   source: 'WFgunJwZz89Ngb89ixw4p',
//   target: 'mgLU4ZtExIeo0oXA3yVay',
//   sourceHandle: 'output-bottom',
//   targetHandle: 'input-top',
//   type: 'default',
//   style: { stroke: "#333", strokeWidth: 2 },
//   markerEnd: { type: "arrowclosed" },
//   // Common types: 'default', 'straight', 'step', 'smoothstep', 'bezier'
//   // Common markers: 'arrow', 'arrowclosed', 'arrowopen'
// },
// {
//   id: 'xy-edge__mgLU4ZtExIeo0oXA3yVayoutput-bottom-1WU9oGExEstpRY1dlhDvKinput-top',
//   source: 'mgLU4ZtExIeo0oXA3yVay',
//   target: '1WU9oGExEstpRY1dlhDvK',
//   sourceHandle: 'output-bottom',
//   targetHandle: 'input-top',
//   type: 'default',
//   style: { stroke: "#333", strokeWidth: 2 },
//   markerEnd: { type: "arrowclosed" },
//   // Common types: 'default', 'straight', 'step', 'smoothstep', 'bezier'
//   // Common markers: 'arrow', 'arrowclosed', 'arrowopen'
// },
// {
//   id: 'xy-edge__qoK3O0-sWd_nC8sIeCy_noutput-bottom-1WU9oGExEstpRY1dlhDvKinput-top',
//   source: 'qoK3O0-sWd_nC8sIeCy_n',
//   target: '1WU9oGExEstpRY1dlhDvK',
//   sourceHandle: 'output-bottom',
//   targetHandle: 'input-top',
//   type: 'default',
//   style: { stroke: "#333", strokeWidth: 2 },
//   markerEnd: { type: "arrowclosed" },
//   // Common types: 'default', 'straight', 'step', 'smoothstep', 'bezier'
//   // Common markers: 'arrowclosed', 'arrow', 'arrowopen'
// },
// {
//   id: 'xy-edge__mgLU4ZtExIeo0oXA3yVayoutput-bottom-ZnuLNxIO6uZHIVnra0nMfinput-top',
//   source: 'mgLU4ZtExIeo0oXA3yVay',
//   target: 'ZnuLNxIO6uZHIVnra0nMf',
//   sourceHandle: 'output-bottom',
//   targetHandle: 'input-top',
//   type: 'default',
//   style: { stroke: "#333", strokeWidth: 2 },
//   markerEnd: { type: "arrowclosed" },
//   // Common types: 'default', 'straight', 'step', 'smoothstep', 'bezier'
//   // Common markers: 'arrowclosed', 'arrow', 'arrowopen'
// },
// {
//   id: 'xy-edge__yLCcPE2zfUyKmGQPa0mg7output-bottom-ZnuLNxIO6uZHIVnra0nMfinput-top',
//   source: 'yLCcPE2zfUyKmGQPa0mg7',
//   target: 'ZnuLNxIO6uZHIVnra0nMf',
//   sourceHandle: 'output-bottom',
//   targetHandle: 'input-top',
//   type: 'default',
//   style: { stroke: "#333", strokeWidth: 2 },
//   markerEnd: { type: "arrowclosed" },
//   // Common types: 'default', 'straight', 'step', 'smoothstep', 'bezier'
//   // Common markers: 'arrowclosed', 'arrow', 'arrowopen'
// },
// {
//   id: 'xy-edge__1WU9oGExEstpRY1dlhDvKoutput-bottom-FR6R_kJhNWVezT0pm-hckinput-top',
//   source: '1WU9oGExEstpRY1dlhDvK',
//   target: 'FR6R_kJhNWVezT0pm-hck',
//   sourceHandle: 'output-bottom',
//   targetHandle: 'input-top',
//   type: 'default',
//   style: { stroke: "#333", strokeWidth: 2 },
//   markerEnd: { type: "arrowclosed" },
//   // Common types: 'default', 'straight', 'step', 'smoothstep', 'bezier'
//   // Common markers: 'arrowclosed', 'arrow', 'arrowopen'
// },
// {
//   id: 'xy-edge__ZnuLNxIO6uZHIVnra0nMfoutput-bottom-FR6R_kJhNWVezT0pm-hckinput-top',
//   source: 'ZnuLNxIO6uZHIVnra0nMf',
//   target: 'FR6R_kJhNWVezT0pm-hck',
//   sourceHandle: 'output-bottom',
//   targetHandle: 'input-top',
//   type: 'default',
//   style: { stroke: "#333", strokeWidth: 2 },
//   markerEnd: { type: "arrowclosed" },
//   // Common types: 'default', 'straight', 'step', 'smoothstep', 'bezier'
//   // Common markers: 'arrowclosed', 'arrow', 'arrowopen'
// },
// {
//   id: 'xy-edge__FR6R_kJhNWVezT0pm-hckoutput-bottom-h2k8msBE3eQSCilEKi0xginput',
//   source: 'FR6R_kJhNWVezT0pm-hck',
//   target: 'h2k8msBE3eQSCilEKi0xg',
//   sourceHandle: 'output-bottom',
//   targetHandle: 'input',
//   type: 'default',
//   style: { stroke: "#333", strokeWidth: 2 },
//   markerEnd: { type: "arrowclosed" },
//   // Common types: 'default', 'straight', 'step', 'smoothstep', 'bezier'
//   // Common markers: 'arrowclosed', 'arrow', 'arrowopen'
// },
// {
//   id: 'xy-edge__FR6R_kJhNWVezT0pm-hckoutput-bottom-h2k8msBE3eQSCilEKi0xginput-top',
//   source: 'FR6R_kJhNWVezT0pm-hck',
//   target: 'h2k8msBE3eQSCilEKi0xg',
//   sourceHandle: 'output-bottom',
//   targetHandle: 'input-top',
//   type: 'default',
//   style: { stroke: "#333", strokeWidth: 2 },
//   markerEnd: { type: "arrowclosed" },
//   // Common types: 'default', 'straight', 'step', 'smoothstep', 'bezier'
//   // Common markers: 'arrowclosed', 'arrow', 'arrowopen'
// },
// {
//   id: 'xy-edge__FR6R_kJhNWVezT0pm-hckoutput-bottom-r_Zy2OhKDXK31u79uYAePinput-top',
//   source: 'FR6R_kJhNWVezT0pm-hck',
//   target: 'r_Zy2OhKDXK31u79uYAeP',
//   sourceHandle: 'output-bottom',
//   targetHandle: 'input-top',
//   type: 'default',
//   style: { stroke: "#333", strokeWidth: 2 },
//   markerEnd: { type: "arrowclosed" },
//   // Common types: 'default', 'straight', 'step', 'smoothstep', 'bezier'
//   // Common markers: 'arrowclosed', 'arrow', 'arrowopen'
// },
// {
//   id: 'xy-edge__r_Zy2OhKDXK31u79uYAePoutput-bottom-h2k8msBE3eQSCilEKi0xginput-top',
//   source: 'r_Zy2OhKDXK31u79uYAeP',
//   target: 'h2k8msBE3eQSCilEKi0xg',
//   sourceHandle: 'output-bottom',
//   targetHandle: 'input-top',
//   type: 'default',
//   style: { stroke: "#333", strokeWidth: 2 },
//   markerEnd: { type: "arrowclosed" },
//   // Common types: 'default', 'straight', 'step', 'smoothstep', 'bezier'
//   // Common markers: 'arrowclosed', 'arrow', 'arrowopen'
// },
// ];

async function updateNeuroserpin6Edges() {
  try {
    logger.app.info('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    logger.app.info('✅ Connected to MongoDB');

    // Find the Neuroserpin6 document by exact ID
    logger.app.info('Searching for Neuroserpin6 document...');
    const flowchartDoc = await CustomFlowchart.findById("682f33b87a6b41356cee7202");

    if (!flowchartDoc) {
      logger.app.info('❌ Neuroserpin6 document not found with ID: 682f33b87a6b41356cee7202');
      return;
    }

    logger.app.info('✅ Found document:', flowchartDoc.name);

    // Parse the flowchart JSON
    const flowchartData = JSON.parse(flowchartDoc.flowchart);
    let updatedCount = 0;
    let deletedCount = 0;
    let addedCount = 0;

    // Create a map of existing edges for easy lookup
    const existingEdges = new Map();
    flowchartData.edges.forEach(edge => {
      existingEdges.set(edge.id, edge);
    });

    // Process edge updates
    edgeUpdates.forEach(edgeUpdate => {
      if (edgeUpdate.delete) {
        // Delete edge
        const index = flowchartData.edges.findIndex(edge => edge.id === edgeUpdate.id);
        if (index !== -1) {
          flowchartData.edges.splice(index, 1);
          logger.app.info(`🗑️  Deleted edge: ${edgeUpdate.id}`);
          deletedCount++;
        }
      } else if (existingEdges.has(edgeUpdate.id)) {
        // Update existing edge
        const edgeIndex = flowchartData.edges.findIndex(edge => edge.id === edgeUpdate.id);
        if (edgeIndex !== -1) {
          const oldEdge = flowchartData.edges[edgeIndex];
          flowchartData.edges[edgeIndex] = { ...oldEdge, ...edgeUpdate };
          logger.app.info(`🔗 Updated edge: ${edgeUpdate.id}`);
          logger.app.info(`   From: ${edgeUpdate.source} → To: ${edgeUpdate.target}`);
          updatedCount++;
        }
      } else {
        // Add new edge
        flowchartData.edges.push(edgeUpdate);
        logger.app.info(`➕ Added new edge: ${edgeUpdate.id}`);
        logger.app.info(`   From: ${edgeUpdate.source} → To: ${edgeUpdate.target}`);
        addedCount++;
      }
    });

    const totalChanges = updatedCount + deletedCount + addedCount;
    if (totalChanges === 0) {
      logger.app.info('ℹ️  No edge updates needed');
      return;
    }

    // Save back to MongoDB
    logger.app.info(`\n💾 Saving edge changes...`);
    await CustomFlowchart.findByIdAndUpdate(
      flowchartDoc._id,
      { flowchart: JSON.stringify(flowchartData) },
      { new: true }
    );

    logger.app.info('✅ Successfully updated Neuroserpin6 edges in MongoDB!');
    logger.app.info(`📊 Summary:`);
    logger.app.info(`   - Updated: ${updatedCount} edges`);
    logger.app.info(`   - Added: ${addedCount} edges`);
    logger.app.info(`   - Deleted: ${deletedCount} edges`);
    logger.app.info(`   - Total changes: ${totalChanges}`);

  } catch (error) {
    logger.app.error('❌ Error updating edges:', error);
  } finally {
    await mongoose.disconnect();
    logger.app.info('\n🔌 Disconnected from MongoDB');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateNeuroserpin6Edges();
}

export default updateNeuroserpin6Edges;