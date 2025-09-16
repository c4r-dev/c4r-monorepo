// C4R Database Utilities
// Consolidated from 36 MongoDB implementations across the monorepo

// Connection utilities
export { connectDB, disconnectDB } from './connection/mongodb';

// Common schemas (extracted from repeated patterns)
export { StudentInputSchema, StudentInput } from './models/StudentInput';
export { SessionSchema, Session } from './models/Session';
export { FeedbackSchema, Feedback } from './models/Feedback';
export { DAGSchema, DAG } from './models/DAG';
export { UserResponseSchema, UserResponse } from './models/UserResponse';

// Activity-specific schemas
export { FluDAGSchema, FluDAG } from './models/activities/FluDAG';
export { PolioSchema, Polio } from './models/activities/Polio';
export { WasonSchema, Wason } from './models/activities/Wason';
export { RandomizationSchema, Randomization } from './models/activities/Randomization';

// Utility functions
export { generateSessionId } from './utils/session';
export { validateInput } from './utils/validation';
export { sanitizeData } from './utils/sanitization';

// Types
export type { 
  IStudentInput, 
  ISession, 
  IFeedback, 
  IDAG,
  IUserResponse 
} from './types';

// Configuration
export { dbConfig } from './config';