// ForwardRef Error Detection Script
// Run this in browser console to detect forwardRef issues

console.log('🔍 Starting ForwardRef Error Detection...');

// Store original console.error to catch forwardRef errors
const originalConsoleError = console.error;
let forwardRefErrors = [];
let totalErrors = 0;

console.error = function(...args) {
    totalErrors++;
    const message = args.join(' ');
    
    // Check for forwardRef specific errors
    if (message.includes('forwardRef') || 
        message.includes('Surface.js') || 
        message.includes('Cannot read properties of undefined')) {
        
        forwardRefErrors.push({
            timestamp: new Date().toISOString(),
            message: message,
            stack: args.find(arg => arg && arg.stack) ? args.find(arg => arg && arg.stack).stack : 'No stack trace'
        });
        
        console.log('🚨 FORWARDREF ERROR DETECTED:', message);
    }
    
    // Call original console.error
    originalConsoleError.apply(console, args);
};

// Monitor for React errors
window.addEventListener('error', (event) => {
    if (event.message && (event.message.includes('forwardRef') || event.message.includes('Surface.js'))) {
        forwardRefErrors.push({
            timestamp: new Date().toISOString(),
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
        
        console.log('🚨 WINDOW ERROR - ForwardRef detected:', event.message);
    }
});

// Test function to check current state
window.checkForwardRefStatus = function() {
    console.log('\n📊 ForwardRef Error Report');
    console.log('========================');
    console.log(`Total Errors: ${totalErrors}`);
    console.log(`ForwardRef Errors: ${forwardRefErrors.length}`);
    
    if (forwardRefErrors.length === 0) {
        console.log('✅ No forwardRef errors detected!');
        return { status: 'success', errors: 0, details: 'No forwardRef errors found' };
    } else {
        console.log('❌ ForwardRef errors found:');
        forwardRefErrors.forEach((error, index) => {
            console.log(`\n  Error ${index + 1}:`);
            console.log(`    Time: ${error.timestamp}`);
            console.log(`    Message: ${error.message}`);
            if (error.filename) console.log(`    File: ${error.filename}:${error.lineno}:${error.colno}`);
            if (error.stack) console.log(`    Stack: ${error.stack.substring(0, 200)}...`);
        });
        return { status: 'error', errors: forwardRefErrors.length, details: forwardRefErrors };
    }
};

// Test recharts availability
window.testRechartsAvailability = function() {
    console.log('\n🧪 Testing Recharts Availability');
    console.log('================================');
    
    try {
        // Try to access React
        if (typeof React !== 'undefined') {
            console.log('✅ React is available globally');
            if (React.forwardRef) {
                console.log('✅ React.forwardRef is available');
            } else {
                console.log('❌ React.forwardRef is NOT available');
            }
        } else {
            console.log('⚠️ React is not available globally (this is normal with bundlers)');
        }
        
        // Test if any recharts components are in the DOM
        const rechartsElements = document.querySelectorAll('[class*="recharts"]');
        console.log(`📊 Found ${rechartsElements.length} recharts elements in DOM`);
        
        return {
            react: typeof React !== 'undefined',
            forwardRef: typeof React !== 'undefined' && !!React.forwardRef,
            rechartsElements: rechartsElements.length
        };
        
    } catch (error) {
        console.log('❌ Error testing recharts availability:', error.message);
        return { error: error.message };
    }
};

// Auto-run tests after page load
setTimeout(() => {
    console.log('\n🚀 Running automatic tests...');
    window.testRechartsAvailability();
    window.checkForwardRefStatus();
    
    console.log('\n💡 Available commands:');
    console.log('  - checkForwardRefStatus() : Check for forwardRef errors');
    console.log('  - testRechartsAvailability() : Test recharts setup');
}, 2000);

console.log('✅ ForwardRef Error Detection initialized');
console.log('💡 Use checkForwardRefStatus() to get current status');