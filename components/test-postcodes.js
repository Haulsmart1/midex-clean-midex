'use client';

import { useEffect } from 'react';
import { normalizePostcode, isROI, isGB, isNI, requiresCustoms } from '@/utils/normalizePostcode';

export default function TestPostcodeDebug() {
  useEffect(() => {
    console.log('📦 Normalized Postcodes');
    console.log('CA7 →', normalizePostcode('CA7'));           // CA7
    console.log('SW1A1AA →', normalizePostcode('SW1A1AA'));   // SW1A 1AA
    console.log('V94 →', normalizePostcode('V94'));           // V94
    console.log('D8 →', normalizePostcode('D8'));             // D8
    console.log('BT7 →', normalizePostcode('BT7'));           // BT7

    console.log('\n🌍 Region Checks');
    console.log('isGB("CA7") →', isGB('CA7'));
    console.log('isNI("BT7") →', isNI('BT7'));
    console.log('isROI("V94") →', isROI('V94'));
    console.log('isROI("D8") →', isROI('D8'));

    console.log('\n🛃 Customs Logic');
    console.log('requiresCustoms("CA7", "V94") →', requiresCustoms('CA7', 'V94')); // ✅ true
    console.log('requiresCustoms("CA7", "BT7") →', requiresCustoms('CA7', 'BT7')); // ✅ true
    console.log('requiresCustoms("CA7", "CA8") →', requiresCustoms('CA7', 'CA8')); // ❌ false
  }, []);

  return <div style={{ padding: '2rem', color: 'white' }}>✅ Check your browser console for results</div>;
}
