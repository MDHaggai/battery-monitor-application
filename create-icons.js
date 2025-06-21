const sharp = require('sharp');
const fs = require('fs');

async function createPNGIcons() {
    console.log('🔧 Creating PNG icons for EAS build...');
    
    try {
        // Create icon.png (1024x1024) from app-icon.svg
        if (fs.existsSync('assets/app-icon.svg')) {
            await sharp('assets/app-icon.svg')
                .resize(1024, 1024)
                .png()
                .toFile('assets/icon.png');
            console.log('✅ Created icon.png (1024x1024)');
        }
        
        // Create adaptive-icon.png (1024x1024) from adaptive-icon-foreground.svg
        if (fs.existsSync('assets/adaptive-icon-foreground.svg')) {
            await sharp('assets/adaptive-icon-foreground.svg')
                .resize(1024, 1024)
                .png()
                .toFile('assets/adaptive-icon.png');
            console.log('✅ Created adaptive-icon.png (1024x1024)');
        }
        
        // Create splash.png (1284x2778) from splash-screen.svg
        if (fs.existsSync('assets/splash-screen.svg')) {
            await sharp('assets/splash-screen.svg')
                .resize(1284, 2778)
                .png()
                .toFile('assets/splash.png');
            console.log('✅ Created splash.png (1284x2778)');
        }
        
        // Create favicon.png (48x48) from favicon.svg
        if (fs.existsSync('assets/favicon.svg')) {
            await sharp('assets/favicon.svg')
                .resize(48, 48)
                .png()
                .toFile('assets/favicon.png');
            console.log('✅ Created favicon.png (48x48)');
        }
        
        console.log('\n🎉 All PNG icons created successfully!');
        console.log('Ready for EAS build: eas build --platform android --profile development');
        
    } catch (error) {
        console.error('❌ Error creating PNG files:', error.message);
        console.log('\n🔧 Alternative: Use online converter at https://cloudconvert.com/svg-to-png');
    }
}

createPNGIcons();
