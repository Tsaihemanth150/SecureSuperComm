// queue/emailQueue.js
import { Queue } from 'bullmq';
import { connection } from '../config/redis';

const emailQueue = new Queue('emailQueue', { connection });

export default emailQueue;