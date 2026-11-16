import { createHandler } from '@/lib/server/enquiryCapture.cjs';
import { repository } from '@/lib/server/enquiryRepository.cjs';
export const config={api:{bodyParser:{sizeLimit:'4300kb'}}};
export default createHandler({env:{...process.env,MIDNIGHT_ENQUIRY_EMAIL_ENABLED:'false'},repository,send:async()=>{throw Error('Automatic enquiry email is disabled');}});
