const fs = require('fs');
const util = require('util');

const logFile = fs.createWriteStream('test-output.txt', { flags: 'w' });
const log = (d) => {
    console.log(d);
    logFile.write(util.format(d) + '\n');
};

try {
    const pkg = require('pdf-parse');
    const { PDFParse } = pkg;

    log('PDFParse type: ' + typeof PDFParse);
    if (typeof PDFParse === 'function') {
        // Check if it's a class
        log('Is class-like: ' + (PDFParse.toString().startsWith('class')));
    }

    async function test() {
        log('Testing PDFParse...');
        try {
            // Minimal PDF binary content (blank page)
            const pdfBuffer = Buffer.from('JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXwKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCj4+CmVuZG9iagoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjAgMDAwMDAgbiAgCjAwMDAwMDAxNTcgMDAwMDAgbiAgCgp0cmFpbGVyCjw8CiAgL1NpemUgNAogIC9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoyMTMKJSVFT0YK', 'base64');

            // Try explicit PDFParse usage - assuming it might need instantiation or is a static
            // Since v1 was just fn(buffer), maybe v2 is just PDFParse(buffer)? 
            // Or new PDFParse().extract(buffer)?

            // Convert Buffer to Uint8Array explicitly
            const uint8Array = new Uint8Array(pdfBuffer.buffer, pdfBuffer.byteOffset, pdfBuffer.byteLength);

            try {
                const instance = new PDFParse(uint8Array);
                log('Instantiated PDFParse(uint8Array).');

                // Try calling getText
                const textObj = await instance.getText();
                log('Extracted text via getText(): ' + JSON.stringify(textObj));

            } catch (e) {
                log('Could not instantiate PDFParse(buffer): ' + e.message);

                // Try empty options
                try {
                    const instance = new PDFParse({});
                    log('Instantiated PDFParse({}).');
                    log('Instance keys: ' + JSON.stringify(Object.keys(instance)));
                } catch (e2) {
                    log('Could not instantiate PDFParse({}): ' + e2.message);
                }
            }

        } catch (e) {
            log('ERROR: ' + e);
        }
    }

    test();

} catch (e) {
    log('Error: ' + e.message);
}
