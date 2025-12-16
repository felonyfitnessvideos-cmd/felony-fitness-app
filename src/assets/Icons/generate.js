import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

console.log('🔵 1. Script started.');
console.log(`   - Working Directory: ${process.cwd()}`);

// CONFIGURATION
const OUTPUT_DIR = './output';
const BASE_COLOR = '#333333'; 
const ACTIVE_COLOR = '#FF0000';

// ICONS LIST
const icons = [
  { name: 'quadriceps',      source: 'front.svg', targetId: 'Quads',          viewBox: '0 300 500 500' },
  { name: 'chest_middle',    source: 'front.svg', targetId: 'Chest',          viewBox: '0 0 500 400' },
  { name: 'chest_upper',     source: 'front.svg', targetId: 'Chest',          viewBox: '0 0 500 400' },
  { name: 'shoulders_front', source: 'front.svg', targetId: 'Delts',          viewBox: '0 0 500 400' },
  { name: 'biceps',          source: 'front.svg', targetId: 'Biceps',         viewBox: '0 0 500 400' },
  { name: 'forearms',        source: 'front.svg', targetId: 'Forearms',       viewBox: '0 0 500 400' },
  { name: 'abs_upper',       source: 'front.svg', targetId: 'Abs',            viewBox: '0 100 500 400' },
  { name: 'abs_lower',       source: 'front.svg', targetId: 'Abs',            viewBox: '0 200 500 400' },
  { name: 'obliques',        source: 'front.svg', targetId: 'Obliques',       viewBox: '0 100 500 400' },
  { name: 'tibialis',        source: 'front.svg', targetId: 'Tibialis',       viewBox: '0 500 500 300' },
  { name: 'neck',            source: 'front.svg', targetId: 'Neck',           viewBox: '0 0 500 200' },
  { name: 'lats',            source: 'back.svg', targetId: 'Lats',            viewBox: '0 0 500 400' },
  { name: 'traps',           source: 'back.svg', targetId: 'Traps',           viewBox: '0 0 500 300' },
  { name: 'rhomboids',       source: 'back.svg', targetId: 'Rhomboids',       viewBox: '0 50 500 300' },
  { name: 'shoulders_rear',  source: 'back.svg', targetId: 'Delts',           viewBox: '0 50 500 300' },
  { name: 'triceps',         source: 'back.svg', targetId: 'Triceps',         viewBox: '0 50 500 400' },
  { name: 'glutes',          source: 'back.svg', targetId: 'Glutes',          viewBox: '0 300 500 400' },
  { name: 'hamstrings',      source: 'back.svg', targetId: 'Hamstrings',      viewBox: '0 400 500 500' },
  { name: 'calves',          source: 'back.svg', targetId: 'Calves',          viewBox: '0 600 500 400' },
  { name: 'erector_spinae',  source: 'back.svg', targetId: 'Erector_Spinae',  viewBox: '0 200 500 400' },
  { name: 'rotator_cuff',    source: 'back.svg', targetId: 'Rotator_Cuff',    viewBox: '0 50 500 400' }
];

try {
    // 1. Create Output Directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        console.log(`🔵 2. Creating output folder: ${OUTPUT_DIR}`);
        fs.mkdirSync(OUTPUT_DIR);
    } else {
        console.log(`🔵 2. Output folder exists.`);
    }

    // 2. Load SVGs
    console.log('🔵 3. Loading SVG files...');
    const sources = {};
    
    // Explicitly checking Front
    if(fs.existsSync('front.svg')) {
        sources['front.svg'] = fs.readFileSync('front.svg', 'utf8');
        console.log('   ✅ Loaded front.svg');
    } else {
        throw new Error("Could not find 'front.svg' in current folder.");
    }

    // Explicitly checking Back
    if(fs.existsSync('back.svg')) {
        sources['back.svg'] = fs.readFileSync('back.svg', 'utf8');
        console.log('   ✅ Loaded back.svg');
    } else {
        throw new Error("Could not find 'back.svg' in current folder.");
    }

    // 3. Generate Icons
    console.log('🔵 4. Starting icon generation...');
    
    icons.forEach(icon => {
        // console.log(`   ... Processing ${icon.name}`); // Uncomment if it hangs inside loop
        
        const dom = new JSDOM(sources[icon.source]);
        const doc = dom.window.document;

        // Reset
        doc.querySelectorAll('path').forEach(p => p.setAttribute('fill', BASE_COLOR));

        // Highlight
        const target = doc.getElementById(icon.targetId);
        
        // Logic to track success
        let success = false;

        if (target) {
            target.setAttribute('fill', ACTIVE_COLOR);
            success = true;
        } else {
            // Fuzzy Search
            const allPaths = Array.from(doc.querySelectorAll('path'));
            const fuzzyTarget = allPaths.find(p => p.id && p.id.toLowerCase() === icon.targetId.toLowerCase());
            
            if (fuzzyTarget) {
                fuzzyTarget.setAttribute('fill', ACTIVE_COLOR);
                success = true;
            } else {
                console.warn(`   ⚠️  WARNING: ID "${icon.targetId}" not found in ${icon.source}`);
            }
        }

        // Save if successful (or even if failed, to see result)
        if(success) {
            const svgRoot = doc.querySelector('svg');
            if (icon.viewBox) svgRoot.setAttribute('viewBox', icon.viewBox);
            fs.writeFileSync(path.join(OUTPUT_DIR, `${icon.name}.svg`), svgRoot.outerHTML);
        }
    });

    console.log('\n✅ 🎉 SUCCESS! Check the /output folder.');

} catch (error) {
    console.error('\n❌ CRITICAL ERROR:');
    console.error(error.message);
    // Print stack trace if needed
    // console.error(error.stack); 
}