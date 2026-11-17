import { NextResponse } from 'next/server';
import { publicReleaseRoute } from './lib/publicReleasePolicy.cjs';
export function proxy(request) {
  if(publicReleaseRoute(request.nextUrl.pathname))return NextResponse.next();
  return NextResponse.json({message:'This service is not available in the public freight release. Please use the freight enquiry page or contact operations.'},{status:410,headers:{'Cache-Control':'no-store'}});
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
